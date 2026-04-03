'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { BuildingIcon, UsersIcon, LogOutIcon } from '@/components/Icons'

const PLAN_LABELS: Record<string, string> = {
  demarrage: 'Démarrage',
  maitre: 'Maître',
  entreprise: 'Entreprise',
  gratuit: 'Essai',
  pro: 'Pro',
}

interface SidebarProps {
  profil: {
    prenom_nom: string
    role: string
    entreprises: { nom: string; plan: string } | null
  }
  userEmail: string
}

export default function Sidebar({ profil, userEmail }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const nomEntreprise = (profil.entreprises as any)?.nom ?? 'Mon entreprise'
  const plan = (profil.entreprises as any)?.plan ?? 'gratuit'

  async function deconnecter() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const initiales = profil.prenom_nom
    ? profil.prenom_nom.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase()
    : '?'

  function NavItem({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
    const actif = pathname === href || pathname.startsWith(href + '/')
    return (
      <Link
        href={href}
        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-500 transition-all"
        style={{
          background: actif ? 'rgba(255,255,255,0.1)' : 'transparent',
          color: actif ? '#FFFFFF' : 'rgba(255,255,255,0.5)',
        }}
        onMouseEnter={e => { if (!actif) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; if (!actif) e.currentTarget.style.color = 'rgba(255,255,255,0.75)' }}
        onMouseLeave={e => { if (!actif) e.currentTarget.style.background = 'transparent'; if (!actif) e.currentTarget.style.color = 'rgba(255,255,255,0.5)' }}
      >
        <span style={{ opacity: actif ? 1 : 0.6 }}>{icon}</span>
        {label}
        {actif && <span className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: '#2E8FD4' }} />}
      </Link>
    )
  }

  return (
    <aside className="w-60 flex flex-col flex-shrink-0 h-full" style={{ background: '#111827' }}>
      {/* Logo */}
      <div className="px-5 pt-6 pb-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(27,95,168,0.3)', border: '1px solid rgba(27,95,168,0.4)' }}
          >
            <svg width="14" height="14" viewBox="0 0 108 160" fill="none">
              <rect x="51" y="44" width="12" height="80" rx="2" fill="#4A9FD4" />
              <rect x="10" y="44" width="92" height="8" rx="2" fill="#4A9FD4" opacity="0.7" />
              <line x1="57" y1="16" x2="95" y2="44" stroke="#4A9FD4" strokeWidth="2" opacity="0.6" />
              <line x1="57" y1="16" x2="20" y2="44" stroke="#4A9FD4" strokeWidth="2" opacity="0.5" />
            </svg>
          </div>
          <div>
            <div className="text-white text-sm font-700 tracking-tight leading-none">TraceChantier</div>
            <div className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.32)' }}>Dashboard</div>
          </div>
        </div>
      </div>

      {/* Entreprise */}
      <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="px-3 py-2.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)' }}>
          <div className="text-white text-sm font-600 truncate leading-none">{nomEntreprise}</div>
          <div className="flex items-center gap-1.5 mt-1.5">
            <span
              className="text-xs px-1.5 py-0.5 rounded font-500"
              style={{ background: 'rgba(27,95,168,0.3)', color: '#7DB8EC', border: '1px solid rgba(27,95,168,0.25)' }}
            >
              {PLAN_LABELS[plan] ?? plan}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5">
        <div className="text-xs font-600 px-3 mb-2" style={{ color: 'rgba(255,255,255,0.22)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Navigation
        </div>
        <NavItem href="/dashboard" icon={<BuildingIcon size={16} />} label="Chantiers" />
      </nav>

      {/* User */}
      <div className="px-4 pb-5 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-2.5 mb-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-700"
            style={{ background: '#1B5FA8', color: '#FFFFFF' }}
          >
            {initiales}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-white text-sm font-500 truncate leading-none">{profil.prenom_nom}</div>
            <div className="text-xs mt-0.5 truncate" style={{ color: 'rgba(255,255,255,0.38)' }}>{userEmail}</div>
          </div>
        </div>
        <button
          onClick={deconnecter}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all"
          style={{ color: 'rgba(255,255,255,0.38)', background: 'transparent' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.38)' }}
        >
          <LogOutIcon size={15} />
          Déconnexion
        </button>
      </div>
    </aside>
  )
}