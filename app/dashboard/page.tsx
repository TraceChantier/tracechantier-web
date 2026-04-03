import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import CloturerBtn from '@/components/CloturerBtn'
import { BuildingIcon, CameraIcon, BookIcon, ChartIcon, DownloadIcon } from '@/components/Icons'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profil } = await supabase
    .from('profils')
    .select('entreprise_id, prenom_nom')
    .eq('id', user!.id)
    .single()

  const entrepriseId = profil?.entreprise_id

  const [chantiersActifsRes, chantiersCloturesRes, photosRes, journauxRes] = await Promise.all([
    supabase.from('chantiers').select('id, nom').eq('entreprise_id', entrepriseId).eq('actif', true),
    supabase.from('chantiers').select('id, nom, ferme_le').eq('entreprise_id', entrepriseId).eq('actif', false),
    supabase.from('photos').select('id', { count: 'exact', head: true }).eq('entreprise_id', entrepriseId),
    supabase.from('journal_chantier').select('id', { count: 'exact', head: true }).in(
      'chantier_id',
      (await supabase.from('chantiers').select('id').eq('entreprise_id', entrepriseId)).data?.map((c: any) => c.id) ?? []
    ),
  ])

  const chantiersActifs = chantiersActifsRes.data ?? []
  const chantiersClotures = chantiersCloturesRes.data ?? []
  const nbPhotos = photosRes.count ?? 0
  const nbJournaux = journauxRes.count ?? 0
  const prenom = profil?.prenom_nom?.split(' ')[0] ?? 'vous'

  return (
    <div className="p-8 max-w-5xl mx-auto">

      <div className="mb-8">
        <h1 className="text-xl font-700 tracking-tight" style={{ color: '#111827' }}>
          Bonjour, {prenom}
        </h1>
        <p className="text-sm mt-1" style={{ color: '#6B7280' }}>
          Vue d'ensemble de vos chantiers
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Chantiers actifs"   value={chantiersActifs.length}   color="#1B5FA8" icon={<BuildingIcon size={14} />} />
        <StatCard label="Chantiers clôturés" value={chantiersClotures.length} color="#059669" icon={<BuildingIcon size={14} />} />
        <StatCard label="Photos archivées"   value={nbPhotos}                 color="#D97706" icon={<CameraIcon size={14} />} />
        <StatCard label="Journaux soumis"    value={nbJournaux}               color="#7C3AED" icon={<BookIcon size={14} />} />
      </div>

      {/* Chantiers actifs */}
      <Section titre="Chantiers actifs" count={chantiersActifs.length} accentColor="#1B5FA8">
        {chantiersActifs.length === 0 ? (
          <EmptyState message="Aucun chantier actif" />
        ) : (
          <div className="flex flex-col gap-2">
            {chantiersActifs.map(c => <ChantierRow key={c.id} chantier={c} actif={true} />)}
          </div>
        )}
      </Section>

      {chantiersClotures.length > 0 && (
        <Section titre="Clôturés" count={chantiersClotures.length} accentColor="#9CA3AF">
          <div className="flex flex-col gap-1.5">
            {chantiersClotures.map(c => <ChantierRow key={c.id} chantier={c} actif={false} />)}
          </div>
        </Section>
      )}
    </div>
  )
}

function StatCard({ label, value, color, icon }: {
  label: string; value: number; color: string; icon: React.ReactNode
}) {
  return (
    <div
      className="bg-white rounded-xl p-5 relative overflow-hidden"
      style={{ border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
    >
      <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-xl" style={{ background: color }} />
      <div className="w-7 h-7 rounded-lg flex items-center justify-center mb-3" style={{ background: color + '18', color }}>
        {icon}
      </div>
      <div className="text-3xl font-700 tracking-tight leading-none mb-1.5" style={{ color: '#111827' }}>{value}</div>
      <div className="text-xs font-500" style={{ color: '#9CA3AF' }}>{label}</div>
    </div>
  )
}

function Section({ titre, count, accentColor, children }: {
  titre: string; count: number; accentColor: string; children: React.ReactNode
}) {
  return (
    <section className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-xs font-700 uppercase tracking-wider" style={{ color: '#9CA3AF', letterSpacing: '0.07em' }}>
          {titre}
        </h2>
        <span className="text-xs px-2 py-0.5 rounded-full font-600" style={{ background: accentColor + '15', color: accentColor }}>
          {count}
        </span>
      </div>
      {children}
    </section>
  )
}

function badgeSuppressionCloture(ferme_le: string | null) {
  if (!ferme_le) {
    return (
      <span
        className="text-xs px-2 py-0.5 rounded-full font-600 flex-shrink-0"
        style={{ background: '#F3F4F6', color: '#9CA3AF', border: '1px solid #E5E7EB' }}
      >
        Archivé
      </span>
    )
  }
  const joursRestants = 180 - Math.floor((Date.now() - new Date(ferme_le).getTime()) / 86400000)
  if (joursRestants <= 7) {
    return (
      <span
        className="text-xs px-2 py-0.5 rounded-full font-600 flex-shrink-0"
        style={{ background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA' }}
      >
        Suppression dans {joursRestants} jour{joursRestants > 1 ? 's' : ''}
      </span>
    )
  }
  if (joursRestants <= 30) {
    return (
      <span
        className="text-xs px-2 py-0.5 rounded-full font-600 flex-shrink-0"
        style={{ background: '#FFFBEB', color: '#D97706', border: '1px solid #FDE68A' }}
      >
        Suppression dans {joursRestants} jours
      </span>
    )
  }
  return (
    <span
      className="text-xs px-2 py-0.5 rounded-full font-600 flex-shrink-0"
      style={{ background: '#ECFDF5', color: '#059669', border: '1px solid #A7F3D0' }}
    >
      Suppression dans {joursRestants} jours
    </span>
  )
}

function ChantierRow({ chantier, actif }: { chantier: { id: string; nom: string; ferme_le?: string | null }; actif: boolean }) {
  const base = `/dashboard/chantier/${chantier.id}`
  return (
    <div
      className="tc-chantier-row bg-white rounded-xl px-5 py-3.5 flex items-center gap-4 transition-shadow"
      style={{ border: '1px solid #E5E7EB', boxShadow: '0 1px 2px rgba(0,0,0,0.03)', opacity: actif ? 1 : 0.7 }}
    >
      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: actif ? '#059669' : '#D1D5DB' }} />
      <span className="flex-1 text-sm font-600 truncate" style={{ color: '#111827' }}>{chantier.nom}</span>
      <div className="flex items-center gap-1.5 flex-wrap justify-end">
        {!actif && badgeSuppressionCloture(chantier.ferme_le ?? null)}
        <ActionLink href={`${base}/photos`} color="#1B5FA8" icon={<CameraIcon size={12} />}>Photos</ActionLink>
        {actif && <>
          <ActionLink href={`${base}/journal`} color="#059669" icon={<BookIcon size={12} />}>Journal</ActionLink>
          <ActionLink href={`${base}/synthese`} color="#D97706" icon={<ChartIcon size={12} />}>Synthèse</ActionLink>
        </>}
        {!actif && (
          <ActionLink href={`${base}/telecharger`} color="#7C3AED" icon={<DownloadIcon size={12} />}>Télécharger</ActionLink>
        )}
        {actif && <CloturerBtn chantierId={chantier.id} nomChantier={chantier.nom} />}
      </div>
    </div>
  )
}

function ActionLink({ href, color, icon, children }: {
  href: string; color: string; icon: React.ReactNode; children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      className="tc-action-link flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-600 transition-all"
      style={{ background: '#F8F9FA', color, border: '1px solid #E5E7EB' }}
    >
      {icon}{children}
    </Link>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="bg-white rounded-xl py-12 flex flex-col items-center gap-2.5" style={{ border: '1px solid #E5E7EB' }}>
      <div style={{ color: '#D1D5DB' }}><BuildingIcon size={22} /></div>
      <p className="text-sm" style={{ color: '#9CA3AF' }}>{message}</p>
    </div>
  )
}
