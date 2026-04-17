'use client'

import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { PlusIcon, XIcon, CheckIcon, MapIcon, CopyIcon } from '@/components/Icons'

// Dimensions du canvas web — les zones sont stockées en ratios (0-1)
// Compatible avec GererZones.tsx (PLAN_W = SW-28, PLAN_H = 280/300) sur mobile
const PLAN_W = 700
const PLAN_H = 350

const COULEURS = [
  '#1B5FA8', '#2A9D5C', '#D4820A',
  '#C0392B', '#6B3FA0', '#0E8A8A',
]

interface ZoneLocale {
  tempId: string
  nom: string
  couleur: string
  position_x: number  // ratio 0-1
  position_y: number  // ratio 0-1
  largeur: number     // ratio 0-1
  hauteur: number     // ratio 0-1
  ordre: number
}

interface ZoneEnCours {
  x: number; y: number; w: number; h: number
}

export default function CreerChantierForm() {
  const router = useRouter()
  const supabase = createClient()

  const [etape, setEtape] = useState(1)
  const [chargement, setChargement] = useState(false)
  const [erreur, setErreur] = useState<string | null>(null)

  // Étape 1 — Info
  const [nom, setNom] = useState('')
  const [adresse, setAdresse] = useState('')
  const [description, setDescription] = useState('')
  const [dateDebut, setDateDebut] = useState('')

  // Étape 2 — Plan
  const [planFichier, setPlanFichier] = useState<File | null>(null)
  const [planPreview, setPlanPreview] = useState<string | null>(null)
  const [uploadEnCours, setUploadEnCours] = useState(false)
  const [planChemin, setPlanChemin] = useState<string | null>(null)

  // Étape 3 — Zones
  const [zones, setZones] = useState<ZoneLocale[]>([])
  const [zoneSelectee, setZoneSelectee] = useState<ZoneLocale | null>(null)
  const [couleur, setCouleur] = useState(COULEURS[0])
  const [nomZone, setNomZone] = useState('')
  const [zoneEnCours, setZoneEnCours] = useState<ZoneEnCours | null>(null)

  // Étape 4 — Résultat
  const [codeAcces, setCodeAcces] = useState('')
  const [chantierId, setChantierId] = useState('')
  const [copie, setCopie] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<{ startX: number; startY: number; active: boolean }>({ startX: 0, startY: 0, active: false })

  // ── Plan upload ──────────────────────────────────────────────────────────

  function choisirFichier(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    setPlanFichier(f)
    setPlanPreview(URL.createObjectURL(f))
  }

  async function uploadPlan(): Promise<string | null> {
    if (!planFichier) return null
    setUploadEnCours(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null
      const { data: profil } = await supabase
        .from('profils')
        .select('entreprise_id')
        .eq('id', user.id)
        .single()
      if (!profil?.entreprise_id) return null

      const ext = planFichier.type === 'image/png' ? 'png' : 'jpg'
      const chemin = `${profil.entreprise_id}/${Date.now()}/plan.${ext}`
      const { error } = await supabase.storage
        .from('plans-chantier')
        .upload(chemin, planFichier, { contentType: planFichier.type, upsert: false })

      if (error) { console.error('[upload plan]', error.message); return null }
      setPlanChemin(chemin)
      return chemin
    } finally {
      setUploadEnCours(false)
    }
  }

  // ── Zone drawing ─────────────────────────────────────────────────────────

  function getRelativePos(e: React.MouseEvent): { x: number; y: number } {
    if (!containerRef.current) return { x: 0, y: 0 }
    const rect = containerRef.current.getBoundingClientRect()
    return {
      x: Math.max(0, Math.min(e.clientX - rect.left, PLAN_W)),
      y: Math.max(0, Math.min(e.clientY - rect.top, PLAN_H)),
    }
  }

  function handleMouseDown(e: React.MouseEvent) {
    // Ne pas initier le dessin si on clique sur une zone existante
    if ((e.target as HTMLElement).closest('[data-zone]')) return
    const pos = getRelativePos(e)
    dragRef.current = { startX: pos.x, startY: pos.y, active: true }
    setZoneEnCours({ x: pos.x, y: pos.y, w: 0, h: 0 })
    setZoneSelectee(null)
    setNomZone('')
    e.preventDefault()
  }

  function handleMouseMove(e: React.MouseEvent) {
    if (!dragRef.current.active) return
    const pos = getRelativePos(e)
    const x = Math.min(dragRef.current.startX, pos.x)
    const y = Math.min(dragRef.current.startY, pos.y)
    const w = Math.abs(pos.x - dragRef.current.startX)
    const h = Math.abs(pos.y - dragRef.current.startY)
    setZoneEnCours({ x, y, w, h })
  }

  function handleMouseUp() {
    if (!dragRef.current.active) return
    dragRef.current.active = false
    if (!zoneEnCours || zoneEnCours.w < 20 || zoneEnCours.h < 20) {
      setZoneEnCours(null)
      return
    }
    // Stocker en ratios (0-1) — compatible mobile GererZones.tsx
    const nouvelleZone: ZoneLocale = {
      tempId: Date.now().toString(),
      nom: `Zone ${String.fromCharCode(65 + zones.length)}`,
      couleur,
      position_x: zoneEnCours.x / PLAN_W,
      position_y: zoneEnCours.y / PLAN_H,
      largeur: zoneEnCours.w / PLAN_W,
      hauteur: zoneEnCours.h / PLAN_H,
      ordre: zones.length,
    }
    setZones(prev => [...prev, nouvelleZone])
    setZoneSelectee(nouvelleZone)
    setNomZone(nouvelleZone.nom)
    setZoneEnCours(null)
  }

  function mettreAJourNom(v: string) {
    setNomZone(v)
    if (zoneSelectee) {
      setZones(z => z.map(z => z.tempId === zoneSelectee.tempId ? { ...z, nom: v } : z))
      setZoneSelectee(s => s ? { ...s, nom: v } : s)
    }
  }

  function changerCouleur(c: string) {
    setCouleur(c)
    if (zoneSelectee) {
      setZones(z => z.map(z => z.tempId === zoneSelectee.tempId ? { ...z, couleur: c } : z))
      setZoneSelectee(s => s ? { ...s, couleur: c } : s)
    }
  }

  function supprimerZone() {
    if (!zoneSelectee) return
    setZones(z => z.filter(z => z.tempId !== zoneSelectee.tempId))
    setZoneSelectee(null)
    setNomZone('')
  }

  // ── Navigation étapes ────────────────────────────────────────────────────

  async function allerEtape2() {
    if (!nom.trim()) { setErreur('Le nom du chantier est requis.'); return }
    setErreur(null)
    setEtape(2)
  }

  async function allerEtape3() {
    // Upload le plan maintenant si un fichier a été sélectionné
    if (planFichier && !planChemin) {
      const chemin = await uploadPlan()
      if (!chemin) {
        setErreur('Erreur lors de l\'upload du plan. Réessayez ou passez cette étape.')
        return
      }
    }
    setErreur(null)
    setEtape(3)
  }

  async function creerChantier() {
    setChargement(true)
    setErreur(null)
    try {
      const res = await fetch('/api/creer-chantier', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nom: nom.trim(),
          adresse: adresse.trim() || null,
          description: description.trim() || null,
          date_debut: dateDebut || null,
          plan_chemin: planChemin,
          zones: zones.map((z, i) => ({
            nom: z.nom,
            couleur: z.couleur,
            position_x: z.position_x,
            position_y: z.position_y,
            largeur: z.largeur,
            hauteur: z.hauteur,
            ordre: i,
          })),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Erreur serveur')
      setCodeAcces(data.codeAcces ?? '')
      setChantierId(data.chantierId ?? '')
      setEtape(4)
    } catch (e: any) {
      setErreur(e.message)
    } finally {
      setChargement(false)
    }
  }

  async function copierCode() {
    await navigator.clipboard.writeText(codeAcces)
    setCopie(true)
    setTimeout(() => setCopie(false), 2000)
  }

  // ── Header ───────────────────────────────────────────────────────────────

  const tabs = ['Info', 'Plan', 'Zones', 'Code']

  function Header() {
    const pct = `${(etape / 4) * 100}%`
    return (
      <div style={{ background: '#0D3A6E', borderRadius: '16px 16px 0 0', padding: '24px 28px 20px' }}>
        {etape < 4 && (
          <button
            onClick={() => etape > 1 ? setEtape(etape - 1) : router.push('/dashboard')}
            style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.65)', fontSize: '13px', fontWeight: 600, cursor: 'pointer', marginBottom: '12px', padding: 0 }}
          >
            ← Retour
          </button>
        )}
        {/* Barre de progression */}
        <div style={{ height: '3px', background: 'rgba(255,255,255,0.15)', borderRadius: '2px', marginBottom: '14px' }}>
          <div style={{ height: '3px', background: '#fff', borderRadius: '2px', width: pct, transition: 'width 0.3s ease' }} />
        </div>
        {/* Onglets */}
        <div style={{ display: 'flex', gap: '6px' }}>
          {tabs.map((t, i) => {
            const n = i + 1
            const done = n < etape
            const active = n === etape
            return (
              <div
                key={t}
                style={{
                  flex: 1, padding: '6px 4px', borderRadius: '7px', textAlign: 'center',
                  background: active ? 'rgba(255,255,255,0.18)' : done ? 'rgba(255,255,255,0.08)' : 'transparent',
                }}
              >
                <span style={{ fontSize: '11px', fontWeight: active || done ? 700 : 500, color: active || done ? '#fff' : 'rgba(255,255,255,0.4)' }}>
                  {done ? `✓ ${t}` : `${n}. ${t}`}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // ── Rendu étapes ─────────────────────────────────────────────────────────

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px 14px', borderRadius: '11px',
    border: '1px solid #D0E4F4', fontSize: '14px', color: '#1A3A5C',
    background: '#F8FBFF', outline: 'none', boxSizing: 'border-box',
  }

  const labelStyle: React.CSSProperties = {
    fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em',
    textTransform: 'uppercase', color: '#5B87B5', marginBottom: '6px', display: 'block', marginTop: '16px',
  }

  const btnPrimaryStyle: React.CSSProperties = {
    background: '#1B5FA8', color: '#fff', border: 'none', borderRadius: '12px',
    padding: '14px 24px', fontSize: '15px', fontWeight: 600, cursor: 'pointer',
    width: '100%', marginTop: '20px', transition: 'opacity 0.15s',
  }

  // ── Étape 1 — Info ────────────────────────────────────────────
  if (etape === 1) return (
    <div style={{ background: '#fff', borderRadius: '16px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', overflow: 'hidden', maxWidth: '640px', margin: '0 auto' }}>
      <Header />
      <div style={{ padding: '28px 28px 32px' }}>
        <label style={labelStyle}>Nom du chantier *</label>
        <input style={inputStyle} placeholder="Résidence Les Pins" value={nom} onChange={e => setNom(e.target.value)} onKeyDown={e => e.key === 'Enter' && allerEtape2()} autoFocus />
        <label style={labelStyle}>Adresse</label>
        <input style={inputStyle} placeholder="450 boul. des Laurentides, Laval" value={adresse} onChange={e => setAdresse(e.target.value)} />
        <label style={labelStyle}>Description (optionnel)</label>
        <textarea style={{ ...inputStyle, height: '80px', resize: 'vertical' }} placeholder="Rénovation complète de la cuisine et salle de bain..." value={description} onChange={e => setDescription(e.target.value)} />
        <label style={labelStyle}>Date de début</label>
        <input style={inputStyle} type="date" value={dateDebut} onChange={e => setDateDebut(e.target.value)} />
        {erreur && <p style={{ fontSize: '13px', color: '#DC2626', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', padding: '10px 14px', marginTop: '14px' }}>{erreur}</p>}
        <button style={btnPrimaryStyle} onClick={allerEtape2}>
          Suivant — Plan du site →
        </button>
      </div>
    </div>
  )

  // ── Étape 2 — Plan ────────────────────────────────────────────
  if (etape === 2) return (
    <div style={{ background: '#fff', borderRadius: '16px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', overflow: 'hidden', maxWidth: '640px', margin: '0 auto' }}>
      <Header />
      <div style={{ padding: '28px 28px 32px' }}>
        {!planPreview ? (
          <label style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px',
            border: '2px dashed #D0E4F4', borderRadius: '13px', padding: '44px 24px',
            cursor: 'pointer', transition: 'border-color 0.15s', background: '#F8FBFF',
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = '#1B5FA8'}
          onMouseLeave={e => e.currentTarget.style.borderColor = '#D0E4F4'}
          >
            <MapIcon size={36} style={{ color: '#9BBAD6' }} />
            <span style={{ fontSize: '15px', fontWeight: 600, color: '#1A3A5C' }}>Importer le plan du site</span>
            <span style={{ fontSize: '12px', color: '#5B87B5' }}>JPG, PNG — photo du plan papier acceptée</span>
            <input type="file" accept="image/*" onChange={choisirFichier} style={{ display: 'none' }} />
          </label>
        ) : (
          <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid #D0E4F4', marginBottom: '16px' }}>
            <img src={planPreview} alt="Plan" style={{ width: '100%', maxHeight: '280px', objectFit: 'contain', background: '#EAF0F8', display: 'block' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: '#fff' }}>
              <span style={{ fontSize: '12px', color: '#2A9D5C', fontWeight: 600 }}>✓ Plan importé</span>
              <label style={{ fontSize: '11px', color: '#5B87B5', cursor: 'pointer' }}>
                Remplacer
                <input type="file" accept="image/*" onChange={choisirFichier} style={{ display: 'none' }} />
              </label>
            </div>
          </div>
        )}
        <div style={{ background: '#E8F2FC', borderRadius: '11px', padding: '13px', marginTop: '16px', border: '1px solid rgba(27,95,168,0.15)' }}>
          <p style={{ fontSize: '11px', fontWeight: 700, color: '#1B5FA8', margin: '0 0 4px' }}>💡 CONSEIL</p>
          <p style={{ fontSize: '12px', color: '#2C5282', margin: 0, lineHeight: 1.6 }}>Une photo du plan papier suffit. Même approximatif, c'est parfait pour démarrer.</p>
        </div>
        {erreur && <p style={{ fontSize: '13px', color: '#DC2626', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', padding: '10px 14px', marginTop: '14px' }}>{erreur}</p>}
        <button
          style={{ ...btnPrimaryStyle, opacity: uploadEnCours ? 0.6 : 1 }}
          onClick={allerEtape3}
          disabled={uploadEnCours}
        >
          {uploadEnCours ? 'Upload en cours...' : 'Zones →'}
        </button>
      </div>
    </div>
  )

  // ── Étape 3 — Zones ───────────────────────────────────────────
  if (etape === 3) return (
    <div style={{ background: '#fff', borderRadius: '16px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', overflow: 'hidden', maxWidth: '800px', margin: '0 auto' }}>
      <Header />
      <div style={{ padding: '20px 24px 32px' }}>
        {/* Info banner */}
        <div style={{ background: '#E8F2FC', borderRadius: '10px', padding: '11px 14px', marginBottom: '16px', border: '1px solid rgba(27,95,168,0.15)' }}>
          <span style={{ fontSize: '12px', color: '#2C5282', fontWeight: 500 }}>
            ✏️ Glissez sur le plan pour dessiner une zone · Cliquez pour sélectionner
          </span>
        </div>

        {/* Canvas des zones */}
        <div
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{
            position: 'relative', width: PLAN_W, height: PLAN_H, maxWidth: '100%',
            borderRadius: '12px', overflow: 'hidden', cursor: 'crosshair',
            border: '1.5px solid #D0E4F4', background: '#EAF0F8', userSelect: 'none',
          }}
        >
          {/* Image plan */}
          {planPreview && (
            <img
              src={planPreview}
              alt="Plan"
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain', pointerEvents: 'none' }}
              draggable={false}
            />
          )}
          {!planPreview && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '13px', color: '#9BBAD6' }}>Aucun plan — zones sur fond neutre</span>
            </div>
          )}

          {/* Zones existantes */}
          {zones.map(z => {
            const sel = zoneSelectee?.tempId === z.tempId
            return (
              <div
                key={z.tempId}
                data-zone="true"
                onClick={e => { e.stopPropagation(); setZoneSelectee(z); setNomZone(z.nom); setCouleur(z.couleur) }}
                style={{
                  position: 'absolute',
                  left: z.position_x * PLAN_W, top: z.position_y * PLAN_H,
                  width: z.largeur * PLAN_W, height: z.hauteur * PLAN_H,
                  background: z.couleur + '99',
                  border: `${sel ? 2.5 : 1.5}px solid ${sel ? '#fff' : z.couleur}`,
                  borderRadius: '7px', cursor: 'pointer', overflow: 'hidden',
                  boxShadow: sel ? `0 0 0 3px ${z.couleur}55` : 'none',
                }}
              >
                <div style={{
                  position: 'absolute', top: 4, left: 4,
                  background: z.couleur, borderRadius: '4px',
                  padding: '2px 7px', maxWidth: '90%',
                }}>
                  <span style={{ fontSize: '10px', fontWeight: 700, color: '#fff', letterSpacing: '0.5px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>
                    {z.nom}
                  </span>
                </div>
              </div>
            )
          })}

          {/* Zone en cours de dessin */}
          {zoneEnCours && zoneEnCours.w > 5 && zoneEnCours.h > 5 && (
            <div style={{
              position: 'absolute',
              left: zoneEnCours.x, top: zoneEnCours.y,
              width: zoneEnCours.w, height: zoneEnCours.h,
              background: couleur + '55', border: `2px dashed ${couleur}`,
              borderRadius: '6px', pointerEvents: 'none',
            }} />
          )}

          {/* Hint si pas de zone */}
          {zones.length === 0 && !zoneEnCours && (
            <div style={{ position: 'absolute', bottom: 10, left: 0, right: 0, display: 'flex', justifyContent: 'center', pointerEvents: 'none' }}>
              <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.9)', background: 'rgba(0,0,0,0.35)', borderRadius: '20px', padding: '5px 14px' }}>
                👆 Glissez pour dessiner une zone
              </span>
            </div>
          )}
        </div>

        {/* Compteur */}
        <p style={{ fontSize: '12px', color: '#5B87B5', marginTop: '10px', fontWeight: 500 }}>
          {zones.length} zone{zones.length !== 1 ? 's' : ''}
        </p>

        {/* Sélecteur couleur */}
        <div style={{ marginTop: '14px' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#5B87B5', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Couleur de la prochaine zone
          </span>
          <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
            {COULEURS.map(c => (
              <button
                key={c}
                onClick={() => changerCouleur(c)}
                style={{
                  width: 32, height: 32, borderRadius: '9px', background: c, border: 'none', cursor: 'pointer',
                  outline: couleur === c ? `3px solid #1A3A5C` : 'none',
                  transform: couleur === c ? 'scale(1.15)' : 'scale(1)',
                  transition: 'transform 0.1s, outline 0.1s',
                }}
              />
            ))}
          </div>
        </div>

        {/* Zone sélectionnée */}
        {zoneSelectee && (
          <div style={{ marginTop: '16px', background: '#fff', borderRadius: '12px', padding: '16px', border: '1px solid #D0E4F4' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: zoneSelectee.couleur, flexShrink: 0 }} />
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#1A3A5C', flex: 1 }}>Zone sélectionnée</span>
              <button
                onClick={supprimerZone}
                style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '7px', padding: '5px 10px', fontSize: '12px', color: '#DC2626', fontWeight: 600, cursor: 'pointer' }}
              >
                🗑 Supprimer
              </button>
            </div>
            <input
              value={nomZone}
              onChange={e => mettreAJourNom(e.target.value)}
              style={{ ...inputStyle, marginTop: 0 }}
              placeholder="Nom de la zone"
            />
            <p style={{ fontSize: '11px', color: '#9BBAD6', marginTop: '6px', marginBottom: 0 }}>Modifications sauvegardées à la création</p>
          </div>
        )}

        {erreur && <p style={{ fontSize: '13px', color: '#DC2626', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', padding: '10px 14px', marginTop: '14px' }}>{erreur}</p>}
        <button
          style={{ ...btnPrimaryStyle, opacity: chargement ? 0.6 : 1 }}
          onClick={creerChantier}
          disabled={chargement}
        >
          {chargement ? 'Création en cours...' : 'Créer le chantier →'}
        </button>
      </div>
    </div>
  )

  // ── Étape 4 — Code ────────────────────────────────────────────
  return (
    <div style={{ background: '#fff', borderRadius: '16px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', overflow: 'hidden', maxWidth: '640px', margin: '0 auto' }}>
      <Header />
      <div style={{ padding: '28px 28px 36px' }}>
        {/* Code d'accès */}
        <div style={{ background: '#0D3A6E', borderRadius: '14px', padding: '24px', textAlign: 'center', marginBottom: '20px' }}>
          <p style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '18px' }}>
            Code d'accès · Généré automatiquement
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '14px' }}>
            {codeAcces.split('').map((c, i) => (
              <div key={i} style={{ width: 52, height: 60, background: 'rgba(255,255,255,0.15)', borderRadius: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.25)' }}>
                <span style={{ fontSize: '26px', fontWeight: 700, color: '#fff', fontFamily: 'monospace' }}>{c}</span>
              </div>
            ))}
          </div>
          <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', marginBottom: 0 }}>
            Partagez ce code avec vos sous-traitants pour accéder au chantier
          </p>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <button
            onClick={copierCode}
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: copie ? '#ECFDF5' : '#F0F6FC', border: `1px solid ${copie ? '#A7F3D0' : '#D0E4F4'}`, borderRadius: '11px', padding: '12px', fontSize: '13px', fontWeight: 600, color: copie ? '#059669' : '#1B5FA8', cursor: 'pointer', transition: 'all 0.15s' }}
          >
            {copie ? <><CheckIcon size={14} /> Copié !</> : <><CopyIcon size={14} /> Copier le code</>}
          </button>
        </div>

        {/* Récap */}
        <div style={{ background: '#E8F2FC', borderRadius: '11px', padding: '14px', border: '1px solid rgba(27,95,168,0.15)', marginBottom: '20px' }}>
          <p style={{ fontSize: '10px', fontWeight: 700, color: '#1B5FA8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>Récapitulatif</p>
          <p style={{ fontSize: '13px', color: '#2C5282', margin: 0 }}>
            {nom} · {zones.length} zone{zones.length !== 1 ? 's' : ''} · Code {codeAcces}
          </p>
        </div>

        <button
          style={{ ...btnPrimaryStyle, marginTop: 0 }}
          onClick={() => router.push(`/dashboard/chantier/${chantierId}/journal`)}
        >
          Voir le chantier →
        </button>
        <p style={{ fontSize: '11px', color: '#9BBAD6', textAlign: 'center', marginTop: '10px' }}>
          Le code est modifiable depuis Équipe
        </p>
      </div>
    </div>
  )
}
