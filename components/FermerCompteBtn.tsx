'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { TrashIcon, XIcon, AlertIcon } from '@/components/Icons'
import { createClient } from '@/lib/supabase/client'

const DISCLAIMER = `La fermeture de votre compte est définitive et irréversible. Avant de confirmer, veuillez prendre note des points suivants :

• Toutes vos données seront supprimées définitivement : chantiers, photos, journaux, rapports et informations d'équipe.

• Votre abonnement Stripe sera annulé immédiatement. Aucun remboursement ne sera effectué pour la période déjà facturée.

• Vos sous-traitants perdront immédiatement l'accès aux chantiers via leurs codes d'accès.

• La loi québécoise (art. 2925 C.c.Q.) prévoit un délai de prescription de 5 ans pour les réclamations liées aux travaux de construction. TraceChantier recommande de conserver vos données localement avant de procéder.

• Cette action ne peut pas être annulée. Il n'existe aucun moyen de récupérer vos données après la suppression.`

export default function FermerCompteBtn() {
  const [ouvert, setOuvert]         = useState(false)
  const [accepte, setAccepte]       = useState(false)
  const [emailSaisi, setEmailSaisi] = useState('')
  const [chargement, setChargement] = useState(false)
  const [erreur, setErreur]         = useState<string | null>(null)
  const enCours = useRef(false)
  const router  = useRouter()
  const supabase = createClient()

  function ouvrir() {
    setAccepte(false)
    setEmailSaisi('')
    setErreur(null)
    setOuvert(true)
  }

  function fermer() {
    if (chargement) return
    setOuvert(false)
    setErreur(null)
    setAccepte(false)
    setEmailSaisi('')
  }

  async function confirmer() {
    if (!accepte || !emailSaisi || enCours.current) return
    enCours.current = true
    setChargement(true)
    setErreur(null)
    try {
      const res = await fetch('/api/fermer-compte', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email_confirm: emailSaisi }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? 'Erreur serveur')
      }
      // Déconnexion côté client puis redirection
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push('/?compte=supprime')
    } catch (e: any) {
      const raw: string = e?.message ?? ''
      const msg = raw.includes('Non autorisé')
        ? 'Action non autorisée.'
        : 'Une erreur est survenue. Veuillez réessayer ou contacter le support.'
      setErreur(msg)
    } finally {
      setChargement(false)
      enCours.current = false
    }
  }

  return (
    <>
      <button
        onClick={ouvrir}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '8px 16px',
          borderRadius: '8px',
          fontSize: '13px',
          fontWeight: 600,
          background: '#FEF2F2',
          color: '#DC2626',
          border: '1px solid #FECACA',
          cursor: 'pointer',
          transition: 'background 0.15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = '#FEE2E2' }}
        onMouseLeave={e => { e.currentTarget.style.background = '#FEF2F2' }}
      >
        <TrashIcon size={14} />
        Supprimer mon compte
      </button>

      {ouvert && (
        <div
          onClick={fermer}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.55)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '500px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              maxHeight: '90vh',
            }}
          >
            {/* Barre rouge */}
            <div style={{ height: '4px', background: '#DC2626', flexShrink: 0 }} />

            {/* En-tête */}
            <div style={{
              padding: '20px 24px 16px',
              borderBottom: '1px solid #F3F4F6',
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: '12px',
              flexShrink: 0,
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ color: '#DC2626' }}><AlertIcon size={16} /></span>
                  <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#111827', margin: 0 }}>
                    Supprimer mon compte
                  </h2>
                </div>
                <p style={{ fontSize: '13px', color: '#6B7280', margin: 0 }}>
                  Cette action est permanente et irréversible
                </p>
              </div>
              <button
                onClick={fermer}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: '2px', display: 'flex', alignItems: 'center', flexShrink: 0 }}
                aria-label="Fermer"
              >
                <XIcon size={16} />
              </button>
            </div>

            {/* Corps scrollable */}
            <div style={{ padding: '16px 24px', overflowY: 'auto', flex: 1 }}>
              <div style={{
                background: '#FFF7F7',
                border: '1px solid #FECACA',
                borderRadius: '8px',
                padding: '14px 16px',
                marginBottom: '16px',
              }}>
                <p style={{ fontSize: '13px', color: '#6B7280', lineHeight: '1.65', margin: 0, whiteSpace: 'pre-line' }}>
                  {DISCLAIMER}
                </p>
              </div>

              {/* Confirmation email */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', color: '#374151', fontWeight: 600, marginBottom: '6px' }}>
                  Confirmez votre adresse courriel pour continuer
                </label>
                <input
                  type="email"
                  placeholder="votre@courriel.com"
                  value={emailSaisi}
                  onChange={e => setEmailSaisi(e.target.value)}
                  style={{
                    width: '100%', padding: '9px 12px', borderRadius: '8px',
                    border: '1px solid #D1D5DB', fontSize: '13px', color: '#111827',
                    outline: 'none', boxSizing: 'border-box',
                  }}
                />
              </div>

              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer', userSelect: 'none' }}>
                <input
                  type="checkbox"
                  checked={accepte}
                  onChange={e => setAccepte(e.target.checked)}
                  style={{ width: '16px', height: '16px', marginTop: '1px', cursor: 'pointer', accentColor: '#DC2626', flexShrink: 0 }}
                />
                <span style={{ fontSize: '13px', color: '#374151', lineHeight: '1.5' }}>
                  Je comprends que cette action supprimera définitivement mon compte et toutes mes données
                </span>
              </label>

              {erreur && (
                <p style={{ marginTop: '12px', fontSize: '13px', color: '#DC2626', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '6px', padding: '8px 12px' }}>
                  {erreur}
                </p>
              )}
            </div>

            {/* Actions */}
            <div style={{
              padding: '14px 24px 20px',
              borderTop: '1px solid #F3F4F6',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '10px',
              flexShrink: 0,
            }}>
              <button
                onClick={fermer}
                disabled={chargement}
                style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, background: '#FFFFFF', color: '#374151', border: '1px solid #D1D5DB', cursor: chargement ? 'not-allowed' : 'pointer', opacity: chargement ? 0.5 : 1 }}
              >
                Annuler
              </button>
              <button
                onClick={confirmer}
                disabled={!accepte || !emailSaisi || chargement}
                style={{ padding: '8px 18px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, background: '#DC2626', color: '#FFFFFF', border: 'none', cursor: (!accepte || !emailSaisi || chargement) ? 'not-allowed' : 'pointer', opacity: (!accepte || !emailSaisi || chargement) ? 0.4 : 1, transition: 'opacity 0.15s' }}
              >
                {chargement ? 'Suppression en cours...' : 'Supprimer définitivement'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
