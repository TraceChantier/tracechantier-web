import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit, getClientIp } from '@/lib/rateLimit'

export async function POST(req: NextRequest): Promise<NextResponse> {
  if (!checkRateLimit(`retirer-admin:${getClientIp(req)}`, 10, 60)) {
    return NextResponse.json({ error: 'Trop de requêtes.' }, { status: 429 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 })

  const { data: profil } = await supabase
    .from('profils')
    .select('entreprise_id, role')
    .eq('id', user.id)
    .single()

  // Seul le propriétaire peut retirer un admin
  if (!profil || profil.role !== 'proprietaire') {
    return NextResponse.json({ error: 'Réservé au propriétaire.' }, { status: 403 })
  }

  const { adminId } = await req.json().catch(() => ({}))
  if (!adminId) return NextResponse.json({ error: 'adminId requis.' }, { status: 400 })

  // Vérifier que l'admin appartient à la même entreprise
  const { data: cible } = await supabase
    .from('profils')
    .select('id, entreprise_id, role')
    .eq('id', adminId)
    .eq('entreprise_id', profil.entreprise_id)
    .single()

  if (!cible) return NextResponse.json({ error: 'Utilisateur introuvable.' }, { status: 404 })
  if (cible.role === 'proprietaire') {
    return NextResponse.json({ error: 'Impossible de retirer le propriétaire.' }, { status: 400 })
  }

  // Détacher l'admin de l'entreprise (null entreprise_id) sans supprimer le compte
  const { error } = await supabase
    .from('profils')
    .update({ entreprise_id: null, role: 'proprietaire' })
    .eq('id', adminId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
