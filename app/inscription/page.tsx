'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { PLANS, PLANS_UI, LOOKUP_KEYS } from '@/lib/plans'

const PLANS_LIST = [
  { id: 'demarrage',  label: PLANS.demarrage.label,  prix: PLANS.demarrage.prix_mensuel,  badge: null,       features: PLANS_UI.demarrage.features },
  { id: 'maitre',     label: PLANS.maitre.label,      prix: PLANS.maitre.prix_mensuel,      badge: 'Populaire', features: PLANS_UI.maitre.features },
  { id: 'entreprise', label: PLANS.entreprise.label,  prix: PLANS.entreprise.prix_mensuel, badge: null,       features: PLANS_UI.entreprise.features },
]

function emailValide(e: string) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e.trim()) }

// ── Palette ─────────────────────────────────────────────────────────────────
const C = {
  ink:    '#111827', inkMid: '#374151', inkLight: '#6B7280',
  border: '#E5E7EB', bg: '#F9FAFB', accent: '#1B5FA8',
  green:  '#059669', red: '#DC2626', redBg: '#FEF2F2',
}

// ── Composant principal ──────────────────────────────────────────────────────
export default function InscriptionPage() {
  const searchParams = useSearchParams()
  const abonnementParam = searchParams.get('abonnement')

  const [etape, setEtape] = useState(1)
  const [soumis, setSoumis] = useState(false)
  const [chargement, setChargement] = useState(false)
  const [erreur, setErreur] = useState<string | null>(null)

  // Retour depuis Stripe après abandon — compte créé mais pas d'abonnement
  if (abonnementParam === 'cancel') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.bg, fontFamily: "'DM Sans','Segoe UI',system-ui,sans-serif", padding: 24 }}>
        <div style={{ maxWidth: 420, width: '100%', textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: C.ink, marginBottom: 12 }}>Abonnement non complété</h1>
          <p style={{ fontSize: 14, color: C.inkLight, lineHeight: 1.7, marginBottom: 28 }}>
            Votre compte a bien été créé, mais vous n'avez pas finalisé votre abonnement Stripe.
            Connectez-vous pour compléter l'activation de votre compte.
          </p>
          <Link href="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: C.accent, color: '#fff', borderRadius: 10, padding: '13px 24px', fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>
            Se connecter et activer →
          </Link>
          <p style={{ marginTop: 16, fontSize: 12, color: C.inkLight }}>
            Pas encore de compte ?{' '}
            <Link href="/inscription" style={{ color: C.accent, fontWeight: 600 }}>Recommencer l'inscription</Link>
          </p>
        </div>
      </div>
    )
  }

  // Étape 1 — Profil
  const [prenomNom, setPrenomNom] = useState('')
  const [email, setEmail] = useState('')
  const [motDePasse, setMotDePasse] = useState('')
  const [confirmer, setConfirmer] = useState('')

  // Étape 2 — Entreprise
  const [nomEntreprise, setNomEntreprise] = useState('')
  const [telephone, setTelephone] = useState('')
  const [ville, setVille] = useState('')

  // Étape 3 — Plan + CGU
  const [plan, setPlan] = useState<'demarrage' | 'maitre' | 'entreprise'>('maitre')
  const [cguAccepte, setCguAccepte] = useState(false)

  async function handleInscription() {
    if (soumis) return
    setSoumis(true)
    setChargement(true)
    setErreur(null)

    const supabase = createClient()
    const emailNorm = email.trim().toLowerCase()

    try {
      // 1. Créer le compte auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: emailNorm,
        password: motDePasse,
        options: { data: { prenom_nom: prenomNom.trim() } },
      })
      if (authError) throw authError
      if (!authData.user) throw new Error('Erreur création compte')

      // 2. Créer le compte complet (entreprise + profil via RPC)
      const { error: rpcError } = await supabase.rpc('creer_compte_complet', {
        p_user_id:        authData.user.id,
        p_email:          emailNorm,
        p_prenom_nom:     prenomNom.trim(),
        p_nom_entreprise: nomEntreprise.trim(),
        p_telephone:      telephone.trim(),
        p_ville:          ville.trim(),
        p_plan:           plan,
      })
      if (rpcError) throw rpcError

      // 3. Ouvrir une session pour appeler l'Edge Function
      const { data: signInData } = await supabase.auth.signInWithPassword({
        email: emailNorm,
        password: motDePasse,
      })
      const accessToken = signInData.session?.access_token

      // 4. Appeler creer-checkout pour l'essai Stripe
      const lookupKey = LOOKUP_KEYS[plan]
      if (lookupKey && accessToken) {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/creer-checkout`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`,
              'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
            },
            body: JSON.stringify({
              mode: 'checkout',
              price_lookup_key: lookupKey,
              with_trial: true,
              success_url: `${window.location.origin}/dashboard?abonnement=success`,
              cancel_url:  `${window.location.origin}/inscription?abonnement=cancel`,
            }),
          }
        )
        const json = await res.json()
        if (res.ok && json.url && json.url.startsWith('https://checkout.stripe.com/')) {
          window.location.href = json.url
          return
        }
      }

      // Fallback si Stripe échoue — rediriger vers le dashboard
      window.location.href = '/dashboard'
    } catch (err: any) {
      const msg = err.message?.includes('User already registered')
        ? 'Un compte existe déjà avec cette adresse courriel. Connectez-vous sur /login pour compléter votre abonnement.'
        : err.message ?? 'Une erreur est survenue.'
      setErreur(msg)
      setSoumis(false)
    } finally {
      setChargement(false)
    }
  }

  function validerEtape1() {
    if (!prenomNom.trim() || prenomNom.trim().length < 2)
      return setErreur('Veuillez entrer votre prénom et nom.')
    if (!emailValide(email))
      return setErreur('Adresse courriel invalide.')
    if (motDePasse.length < 8)
      return setErreur('Le mot de passe doit contenir au moins 8 caractères.')
    if (motDePasse !== confirmer)
      return setErreur('Les mots de passe ne correspondent pas.')
    setErreur(null)
    setEtape(2)
  }

  function validerEtape2() {
    if (!nomEntreprise.trim())
      return setErreur("Veuillez entrer le nom de votre entreprise.")
    setErreur(null)
    setEtape(3)
  }

  const progPct = etape === 1 ? '33%' : etape === 2 ? '66%' : '100%'

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: "'DM Sans','Segoe UI',system-ui,sans-serif", background: C.bg }}>

      {/* ── Panneau gauche branding ── */}
      <div style={{
        width: 420, flexShrink: 0, background: '#0D2E52',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        padding: '40px 36px',
      }} className="hidden lg:flex">
        <div>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(46,143,212,0.2)', border: '1px solid rgba(46,143,212,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="18" height="18" viewBox="0 0 108 160" fill="none">
                <rect x="51" y="44" width="12" height="80" rx="2" fill="#4A9FD4"/>
                <rect x="10" y="44" width="92" height="8" rx="2" fill="#4A9FD4" opacity="0.7"/>
                <line x1="57" y1="16" x2="95" y2="44" stroke="#4A9FD4" strokeWidth="2" opacity="0.5"/>
                <line x1="57" y1="16" x2="20" y2="44" stroke="#4A9FD4" strokeWidth="2" opacity="0.4"/>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>TraceChantier</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>Créer un compte</div>
            </div>
          </Link>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {[
            { ico: '📸', titre: 'Photos terrain', desc: 'ST soumet en 2 taps, sans compte' },
            { ico: '🤖', titre: 'Journal IA', desc: 'Généré automatiquement chaque jour' },
            { ico: '📄', titre: 'Rapports PDF', desc: 'Envoyez-les à vos clients en 30 s' },
            { ico: '🔒', titre: 'Conformité CCQ/CNESST', desc: 'Traces horodatées, valeur légale' },
          ].map((f) => (
            <div key={f.titre} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 9, background: 'rgba(46,143,212,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>{f.ico}</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', marginBottom: 2 }}>{f.titre}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', lineHeight: 1.5 }}>{f.desc}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', lineHeight: 1.7 }}>
          14 jours d'essai gratuit · Aucune carte requise<br/>
          Annulable à tout moment
        </div>
      </div>

      {/* ── Panneau droit formulaire ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
        <div style={{ width: '100%', maxWidth: 420 }}>

          {/* Barre de progression */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: C.ink }}>
                {etape === 1 ? 'Votre profil' : etape === 2 ? 'Votre entreprise' : 'Choisir un plan'}
              </span>
              <span style={{ fontSize: 12, color: C.inkLight }}>Étape {etape} / 3</span>
            </div>
            <div style={{ height: 4, background: C.border, borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: progPct, background: C.accent, borderRadius: 4, transition: 'width 0.3s ease' }}/>
            </div>
          </div>

          {/* Erreur globale */}
          {erreur && (
            <div style={{ padding: '12px 14px', borderRadius: 10, background: C.redBg, color: C.red, border: `1px solid #FECACA`, fontSize: 13, marginBottom: 16 }}>
              {erreur.includes('/login')
                ? <>{erreur.split('/login')[0]} <Link href="/login" style={{ color: C.red, fontWeight: 700, textDecoration: 'underline' }}>Se connecter →</Link></>
                : erreur
              }
            </div>
          )}

          {/* ══ ÉTAPE 1 — PROFIL ══ */}
          {etape === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: C.ink, letterSpacing: '-0.5px', margin: 0 }}>Créer votre compte</h1>
              <p style={{ fontSize: 13, color: C.inkLight, margin: 0, marginTop: -8 }}>
                Déjà un compte ? <Link href="/login" style={{ color: C.accent, fontWeight: 600 }}>Se connecter</Link>
              </p>

              <div>
                <label style={lblStyle}>PRÉNOM ET NOM</label>
                <input style={inputStyle} placeholder="Marc Bouchard" value={prenomNom} onChange={e => { setPrenomNom(e.target.value); setErreur(null) }} />
              </div>
              <div>
                <label style={lblStyle}>COURRIEL PROFESSIONNEL</label>
                <input style={inputStyle} type="email" placeholder="marc@construction.com" value={email} onChange={e => { setEmail(e.target.value); setErreur(null) }} autoCapitalize="none" />
              </div>
              <div>
                <label style={lblStyle}>MOT DE PASSE</label>
                <input style={inputStyle} type="password" placeholder="Minimum 8 caractères" value={motDePasse} onChange={e => { setMotDePasse(e.target.value); setErreur(null) }} />
              </div>
              <div>
                <label style={lblStyle}>CONFIRMER LE MOT DE PASSE</label>
                <input style={inputStyle} type="password" placeholder="••••••••" value={confirmer} onChange={e => { setConfirmer(e.target.value); setErreur(null) }} />
              </div>

              <button style={btnStyle} onClick={validerEtape1}>
                Continuer — Mon entreprise →
              </button>
            </div>
          )}

          {/* ══ ÉTAPE 2 — ENTREPRISE ══ */}
          {etape === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: C.ink, letterSpacing: '-0.5px', margin: 0 }}>Votre entreprise</h1>

              <div>
                <label style={lblStyle}>NOM DE L'ENTREPRISE</label>
                <input style={inputStyle} placeholder="Construction Bouchard Inc." value={nomEntreprise} onChange={e => { setNomEntreprise(e.target.value); setErreur(null) }} />
              </div>
              <div>
                <label style={lblStyle}>TÉLÉPHONE (optionnel)</label>
                <input style={inputStyle} type="tel" placeholder="(514) 555-0123" value={telephone} onChange={e => setTelephone(e.target.value)} />
              </div>
              <div>
                <label style={lblStyle}>VILLE / PROVINCE (optionnel)</label>
                <input style={inputStyle} placeholder="Laval, Québec" value={ville} onChange={e => setVille(e.target.value)} />
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button style={{ ...btnStyle, flex: 1, background: '#fff', color: C.accent, border: `1.5px solid ${C.accent}` }} onClick={() => { setErreur(null); setEtape(1) }}>
                  ← Retour
                </button>
                <button style={{ ...btnStyle, flex: 2 }} onClick={validerEtape2}>
                  Choisir mon plan →
                </button>
              </div>
            </div>
          )}

          {/* ══ ÉTAPE 3 — PLAN ══ */}
          {etape === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: C.ink, letterSpacing: '-0.5px', margin: 0 }}>Choisissez votre plan</h1>
              <p style={{ fontSize: 12, color: C.inkLight, margin: 0, marginTop: -8 }}>14 jours d'essai gratuit · Aucune carte requise</p>

              {PLANS_LIST.map((p) => (
                <div
                  key={p.id}
                  onClick={() => setPlan(p.id as any)}
                  style={{
                    borderRadius: 12, padding: '14px 16px', cursor: 'pointer',
                    border: plan === p.id ? `2px solid ${C.accent}` : `1.5px solid ${C.border}`,
                    background: plan === p.id ? '#EBF4FF' : '#fff',
                    transition: 'all 0.15s',
                    position: 'relative',
                  }}
                >
                  {p.badge && (
                    <span style={{ position: 'absolute', top: 10, right: 12, background: '#F59E0B', color: '#fff', fontSize: 9, fontWeight: 800, borderRadius: 4, padding: '2px 6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {p.badge}
                    </span>
                  )}
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 4 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: C.accent, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{p.label}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 8 }}>
                    <span style={{ fontSize: 28, fontWeight: 800, color: C.ink, lineHeight: 1 }}>{p.prix}$</span>
                    <span style={{ fontSize: 12, color: C.inkLight }}>/mois</span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {p.features.slice(0, 3).map(f => (
                      <span key={f} style={{ fontSize: 11, color: C.inkMid, background: C.bg, borderRadius: 4, padding: '2px 7px', border: `1px solid ${C.border}` }}>✓ {f}</span>
                    ))}
                  </div>
                </div>
              ))}

              {/* CGU */}
              <div
                onClick={() => setCguAccepte(!cguAccepte)}
                style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 14px', borderRadius: 10, background: '#F8FBFF', border: `1px solid ${C.border}`, cursor: 'pointer' }}
              >
                <div style={{ width: 20, height: 20, borderRadius: 5, border: `2px solid ${cguAccepte ? C.accent : C.border}`, background: cguAccepte ? C.accent : '#fff', flexShrink: 0, marginTop: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {cguAccepte && <span style={{ color: '#fff', fontSize: 12, fontWeight: 700 }}>✓</span>}
                </div>
                <span style={{ fontSize: 12, color: C.inkMid, lineHeight: 1.6 }}>
                  J'ai lu et j'accepte les{' '}
                  <Link href="/cgu" target="_blank" style={{ color: C.accent, fontWeight: 600 }} onClick={e => e.stopPropagation()}>Conditions d'utilisation</Link>
                  {' '}et la{' '}
                  <Link href="/confidentialite" target="_blank" style={{ color: C.accent, fontWeight: 600 }} onClick={e => e.stopPropagation()}>Politique de confidentialité</Link>
                </span>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button style={{ ...btnStyle, flex: 1, background: '#fff', color: C.accent, border: `1.5px solid ${C.accent}` }} onClick={() => { setErreur(null); setEtape(2) }}>
                  ← Retour
                </button>
                <button
                  style={{ ...btnStyle, flex: 2, opacity: (!cguAccepte || chargement) ? 0.5 : 1, cursor: (!cguAccepte || chargement) ? 'not-allowed' : 'pointer' }}
                  disabled={!cguAccepte || chargement}
                  onClick={handleInscription}
                >
                  {chargement ? 'Création...' : 'Démarrer mon essai gratuit →'}
                </button>
              </div>

              <p style={{ textAlign: 'center', fontSize: 11, color: C.inkLight, margin: 0 }}>
                Paiement sécurisé par Stripe · Annulable à tout moment
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

// ── Styles helpers ────────────────────────────────────────────────────────────
const lblStyle: React.CSSProperties = {
  display: 'block', fontSize: 11, fontWeight: 700, color: '#5B87B5',
  letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6,
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '11px 13px', borderRadius: 9,
  border: '1.5px solid #D1D5DB', fontSize: 14, color: '#111827',
  background: '#fff', outline: 'none', boxSizing: 'border-box',
  transition: 'border-color 0.15s',
}

const btnStyle: React.CSSProperties = {
  padding: '13px 18px', borderRadius: 10, background: '#1B5FA8',
  color: '#fff', fontSize: 14, fontWeight: 700, border: 'none',
  cursor: 'pointer', transition: 'opacity 0.15s', width: '100%',
}
