import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import ChantierTabs from '@/components/ChantierTabs'
import Link from 'next/link'
import { ArrowLeftIcon } from '@/components/Icons'

export default async function ChantierLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) notFound()

  const { data: profil } = await supabase
    .from('profils')
    .select('entreprise_id')
    .eq('id', user.id)
    .single()

  const { data: chantier } = await supabase
    .from('chantiers')
    .select('id, nom, actif, entreprise_id')
    .eq('id', id)
    .single()

  if (!chantier) notFound()

  // Vérifier que le chantier appartient bien à l'entreprise de l'utilisateur connecté
  if (!profil || chantier.entreprise_id !== profil.entreprise_id) notFound()

  return (
    <div className="flex flex-col h-full">
      <div className="bg-white px-8 pt-6 pb-0 flex-shrink-0" style={{ borderBottom: '1px solid #E5E7EB' }}>

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-4">
          <Link
            href="/dashboard"
            className="tc-breadcrumb flex items-center gap-1.5 text-xs font-500 transition-colors"
            style={{ color: '#9CA3AF' }}
          >
            <ArrowLeftIcon size={12} />
            Chantiers
          </Link>
          <span style={{ color: '#E5E7EB' }}>/</span>
          <span className="text-xs font-500 truncate max-w-xs" style={{ color: '#6B7280' }}>
            {chantier.nom}
          </span>
        </div>

        {/* Title */}
        <div className="flex items-center gap-2.5 mb-5">
          <h1 className="text-lg font-700 tracking-tight" style={{ color: '#111827' }}>
            {chantier.nom}
          </h1>
          {!chantier.actif && (
            <span
              className="text-xs px-2 py-0.5 rounded-full font-600"
              style={{ background: '#F3F4F6', color: '#9CA3AF', border: '1px solid #E5E7EB' }}
            >
              Clôturé
            </span>
          )}
          {chantier.actif && (
            <span className="flex items-center gap-1.5 text-xs font-500" style={{ color: '#059669' }}>
              <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: '#059669' }} />
              Actif
            </span>
          )}
        </div>

        <ChantierTabs chantierId={id} />
      </div>

      <div className="flex-1 overflow-y-auto" style={{ background: '#F8F9FA' }}>
        {children}
      </div>
    </div>
  )
}
