import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import EquipeClient from '@/components/EquipeClient'
import { UsersIcon } from '@/components/Icons'

export default async function EquipePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profil } = await supabase
    .from('profils')
    .select('entreprise_id, role, prenom_nom')
    .eq('id', user.id)
    .single()

  if (!profil?.entreprise_id) redirect('/dashboard')

  const entrepriseId = profil.entreprise_id

  const [chantiersRes, stRes, adminsRes, proprietairesRes, entrepriseRes] = await Promise.all([
    supabase
      .from('chantiers')
      .select('id, nom, adresse, code_acces, actif, date_debut, description')
      .eq('entreprise_id', entrepriseId)
      .eq('actif', true)
      .order('nom', { ascending: true }),
    supabase
      .from('sous_traitants')
      .select('id, prenom_nom, specialite, entreprise_id, derniere_activite')
      .eq('entreprise_id', entrepriseId)
      .order('derniere_activite', { ascending: false })
      .limit(200),
    supabase
      .from('profils')
      .select('id, prenom_nom, role')
      .eq('entreprise_id', entrepriseId)
      .eq('role', 'admin')
      .order('prenom_nom'),
    supabase
      .from('profils')
      .select('id, prenom_nom, role')
      .eq('entreprise_id', entrepriseId)
      .eq('role', 'proprietaire')
      .order('prenom_nom'),
    supabase
      .from('entreprises')
      .select('plan, admins_supplementaires')
      .eq('id', entrepriseId)
      .single(),
  ])

  // Dédupliquer ST par nom
  const stRaw = stRes.data ?? []
  const stVus = new Map<string, typeof stRaw[0]>()
  stRaw.forEach(st => {
    const cle = st.prenom_nom.toLowerCase().trim()
    const prev = stVus.get(cle)
    if (!prev || new Date(st.derniere_activite ?? 0) > new Date(prev.derniere_activite ?? 0)) {
      stVus.set(cle, st)
    }
  })

  // Combiner propriétaires + admins pour la liste équipe
  const tousLesMembres = [
    ...(proprietairesRes.data ?? []),
    ...(adminsRes.data ?? []),
  ]

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div style={{ color: '#9CA3AF' }}><UsersIcon size={20} /></div>
        <div>
          <h1 className="text-xl font-700 tracking-tight" style={{ color: '#111827' }}>Équipe & Codes</h1>
          <p className="text-sm mt-0.5" style={{ color: '#6B7280' }}>
            Gérez vos chantiers, codes d'accès, sous-traitants et admins
          </p>
        </div>
      </div>

      <EquipeClient
        chantiers={chantiersRes.data ?? []}
        sousTraitants={Array.from(stVus.values())}
        admins={tousLesMembres}
        entreprise={entrepriseRes.data}
        userRole={profil.role}
        userId={user.id}
      />
    </div>
  )
}
