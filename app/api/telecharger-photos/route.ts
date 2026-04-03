// Dépendance : jszip@^3.10.1 — déjà présente dans package.json
// Si jamais retirée : npm install jszip

import { NextRequest, NextResponse } from 'next/server'
import JSZip from 'jszip'
import { createClient } from '@/lib/supabase/server'

// Next.js App Router — timeout configuré dans next.config via maxDuration
// Ce handler doit terminer sous 50 secondes.
export const maxDuration = 50

const LIMITE_PHOTOS = 200
const TIMEOUT_FETCH_MS = 10_000 // 10 s par photo

// Sanitise un nom de fichier pour éviter les path traversal dans le ZIP
function sanitiserNomFichier(chemin: string, index: number): string {
  // Garder uniquement le dernier segment du chemin (nom du fichier)
  const segments = chemin.replace(/\\/g, '/').split('/')
  const nomBase = segments[segments.length - 1] ?? `photo-${index}`
  // Retirer les caractères dangereux
  const nomPropre = nomBase.replace(/[^\w.\-]/g, '_')
  // Préfixer avec l'index pour garantir l'unicité
  return `${String(index + 1).padStart(4, '0')}_${nomPropre}`
}

// Télécharge une URL avec timeout et retourne un ArrayBuffer ou null si échec
async function fetchAvecTimeout(url: string): Promise<ArrayBuffer | null> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_FETCH_MS)
  try {
    const res = await fetch(url, { signal: controller.signal })
    if (!res.ok) return null
    return await res.arrayBuffer()
  } catch {
    return null
  } finally {
    clearTimeout(timer)
  }
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  // --- 1. Authentification ---
  const supabase = await createClient()
  const { data: { user }, error: errAuth } = await supabase.auth.getUser()

  if (errAuth || !user) {
    return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 })
  }

  // --- 2. Paramètre chantierId ---
  const { searchParams } = new URL(req.url)
  const chantierId = searchParams.get('chantierId')

  if (!chantierId || typeof chantierId !== 'string' || chantierId.trim() === '') {
    return NextResponse.json({ error: 'Paramètre chantierId manquant.' }, { status: 400 })
  }

  // --- 3. Récupérer l'entreprise de l'utilisateur ---
  const { data: profil, error: errProfil } = await supabase
    .from('profils')
    .select('entreprise_id')
    .eq('id', user.id)
    .single()

  if (errProfil || !profil?.entreprise_id) {
    return NextResponse.json({ error: 'Accès refusé.' }, { status: 403 })
  }

  // --- 4. Vérifier que le chantier appartient à l'entreprise de l'utilisateur ---
  const { data: chantier, error: errChantier } = await supabase
    .from('chantiers')
    .select('id, nom, entreprise_id')
    .eq('id', chantierId)
    .single()

  if (errChantier || !chantier) {
    return NextResponse.json({ error: 'Chantier introuvable.' }, { status: 404 })
  }

  if (chantier.entreprise_id !== profil.entreprise_id) {
    return NextResponse.json({ error: 'Accès refusé.' }, { status: 403 })
  }

  // --- 5. Récupérer les photos (200 max, les plus récentes) ---
  const { data: photos, error: errPhotos } = await supabase
    .from('photos')
    .select('chemin, description, prise_le, zone_id')
    .eq('chantier_id', chantierId)
    .order('prise_le', { ascending: false })
    .limit(LIMITE_PHOTOS + 1) // +1 pour détecter si on a tronqué

  if (errPhotos) {
    console.error('[telecharger-photos] Erreur lecture photos:', errPhotos.code)
    return NextResponse.json({ error: 'Erreur lors de la récupération des photos.' }, { status: 500 })
  }

  if (!photos || photos.length === 0) {
    return NextResponse.json({ error: 'Aucune photo', count: 0 }, { status: 404 })
  }

  const tronque = photos.length > LIMITE_PHOTOS
  const photosFiltrees = tronque ? photos.slice(0, LIMITE_PHOTOS) : photos

  // --- 6. Générer les URLs signées et construire le ZIP ---
  const zip = new JSZip()
  let photosAjoutees = 0

  // On génère toutes les URLs signées en parallèle (pas de données sensibles loggées)
  const urlsSignees = await Promise.all(
    photosFiltrees.map(async (photo) => {
      if (!photo.chemin) return null
      const { data, error } = await supabase.storage
        .from('photos-chantier')
        .createSignedUrl(photo.chemin, 3600)
      if (error || !data?.signedUrl) return null
      return data.signedUrl
    })
  )

  // Téléchargement en parallèle par lots de 10 pour éviter de saturer le réseau
  const TAILLE_LOT = 10
  for (let i = 0; i < photosFiltrees.length; i += TAILLE_LOT) {
    const lot = photosFiltrees.slice(i, i + TAILLE_LOT)
    const loturls = urlsSignees.slice(i, i + TAILLE_LOT)

    await Promise.all(
      lot.map(async (photo, j) => {
        const indexGlobal = i + j
        const url = loturls[j]
        if (!url) return

        const buffer = await fetchAvecTimeout(url)
        if (!buffer) return

        const nomFichier = sanitiserNomFichier(photo.chemin, indexGlobal)
        zip.file(nomFichier, buffer)
        photosAjoutees++
      })
    )
  }

  if (photosAjoutees === 0) {
    return NextResponse.json({ error: 'Aucune photo téléchargeable.' }, { status: 404 })
  }

  // --- 7. Générer le ZIP en mémoire ---
  let zipBuffer: Buffer
  try {
    const uint8 = await zip.generateAsync({
      type: 'uint8array',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 },
    })
    zipBuffer = Buffer.from(uint8)
  } catch (e) {
    console.error('[telecharger-photos] Erreur génération ZIP:', (e as Error).message)
    return NextResponse.json({ error: 'Erreur lors de la création de l\'archive.' }, { status: 500 })
  }

  // --- 8. Construire le nom du fichier ZIP ---
  const nomSanitise = (chantier.nom ?? 'chantier')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // retirer les accents
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 50)

  const nomZip = `chantier-${nomSanitise}-photos.zip`

  // --- 9. Retourner le ZIP en streaming ---
  const headers = new Headers({
    'Content-Type': 'application/zip',
    'Content-Disposition': `attachment; filename="${nomZip}"`,
    'Content-Length': String(zipBuffer.byteLength),
    'Cache-Control': 'no-store',
  })

  if (tronque) {
    headers.set('X-Truncated', 'true')
    headers.set('X-Photos-Count', String(photosAjoutees))
  }

  return new NextResponse(zipBuffer, { status: 200, headers })
}
