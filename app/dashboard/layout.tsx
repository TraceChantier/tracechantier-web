import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/Sidebar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profilRaw } = await supabase
    .from('profils')
    .select('prenom_nom, role, entreprise_id, entreprises(nom, plan, stripe_subscription_status)')
    .eq('id', user.id)
    .single()

  if (!profilRaw?.entreprise_id) redirect('/login')

  const profil = {
    ...profilRaw,
    entreprises: Array.isArray(profilRaw.entreprises) ? (profilRaw.entreprises[0] ?? null) : profilRaw.entreprises,
  }

  const ent = profil.entreprises as any
  const statut = ent?.stripe_subscription_status ?? ''

  if (statut === 'past_due') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8F9FA', padding: '24px' }}>
        <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #FDE68A', padding: '40px 32px', maxWidth: '480px', width: '100%', textAlign: 'center', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
          <div style={{ fontSize: '40px', marginBottom: '16px' }}>⚠️</div>
          <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#111827', marginBottom: '12px' }}>Paiement en retard</h1>
          <p style={{ fontSize: '14px', color: '#6B7280', lineHeight: '1.6', marginBottom: '28px' }}>
            Votre dernier paiement a échoué. Mettez à jour votre mode de paiement pour retrouver l&apos;accès à votre tableau de bord.
          </p>
          <a
            href="/dashboard/parametres"
            style={{ display: 'inline-block', background: '#D97706', color: '#fff', fontWeight: 600, fontSize: '14px', padding: '12px 28px', borderRadius: '10px', textDecoration: 'none' }}
          >
            Gérer mon abonnement →
          </a>
        </div>
      </div>
    )
  }

  if (statut === 'canceled') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8F9FA', padding: '24px' }}>
        <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #E5E7EB', padding: '40px 32px', maxWidth: '480px', width: '100%', textAlign: 'center', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
          <div style={{ fontSize: '40px', marginBottom: '16px' }}>🔒</div>
          <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#111827', marginBottom: '12px' }}>Abonnement terminé</h1>
          <p style={{ fontSize: '14px', color: '#6B7280', lineHeight: '1.6', marginBottom: '28px' }}>
            Votre abonnement a été annulé. Réabonnez-vous pour retrouver l&apos;accès à vos chantiers et données.
          </p>
          <a
            href="/dashboard/parametres"
            style={{ display: 'inline-block', background: '#1B5FA8', color: '#fff', fontWeight: 600, fontSize: '14px', padding: '12px 28px', borderRadius: '10px', textDecoration: 'none' }}
          >
            Réactiver mon abonnement →
          </a>
        </div>
      </div>
    )
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
