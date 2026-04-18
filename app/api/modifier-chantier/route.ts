import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit, getClientIp } from '@/lib/rateLimit'

export async function POST(req: NextRequest): Promise<NextResponse> {
  if (!checkRateLimit(`modifier-chantier:${getClientIp(req)}`, 20, 60)) {
    return NextResponse.json({ error: 'Trop de requêtes.' }, { status: 429 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 })

  const { data: profil } = await supabase
    .from('profils')
    .select('entreprise_id')
    .eq('id', user.id)
    .single()

  if (!profil?.entreprise_id) return NextResponse.json({ error: 'Accès refusé.' }, { status: 403 })

  const body = await req.json().catch(() => ({}))
  const { chantierId, nom, adresse, description, date_debut, zones, zonesSupprimes } = body

  if (!chantierId) return NextResponse.json({ error: 'chantierId requis.' }, { status: 400 })
  if (!nom?.trim()) return NextResponse.json({ error: 'Le nom est requis.' }, { status: 400 })

  // Vérifier ownership
  const { data: chantier } = await supabase
    .from('chantiers')
    .select('id, entreprise_id')
    .eq('id', chantierId)
    .single()

  if (!chantier || chantier.entreprise_id !== profil.entreprise_id) {
    return NextResponse.json({ error: 'Accès refusé.' }, { status: 403 })
  }

  // Update chantier
  await supabase.from('chantiers').update({
    nom: nom.trim(),
    adresse: (adresse ?? '').trim() || null,
    description: (description ?? '').trim() || null,
    date_debut: date_debut || null,
  }).eq('id', chantierId)

  // Supprimer zones marquées — filtrer par chantier_id pour éviter l'IDOR
  if (Array.isArray(zonesSupprimes) && zonesSupprimes.length > 0) {
    await supabase.from('zones').delete()
      .in('id', zonesSupprimes)
      .eq('chantier_id', chantierId)
  }

  // Upsert/insert zones
  if (Array.isArray(zones) && zones.length > 0) {
    const existantes = zones.filter((z: any) => z.id).map((z: any, i: number) => ({
      id: z.id, chantier_id: chantierId, nom: z.nom, couleur: z.couleur, ordre: i,
    }))
    const nouvelles = zones.filter((z: any) => !z.id).map((z: any, i: number) => ({
      chantier_id: chantierId, nom: z.nom, couleur: z.couleur,
      position_x: 0, position_y: 0, largeur: 0, hauteur: 0,
      ordre: zones.findIndex((ez: any) => ez === z),
    }))
    if (existantes.length > 0) await supabase.from('zones').upsert(existantes)
    if (nouvelles.length > 0) await supabase.from('zones').insert(nouvelles)
  }

  return NextResponse.json({ ok: true })
}
