'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AlertIcon } from '@/components/Icons'

interface ChantierSynthese {
  nom: string
  bilan: string
  points_cles: string[]
  alertes: string[]
}

interface SyntheseIA {
  introduction?: string
  chantiers?: ChantierSynthese[]
  incidents_semaine?: string[]
  priorites_semaine_prochaine?: string[]
  note_globale?: string
}

interface JournalResume {
  id: string
  date: string
  resume_ia: any
}


export default function SyntheseClient({
  chantierId,
  journaux,
  debutSemaine,
  finSemaine,
}: {
  chantierId: string
  journaux: JournalResume[]
  debutSemaine: string
  finSemaine: string
}) {
  const [synthese, setSynthese] = useState<SyntheseIA | null>(null)
  const [chargement, setChargement] = useState(false)
  const [erreur, setErreur] = useState<string | null>(null)
  const nb = journaux.length

  async function genererSynthese() {
    setChargement(true)
    setErreur(null)
    try {
      const supabase = createClient()
      const { data, error } = await supabase.functions.invoke('synthese-hebdo', {
        body: { chantier_id: chantierId },
      })
      if (error) throw new Error(error.message)
      // L'Edge Function retourne soit { synthese: {...} } soit directement les champs
      const s = data?.synthese ?? data
      setSynthese(s)
    } catch (e: any) {
      setErreur(e?.message ?? 'Erreur lors de la génération de la synthèse')
    } finally {
      setChargement(false)
    }
  }

  return (
    <div className="p-8 max-w-3xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <h2 className="text-lg font-700 tracking-tight" style={{ color: '#111827' }}>
            Synthèse hebdomadaire
          </h2>
          <span
            className="text-xs font-600 px-2 py-0.5 rounded-full"
            style={{ background: nb > 0 ? '#EFF6FF' : '#F3F4F6', color: nb > 0 ? '#1B5FA8' : '#9CA3AF' }}
          >
            {nb} journal{nb !== 1 ? 'aux' : ''}
          </span>
        </div>
        <p className="text-sm" style={{ color: '#9CA3AF' }}>
          {debutSemaine} — {finSemaine}
        </p>
      </div>

      {/* État vide */}
      {nb === 0 && (
        <div
          className="bg-white rounded-xl py-16 flex flex-col items-center gap-3"
          style={{ border: '1px solid #E5E7EB' }}
        >
          <div style={{ color: '#E5E7EB', fontSize: 22 }}>▤</div>
          <p className="text-sm" style={{ color: '#9CA3AF' }}>Aucun journal cette semaine</p>
        </div>
      )}

      {nb > 0 && (
        <>
          {/* Synthèse IA générée */}
          {synthese ? (
            <div
              className="bg-white rounded-xl overflow-hidden mb-6"
              style={{ border: '1px solid #DBEAFE', boxShadow: '0 1px 4px rgba(27,95,168,0.10)' }}
            >
              {/* Header synthèse */}
              <div
                className="px-6 py-4 flex items-center gap-3"
                style={{ background: '#EFF6FF', borderBottom: '1px solid #DBEAFE' }}
              >
                <div className="flex-1">
                  <div className="font-700 text-sm" style={{ color: '#1B5FA8' }}>
                    Synthèse IA — {nb} journaux analysés
                  </div>
                  {synthese.periode && (
                    <div className="text-xs mt-0.5" style={{ color: '#93C5FD' }}>{synthese.periode}</div>
                  )}
                </div>
                <button
                  onClick={genererSynthese}
                  disabled={chargement}
                  className="text-xs font-600 px-3 py-1.5 rounded-lg transition-all"
                  style={{
                    background: '#FFFFFF',
                    color: '#1B5FA8',
                    border: '1px solid #BFDBFE',
                  }}
                >
                  Régénérer
                </button>
              </div>

              <div className="px-6 py-5 flex flex-col gap-5">
                {/* Introduction */}
                {synthese.introduction && (
                  <div>
                    <div className="text-xs font-700 uppercase tracking-wider mb-2" style={{ color: '#9CA3AF', letterSpacing: '0.07em' }}>
                      Résumé de la semaine
                    </div>
                    <p className="text-sm leading-relaxed" style={{ color: '#374151' }}>{synthese.introduction}</p>
                  </div>
                )}

                {/* Par chantier */}
                {synthese.chantiers && synthese.chantiers.length > 0 && (
                  <div className="flex flex-col gap-3">
                    {synthese.chantiers.map((c, i) => (
                      <div key={i} className="rounded-lg px-4 py-3" style={{ background: '#F8FAFC', border: '1px solid #E5E7EB' }}>
                        <div className="font-600 text-sm mb-1" style={{ color: '#111827' }}>{c.nom}</div>
                        <p className="text-sm mb-2" style={{ color: '#374151' }}>{c.bilan}</p>
                        {c.points_cles?.length > 0 && (
                          <ul className="flex flex-col gap-1">
                            {c.points_cles.map((p, j) => (
                              <li key={j} className="text-xs flex items-start gap-2" style={{ color: '#4B5563' }}>
                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#1B5FA8' }} />
                                {p}
                              </li>
                            ))}
                          </ul>
                        )}
                        {c.alertes?.length > 0 && (
                          <div className="mt-2 flex flex-col gap-1">
                            {c.alertes.map((a, j) => (
                              <div key={j} className="flex items-start gap-2 px-2.5 py-1.5 rounded text-xs" style={{ background: '#FEF2F2', color: '#DC2626' }}>
                                <AlertIcon size={12} style={{ flexShrink: 0, marginTop: 1 }} />
                                {a}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Incidents globaux */}
                {synthese.incidents_semaine && synthese.incidents_semaine.length > 0 && (
                  <div>
                    <div className="text-xs font-700 uppercase tracking-wider mb-2" style={{ color: '#9CA3AF', letterSpacing: '0.07em' }}>
                      Incidents de la semaine
                    </div>
                    <div className="flex flex-col gap-1.5">
                      {synthese.incidents_semaine.map((inc, i) => (
                        <div key={i} className="flex items-start gap-2 px-3.5 py-2.5 rounded-lg text-sm" style={{ background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA' }}>
                          <AlertIcon size={14} style={{ flexShrink: 0, marginTop: 1 }} />
                          {inc}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Priorités semaine prochaine */}
                {synthese.priorites_semaine_prochaine && synthese.priorites_semaine_prochaine.length > 0 && (
                  <div>
                    <div className="text-xs font-700 uppercase tracking-wider mb-2" style={{ color: '#9CA3AF', letterSpacing: '0.07em' }}>
                      Priorités semaine prochaine
                    </div>
                    <ul className="flex flex-col gap-1.5">
                      {synthese.priorites_semaine_prochaine.map((p, i) => (
                        <li key={i} className="text-sm flex items-start gap-2.5" style={{ color: '#374151' }}>
                          <span className="font-700 text-xs" style={{ color: '#1B5FA8', minWidth: 16 }}>{i + 1}.</span>
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Note globale */}
                {synthese.note_globale && (
                  <div className="px-4 py-3 rounded-lg" style={{ background: '#EFF6FF', border: '1px solid #DBEAFE' }}>
                    <p className="text-sm font-500 italic" style={{ color: '#1B5FA8' }}>{synthese.note_globale}</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Bouton Générer la synthèse */
            <div
              className="bg-white rounded-xl px-6 py-8 flex flex-col items-center gap-4 mb-6"
              style={{ border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
            >
              <div className="text-center">
                <div className="font-600 text-sm mb-1" style={{ color: '#111827' }}>
                  Synthèse IA disponible
                </div>
                <p className="text-sm" style={{ color: '#9CA3AF' }}>
                  {nb} journaux prêts à analyser — la synthèse consolidera les travaux, incidents et tendances de la semaine
                </p>
              </div>
              {erreur && (
                <div
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm w-full"
                  style={{ background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA' }}
                >
                  <AlertIcon size={14} />
                  {erreur}
                </div>
              )}
              <button
                onClick={genererSynthese}
                disabled={chargement}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-600 transition-all"
                style={{
                  background: chargement ? '#E5E7EB' : '#1B5FA8',
                  color: chargement ? '#9CA3AF' : '#FFFFFF',
                  boxShadow: chargement ? 'none' : '0 1px 3px rgba(27,95,168,0.25)',
                }}
              >
                {chargement ? 'Génération en cours...' : 'Générer la synthèse'}
              </button>
            </div>
          )}

        </>
      )}
    </div>
  )
}
