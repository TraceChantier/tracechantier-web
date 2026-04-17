'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { CopyIcon, RefreshIcon, CheckIcon, XIcon, PlusIcon, TrashIcon, AlertIcon } from '@/components/Icons'

const COULEURS_ZONES = [
  '#1B5FA8', '#2A9D5C', '#D4820A',
  '#C0392B', '#6B3FA0', '#0E8A8A',
]

interface Chantier {
  id: string; nom: string; adresse: string | null
  code_acces: string; date_debut: string | null; description: string | null
}
interface Zone { id: string; nom: string; couleur: string; ordre: number }
interface ST { id: string; prenom_nom: string; specialite: string; derniere_activite: string | null }
interface Admin { id: string; prenom_nom: string; role: string }
interface Entreprise { plan: string; admins_supplementaires: number }

interface Props {
  chantiers: Chantier[]
  sousTraitants: ST[]
  admins: Admin[]
  entreprise: Entreprise | null
  userRole: string
  userId: string
}

function fmtDate(d: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('fr-CA', { day: 'numeric', month: 'short', year: 'numeric' })
}

function fmtRelative(d: string | null) {
  if (!d) return 'Jamais'
  const diff = Date.now() - new Date(d).getTime()
  const j = Math.floor(diff / 86400000)
  if (j === 0) return 'Aujourd\'hui'
  if (j === 1) return 'Hier'
  if (j < 7) return `Il y a ${j} jours`
  if (j < 30) return `Il y a ${Math.floor(j / 7)} sem.`
  return fmtDate(d)
}

function initiales(nom: string): string {
  return nom.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
}

export default function EquipeClient({ chantiers: init, sousTraitants: initST, admins: initAdmins, entreprise, userRole, userId }: Props) {
  const supabase = createClient()
  const [onglet, setOnglet] = useState<'chantiers' | 'st' | 'admins'>('chantiers')
  const [chantiers, setChantiers] = useState(init)
  const [sousTraitants] = useState(initST)
  const [admins, setAdmins] = useState(initAdmins)

  // Édition chantier
  const [chantierEdite, setChantierEdite] = useState<string | null>(null)
  const [editNom, setEditNom] = useState('')
  const [editAdresse, setEditAdresse] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editDateDebut, setEditDateDebut] = useState('')
  const [editZones, setEditZones] = useState<Zone[]>([])
  const [editZonesSupprimes, setEditZonesSupprimes] = useState<string[]>([])
  const [sauvegarde, setSauvegarde] = useState(false)

  // Regen code
  const [regenEnCours, setRegenEnCours] = useState<string | null>(null)
  const [copie, setCopie] = useState<string | null>(null)

  // Invitation admin
  const [invitationEnCours, setInvitationEnCours] = useState(false)
  const [lienInvitation, setLienInvitation] = useState<string | null>(null)
  const [lienCopie, setLienCopie] = useState(false)

  // Retrait admin
  const [retraitEnCours, setRetraitEnCours] = useState<string | null>(null)
  const [confirmerRetrait, setConfirmerRetrait] = useState<Admin | null>(null)

  // ── Actions ────────────────────────────────────────────────────────────────

  async function ouvrirEdition(chantier: Chantier) {
    setChantierEdite(chantier.id)
    setEditNom(chantier.nom)
    setEditAdresse(chantier.adresse ?? '')
    setEditDescription(chantier.description ?? '')
    setEditDateDebut(chantier.date_debut?.slice(0, 10) ?? '')
    setEditZonesSupprimes([])
    const { data } = await supabase
      .from('zones')
      .select('id, nom, couleur, ordre')
      .eq('chantier_id', chantier.id)
      .order('ordre')
    setEditZones(data ?? [])
  }

  function fermerEdition() {
    setChantierEdite(null)
    setEditZones([])
    setEditZonesSupprimes([])
  }

  function ajouterZone() {
    const lettre = String.fromCharCode(65 + editZones.length)
    setEditZones(prev => [...prev, {
      id: '',
      nom: `Zone ${lettre}`,
      couleur: COULEURS_ZONES[editZones.length % COULEURS_ZONES.length],
      ordre: editZones.length,
    }])
  }

  function modifierZone(index: number, champ: string, valeur: string) {
    setEditZones(prev => prev.map((z, i) => i === index ? { ...z, [champ]: valeur } : z))
  }

  function supprimerZoneEdit(index: number) {
    const zone = editZones[index]
    if (zone.id) setEditZonesSupprimes(prev => [...prev, zone.id])
    setEditZones(prev => prev.filter((_, i) => i !== index))
  }

  async function sauvegarderChantier(chantierId: string) {
    if (!editNom.trim()) return
    setSauvegarde(true)
    try {
      const res = await fetch('/api/modifier-chantier', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chantierId,
          nom: editNom.trim(),
          adresse: editAdresse.trim(),
          description: editDescription.trim(),
          date_debut: editDateDebut || null,
          zones: editZones,
          zonesSupprimes: editZonesSupprimes,
        }),
      })
      if (!res.ok) return
      setChantiers(prev => prev.map(c =>
        c.id === chantierId
          ? { ...c, nom: editNom.trim(), adresse: editAdresse.trim() || null, description: editDescription.trim() || null, date_debut: editDateDebut || null }
          : c
      ))
      fermerEdition()
    } finally {
      setSauvegarde(false)
    }
  }

  async function regenCode(chantierId: string) {
    setRegenEnCours(chantierId)
    try {
      const res = await fetch('/api/regen-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chantierId }),
      })
      const data = await res.json()
      if (res.ok && data.code) {
        setChantiers(prev => prev.map(c => c.id === chantierId ? { ...c, code_acces: data.code } : c))
      }
    } finally {
      setRegenEnCours(null)
    }
  }

  async function copierCode(code: string, id: string) {
    await navigator.clipboard.writeText(code)
    setCopie(id)
    setTimeout(() => setCopie(null), 2000)
  }

  async function inviterAdmin() {
    setInvitationEnCours(true)
    setLienInvitation(null)
    try {
      const { data: tok, error } = await supabase.rpc('generer_invitation_surintendant')
      if (error || !tok) throw new Error(error?.message ?? 'Erreur')
      const lien = `tracechantier://rejoindre-surintendant?token=${tok}`
      setLienInvitation(lien)
    } catch {
      // ignore
    } finally {
      setInvitationEnCours(false)
    }
  }

  async function copierLien() {
    if (!lienInvitation) return
    await navigator.clipboard.writeText(lienInvitation)
    setLienCopie(true)
    setTimeout(() => setLienCopie(false), 2000)
  }

  async function retirerAdmin(admin: Admin) {
    setRetraitEnCours(admin.id)
    setConfirmerRetrait(null)
    try {
      const res = await fetch('/api/retirer-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminId: admin.id }),
      })
      if (res.ok) {
        setAdmins(prev => prev.filter(a => a.id !== admin.id))
      }
    } finally {
      setRetraitEnCours(null)
    }
  }

  // ── Styles communs ────────────────────────────────────────────────────────

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '9px 12px', borderRadius: '9px',
    border: '1px solid #D0E4F4', fontSize: '13px', color: '#1A3A5C',
    background: '#F8FBFF', outline: 'none', boxSizing: 'border-box',
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div>
      {/* Onglets */}
      <div
        className="flex gap-0 mb-6"
        style={{ background: '#fff', borderRadius: '12px', border: '1px solid #E5E7EB', padding: '4px', display: 'inline-flex' }}
      >
        {(['chantiers', 'st', 'admins'] as const).map(o => {
          const labels: Record<string, string> = { chantiers: 'Chantiers', st: 'Sous-traitants', admins: 'Équipe' }
          const counts: Record<string, number> = { chantiers: chantiers.length, st: sousTraitants.length, admins: admins.length }
          const actif = onglet === o
          return (
            <button
              key={o}
              onClick={() => setOnglet(o)}
              style={{
                padding: '8px 18px', borderRadius: '9px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: actif ? 700 : 500,
                background: actif ? '#0D3A6E' : 'transparent', color: actif ? '#fff' : '#6B7280', transition: 'all 0.15s',
              }}
            >
              {labels[o]} <span style={{ opacity: 0.6, fontSize: '11px' }}>({counts[o]})</span>
            </button>
          )
        })}
      </div>

      {/* ── CHANTIERS ────────────────────────────────────────────────────── */}
      {onglet === 'chantiers' && (
        <div className="flex flex-col gap-3">
          {chantiers.length === 0 && (
            <div className="bg-white rounded-xl py-12 flex flex-col items-center gap-2" style={{ border: '1px solid #E5E7EB' }}>
              <p className="text-sm" style={{ color: '#9CA3AF' }}>Aucun chantier actif</p>
            </div>
          )}
          {chantiers.map(c => {
            const edite = chantierEdite === c.id
            return (
              <div key={c.id} className="bg-white rounded-xl overflow-hidden" style={{ border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                {/* Ligne principale */}
                <div style={{ padding: '16px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '14px' }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#111827', margin: 0 }}>{c.nom}</h3>
                      {c.adresse && <p style={{ fontSize: '11px', color: '#9CA3AF', margin: '2px 0 0' }}>{c.adresse}</p>}
                    </div>
                    <button
                      onClick={() => edite ? fermerEdition() : ouvrirEdition(c)}
                      style={{
                        padding: '6px 14px', borderRadius: '8px', border: '1px solid #E5E7EB',
                        background: edite ? '#EFF6FF' : '#F8F9FA', color: edite ? '#1B5FA8' : '#6B7280',
                        fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                      }}
                    >
                      {edite ? 'Fermer' : '✏️ Modifier'}
                    </button>
                  </div>

                  {/* Code d'accès */}
                  <div style={{ marginBottom: '8px' }}>
                    <p style={{ fontSize: '10px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '8px' }}>
                      Code d'accès sous-traitants
                    </p>
                    <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
                      {c.code_acces.split('').map((char, i) => (
                        <div key={i} style={{ flex: 1, height: '46px', background: '#0D3A6E', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span style={{ fontSize: '20px', fontWeight: 700, color: '#fff', fontFamily: 'monospace' }}>{char}</span>
                        </div>
                      ))}
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => copierCode(c.code_acces, c.id)}
                        style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '8px', borderRadius: '9px', border: '1px solid #E5E7EB', background: copie === c.id ? '#ECFDF5' : '#F8F9FA', color: copie === c.id ? '#059669' : '#1B5FA8', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                      >
                        {copie === c.id ? <><CheckIcon size={13} /> Copié</> : <><CopyIcon size={13} /> Copier</>}
                      </button>
                      <button
                        onClick={() => regenCode(c.id)}
                        disabled={regenEnCours === c.id}
                        style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '8px', borderRadius: '9px', border: '1px solid rgba(192,57,43,0.25)', background: '#FFF5F5', color: '#C0392B', fontSize: '12px', fontWeight: 600, cursor: 'pointer', opacity: regenEnCours === c.id ? 0.5 : 1 }}
                      >
                        <RefreshIcon size={13} />
                        {regenEnCours === c.id ? '...' : 'Régénérer'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Formulaire édition */}
                {edite && (
                  <div style={{ borderTop: '1px solid #F3F4F6', padding: '20px' }}>
                    <p style={{ fontSize: '10px', fontWeight: 700, color: '#5B87B5', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>
                      Modifier le chantier
                    </p>

                    <label style={{ fontSize: '11px', color: '#9BBAD6', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: '4px' }}>Nom *</label>
                    <input style={inputStyle} value={editNom} onChange={e => setEditNom(e.target.value)} />

                    <label style={{ fontSize: '11px', color: '#9BBAD6', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: '4px', marginTop: '10px' }}>Adresse</label>
                    <input style={inputStyle} value={editAdresse} onChange={e => setEditAdresse(e.target.value)} />

                    <label style={{ fontSize: '11px', color: '#9BBAD6', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: '4px', marginTop: '10px' }}>Description</label>
                    <textarea style={{ ...inputStyle, height: '64px', resize: 'vertical' }} value={editDescription} onChange={e => setEditDescription(e.target.value)} />

                    <label style={{ fontSize: '11px', color: '#9BBAD6', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: '4px', marginTop: '10px' }}>Date de début</label>
                    <input style={inputStyle} type="date" value={editDateDebut} onChange={e => setEditDateDebut(e.target.value)} />

                    {/* Zones */}
                    <div style={{ marginTop: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <p style={{ fontSize: '11px', fontWeight: 700, color: '#5B87B5', textTransform: 'uppercase', letterSpacing: '0.07em', margin: 0 }}>
                          Zones ({editZones.length})
                        </p>
                        <button
                          onClick={ajouterZone}
                          style={{ display: 'flex', alignItems: 'center', gap: '5px', background: '#E8F2FC', border: 'none', borderRadius: '7px', padding: '5px 10px', fontSize: '12px', fontWeight: 700, color: '#1B5FA8', cursor: 'pointer' }}
                        >
                          <PlusIcon size={12} /> Ajouter
                        </button>
                      </div>
                      {editZones.length === 0 && <p style={{ fontSize: '12px', color: '#9CA3AF', textAlign: 'center', padding: '12px 0' }}>Aucune zone · utilisez les zones visuelles sur l'app mobile</p>}
                      {editZones.map((z, i) => (
                        <div key={z.id || `new-${i}`} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', background: '#F8FBFF', borderRadius: '9px', padding: '10px', border: '1px solid #D0E4F4' }}>
                          <div style={{ width: 12, height: 12, borderRadius: '50%', background: z.couleur, flexShrink: 0 }} />
                          <input
                            value={z.nom}
                            onChange={e => modifierZone(i, 'nom', e.target.value)}
                            style={{ ...inputStyle, flex: 1, margin: 0, padding: '6px 10px', fontSize: '13px' }}
                          />
                          {/* Couleurs */}
                          <div style={{ display: 'flex', gap: '4px' }}>
                            {COULEURS_ZONES.map(col => (
                              <button
                                key={col}
                                onClick={() => modifierZone(i, 'couleur', col)}
                                style={{ width: 18, height: 18, borderRadius: '4px', background: col, border: z.couleur === col ? '2px solid #0D3A6E' : 'none', cursor: 'pointer' }}
                              />
                            ))}
                          </div>
                          <button
                            onClick={() => supprimerZoneEdit(i)}
                            style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '6px', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                          >
                            <XIcon size={12} style={{ color: '#DC2626' }} />
                          </button>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => sauvegarderChantier(c.id)}
                      disabled={sauvegarde}
                      style={{ width: '100%', background: '#1B5FA8', color: '#fff', border: 'none', borderRadius: '11px', padding: '13px', fontSize: '14px', fontWeight: 700, cursor: 'pointer', marginTop: '14px', opacity: sauvegarde ? 0.6 : 1 }}
                    >
                      {sauvegarde ? 'Sauvegarde...' : 'Enregistrer les modifications'}
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* ── ST ───────────────────────────────────────────────────────────── */}
      {onglet === 'st' && (
        <div>
          <div style={{ background: '#E8F2FC', borderRadius: '11px', padding: '12px 16px', marginBottom: '16px', border: '1px solid rgba(27,95,168,0.15)' }}>
            <p style={{ fontSize: '12px', color: '#2C5282', margin: 0 }}>
              👷 {sousTraitants.length} intervenant{sousTraitants.length !== 1 ? 's' : ''} unique{sousTraitants.length !== 1 ? 's' : ''} — profils dédupliqués par nom.
            </p>
          </div>
          {sousTraitants.length === 0 ? (
            <div className="bg-white rounded-xl py-16 flex flex-col items-center gap-3" style={{ border: '1px solid #E5E7EB' }}>
              <p style={{ fontSize: '36px' }}>👷</p>
              <p className="text-sm font-600" style={{ color: '#374151' }}>Aucun ST pour l'instant</p>
              <p className="text-xs" style={{ color: '#9CA3AF' }}>Partagez un code chantier pour qu'ils rejoignent</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl overflow-hidden" style={{ border: '1px solid #E5E7EB' }}>
              {sousTraitants.map((st, i) => {
                const actifAujourdhui = st.derniere_activite && new Date(st.derniere_activite).toDateString() === new Date().toDateString()
                const coulAvatar = COULEURS_ZONES[i % COULEURS_ZONES.length]
                return (
                  <div key={st.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '13px 16px', borderBottom: i < sousTraitants.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: coulAvatar, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>{initiales(st.prenom_nom)}</span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '13px', fontWeight: 600, color: '#1A3A5C', margin: 0 }}>{st.prenom_nom}</p>
                      <p style={{ fontSize: '11px', color: '#5B87B5', margin: '2px 0 0' }}>{st.specialite}</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: 7, height: 7, borderRadius: '50%', background: actifAujourdhui ? '#2A9D5C' : '#D1D5DB' }} />
                      <span style={{ fontSize: '11px', color: '#9CA3AF' }}>{fmtRelative(st.derniere_activite)}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* ── ADMINS ───────────────────────────────────────────────────────── */}
      {onglet === 'admins' && (
        <div>
          {/* Bouton inviter */}
          {userRole === 'proprietaire' && (
            <div style={{ marginBottom: '16px' }}>
              <button
                onClick={inviterAdmin}
                disabled={invitationEnCours}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px', width: '100%',
                  background: '#0D3A6E', color: '#fff', border: 'none', borderRadius: '13px',
                  padding: '16px 20px', cursor: 'pointer', opacity: invitationEnCours ? 0.6 : 1,
                }}
              >
                <span style={{ fontSize: '22px', fontWeight: 700, width: 28, textAlign: 'center' }}>+</span>
                <div style={{ textAlign: 'left' }}>
                  <p style={{ fontSize: '13px', fontWeight: 700, margin: 0 }}>Inviter un admin</p>
                  <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', margin: '2px 0 0' }}>Lien valide 7 jours · Accès Journal IA</p>
                </div>
              </button>

              {/* Lien d'invitation généré */}
              {lienInvitation && (
                <div style={{ background: '#F0FDF4', border: '1px solid #A7F3D0', borderRadius: '11px', padding: '14px 16px', marginTop: '12px' }}>
                  <p style={{ fontSize: '12px', fontWeight: 700, color: '#059669', marginBottom: '8px' }}>✓ Lien d'invitation généré</p>
                  <p style={{ fontSize: '11px', color: '#374151', marginBottom: '10px', lineHeight: 1.5 }}>
                    Envoyez ce lien à votre admin. Il devra l'ouvrir sur l'app mobile TraceChantier.
                  </p>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <code style={{ flex: 1, background: '#ECFDF5', padding: '8px 10px', borderRadius: '7px', fontSize: '11px', color: '#059669', wordBreak: 'break-all', fontFamily: 'monospace' }}>
                      {lienInvitation}
                    </code>
                    <button
                      onClick={copierLien}
                      style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: '6px', background: lienCopie ? '#059669' : '#1B5FA8', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 12px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                    >
                      {lienCopie ? <CheckIcon size={12} /> : <CopyIcon size={12} />}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Liste admins */}
          {admins.length === 0 ? (
            <div className="bg-white rounded-xl py-16 flex flex-col items-center gap-3" style={{ border: '1px solid #E5E7EB' }}>
              <p style={{ fontSize: '36px' }}>👔</p>
              <p className="text-sm font-600" style={{ color: '#374151' }}>Aucun admin</p>
              <p className="text-xs" style={{ color: '#9CA3AF' }}>Invitez des admins pour qu'ils accèdent au journal IA et aux photos</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl overflow-hidden" style={{ border: '1px solid #E5E7EB' }}>
              {admins.map((admin, i) => {
                const estProp = admin.role === 'proprietaire'
                return (
                  <div key={admin.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '13px 16px', borderBottom: i < admins.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: estProp ? '#0D3A6E' : '#1B5FA8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>{initiales(admin.prenom_nom)}</span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '13px', fontWeight: 600, color: '#1A3A5C', margin: 0 }}>{admin.prenom_nom}</p>
                    </div>
                    {estProp ? (
                      <span style={{ fontSize: '11px', fontWeight: 600, color: '#fff', background: '#0D3A6E', borderRadius: '8px', padding: '3px 9px' }}>Propriétaire</span>
                    ) : userRole === 'proprietaire' ? (
                      <button
                        onClick={() => setConfirmerRetrait(admin)}
                        disabled={retraitEnCours === admin.id}
                        style={{ background: '#FFF5F5', border: '1px solid rgba(192,57,43,0.25)', borderRadius: '8px', padding: '5px 12px', fontSize: '12px', fontWeight: 600, color: '#C0392B', cursor: 'pointer', opacity: retraitEnCours === admin.id ? 0.5 : 1 }}
                      >
                        {retraitEnCours === admin.id ? '...' : 'Retirer'}
                      </button>
                    ) : (
                      <span style={{ fontSize: '11px', fontWeight: 600, color: '#1B5FA8', background: '#E8F2FC', borderRadius: '8px', padding: '3px 9px' }}>Admin</span>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* Info accès IA */}
          <div style={{ background: '#F0F6FC', borderRadius: '13px', padding: '16px', marginTop: '16px', border: '1px solid #D0E4F4' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span style={{ background: '#0D3A6E', borderRadius: '7px', padding: '3px 8px', fontSize: '10px', color: '#fff', fontWeight: 800 }}>✨ IA</span>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#1A3A5C' }}>Accès Journal IA</span>
            </div>
            <p style={{ fontSize: '12px', color: '#5B87B5', margin: 0, lineHeight: 1.6 }}>
              Les admins ont le même accès que les surintendants : journal IA, photos, timeline. Le propriétaire gère en plus les paramètres et la facturation.
            </p>
          </div>
        </div>
      )}

      {/* Modal confirmation retrait */}
      {confirmerRetrait && (
        <div
          onClick={() => setConfirmerRetrait(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '400px', padding: '24px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <AlertIcon size={16} style={{ color: '#DC2626' }} />
              <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#111827', margin: 0 }}>Retirer {confirmerRetrait.prenom_nom} ?</h2>
            </div>
            <p style={{ fontSize: '13px', color: '#6B7280', lineHeight: 1.6, marginBottom: '20px' }}>
              Cette personne perdra l'accès au dashboard et à l'application. Ses données ne seront pas supprimées.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={() => setConfirmerRetrait(null)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #D1D5DB', background: '#fff', color: '#374151', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                Annuler
              </button>
              <button onClick={() => retirerAdmin(confirmerRetrait)} style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', background: '#DC2626', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                Retirer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
