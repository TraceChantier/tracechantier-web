'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const PLANS = [
  {
    label: 'Solo',
    prix: '59$',
    desc: '1 admin · 3 chantiers · 30 IA/mois',
  },
  {
    label: 'PME',
    prix: '149$',
    badge: 'Populaire',
    desc: '5 admins · 10 chantiers · 300 IA/mois',
  },
  {
    label: 'Entreprise',
    prix: '249$',
    desc: '10 admins · 20 chantiers · 500 IA/mois',
  },
]

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [motDePasse, setMotDePasse] = useState('')
  const [chargement, setChargement] = useState(false)
  const [erreur, setErreur] = useState<string | null>(null)

  async function seConnecter(e: React.FormEvent) {
    e.preventDefault()
    setChargement(true)
    setErreur(null)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password: motDePasse })
    if (error) {
      setErreur('Courriel ou mot de passe invalide.')
      setChargement(false)
      return
    }
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: "'DM Sans', 'Segoe UI', system-ui, sans-serif", background: '#F4F5F7' }}>

      {/* ── Panneau gauche ── */}
      <div style={{
        display: 'none',
        flexDirection: 'column',
        width: 460,
        flexShrink: 0,
        background: '#111827',
        padding: '40px 40px 36px',
      }} className="lg-panel">
        <style>{`
          @media (min-width: 1024px) { .lg-panel { display: flex !important; } }
        `}</style>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'rgba(255,255,255,0.07)',
            border: '1px solid rgba(255,255,255,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="16" height="16" viewBox="0 0 108 160" fill="none">
              <rect x="51" y="44" width="12" height="80" rx="2" fill="white" opacity="0.9" />
              <rect x="10" y="44" width="92" height="8" rx="2" fill="white" opacity="0.5" />
              <line x1="57" y1="16" x2="95" y2="44" stroke="white" strokeWidth="2" opacity="0.4" />
              <line x1="57" y1="16" x2="20" y2="44" stroke="white" strokeWidth="2" opacity="0.3" />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', letterSpacing: '-0.01em' }}>TraceChantier</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>Dashboard web</div>
          </div>
        </div>

        {/* Spacer */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingTop: 48, paddingBottom: 48 }}>
          <p style={{ fontSize: 22, fontWeight: 600, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.3, marginBottom: 10 }}>
            La documentation de chantier,<br />enfin simple.
          </p>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6, marginBottom: 40 }}>
            Journal vocal, photos géolocalisées, synthèses IA.<br />
            Conçu pour les entrepreneurs généraux du Québec.
          </p>

          {/* Tarifs — affichage seulement */}
          <div style={{ marginBottom: 6 }}>
            <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', marginBottom: 12 }}>
              Tarifs
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {PLANS.map(p => (
                <div key={p.label} style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 10,
                  padding: '12px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  userSelect: 'none',
                }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{p.label}</span>
                      {p.badge && (
                        <span style={{
                          fontSize: 9, fontWeight: 700, letterSpacing: '0.04em',
                          color: '#F59E0B', background: 'rgba(245,158,11,0.12)',
                          border: '1px solid rgba(245,158,11,0.25)',
                          borderRadius: 4, padding: '1px 5px', textTransform: 'uppercase',
                        }}>{p.badge}</span>
                      )}
                    </div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>{p.desc}</div>
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'rgba(255,255,255,0.7)', whiteSpace: 'nowrap', marginLeft: 12 }}>
                    {p.prix}<span style={{ fontSize: 11, fontWeight: 400, color: 'rgba(255,255,255,0.3)' }}>/mois</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* App Store CTA */}
          <div style={{
            marginTop: 20,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 10,
            padding: '14px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: 8, flexShrink: 0,
              background: 'rgba(255,255,255,0.07)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white" opacity={0.7}>
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 2 }}>Nouvel utilisateur?</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', fontWeight: 500, lineHeight: 1.4 }}>
                La création de compte se fait sur l'application iOS.
              </div>
            </div>
          </div>
        </div>

        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.18)' }}>TraceChantier © 2026 · Montréal, QC</p>
      </div>

      {/* ── Panneau droit : formulaire ── */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px',
      }}>
        <div style={{ width: '100%', maxWidth: 380 }}>

          {/* Mobile : logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 32 }} className="mobile-logo">
            <style>{`@media (min-width: 1024px) { .mobile-logo { display: none !important; } }`}</style>
            <div style={{
              width: 34, height: 34, borderRadius: 9,
              background: '#111827',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="15" height="15" viewBox="0 0 108 160" fill="none">
                <rect x="51" y="44" width="12" height="80" rx="2" fill="white" />
                <rect x="10" y="44" width="92" height="8" rx="2" fill="white" opacity="0.5" />
                <line x1="57" y1="16" x2="95" y2="44" stroke="white" strokeWidth="2" opacity="0.4" />
                <line x1="57" y1="16" x2="20" y2="44" stroke="white" strokeWidth="2" opacity="0.3" />
              </svg>
            </div>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#111827', letterSpacing: '-0.01em' }}>TraceChantier</div>
          </div>

          {/* Entête */}
          <div style={{ marginBottom: 28 }}>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', letterSpacing: '-0.02em', margin: 0, marginBottom: 6 }}>
              Connexion
            </h1>
            <p style={{ fontSize: 13, color: '#6B7280', margin: 0 }}>
              Accès réservé aux administrateurs et propriétaires.
            </p>
          </div>

          {/* Formulaire */}
          <form onSubmit={seConnecter} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label htmlFor="email" style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>
                Courriel
              </label>
              <input
                id="email" type="email" value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="vous@exemple.com" required
                style={{
                  width: '100%', padding: '10px 12px', borderRadius: 8, fontSize: 14,
                  border: '1px solid #D1D5DB', background: '#fff', color: '#111827',
                  outline: 'none', boxSizing: 'border-box',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                  transition: 'border-color 0.15s, box-shadow 0.15s',
                }}
                onFocus={e => { e.target.style.borderColor = '#374151'; e.target.style.boxShadow = '0 0 0 3px rgba(55,65,81,0.08)' }}
                onBlur={e => { e.target.style.borderColor = '#D1D5DB'; e.target.style.boxShadow = '0 1px 2px rgba(0,0,0,0.04)' }}
              />
            </div>
            <div>
              <label htmlFor="mdp" style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>
                Mot de passe
              </label>
              <input
                id="mdp" type="password" value={motDePasse}
                onChange={e => setMotDePasse(e.target.value)}
                placeholder="••••••••" required
                style={{
                  width: '100%', padding: '10px 12px', borderRadius: 8, fontSize: 14,
                  border: '1px solid #D1D5DB', background: '#fff', color: '#111827',
                  outline: 'none', boxSizing: 'border-box',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                  transition: 'border-color 0.15s, box-shadow 0.15s',
                }}
                onFocus={e => { e.target.style.borderColor = '#374151'; e.target.style.boxShadow = '0 0 0 3px rgba(55,65,81,0.08)' }}
                onBlur={e => { e.target.style.borderColor = '#D1D5DB'; e.target.style.boxShadow = '0 1px 2px rgba(0,0,0,0.04)' }}
              />
            </div>

            {erreur && (
              <div style={{
                padding: '10px 12px', borderRadius: 8, fontSize: 13,
                background: '#FEF2F2', color: '#B91C1C', border: '1px solid #FCA5A5',
              }}>
                {erreur}
              </div>
            )}

            <button
              type="submit" disabled={chargement}
              style={{
                width: '100%', padding: '11px', borderRadius: 8, fontSize: 14,
                fontWeight: 600, color: '#fff', border: 'none',
                background: chargement ? '#6B7280' : '#111827',
                cursor: chargement ? 'wait' : 'pointer',
                marginTop: 4,
                transition: 'background 0.15s',
                letterSpacing: '-0.01em',
              }}
            >
              {chargement ? 'Connexion en cours…' : 'Se connecter'}
            </button>
          </form>

          {/* Séparateur */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '28px 0' }}>
            <div style={{ flex: 1, height: 1, background: '#E5E7EB' }} />
            <span style={{ fontSize: 11, color: '#9CA3AF', whiteSpace: 'nowrap' }}>Pas encore de compte?</span>
            <div style={{ flex: 1, height: 1, background: '#E5E7EB' }} />
          </div>

          {/* App Store */}
          <div style={{
            background: '#fff',
            border: '1px solid #E5E7EB',
            borderRadius: 10,
            padding: '16px',
            marginBottom: 28,
          }}>
            <p style={{ fontSize: 13, color: '#374151', margin: '0 0 14px', lineHeight: 1.5 }}>
              La création de compte se fait exclusivement depuis l'application mobile. Téléchargez l'app, créez votre entreprise et revenez vous connecter ici.
            </p>
            <a
              href="https://apps.apple.com/app/tracechantier/id6745164842"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: '#111827', color: '#fff',
                padding: '9px 16px', borderRadius: 8,
                fontSize: 13, fontWeight: 500, textDecoration: 'none',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#374151')}
              onMouseLeave={e => (e.currentTarget.style.background = '#111827')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
              Télécharger sur l'App Store
            </a>
          </div>

          {/* Mobile : tarifs */}
          <div className="mobile-plans">
            <style>{`@media (min-width: 1024px) { .mobile-plans { display: none !important; } }`}</style>
            <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', color: '#9CA3AF', textTransform: 'uppercase', marginBottom: 10 }}>
              Tarifs
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {PLANS.map(p => (
                <div key={p.label} style={{
                  background: '#fff', border: '1px solid #E5E7EB', borderRadius: 8,
                  padding: '10px 12px', display: 'flex', alignItems: 'center',
                  justifyContent: 'space-between', userSelect: 'none',
                }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{p.label}</span>
                      {p.badge && (
                        <span style={{
                          fontSize: 9, fontWeight: 700, letterSpacing: '0.04em',
                          color: '#B45309', background: '#FFFBEB',
                          border: '1px solid #FDE68A',
                          borderRadius: 4, padding: '1px 5px', textTransform: 'uppercase',
                        }}>{p.badge}</span>
                      )}
                    </div>
                    <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 1 }}>{p.desc}</div>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#374151', marginLeft: 12 }}>
                    {p.prix}<span style={{ fontSize: 11, fontWeight: 400, color: '#9CA3AF' }}>/mois</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p style={{ textAlign: 'center', fontSize: 11, color: '#D1D5DB', marginTop: 32 }}>
            TraceChantier © 2026 · Montréal, QC
          </p>
        </div>
      </div>
    </div>
  )
}
