'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { LockIcon, XIcon, AlertIcon } from '@/components/Icons'

const DISCLAIMER = `En clôturant ce chantier, vous confirmez avoir pris connaissance des points suivants :

• Vous disposez de 180 jours à compter d'aujourd'hui pour télécharger l'ensemble de vos données (photos, journaux).

• Après ce délai, toutes les données associées à ce chantier (photos, journaux, documents) seront définitivement et irrévocablement supprimées des serveurs de TraceChantier.

• La loi québécoise (art. 2925 C.c.Q.) prévoit un délai de prescription général de 5 ans pour les réclamations liées aux travaux de construction. TraceChantier recommande fortement de conserver une copie de vos documents pendant cette période.

• TraceChantier ne pourra être tenu responsable de toute perte de données survenant après l'expiration de la période d'archivage de 180 jours.

En cochant la case ci-dessous, vous assumez l'entière responsabilité de la conservation de vos documents de chantier conformément aux obligations légales applicables.`

export default function CloturerBtn({ chantierId, nomChantier }: { chantierId: string; nomChantier: string }) {
  const [ouvert, setOuvert] = useState(false)
  const [accepte, setAccepte] = useState(false)
  const [chargement, setChargement] = useState(false)
  const [erreur, setErreur] = useState<string | null>(null)
  const enCours = useRef(false) // FERME-8 : verrou synchrone anti double-clic
  const router = useRouter()

  function ouvrir() {
    setAccepte(false)
    setErreur(null)
    setOuvert(true)
  }

  function fermer() {
    if (chargement) return
    setOuvert(false)
    setErreur(null)
    setAccepte(false)
  }

  async function confirmer() {
    if (!accepte || enCours.current) return // FERME-8 : verrou synchrone
    enCours.current = true
    setChargement(true)
    setErreur(null)
    try {
      const res = await fetch('/api/fermer-chantier', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chantierId }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? 'Erreur serveur')
      }
      setOuvert(false)
      router.refresh()
    } catch (e: any) {
      // FERME-6 : ne jamais exposer les messages internes Postgres/PostgREST
      const raw: string = e?.message ?? ''
      const msg = raw.includes('déjà fermé')
        ? 'Ce chantier est déjà clôturé.'
        : raw.includes('accès refusé') || raw.includes('Non autorisé') || raw.includes('insufficient_privilege')
        ? 'Action non autorisée.'
        : 'Une erreur est survenue. Veuillez réessayer.'
      setErreur(msg)
    } finally {
      setChargement(false)
      enCours.current = false
    }
  }

  return (
    <>
      {/* Bouton déclencheur */}
      <button
        onClick={ouvrir}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-600 transition-all"
        style={{
          background: '#FEF2F2',
          color: '#DC2626',
          border: '1px solid #FECACA',
          cursor: 'pointer',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = '#FEE2E2' }}
        onMouseLeave={e => { e.currentTarget.style.background = '#FEF2F2' }}
      >
        <LockIcon size={12} />
        Clôturer
      </button>

      {/* Overlay modal */}
      {ouvert && (
        <div
          onClick={fermer}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
        >
          {/* Carte */}
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '480px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              maxHeight: '90vh',
            }}
          >
            {/* Bande rouge en haut */}
            <div style={{ height: '4px', background: '#DC2626', flexShrink: 0 }} />

            {/* En-tête */}
            <div
              style={{
                padding: '20px 24px 16px',
                borderBottom: '1px solid #F3F4F6',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: '12px',
                flexShrink: 0,
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ color: '#DC2626' }}><AlertIcon size={16} /></span>
                  <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#111827', margin: 0 }}>
                    Clôturer le chantier
                  </h2>
                </div>
                <p style={{ fontSize: '13px', color: '#374151', margin: 0 }}>
                  <strong>{nomChantier}</strong>
                </p>
              </div>
              <button
                onClick={fermer}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#9CA3AF',
                  padding: '2px',
                  display: 'flex',
                  alignItems: 'center',
                  flexShrink: 0,
                }}
                aria-label="Fermer"
              >
                <XIcon size={16} />
              </button>
            </div>

            {/* Corps — scrollable */}
            <div style={{ padding: '16px 24px', overflowY: 'auto', flex: 1 }}>
              <div
                style={{
                  background: '#FFF7F7',
                  border: '1px solid #FECACA',
                  borderRadius: '8px',
                  padding: '14px 16px',
                  marginBottom: '16px',
                }}
              >
                <p
                  style={{
                    fontSize: '13px',
                    color: '#6B7280',
                    lineHeight: '1.65',
                    margin: 0,
                    whiteSpace: 'pre-line',
                  }}
                >
                  {DISCLAIMER}
                </p>
              </div>

              {/* Checkbox */}
              <label
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  cursor: 'pointer',
                  userSelect: 'none',
                }}
              >
                <input
                  type="checkbox"
                  checked={accepte}
                  onChange={e => setAccepte(e.target.checked)}
                  style={{
                    width: '16px',
                    height: '16px',
                    marginTop: '1px',
                    cursor: 'pointer',
                    accentColor: '#DC2626',
                    flexShrink: 0,
                  }}
                />
                <span style={{ fontSize: '13px', color: '#374151', lineHeight: '1.5' }}>
                  J'ai lu et j'accepte les conditions ci-dessus
                </span>
              </label>

              {erreur && (
                <p
                  style={{
                    marginTop: '12px',
                    fontSize: '13px',
                    color: '#DC2626',
                    background: '#FEF2F2',
                    border: '1px solid #FECACA',
                    borderRadius: '6px',
                    padding: '8px 12px',
                  }}
                >
                  {erreur}
                </p>
              )}
            </div>

            {/* Actions */}
            <div
              style={{
                padding: '14px 24px 20px',
                borderTop: '1px solid #F3F4F6',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '10px',
                flexShrink: 0,
              }}
            >
              <button
                onClick={fermer}
                disabled={chargement}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 600,
                  background: '#FFFFFF',
                  color: '#374151',
                  border: '1px solid #D1D5DB',
                  cursor: chargement ? 'not-allowed' : 'pointer',
                  opacity: chargement ? 0.5 : 1,
                }}
              >
                Annuler
              </button>
              <button
                onClick={confirmer}
                disabled={!accepte || chargement}
                style={{
                  padding: '8px 18px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 600,
                  background: '#DC2626',
                  color: '#FFFFFF',
                  border: 'none',
                  cursor: !accepte || chargement ? 'not-allowed' : 'pointer',
                  opacity: !accepte || chargement ? 0.4 : 1,
                  transition: 'opacity 0.15s',
                }}
              >
                {chargement ? 'Clôture en cours...' : 'Confirmer la clôture'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
