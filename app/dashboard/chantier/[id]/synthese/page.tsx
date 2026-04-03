import { createClient } from '@/lib/supabase/server'
import SyntheseClient from './SyntheseClient'

export default async function SynthesePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const il_y_a_7_jours = new Date()
  il_y_a_7_jours.setDate(il_y_a_7_jours.getDate() - 7)

  const { data: journaux } = await supabase
    .from('journal_chantier')
    .select('id, date, resume_ia')
    .eq('chantier_id', id)
    .gte('date', il_y_a_7_jours.toISOString().split('T')[0])
    .order('date', { ascending: false })
    .limit(7)

  const debutSemaine = il_y_a_7_jours.toLocaleDateString('fr-CA', { day: 'numeric', month: 'long' })
  const finSemaine = new Date().toLocaleDateString('fr-CA', { day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <SyntheseClient
      chantierId={id}
      journaux={journaux ?? []}
      debutSemaine={debutSemaine}
      finSemaine={finSemaine}
    />
  )
}
