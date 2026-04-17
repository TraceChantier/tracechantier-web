import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit, getClientIp } from '@/lib/rateLimit'

interface ZoneInput {
  nom: string
  couleur: string
  position_x: number  // ratio 0-1
  position_y: number  // ratio 0-1
  largeur: number     // ratio 0-1
  hauteur: number     // ratio 0-1
  ordre: number
}

// Plans limites — dupliqués ici pour ne pas importer depuis lib/plans (client-only)
const CHANTIERS_MAX: Record<string, number> = {
  demarrage: 2,
  pro: 10,
  maitre: -1,    // illimité
  gratuit: -1,   // trial : pas de limite stricte côté web (trial = 14j)
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  if (!checkRateLimit(`creer-chantier:${getClientIp(req)}`, 10, 60)) {
    return NextResponse.json({ error: 'Trop de requêtes.' }, { status: 429 })
  }

  const supabase = await createClient()
  const { data: { user }, error: errAuth } = await supabase.auth.getUser()
  if (errAuth || !user) return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 })

  const { data: profil } = await supabase
    .from('profils')
    .select('entreprise_id, role')
    .eq('id', user.id)
    .single()

  if (!profil?.entreprise_id) return NextResponse.json({ error: 'Entreprise introuvable.' }, { status: 403 })

  // Vérifier limites plan
  const { data: ent } = await supabase
    .from('entreprises')
    .select('plan, stripe_subscription_status')
    .eq('id', profil.entreprise_id)
    .single()

  const statut = ent?.stripe_subscription_status ?? 'trialing'
  const planId = (ent?.plan ?? 'gratuit') as string
  const inactif = !['active', 'trialing'].includes(statut)
  if (inactif) {
    return NextResponse.json({ error: 'Votre essai est expiré. Abonnez-vous pour créer des chantiers.' }, { status: 403 })
  }

  const limite = CHANTIERS_MAX[planId] ?? -1
  if (limite !== -1) {
    const { count } = await supabase
      .from('chantiers')
      .select('id', { count: 'exact', head: true })
      .eq('entreprise_id', profil.entreprise_id)
      .eq('actif', true)
    if ((count ?? 0) >= limite) {
      return NextResponse.json({
        error: `Limite atteinte — votre plan inclut ${limite} chantier${limite > 1 ? 's' : ''} actif${limite > 1 ? 's' : ''} maximum.`
      }, { status: 403 })
    }
  }

  const body = await req.json().catch(() => ({}))
  const nom: string = (body.nom ?? '').trim()
  if (!nom) return NextResponse.json({ error: 'Le nom du chantier est requis.' }, { status: 400 })

  const adresse: string = (body.adresse ?? '').trim()
  const description: string = (body.description ?? '').trim()
  const date_debut: string | null = body.date_debut || null
  const plan_chemin: string | null = body.plan_chemin || null
  const zones: ZoneInput[] = Array.isArray(body.zones) ? body.zones : []

  // Créer le chantier — code_acces est généré par trigger DB
  const { data: chantier, error: errChantier } = await supabase
    .from('chantiers')
    .insert({
      entreprise_id: profil.entreprise_id,
      nom,
      adresse: adresse || null,
      description: description || null,
      plan_url: plan_chemin,  // chemin storage, pas URL signée
      date_debut,
    })
    .select('id, code_acces, nom')
    .single()

  if (errChantier || !chantier) {
    console.error('[creer-chantier]', errChantier)
    return NextResponse.json({ error: 'Erreur lors de la création du chantier.' }, { status: 500 })
  }

  // Insérer les zones (ratios 0-1 — compatibles GererZones.tsx + STplan.tsx mobile)
  if (zones.length > 0) {
    const zonesAInserer = zones.map((z, i) => ({
      chantier_id: chantier.id,
      nom: z.nom,
      couleur: z.couleur,
      position_x: z.position_x,
      position_y: z.position_y,
      largeur: z.largeur,
      hauteur: z.hauteur,
      ordre: z.ordre ?? i,
    }))
    const { error: errZones } = await supabase.from('zones').insert(zonesAInserer)
    if (errZones) console.error('[creer-chantier] zones:', errZones.message)
  }

  return NextResponse.json({ chantierId: chantier.id, codeAcces: chantier.code_acces, nom: chantier.nom })
}
