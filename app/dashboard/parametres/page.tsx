import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import FermerCompteBtn from '@/components/FermerCompteBtn'
import { SettingsIcon, TrashIcon } from '@/components/Icons'

export default async function ParametresPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profil } = await supabase
    .from('profils')
    .select('prenom_nom, role, entreprise_id, entreprises(nom, plan, stripe_subscription_status, cree_le)')
    .eq('id', user.id)
    .single()

  if (!profil || profil.role !== 'proprietaire') redirect('/dashboard')

  const ent = Array.isArray(profil.entreprises) ? profil.entreprises[0] : profil.entreprises as any

  const PLAN_LABELS: Record<string, string> = {
    demarrage: 'Entrepreneur solo — 59$/mois',
    maitre: 'PME — 149$/mois',
    entreprise: 'Entreprise — 249$/mois',
    gratuit: 'Essai gratuit',
    pro: 'Pro — 99$/mois',
  }

  const STATUT_LABELS: Record<string, { texte: string; couleur: string }> = {
    trialing:  { texte: 'Essai gratuit',      couleur: '#059669' },
    active:    { texte: 'Actif',              couleur: '#059669' },
    past_due:  { texte: 'Paiement en retard', couleur: '#D97706' },
    canceled:  { texte: 'Annulé',             couleur: '#DC2626' },
    incomplete: { texte: 'En attente',         couleur: '#9CA3AF' },
  }

  const statutInfo = STATUT_LABELS[ent?.stripe_subscription_status ?? ''] ?? { texte: 'Inconnu', couleur: '#9CA3AF' }
  const dateInscription = ent?.cree_le
    ? new Date(ent.cree_le).toLocaleDateString('fr-CA', { day: 'numeric', month: 'long', year: 'numeric' })
    : '—'

  return (
    <div className="p-8 max-w-2xl mx-auto">

      <div className="flex items-center gap-3 mb-8">
        <div style={{ color: '#9CA3AF' }}><SettingsIcon size={20} /></div>
        <div>
          <h1 className="text-xl font-700 tracking-tight" style={{ color: '#111827' }}>Paramètres</h1>
          <p className="text-sm mt-0.5" style={{ color: '#6B7280' }}>Gestion de votre compte</p>
        </div>
      </div>

      {/* ── Informations du compte ── */}
      <section style={{ background: '#fff', borderRadius: '16px', border: '1px solid #E5E7EB', overflow: 'hidden', marginBottom: '20px' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #F3F4F6' }}>
          <h2 style={{ fontSize: '13px', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>
            Compte
          </h2>
        </div>
        <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <Row label="Nom" value={profil.prenom_nom} />
          <Row label="Courriel" value={user.email ?? '—'} />
          <Row label="Entreprise" value={ent?.nom ?? '—'} />
          <Row label="Membre depuis" value={dateInscription} />
        </div>
      </section>

      {/* ── Abonnement ── */}
      <section style={{ background: '#fff', borderRadius: '16px', border: '1px solid #E5E7EB', overflow: 'hidden', marginBottom: '20px' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #F3F4F6' }}>
          <h2 style={{ fontSize: '13px', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>
            Abonnement
          </h2>
        </div>
        <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <Row label="Plan" value={PLAN_LABELS[ent?.plan ?? ''] ?? ent?.plan ?? '—'} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', color: '#6B7280' }}>Statut</span>
            <span style={{ fontSize: '12px', fontWeight: 600, color: statutInfo.couleur, background: statutInfo.couleur + '15', padding: '2px 8px', borderRadius: '20px', border: `1px solid ${statutInfo.couleur}30` }}>
              {statutInfo.texte}
            </span>
          </div>
          <div style={{ paddingTop: '4px' }}>
            <a
              href="/dashboard/abonnement"
              style={{ fontSize: '13px', color: '#1B5FA8', fontWeight: 600, textDecoration: 'none' }}
            >
              Gérer mon abonnement →
            </a>
          </div>
        </div>
      </section>

      {/* ── Zone de danger ── */}
      <section style={{ background: '#fff', borderRadius: '16px', border: '1px solid #FECACA', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #FEE2E2', background: '#FFF7F7' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#DC2626' }}><TrashIcon size={14} /></span>
            <h2 style={{ fontSize: '13px', fontWeight: 700, color: '#DC2626', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>
              Zone de danger
            </h2>
          </div>
        </div>
        <div style={{ padding: '20px' }}>
          <p style={{ fontSize: '13px', color: '#6B7280', lineHeight: '1.6', margin: '0 0 16px 0' }}>
            La suppression de votre compte est <strong>définitive et irréversible</strong>.
            Toutes vos données (chantiers, photos, journaux, équipe) seront supprimées.
            Votre abonnement sera annulé immédiatement.
          </p>
          <FermerCompteBtn />
        </div>
      </section>

    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: '13px', color: '#6B7280' }}>{label}</span>
      <span style={{ fontSize: '13px', color: '#111827', fontWeight: 500 }}>{value}</span>
    </div>
  )
}
