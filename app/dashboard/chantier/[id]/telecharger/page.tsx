import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import TelechargerClient from './TelechargerClient'

export default async function TelechargerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) notFound()

  const { data: profil } = await supabase
    .from('profils')
    .select('entreprise_id')
    .eq('id', user.id)
    .single()

  if (!profil) notFound()

  // Vérifier que le chantier appartient à l'entreprise de l'utilisateur
  const { data: chantier } = await supabase
    .from('chantiers')
    .select('id, nom, actif, ferme_le, entreprise_id')
    .eq('id', id)
    .single()

  if (!chantier) notFound()
  if (chantier.entreprise_id !== profil.entreprise_id) notFound()

  // Charger les journaux pour l'export CSV
  const { data: journaux } = await supabase
    .from('journal_chantier')
    .select('date, resume_ia, notes_brutes')
    .eq('chantier_id', id)
    .order('date', { ascending: false })

  const joursRestants = chantier.ferme_le
    ? 180 - Math.floor((Date.now() - new Date(chantier.ferme_le).getTime()) / 86400000)
    : null

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-700 tracking-tight" style={{ color: '#111827' }}>
          Télécharger les données
        </h1>
        <p className="text-sm mt-1" style={{ color: '#6B7280' }}>
          {chantier.nom}
        </p>
      </div>

      {/* Banner warning si chantier clôturé */}
      {!chantier.actif && joursRestants !== null && (
        <BannerSuppression joursRestants={joursRestants} />
      )}

      <TelechargerClient
        chantierId={id}
        nomChantier={chantier.nom}
        journaux={journaux ?? []}
      />
    </div>
  )
}

function BannerSuppression({ joursRestants }: { joursRestants: number }) {
  const critique = joursRestants <= 7
  const urgent = joursRestants <= 30

  const bg = critique ? '#FEF2F2' : urgent ? '#FFFBEB' : '#FFFBEB'
  const border = critique ? '#FECACA' : '#FDE68A'
  const color = critique ? '#DC2626' : '#D97706'

  const message = joursRestants <= 0
    ? 'Les données de ce chantier sont en cours de suppression.'
    : `Les données de ce chantier seront supprimées dans ${joursRestants} jour${joursRestants > 1 ? 's' : ''}. Téléchargez vos fichiers avant cette date.`

  return (
    <div
      className="rounded-xl px-5 py-4 mb-6 flex items-start gap-3"
      style={{ background: bg, border: `1px solid ${border}` }}
    >
      <span style={{ color, fontSize: '16px', flexShrink: 0, marginTop: '1px' }}>
        {critique ? '⚠' : 'ℹ'}
      </span>
      <p style={{ fontSize: '13px', color, margin: 0, lineHeight: '1.5' }}>
        {message}
      </p>
    </div>
  )
}
