'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { CameraIcon, BookIcon, ChartIcon } from '@/components/Icons'

export default function ChantierTabs({ chantierId }: { chantierId: string }) {
  const pathname = usePathname()
  const base = `/dashboard/chantier/${chantierId}`

  const tabs = [
    { href: `${base}/photos`,   label: 'Photos',          icon: <CameraIcon size={14} /> },
    { href: `${base}/journal`,  label: 'Journal',         icon: <BookIcon size={14} /> },
    { href: `${base}/synthese`, label: 'Synthèse hebdo',  icon: <ChartIcon size={14} /> },
  ]

  return (
    <div className="flex gap-0">
      {tabs.map(t => {
        const actif = pathname === t.href
        return (
          <Link
            key={t.href}
            href={t.href}
            className="flex items-center gap-2 px-4 py-3 text-sm font-500 border-b-2 transition-all relative"
            style={{
              borderColor: actif ? '#1B5FA8' : 'transparent',
              color: actif ? '#1B5FA8' : '#9CA3AF',
              marginBottom: -1,
            }}
            onMouseEnter={e => { if (!actif) e.currentTarget.style.color = '#6B7280' }}
            onMouseLeave={e => { if (!actif) e.currentTarget.style.color = '#9CA3AF' }}
          >
            <span style={{ opacity: actif ? 1 : 0.6 }}>{t.icon}</span>
            {t.label}
          </Link>
        )
      })}
    </div>
  )
}
