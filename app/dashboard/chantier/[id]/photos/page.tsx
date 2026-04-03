import { createClient } from '@/lib/supabase/server'
import PhotosGrid from '@/components/PhotosGrid'

/** Extrait le path relatif depuis une URL complète Supabase Storage ou le retourne tel quel si c'est déjà un path. */
function extrairePathStorage(urlOuPath: string, bucket: string): string {
  if (!urlOuPath) return ''
  // URL signée ou URL publique Supabase contenant le nom du bucket
  const marqueur = `/storage/v1/object/`
  const idx = urlOuPath.indexOf(marqueur)
  if (idx !== -1) {
    // Après le marqueur : "public/bucket/path" ou "sign/bucket/path"
    const apresMarqueur = urlOuPath.slice(idx + marqueur.length)
    // Enlever le préfixe "public/" ou "sign/"
    const partieBucket = apresMarqueur.replace(/^(public|sign)\//, '')
    // Enlever le nom du bucket s'il est présent
    if (partieBucket.startsWith(bucket + '/')) {
      return partieBucket.slice(bucket.length + 1)
    }
    return partieBucket
  }
  // URL ancienne style : https://xxx.supabase.co/photos-chantier/path
  const bucketPrefix = `/${bucket}/`
  const idxBucket = urlOuPath.indexOf(bucketPrefix)
  if (idxBucket !== -1) {
    return urlOuPath.slice(idxBucket + bucketPrefix.length)
  }
  // Déjà un path relatif
  return urlOuPath
}

export default async function PhotosPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: zones } = await supabase
    .from('zones')
    .select('id, nom, couleur')
    .eq('chantier_id', id)
    .order('ordre')

  const { data: photosRaw } = await supabase
    .from('photos')
    .select('id, url, prise_le, prioritaire, incident, note, zone_id, zones(nom, couleur), sous_traitants(prenom_nom)')
    .eq('chantier_id', id)
    .order('prise_le', { ascending: false })
    .limit(200)

  const photos = (photosRaw ?? []).map((p: any) => ({
    ...p,
    zones: Array.isArray(p.zones) ? (p.zones[0] ?? null) : p.zones,
    sous_traitants: Array.isArray(p.sous_traitants) ? (p.sous_traitants[0] ?? null) : p.sous_traitants,
  }))

  // Générer les URLs signées (bucket privé)
  const signedUrls: Record<string, string> = {}
  await Promise.all(
    photos.map(async (photo) => {
      if (!photo.url) return
      const path = extrairePathStorage(photo.url, 'photos-chantier')
      if (!path) return
      const { data } = await supabase.storage
        .from('photos-chantier')
        .createSignedUrl(path, 3600)
      if (data?.signedUrl) {
        signedUrls[photo.id] = data.signedUrl
      }
    })
  )

  return (
    <div className="p-8">
      <PhotosGrid photos={photos} zones={zones ?? []} chantierId={id} signedUrls={signedUrls} />
    </div>
  )
}
