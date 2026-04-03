'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

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
    <div className="min-h-screen flex" style={{ background: '#F8F9FA' }}>
      {/* Panneau gauche branding */}
      <div className="hidden lg:flex flex-col justify-between w-[440px] flex-shrink-0 p-10" style={{ background: '#111827' }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(27,95,168,0.25)', border: '1px solid rgba(27,95,168,0.3)' }}>
            <svg width="18" height="18" viewBox="0 0 108 160" fill="none">
              <rect x="51" y="44" width="12" height="80" rx="2" fill="#4A9FD4" />
              <rect x="10" y="44" width="92" height="8" rx="2" fill="#4A9FD4" opacity="0.7" />
              <line x1="57" y1="16" x2="95" y2="44" stroke="#4A9FD4" strokeWidth="2" opacity="0.5" />
              <line x1="57" y1="16" x2="20" y2="44" stroke="#4A9FD4" strokeWidth="2" opacity="0.4" />
            </svg>
          </div>
          <div>
            <div className="font-700 text-sm text-white tracking-tight">TraceChantier</div>
            <div className="text-xs" style={{ color: 'rgba(255,255,255,0.38)' }}>Dashboard web</div>
          </div>
        </div>
        <div className="flex flex-col items-center py-8">
          <div style={{ opacity: 0.12 }}>
            <svg width="160" height="200" viewBox="0 0 108 160" fill="none">
              <rect x="42" y="148" width="30" height="8" rx="2" fill="white" />
              <rect x="51" y="44" width="12" height="108" rx="2" fill="white" />
              <line x1="51" y1="66" x2="63" y2="78" stroke="white" strokeWidth="1.5" />
              <line x1="63" y1="66" x2="51" y2="78" stroke="white" strokeWidth="1.5" />
              <line x1="51" y1="88" x2="63" y2="100" stroke="white" strokeWidth="1.5" />
              <line x1="63" y1="88" x2="51" y2="100" stroke="white" strokeWidth="1.5" />
              <line x1="51" y1="110" x2="63" y2="122" stroke="white" strokeWidth="1.5" />
              <line x1="63" y1="110" x2="51" y2="122" stroke="white" strokeWidth="1.5" />
              <line x1="57" y1="12" x2="98" y2="44" stroke="white" strokeWidth="1.3" />
              <line x1="57" y1="12" x2="16" y2="44" stroke="white" strokeWidth="1.1" />
              <circle cx="57" cy="12" r="3.5" fill="white" />
              <rect x="10" y="44" width="92" height="10" rx="2.5" fill="white" />
              <rect x="10" y="47" width="22" height="14" rx="2.5" fill="white" opacity="0.6" />
              <rect x="74" y="52" width="24" height="14" rx="2.5" fill="white" opacity="0.5" />
              <line x1="86" y1="66" x2="86" y2="110" stroke="white" strokeWidth="1.4" />
            </svg>
          </div>
        </div>
        <div>
          <p className="text-sm leading-relaxed mb-3" style={{ color: 'rgba(255,255,255,0.45)' }}>
            La plateforme de documentation terrain pour les entrepreneurs generaux du Quebec.
          </p>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>Acces par invitation uniquement</p>
        </div>
      </div>

      {/* Panneau droit formulaire */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10">
        <div className="w-full max-w-[360px]">
          <div className="mb-8">
            <h1 className="text-2xl font-700 tracking-tight mb-1.5" style={{ color: '#111827' }}>Connexion</h1>
            <p className="text-sm" style={{ color: '#6B7280' }}>Acces reserve aux administrateurs</p>
          </div>

          <form onSubmit={seConnecter} className="flex flex-col gap-4">
            <div>
              <label htmlFor="email" className="block text-sm font-500 mb-1.5" style={{ color: '#374151' }}>Courriel</label>
              <input
                id="email" type="email" value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="vous@exemple.com" required
                className="w-full px-3.5 py-2.5 rounded-lg text-sm border outline-none transition-all"
                style={{ borderColor: '#D1D5DB', background: '#FFFFFF', color: '#111827', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}
                onFocus={e => { e.target.style.borderColor = '#1B5FA8'; e.target.style.boxShadow = '0 0 0 3px rgba(27,95,168,0.1)' }}
                onBlur={e => { e.target.style.borderColor = '#D1D5DB'; e.target.style.boxShadow = '0 1px 2px rgba(0,0,0,0.04)' }}
              />
            </div>
            <div>
              <label htmlFor="mdp" className="block text-sm font-500 mb-1.5" style={{ color: '#374151' }}>Mot de passe</label>
              <input
                id="mdp" type="password" value={motDePasse}
                onChange={e => setMotDePasse(e.target.value)}
                placeholder="••••••••" required
                className="w-full px-3.5 py-2.5 rounded-lg text-sm border outline-none transition-all"
                style={{ borderColor: '#D1D5DB', background: '#FFFFFF', color: '#111827', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}
                onFocus={e => { e.target.style.borderColor = '#1B5FA8'; e.target.style.boxShadow = '0 0 0 3px rgba(27,95,168,0.1)' }}
                onBlur={e => { e.target.style.borderColor = '#D1D5DB'; e.target.style.boxShadow = '0 1px 2px rgba(0,0,0,0.04)' }}
              />
            </div>
            {erreur && (
              <div className="px-3.5 py-3 rounded-lg text-sm" style={{ background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA' }}>
                {erreur}
              </div>
            )}
            <button
              type="submit" disabled={chargement}
              className="w-full py-2.5 rounded-lg text-sm font-600 text-white transition-all mt-1"
              style={{ background: chargement ? '#93C5FD' : '#1B5FA8', cursor: chargement ? 'wait' : 'pointer' }}
            >
              {chargement ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>
          <p className="text-center text-xs mt-8" style={{ color: '#9CA3AF' }}>TraceChantier © 2026</p>
        </div>
      </div>
    </div>
  )
}