'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { DownloadIcon, PencilIcon, CheckIcon, XIcon, AlertIcon, ChevronRightIcon } from '@/components/Icons'

interface ResumeIA {
  narrative?: string
  travaux?: string[]
  equipe?: string
  materiaux?: string[]
  meteo?: string | null
  avancement?: string | null
  incidents?: string[]
  prochaines_etapes?: string[]
}

interface Journal {
  id: string
  date: string
  resume_ia: ResumeIA | null
  notes_brutes: string | null
  profils: { prenom_nom: string } | null
}

/** Échappe les caractères HTML pour prévenir les injections XSS dans le PDF */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('fr-CA', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
}

function fmtShort(d: string) {
  return new Date(d).toLocaleDateString('fr-CA', { day: 'numeric', month: 'short' })
}

function fmtDay(d: string) {
  return new Date(d).toLocaleDateString('fr-CA', { weekday: 'short' }).toUpperCase()
}

export default function JournalList({
  journaux: init, chantierNom, chantierId,
}: {
  journaux: Journal[]; chantierNom: string; chantierId: string
}) {
  const [journaux, setJournaux] = useState(init)
  const [ouvert, setOuvert] = useState<string | null>(init[0]?.id ?? null)
  const [edition, setEdition] = useState<{ id: string; champ: keyof ResumeIA; val: string } | null>(null)
  const [sauvegarde, setSauvegarde] = useState(false)

  async function sauvegarderChamp() {
    if (!edition) return
    setSauvegarde(true)
    const journal = journaux.find(j => j.id === edition.id)
    if (!journal) return
    const nouveauResume = { ...(journal.resume_ia ?? {}), [edition.champ]: edition.val }
    const supabase = createClient()
    await supabase.from('journal_chantier').update({ resume_ia: nouveauResume }).eq('id', edition.id)
    setJournaux(prev => prev.map(j =>
      j.id === edition.id ? { ...j, resume_ia: nouveauResume as ResumeIA } : j
    ))
    setSauvegarde(false)
    setEdition(null)
  }

  function telechargerPDF(journal: Journal) {
    const r = journal.resume_ia ?? {}
    // Toutes les données utilisateur passent par escapeHtml() — protection XSS
    const e = escapeHtml
    const html = `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Arial, sans-serif; max-width: 780px; margin: 48px auto; padding: 0 24px; color: #111827; background: #fff; }
  .header { border-bottom: 2px solid #1B5FA8; padding-bottom: 16px; margin-bottom: 28px; }
  .header h1 { font-size: 22px; font-weight: 700; color: #111827; margin-bottom: 6px; }
  .meta { font-size: 13px; color: #6B7280; }
  .section { margin-bottom: 24px; }
  .section-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #9CA3AF; margin-bottom: 8px; }
  p, li { font-size: 14px; line-height: 1.65; color: #374151; }
  ul { padding-left: 16px; display: flex; flex-direction: column; gap: 4px; }
  .incident { background: #FEF2F2; border: 1px solid #FECACA; color: #DC2626; padding: 8px 12px; border-radius: 6px; font-size: 13px; margin: 4px 0; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
  .footer { margin-top: 48px; font-size: 11px; color: #9CA3AF; border-top: 1px solid #E5E7EB; padding-top: 12px; }
  @media print { body { margin: 0; padding: 24px; } @page { margin: 20mm; } }
</style></head><body>
<div class="header">
  <h1>Journal de chantier</h1>
  <div class="meta">${e(chantierNom)} &middot; ${e(fmtDate(journal.date))}${r.equipe ? ` &middot; ${e(r.equipe)}` : ''}</div>
</div>
${r.narrative ? `<div class="section"><div class="section-label">R&eacute;sum&eacute; de la journ&eacute;e</div><p>${e(r.narrative)}</p></div>` : ''}
${r.travaux?.length ? `<div class="section"><div class="section-label">Travaux effectu&eacute;s</div><ul>${r.travaux.map(t => `<li>${e(t)}</li>`).join('')}</ul></div>` : ''}
<div class="grid">
${r.meteo ? `<div class="section"><div class="section-label">M&eacute;t&eacute;o</div><p>${e(r.meteo)}</p></div>` : ''}
${r.avancement ? `<div class="section"><div class="section-label">Avancement</div><p>${e(r.avancement)}</p></div>` : ''}
${r.materiaux?.length ? `<div class="section"><div class="section-label">Mat&eacute;riaux</div><ul>${r.materiaux.map(m => `<li>${e(m)}</li>`).join('')}</ul></div>` : ''}
</div>
${r.incidents?.length ? `<div class="section"><div class="section-label">Incidents</div>${r.incidents.map(inc => `<div class="incident">&#9650; ${e(inc)}</div>`).join('')}</div>` : ''}
${r.prochaines_etapes?.length ? `<div class="section"><div class="section-label">Prochaines &eacute;tapes</div><ul>${r.prochaines_etapes.map(step => `<li>${e(step)}</li>`).join('')}</ul></div>` : ''}
<div class="footer">G&eacute;n&eacute;r&eacute; par TraceChantier &middot; ${e(new Date().toLocaleDateString('fr-CA'))}</div>
</body></html>`

    const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `journal-${journal.date}.html`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (journaux.length === 0) {
    return (
      <div className="bg-white rounded-xl py-16 flex flex-col items-center gap-3" style={{ border: '1px solid #E5E7EB' }}>
        <div style={{ color: '#E5E7EB', fontSize: 24 }}>▤</div>
        <p className="text-sm" style={{ color: '#9CA3AF' }}>Aucun journal soumis pour ce chantier</p>
      </div>
    )
  }

  const journalOuvert = journaux.find(j => j.id === ouvert)

  return (
    <div className="flex gap-6 items-start">
      {/* Sidebar liste */}
      <div
        className="w-56 flex-shrink-0 bg-white rounded-xl overflow-hidden"
        style={{ border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
      >
        <div
          className="px-4 py-3"
          style={{ borderBottom: '1px solid #F3F4F6' }}
        >
          <span className="text-xs font-700 uppercase tracking-wider" style={{ color: '#9CA3AF', letterSpacing: '0.07em' }}>
            Journaux
          </span>
        </div>
        <div className="flex flex-col divide-y" style={{ borderColor: '#F3F4F6' }}>
          {journaux.map(j => {
            const actif = ouvert === j.id
            return (
              <button
                key={j.id}
                onClick={() => setOuvert(j.id)}
                className="text-left px-4 py-3 transition-colors w-full flex items-center justify-between"
                style={{
                  background: actif ? '#EFF6FF' : '#FFFFFF',
                  borderLeft: actif ? '3px solid #1B5FA8' : '3px solid transparent',
                }}
                onMouseEnter={e => { if (!actif) e.currentTarget.style.background = '#F8F9FA' }}
                onMouseLeave={e => { if (!actif) e.currentTarget.style.background = '#FFFFFF' }}
              >
                <div>
                  <div className="text-xs font-600" style={{ color: actif ? '#1B5FA8' : '#6B7280', letterSpacing: '0.03em' }}>
                    {fmtDay(j.date)}
                  </div>
                  <div className="text-sm font-700 mt-0.5" style={{ color: actif ? '#1B5FA8' : '#111827' }}>
                    {fmtShort(j.date)}
                  </div>
                  {j.resume_ia?.avancement && (
                    <div className="text-xs mt-0.5 truncate w-32" style={{ color: '#9CA3AF' }}>
                      {j.resume_ia.avancement}
                    </div>
                  )}
                </div>
                {actif && <ChevronRightIcon size={13} style={{ color: '#1B5FA8', flexShrink: 0 }} />}
              </button>
            )
          })}
        </div>
      </div>

      {/* Détail */}
      {journalOuvert && (() => {
        const r = journalOuvert.resume_ia ?? {}
        return (
          <div className="flex-1 min-w-0">
            {/* Journal header card */}
            <div
              className="bg-white rounded-xl px-6 py-5 mb-4 flex items-start justify-between"
              style={{ border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
            >
              <div>
                <h2 className="text-base font-700 capitalize tracking-tight" style={{ color: '#111827' }}>
                  {fmtDate(journalOuvert.date)}
                </h2>
                {journalOuvert.profils && (
                  <p className="text-xs mt-1 font-500" style={{ color: '#9CA3AF' }}>
                    Soumis par {journalOuvert.profils.prenom_nom}
                  </p>
                )}
                <div className="flex flex-wrap gap-2 mt-3">
                  {r.meteo && <Chip>{r.meteo}</Chip>}
                  {r.equipe && <Chip>{r.equipe}</Chip>}
                  {r.avancement && <Chip accent>{r.avancement}</Chip>}
                </div>
              </div>
              <button
                onClick={() => telechargerPDF(journalOuvert)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-600 transition-all flex-shrink-0"
                style={{
                  background: '#1B5FA8',
                  color: '#FFFFFF',
                  boxShadow: '0 1px 3px rgba(27,95,168,0.25)',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#1754A0'}
                onMouseLeave={e => e.currentTarget.style.background = '#1B5FA8'}
              >
                <DownloadIcon size={14} />
                Exporter PDF
              </button>
            </div>

            {/* Sections */}
            <div
              className="bg-white rounded-xl overflow-hidden"
              style={{ border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
            >
              {/* Narrative */}
              <JournalSection label="Résumé de la journée" showDivider={false}>
                <EditableText
                  val={r.narrative ?? ''}
                  journalId={journalOuvert.id}
                  champ="narrative"
                  edition={edition}
                  onEdit={setEdition}
                  onSave={sauvegarderChamp}
                  sauvegarde={sauvegarde}
                  multiline
                />
              </JournalSection>

              {r.travaux?.length ? (
                <JournalSection label="Travaux effectués">
                  <ul className="flex flex-col gap-2">
                    {r.travaux.map((t, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm" style={{ color: '#374151' }}>
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#1B5FA8' }} />
                        {t}
                      </li>
                    ))}
                  </ul>
                </JournalSection>
              ) : null}

              <div className="grid grid-cols-2 divide-x" style={{ borderTop: '1px solid #F3F4F6', borderColor: '#F3F4F6' }}>
                {r.equipe && (
                  <JournalSection label="Équipe" compact noDivider>
                    <EditableText val={r.equipe} journalId={journalOuvert.id} champ="equipe"
                      edition={edition} onEdit={setEdition} onSave={sauvegarderChamp} sauvegarde={sauvegarde} />
                  </JournalSection>
                )}
                {r.avancement && (
                  <JournalSection label="Avancement" compact noDivider>
                    <EditableText val={r.avancement} journalId={journalOuvert.id} champ="avancement"
                      edition={edition} onEdit={setEdition} onSave={sauvegarderChamp} sauvegarde={sauvegarde} />
                  </JournalSection>
                )}
                {r.materiaux?.length ? (
                  <JournalSection label="Matériaux" compact noDivider>
                    <ul className="flex flex-col gap-1.5">
                      {r.materiaux.map((m, i) => (
                        <li key={i} className="text-sm flex items-start gap-2" style={{ color: '#374151' }}>
                          <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#9CA3AF' }} />
                          {m}
                        </li>
                      ))}
                    </ul>
                  </JournalSection>
                ) : null}
              </div>

              {r.incidents?.length ? (
                <JournalSection label="Incidents">
                  <div className="flex flex-col gap-2">
                    {r.incidents.map((inc, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2.5 px-3.5 py-3 rounded-lg text-sm"
                        style={{ background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA' }}
                      >
                        <AlertIcon size={14} style={{ flexShrink: 0, marginTop: 1 }} />
                        {inc}
                      </div>
                    ))}
                  </div>
                </JournalSection>
              ) : null}

              {r.prochaines_etapes?.length ? (
                <JournalSection label="Prochaines étapes">
                  <ul className="flex flex-col gap-2">
                    {r.prochaines_etapes.map((e, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm" style={{ color: '#374151' }}>
                        <span className="mt-1 flex-shrink-0" style={{ color: '#059669' }}>→</span>
                        {e}
                      </li>
                    ))}
                  </ul>
                </JournalSection>
              ) : null}
            </div>
          </div>
        )
      })()}
    </div>
  )
}

function JournalSection({
  label, children, showDivider = true, compact = false, noDivider = false
}: {
  label: string; children: React.ReactNode
  showDivider?: boolean; compact?: boolean; noDivider?: boolean
}) {
  return (
    <div
      className={compact ? 'px-5 py-4' : 'px-6 py-5'}
      style={{ borderTop: (showDivider && !noDivider) ? '1px solid #F3F4F6' : 'none' }}
    >
      <div
        className="text-xs font-700 uppercase tracking-wider mb-3"
        style={{ color: '#9CA3AF', letterSpacing: '0.07em' }}
      >
        {label}
      </div>
      {children}
    </div>
  )
}

function Chip({ children, accent = false }: { children: React.ReactNode; accent?: boolean }) {
  return (
    <span
      className="text-xs font-500 px-2.5 py-1 rounded-lg"
      style={{
        background: accent ? '#EFF6FF' : '#F3F4F6',
        color: accent ? '#1B5FA8' : '#6B7280',
        border: `1px solid ${accent ? '#DBEAFE' : '#E5E7EB'}`,
      }}
    >
      {children}
    </span>
  )
}

function EditableText({
  val, journalId, champ, edition, onEdit, onSave, sauvegarde, multiline,
}: {
  val: string; journalId: string; champ: keyof ResumeIA
  edition: { id: string; champ: keyof ResumeIA; val: string } | null
  onEdit: (e: { id: string; champ: keyof ResumeIA; val: string }) => void
  onSave: () => void; sauvegarde: boolean; multiline?: boolean
}) {
  const enEdition = edition?.id === journalId && edition?.champ === champ

  if (enEdition) {
    return (
      <div>
        {multiline ? (
          <textarea
            value={edition.val}
            onChange={e => onEdit({ id: journalId, champ, val: e.target.value })}
            rows={4}
            className="w-full px-3.5 py-2.5 rounded-lg border text-sm resize-none outline-none transition-all"
            style={{ borderColor: '#1B5FA8', background: '#FFFFFF', color: '#111827', boxShadow: '0 0 0 3px rgba(27,95,168,0.08)' }}
            autoFocus
          />
        ) : (
          <input
            value={edition.val}
            onChange={e => onEdit({ id: journalId, champ, val: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none transition-all"
            style={{ borderColor: '#1B5FA8', background: '#FFFFFF', color: '#111827', boxShadow: '0 0 0 3px rgba(27,95,168,0.08)' }}
            autoFocus
          />
        )}
        <div className="flex gap-2 mt-2">
          <button
            onClick={onSave}
            disabled={sauvegarde}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-600 transition-all"
            style={{ background: '#1B5FA8', color: '#FFFFFF' }}
          >
            <CheckIcon size={12} />
            {sauvegarde ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
          <button
            onClick={() => onEdit(null as any)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-600"
            style={{ background: '#F8F9FA', color: '#9CA3AF', border: '1px solid #E5E7EB' }}
          >
            <XIcon size={12} />
            Annuler
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      onClick={() => onEdit({ id: journalId, champ, val })}
      className="group cursor-text px-3.5 py-2.5 rounded-lg border transition-all relative"
      style={{ borderColor: '#F3F4F6', background: '#F8F9FA' }}
      title="Cliquer pour modifier"
      onMouseEnter={e => { e.currentTarget.style.borderColor = '#D1D5DB'; e.currentTarget.style.background = '#FFFFFF' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = '#F3F4F6'; e.currentTarget.style.background = '#F8F9FA' }}
    >
      <p className="text-sm leading-relaxed" style={{ color: val ? '#374151' : '#D1D5DB' }}>
        {val || 'Cliquer pour modifier...'}
      </p>
      <span
        className="absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ color: '#9CA3AF' }}
      >
        <PencilIcon size={12} />
      </span>
    </div>
  )
}
