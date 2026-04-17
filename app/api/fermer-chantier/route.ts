import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit, getClientIp } from '@/lib/rateLimit'

export async function POST(req: NextRequest) {
  if (!checkRateLimit(`fermer-chantier:${getClientIp(req)}`, 10, 60)) {
    return NextResponse.json({ error: 'Trop de requêtes.' }, { status: 429 })
  }
  const { chantierId } = await req.json()
  if (!chantierId) return NextResponse.json({ error: 'chantierId requis' }, { status: 400 })

  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { data: profil } = await supabase
    .from('profils')
    .select('entreprise_id, role')
    .eq('id', user.id)
    .single()

  if (!profil || profil.role !== 'proprietaire') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
  }

  const now = new Date().toISOString()
  const { error } = await supabase
    .from('chantiers')
    .update({
      actif: false,
      ferme_le: now,
      fermeture_disclaimer_le: now,
      fermeture_disclaimer_par: user.id,
    })
    .eq('id', chantierId)
    .eq('entreprise_id', profil.entreprise_id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
