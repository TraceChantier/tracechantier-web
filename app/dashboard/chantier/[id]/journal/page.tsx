import { createClient } from '@/lib/supabase/server'
import JournalList from '@/components/JournalList'

export default async function JournalPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: chantier } = await supabase
    .from('chantiers')
    .select('nom, entreprise_id')
    .eq('id', id)
    .single()

  const { data: journauxRaw, error } = await supabase
    .from('journal_chantier')
    .select('id, date, resume_ia, notes_brutes, profils(prenom_nom)')
    .eq('chantier_id', id)
    .order('date', { ascending: false })
    .limit(60)

  if (error) {
    console.error('[Journal] Supabase error:', error)
  }


  const journaux = (journauxRaw ?? []).map((j: any) => ({
    ...j,
    profils: Array.isArray(j.profils) ? (j.profils[0] ?? null) : j.profils,
  }))

  return (
    <div className="p-8">
      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg text-sm" style={{ background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA' }}>
          Erreur de chargement : {error.message}
        </div>
      )}
      <JournalList journaux={journaux} chantierNom={chantier?.nom ?? ''} chantierId={id} />
    </div>
  )
}
