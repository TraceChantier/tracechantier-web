import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit, getClientIp } from '@/lib/rateLimit'

const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

function genererCode(): string {
  return Array.from({ length: 6 }, () => CHARS[Math.floor(Math.random() * CHARS.length)]).join('')
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  if (!checkRateLimit(`regen-code:${getClientIp(req)}`, 10, 60)) {
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

  const { chantierId } = await req.json().catch(() => ({}))
  if (!chantierId) return NextResponse.json({ error: 'chantierId requis.' }, { status: 400 })

  // Vérifier ownership
  const { data: chantier } = await supabase
    .from('chantiers')
    .select('id, entreprise_id')
    .eq('id', chantierId)
    .eq('entreprise_id', profil.entreprise_id)
    .single()

  if (!chantier) return NextResponse.json({ error: 'Chantier introuvable.' }, { status: 404 })

  const nouveauCode = genererCode()
  const { error } = await supabase
    .from('chantiers')
    .update({ code_acces: nouveauCode })
    .eq('id', chantierId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ code: nouveauCode })
}
