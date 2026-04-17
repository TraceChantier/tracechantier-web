import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import CreerChantierForm from '@/components/CreerChantierForm'

export default async function CreerChantierPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-xl font-700 tracking-tight" style={{ color: '#111827' }}>
          Nouveau chantier
        </h1>
        <p className="text-sm mt-1" style={{ color: '#6B7280' }}>
          Les zones dessinées ici apparaîtront directement sur l'app mobile
        </p>
      </div>
      <CreerChantierForm />
    </div>
  )
}
