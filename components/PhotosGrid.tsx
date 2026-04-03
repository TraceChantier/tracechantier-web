'use client'

import { useState, useMemo } from 'react'
import JSZip from 'jszip'
import { createClient } from '@/lib/supabase/client'
import { DownloadIcon, XIcon, StarIcon, AlertIcon, FilterIcon } from '@/components/Icons'

interface Photo {
  id: string
  url: string
  prise_le: string
  prioritaire: boolean
  incident: boolean
  note: string | null
  zone_id: string | null
  zones: { nom: string; couleur: string } | null
  sous_traitants: { prenom_nom: string } | null
}

interface Zone { id: string; nom: string; couleur: string }

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString('fr-CA', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function fmtShort(iso: string) {
  return new Date(iso).toLocaleDateString('fr-CA', { day: 'numeric', month: 'short' })
}

export default function PhotosGrid({ photos: init, zones, chantierId, signedUrls = {} }: {
  photos: Photo[]; zones: Zone[]; chantierId: string; signedUrls?: Record<string, string>
}) {
  const [photos, setPhotos] = useState(init)
  const [zoneActive, setZoneActive] = useState<string | null>(null)
  const [photoOuverte, setPhotoOuverte] = useState<Photo | null>(null)
  const [telechargement, setTelechargement] = useState(false)
  const [dateDebut, setDateDebut] = useState('')
  const [dateFin, setDateFin] = useState('')

  /** Retourne l'URL signée si disponible, sinon l'URL brute de la photo */
  function urlPhoto(photo: Photo): string {
    return signedUrls[photo.id] ?? photo.url
  }

  const photosFiltrees = useMemo(() => {
    let liste = zoneActive ? photos.filter(p => p.zone_id === zoneActive) : photos
    if (dateDebut) liste = liste.filter(p => p.prise_le >= dateDebut)
    if (dateFin) liste = liste.filter(p => p.prise_le <= dateFin + 'T23:59:59')
    return liste
  }, [photos, zoneActive, dateDebut, dateFin])

  async function togglePrioritaire(photo: Photo) {
    const val = !photo.prioritaire
    const supabase = createClient()
    await supabase.from('photos').update({ prioritaire: val }).eq('id', photo.id)
    setPhotos(prev => prev.map(p => p.id === photo.id ? { ...p, prioritaire: val } : p))
  }

  async function toggleIncident(photo: Photo) {
    const val = !photo.incident
    const supabase = createClient()
    await supabase.from('photos').update({ incident: val }).eq('id', photo.id)
    setPhotos(prev => prev.map(p => p.id === photo.id ? { ...p, incident: val } : p))
  }

  async function sauvegarderNote(photo: Photo, note: string) {
    const supabase = createClient()
    await supabase.from('photos').update({ note: note || null }).eq('id', photo.id)
    setPhotos(prev => prev.map(p => p.id === photo.id ? { ...p, note: note || null } : p))
  }

  async function telechargerZip() {
    if (photosFiltrees.length === 0) return
    setTelechargement(true)
    const zip = new JSZip()
    const liste = [...photosFiltrees.filter(p => p.url)].sort(
      (a, b) => new Date(a.prise_le).getTime() - new Date(b.prise_le).getTime()
    )
    await Promise.all(liste.map(async (p) => {
      try {
        const src = urlPhoto(p)
        const res = await fetch(src)
        const blob = await res.blob()
        const d = new Date(p.prise_le)
        const datePrefix = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}_${String(d.getHours()).padStart(2, '0')}-${String(d.getMinutes()).padStart(2, '0')}`
        zip.file(`${datePrefix}_${p.id.slice(0, 8)}.jpg`, blob)
      } catch {}
    }))
    const content = await zip.generateAsync({ type: 'blob' })
    const dateLabel = dateDebut && dateFin ? `${dateDebut}_${dateFin}` : new Date().toISOString().split('T')[0]
    const a = document.createElement('a')
    a.href = URL.createObjectURL(content)
    a.download = `photos_${dateLabel}.zip`
    a.click()
    URL.revokeObjectURL(a.href)
    setTelechargement(false)
  }

  return (
    <div>
      {/* Toolbar */}
      <div
        className="flex items-center justify-between mb-6 px-1"
        style={{ flexWrap: 'wrap', gap: 12 }}
      >
        <div className="flex items-center gap-3 flex-wrap">
          {/* Count */}
          <span className="text-sm font-600" style={{ color: '#111827' }}>
            {photosFiltrees.length}
            <span className="font-400 ml-1" style={{ color: '#9CA3AF' }}>
              photo{photosFiltrees.length !== 1 ? 's' : ''}
            </span>
          </span>

          {/* Zone filters */}
          {zones.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <span style={{ color: '#D1D5DB' }}><FilterIcon size={13} /></span>
              <button
                onClick={() => setZoneActive(null)}
                className="px-3 py-1 rounded-lg text-xs font-600 transition-all"
                style={{
                  background: !zoneActive ? '#111827' : '#FFFFFF',
                  color: !zoneActive ? '#FFFFFF' : '#6B7280',
                  border: `1px solid ${!zoneActive ? '#111827' : '#E5E7EB'}`,
                }}
              >
                Toutes
              </button>
              {zones.map(z => (
                <button
                  key={z.id}
                  onClick={() => setZoneActive(zoneActive === z.id ? null : z.id)}
                  className="px-3 py-1 rounded-lg text-xs font-600 flex items-center gap-1.5 transition-all"
                  style={{
                    background: zoneActive === z.id ? z.couleur : '#FFFFFF',
                    color: zoneActive === z.id ? '#FFFFFF' : '#6B7280',
                    border: `1px solid ${zoneActive === z.id ? z.couleur : '#E5E7EB'}`,
                  }}
                >
                  <span
                    className="w-2 h-2 rounded-full inline-block flex-shrink-0"
                    style={{ background: zoneActive === z.id ? 'rgba(255,255,255,0.7)' : z.couleur }}
                  />
                  {z.nom}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Filtre par date */}
        <div className="flex items-center gap-2 flex-wrap">
          <input
            type="date"
            value={dateDebut}
            onChange={e => setDateDebut(e.target.value)}
            className="px-3 py-1.5 rounded-lg border text-xs outline-none"
            style={{ borderColor: '#E5E7EB', color: '#374151', background: '#FAFAFA' }}
          />
          <span className="text-xs" style={{ color: '#9CA3AF' }}>→</span>
          <input
            type="date"
            value={dateFin}
            onChange={e => setDateFin(e.target.value)}
            className="px-3 py-1.5 rounded-lg border text-xs outline-none"
            style={{ borderColor: '#E5E7EB', color: '#374151', background: '#FAFAFA' }}
          />
          {(dateDebut || dateFin) && (
            <button
              onClick={() => { setDateDebut(''); setDateFin('') }}
              className="text-xs px-2 py-1.5 rounded-lg"
              style={{ color: '#6B7280', border: '1px solid #E5E7EB' }}
            >
              ✕
            </button>
          )}
        </div>

        <button
          onClick={telechargerZip}
          disabled={telechargement || photosFiltrees.length === 0}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-600 transition-all"
          style={{
            background: telechargement ? '#E5E7EB' : '#1B5FA8',
            color: telechargement ? '#9CA3AF' : '#FFFFFF',
            boxShadow: telechargement ? 'none' : '0 1px 3px rgba(27,95,168,0.25)',
          }}
        >
          <DownloadIcon size={14} />
          {telechargement ? 'Préparation ZIP...' : `Télécharger ZIP (${photosFiltrees.length})`}
        </button>
      </div>

      {/* Grid */}
      {photosFiltrees.length === 0 ? (
        <div
          className="bg-white rounded-xl py-16 flex flex-col items-center gap-3"
          style={{ border: '1px solid #E5E7EB' }}
        >
          <div style={{ color: '#D1D5DB', fontSize: 28 }}>◻</div>
          <p className="text-sm" style={{ color: '#9CA3AF' }}>Aucune photo dans cette zone</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {photosFiltrees.map(photo => (
            <div
              key={photo.id}
              className="bg-white rounded-lg overflow-hidden cursor-pointer group relative transition-all"
              style={{
                border: '1px solid #E5E7EB',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              }}
              onClick={() => setPhotoOuverte(photo)}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 6px 20px rgba(0,0,0,0.12)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-1px)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)'; (e.currentTarget as HTMLDivElement).style.transform = 'none' }}
            >
              {/* Image */}
              <div className="relative" style={{ aspectRatio: '4/3' }}>
                <img
                  src={urlPhoto(photo)}
                  alt=""
                  className="w-full h-full object-cover"
                  loading="lazy"
                />

                {/* Overlay on hover */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: 'rgba(0,0,0,0.15)' }}
                />

                {/* Status badges */}
                <div className="absolute top-2 left-2 flex gap-1">
                  {photo.incident && (
                    <span
                      className="flex items-center justify-center w-5 h-5 rounded"
                      style={{ background: 'rgba(220,38,38,0.88)', backdropFilter: 'blur(4px)' }}
                    >
                      <AlertIcon size={11} style={{ color: 'white' }} />
                    </span>
                  )}
                  {photo.prioritaire && (
                    <span
                      className="flex items-center justify-center w-5 h-5 rounded"
                      style={{ background: 'rgba(217,119,6,0.88)', backdropFilter: 'blur(4px)' }}
                    >
                      <StarIcon size={11} style={{ color: 'white' }} />
                    </span>
                  )}
                </div>

                {/* Zone label */}
                {photo.zones && (
                  <div
                    className="absolute bottom-0 left-0 right-0 px-2 py-1.5"
                    style={{ background: 'linear-gradient(transparent, rgba(0,0,0,0.55))' }}
                  >
                    <div className="flex items-center gap-1">
                      <span
                        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{ background: photo.zones.couleur }}
                      />
                      <span className="text-white text-xs font-500 truncate">{photo.zones.nom}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Meta */}
              <div className="px-2.5 py-2">
                <p className="text-xs" style={{ color: '#9CA3AF' }}>{fmtShort(photo.prise_le)}</p>
                {photo.sous_traitants && (
                  <p className="text-xs font-500 truncate mt-0.5" style={{ color: '#6B7280' }}>
                    {photo.sous_traitants.prenom_nom}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal photo */}
      {photoOuverte && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
          onClick={e => { if (e.target === e.currentTarget) setPhotoOuverte(null) }}
        >
          <div
            className="bg-white rounded-2xl overflow-hidden w-full max-w-4xl max-h-[90vh] flex flex-col md:flex-row"
            style={{ boxShadow: '0 25px 60px rgba(0,0,0,0.35)' }}
          >
            {/* Image */}
            <div className="flex-1 bg-black flex items-center justify-center min-h-64 relative">
              <img
                src={urlPhoto(photoOuverte)}
                alt=""
                className="max-h-[80vh] max-w-full object-contain"
              />
            </div>

            {/* Detail panel */}
            <div className="w-full md:w-72 flex flex-col" style={{ borderLeft: '1px solid #E5E7EB' }}>
              {/* Panel header */}
              <div
                className="flex items-center justify-between px-5 py-4"
                style={{ borderBottom: '1px solid #F3F4F6' }}
              >
                <h2 className="font-600 text-sm" style={{ color: '#111827' }}>Détails</h2>
                <button
                  onClick={() => setPhotoOuverte(null)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                  style={{ color: '#9CA3AF', background: '#F8F9FA' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#F3F4F6'}
                  onMouseLeave={e => e.currentTarget.style.background = '#F8F9FA'}
                >
                  <XIcon size={14} />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">
                <Field label="Date">{fmt(photoOuverte.prise_le)}</Field>
                {photoOuverte.zones && (
                  <Field label="Zone">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-sm" style={{ background: photoOuverte.zones.couleur }} />
                      {photoOuverte.zones.nom}
                    </div>
                  </Field>
                )}
                {photoOuverte.sous_traitants && (
                  <Field label="Sous-traitant">{photoOuverte.sous_traitants.prenom_nom}</Field>
                )}

                {/* Toggles */}
                <div className="flex gap-2">
                  <TagToggle
                    active={photoOuverte.prioritaire}
                    activeColor="#D97706"
                    activeBg="#FFFBEB"
                    activeBorder="#FDE68A"
                    icon={<StarIcon size={12} />}
                    label="Prioritaire"
                    onClick={() => togglePrioritaire(photoOuverte).then(() =>
                      setPhotoOuverte(p => p ? { ...p, prioritaire: !p.prioritaire } : p)
                    )}
                  />
                  <TagToggle
                    active={photoOuverte.incident}
                    activeColor="#DC2626"
                    activeBg="#FEF2F2"
                    activeBorder="#FECACA"
                    icon={<AlertIcon size={12} />}
                    label="Incident"
                    onClick={() => toggleIncident(photoOuverte).then(() =>
                      setPhotoOuverte(p => p ? { ...p, incident: !p.incident } : p)
                    )}
                  />
                </div>

                {/* Note */}
                <div>
                  <div className="text-xs font-600 uppercase tracking-wider mb-1.5" style={{ color: '#9CA3AF', letterSpacing: '0.06em' }}>
                    Note
                  </div>
                  <NoteEditor
                    photo={photoOuverte}
                    onSave={note => {
                      sauvegarderNote(photoOuverte, note)
                      setPhotoOuverte(p => p ? { ...p, note: note || null } : p)
                    }}
                  />
                </div>
              </div>

              {/* Download CTA */}
              <div className="px-5 py-4" style={{ borderTop: '1px solid #F3F4F6' }}>
                <a
                  href={urlPhoto(photoOuverte)}
                  download={`photo_${photoOuverte.zones?.nom ?? 'zone'}.jpg`}
                  target="_blank"
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg text-sm font-600 transition-all"
                  style={{
                    background: '#1B5FA8',
                    color: '#FFFFFF',
                    boxShadow: '0 1px 3px rgba(27,95,168,0.25)',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#1754A0'}
                  onMouseLeave={e => e.currentTarget.style.background = '#1B5FA8'}
                >
                  <DownloadIcon size={14} />
                  Télécharger
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs font-600 uppercase tracking-wider mb-1" style={{ color: '#9CA3AF', letterSpacing: '0.06em' }}>
        {label}
      </div>
      <div className="text-sm" style={{ color: '#111827' }}>{children}</div>
    </div>
  )
}

function TagToggle({
  active, activeColor, activeBg, activeBorder, icon, label, onClick
}: {
  active: boolean; activeColor: string; activeBg: string; activeBorder: string
  icon: React.ReactNode; label: string; onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-600 transition-all"
      style={{
        background: active ? activeBg : '#F8F9FA',
        color: active ? activeColor : '#9CA3AF',
        border: `1px solid ${active ? activeBorder : '#E5E7EB'}`,
      }}
    >
      {icon}{label}
    </button>
  )
}

function NoteEditor({ photo, onSave }: { photo: Photo; onSave: (note: string) => void }) {
  const [note, setNote] = useState(photo.note ?? '')
  const [saved, setSaved] = useState(false)

  async function sauvegarder() {
    setSaved(true)
    onSave(note)
    await new Promise(r => setTimeout(r, 1200))
    setSaved(false)
  }

  return (
    <div>
      <textarea
        value={note}
        onChange={e => setNote(e.target.value)}
        placeholder="Ajouter une note..."
        rows={3}
        className="w-full px-3 py-2.5 rounded-lg border text-sm resize-none outline-none transition-all"
        style={{
          borderColor: '#E5E7EB',
          background: '#F8F9FA',
          color: '#111827',
          lineHeight: 1.5,
        }}
        onFocus={e => { e.target.style.borderColor = '#1B5FA8'; e.target.style.background = '#FFFFFF' }}
        onBlur={e => { e.target.style.borderColor = '#E5E7EB'; e.target.style.background = '#F8F9FA' }}
      />
      <button
        onClick={sauvegarder}
        disabled={saved}
        className="mt-1.5 px-3 py-1.5 rounded-lg text-xs font-600 transition-all"
        style={{
          background: saved ? '#ECFDF5' : '#F8F9FA',
          color: saved ? '#059669' : '#1B5FA8',
          border: `1px solid ${saved ? '#A7F3D0' : '#E5E7EB'}`,
        }}
      >
        {saved ? '✓ Sauvegardé' : 'Sauvegarder'}
      </button>
    </div>
  )
}
