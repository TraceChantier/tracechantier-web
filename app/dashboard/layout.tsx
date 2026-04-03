import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/Sidebar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profilRaw } = await supabase
    .from('profils')
    .select('prenom_nom, role, entreprise_id, entreprises(nom, plan)')
    .eq('id', user.id)
    .single()

  if (!profilRaw?.entreprise_id) redirect('/login')

  const profil = {
    ...profilRaw,
    entreprises: Array.isArray(profilRaw.entreprises) ? (profilRaw.entreprises[0] ?? null) : profilRaw.entreprises,
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#F8F9FA' }}>
      <Sidebar profil={profil as any} userEmail={user.email ?? ''} />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
