import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { checkRateLimit, getClientIp } from '@/lib/rateLimit'

export async function POST(req: NextRequest) {
  // ── Rate limiting : max 3 tentatives / 10 minutes ───────────────────────
  const ip = getClientIp(req)
  if (!checkRateLimit(`fermer-compte:${ip}`, 3, 600)) {
    return NextResponse.json({ error: 'Trop de tentatives. Réessayez dans quelques minutes.' }, { status: 429 })
  }

  const supabase = await createClient()

  // ── Auth ─────────────────────────────────────────────────────────────────
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  // ── Vérification email de confirmation ───────────────────────────────────
  const body = await req.json().catch(() => ({}))
  const emailConfirm: string = body?.email_confirm ?? ''
  if (!emailConfirm || emailConfirm.toLowerCase().trim() !== (user.email ?? '').toLowerCase().trim()) {
    return NextResponse.json({ error: 'Adresse courriel incorrecte.' }, { status: 400 })
  }

  const { data: profil } = await supabase
    .from('profils')
    .select('entreprise_id, role')
    .eq('id', user.id)
    .single()

  if (!profil || profil.role !== 'proprietaire') {
    return NextResponse.json({ error: 'Non autorisé — réservé au propriétaire' }, { status: 403 })
  }

  const entrepriseId = profil.entreprise_id

  // ── Client admin (service role) ──────────────────────────────────────────
  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  try {
    // ── 1. Récupérer infos Stripe ─────────────────────────────────────────
    const { data: entreprise } = await supabaseAdmin
      .from('entreprises')
      .select('stripe_subscription_id, stripe_subscription_status')
      .eq('id', entrepriseId)
      .single()

    // ── 2. Annuler l'abonnement Stripe (si actif) ─────────────────────────
    const stripeKey = process.env.STRIPE_SECRET_KEY
    if (stripeKey && entreprise?.stripe_subscription_id) {
      const statut = entreprise.stripe_subscription_status ?? ''
      if (statut === 'active' || statut === 'trialing' || statut === 'past_due') {
        await fetch(`https://api.stripe.com/v1/subscriptions/${entreprise.stripe_subscription_id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${stripeKey}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: 'cancellation_details[comment]=compte_supprime_par_utilisateur',
        })
      }
    }

    // ── 3. Supprimer les fichiers Storage (photos + logo) ─────────────────
    const buckets = ['photos-chantier', 'logos-entreprise']
    await Promise.allSettled(
      buckets.map(async (bucket) => {
        const { data: fichiers } = await supabaseAdmin
          .storage
          .from(bucket)
          .list(entrepriseId, { limit: 10000 })

        if (fichiers && fichiers.length > 0) {
          const chemins = fichiers.map(f => `${entrepriseId}/${f.name}`)
          await supabaseAdmin.storage.from(bucket).remove(chemins)
        }
      })
    )

    // ── 4. Supprimer l'entreprise (CASCADE → chantiers, photos, journaux…) ──
    await supabaseAdmin
      .from('entreprises')
      .delete()
      .eq('id', entrepriseId)

    // ── 5. Supprimer l'utilisateur auth (CASCADE → profils) ───────────────
    await supabaseAdmin.auth.admin.deleteUser(user.id)

    return NextResponse.json({ ok: true })

  } catch (err: any) {
    console.error('[fermer-compte]', err)
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 })
  }
}
