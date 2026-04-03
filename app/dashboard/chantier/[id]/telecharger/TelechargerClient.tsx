'use client'

import { useState } from 'react'
import { DownloadIcon, BookIcon, CameraIcon } from '@/components/Icons'

type Journal = {
  date: string
  resume_ia: any
  notes_brutes: string | null
}

type Props = {
  chantierId: string
  nomChantier: string
  journaux: Journal[]
}

function extraireTexteResume(resume_ia: any): string {
  if (!resume_ia) return ''
  if (typeof resume_ia === 'string') return resume_ia
  if (typeof resume_ia === 'object') {
    // Chercher les champs "resume" ou "contenu" en premier
    if (resume_ia.resume) return String(resume_ia.resume)
    if (resume_ia.contenu) return String(resume_ia.contenu)
    // Sinon stringify condensé
    return JSON.stringify(resume_ia)
  }
  return String(resume_ia)
}

function escapeCsvField(value: string): string {
  const s = value.replace(/"/g, '""')
  if (s.includes(',') || s.includes('"') || s.includes('\n') || s.includes('\r')) {
    return `"${s}"`
  }
  return s
}

export default function TelechargerClient({ chantierId, nomChantier, journaux }: Props) {
  const [telechargementPhotos, setTelechargementPhotos] = useState(false)
  const [erreurPhotos, setErreurPhotos] = useState<string | null>(null)

  async function telechargerPhotos() {
    setTelechargementPhotos(true)
    setErreurPhotos(null)
    try {
      const res = await fetch(`/api/telecharger-photos?chantierId=${encodeURIComponent(chantierId)}`)
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body?.error ?? `Erreur ${res.status}`)
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `photos-${nomChantier.replace(/[^a-zA-Z0-9]/g, '-')}.zip`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (e: any) {
      setErreurPhotos(e?.message ?? 'Une erreur est survenue.')
    } finally {
      setTelechargementPhotos(false)
    }
  }

  function exporterJournauxCSV() {
    if (journaux.length === 0) return

    const lignes: string[] = [
      ['Date', 'Résumé IA', 'Notes brutes'].map(escapeCsvField).join(','),
    ]

    for (const j of journaux) {
      const date = escapeCsvField(j.date ?? '')
      const resume = escapeCsvField(extraireTexteResume(j.resume_ia))
      const notes = escapeCsvField(j.notes_brutes ?? '')
      lignes.push([date, resume, notes].join(','))
    }

    const csv = '\uFEFF' + lignes.join('\r\n') // BOM UTF-8 pour Excel
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `journaux-${nomChantier.replace(/[^a-zA-Z0-9]/g, '-')}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex flex-col gap-4">

      {/* Section Photos */}
      <div
        className="bg-white rounded-xl p-6"
        style={{ border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
      >
        <div className="flex items-center gap-2 mb-1">
          <span style={{ color: '#1B5FA8' }}><CameraIcon size={16} /></span>
          <h2 className="text-sm font-700" style={{ color: '#111827' }}>Photos</h2>
        </div>
        <p className="text-xs mb-4" style={{ color: '#6B7280' }}>
          Télécharge toutes les photos du chantier dans une archive ZIP.
        </p>
        <button
          onClick={telechargerPhotos}
          disabled={telechargementPhotos}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-600 transition-all"
          style={{
            background: telechargementPhotos ? '#EFF6FF' : '#EFF6FF',
            color: '#1B5FA8',
            border: '1px solid #BFDBFE',
            cursor: telechargementPhotos ? 'wait' : 'pointer',
            opacity: telechargementPhotos ? 0.6 : 1,
          }}
          onMouseEnter={e => { if (!telechargementPhotos) e.currentTarget.style.background = '#DBEAFE' }}
          onMouseLeave={e => { e.currentTarget.style.background = '#EFF6FF' }}
        >
          <DownloadIcon size={14} />
          {telechargementPhotos ? 'Préparation du ZIP...' : 'Télécharger toutes les photos (ZIP)'}
        </button>
        {erreurPhotos && (
          <p className="mt-3 text-xs rounded-lg px-3 py-2" style={{ color: '#DC2626', background: '#FEF2F2', border: '1px solid #FECACA' }}>
            {erreurPhotos}
          </p>
        )}
      </div>

      {/* Section Journaux */}
      <div
        className="bg-white rounded-xl p-6"
        style={{ border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
      >
        <div className="flex items-center gap-2 mb-1">
          <span style={{ color: '#059669' }}><BookIcon size={16} /></span>
          <h2 className="text-sm font-700" style={{ color: '#111827' }}>Journaux</h2>
        </div>
        <p className="text-xs mb-4" style={{ color: '#6B7280' }}>
          {journaux.length === 0
            ? 'Aucun journal disponible pour ce chantier.'
            : `${journaux.length} entrée${journaux.length > 1 ? 's' : ''} disponible${journaux.length > 1 ? 's' : ''} — export CSV (compatible Excel).`}
        </p>
        <button
          onClick={exporterJournauxCSV}
          disabled={journaux.length === 0}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-600 transition-all"
          style={{
            background: '#F0FDF4',
            color: '#059669',
            border: '1px solid #A7F3D0',
            cursor: journaux.length === 0 ? 'not-allowed' : 'pointer',
            opacity: journaux.length === 0 ? 0.4 : 1,
          }}
          onMouseEnter={e => { if (journaux.length > 0) e.currentTarget.style.background = '#DCFCE7' }}
          onMouseLeave={e => { e.currentTarget.style.background = '#F0FDF4' }}
        >
          <DownloadIcon size={14} />
          Exporter les journaux (CSV)
        </button>
      </div>

    </div>
  )
}
