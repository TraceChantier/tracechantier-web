'use client'
import GrueSVG from '../components/GrueSVG'
import Link from 'next/link'

const CRANE_W = 180

const PLANS = [
  {
    id: 'demarrage',
    label: 'Solo',
    prix: 59,
    prixAnnuel: 49,
    highlight: false,
    badge: null,
    features: [
      '1 admin',
      '3 chantiers actifs',
      '30 rapports IA / mois',
      '5 Go de photos',
      'Journal vocal IA',
      'Timeline avant/après',
      'Export PDF',
    ],
  },
  {
    id: 'maitre',
    label: 'PME',
    prix: 149,
    prixAnnuel: 124,
    highlight: true,
    badge: 'Populaire',
    features: [
      '5 admins',
      '10 chantiers actifs',
      '300 rapports IA / mois',
      '25 Go de photos',
      'Journal vocal IA',
      'Timeline avant/après',
      'Export PDF',
      'Portail client',
      'Synthèse hebdomadaire IA',
    ],
  },
  {
    id: 'entreprise',
    label: 'Entreprise',
    prix: 249,
    prixAnnuel: 207,
    highlight: false,
    badge: null,
    features: [
      '10 admins',
      '20 chantiers actifs',
      '500 rapports IA / mois',
      '100 Go de photos',
      'Journal vocal IA',
      'Timeline avant/après',
      'Export PDF + CSV',
      'Portail client',
      'Synthèse hebdomadaire IA',
      'Support prioritaire',
    ],
  },
]

const FAQ = [
  {
    q: "Qu'est-ce qu'un sous-traitant (ST) dans TraceChantier ?",
    a: "Un ST est un travailleur sur le terrain — électricien, plombier, charpentier. Il n'a pas besoin de créer un compte : il tape son code de chantier dans l'app et soumet ses photos et journaux en 10 secondes. Vous recevez automatiquement un résumé IA.",
  },
  {
    q: "Est-ce que l'app fonctionne sans connexion internet ?",
    a: "Oui. La prise de photos et la soumission de journaux fonctionnent hors-ligne. Les données se synchronisent automatiquement dès que la connexion revient — utile sur les chantiers en zone rurale.",
  },
  {
    q: "Puis-je exporter mes données ?",
    a: "Oui. Depuis le dashboard web, vous pouvez exporter les journaux en PDF ou CSV, et télécharger toutes les photos d'un chantier en ZIP. Les plans PME et Entreprise incluent l'export CSV complet.",
  },
  {
    q: "Y a-t-il un engagement ?",
    a: "Aucun engagement. L'abonnement est mensuel et vous pouvez annuler à tout moment depuis votre dashboard. L'essai de 14 jours est gratuit, sans carte de crédit requise.",
  },
  {
    q: "Mes données sont-elles sécurisées ?",
    a: "Toutes vos données sont hébergées au Canada sur des serveurs certifiés SOC 2. Vos photos sont stockées dans un bucket privé — seuls vous et vos admins y avez accès. Aucune donnée n'est partagée avec des tiers.",
  },
]

const APP_STORE_URL = 'https://apps.apple.com/app/tracechantier/id6745164842'

// ── Palette centralisée ──────────────────────────────────────────────────────
const C = {
  heroFrom:    '#0F172A',
  heroTo:      '#1a2b45',
  ink:         '#111827',
  inkMid:      '#374151',
  inkLight:    '#6B7280',
  inkXlight:   '#9CA3AF',
  border:      '#E5E7EB',
  borderLight: '#F3F4F6',
  bgLight:     '#F9FAFB',
  bgWhite:     '#ffffff',
  accent:      '#F59E0B',  // ambre — utilisé avec parcimonie
  accentBg:    'rgba(245,158,11,0.08)',
  accentBorder:'rgba(245,158,11,0.25)',
  checkGreen:  '#059669',
}

export default function Home() {
  return (
    <main style={{ fontFamily: "'DM Sans', 'Segoe UI', system-ui, sans-serif", overflowX: 'hidden', background: C.bgWhite }}>

      {/* ══════════════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════════════ */}
      <section style={{
        width: '100%', minHeight: '100vh',
        background: `linear-gradient(165deg, ${C.heroFrom} 0%, ${C.heroTo} 100%)`,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '40px 24px 80px', position: 'relative', overflow: 'hidden',
      }}>
        <style>{`
          * { box-sizing: border-box; margin: 0; padding: 0; }

          .anim-wrap { position: relative; width: 100%; height: 300px; flex-shrink: 0; }
          .crane { position: absolute; top: 0; left: calc(50% - 140px); }
          .cable {
            position: absolute; top: 82px; left: calc(50% - 1px);
            width: 2px; height: 178px;
            background: linear-gradient(to bottom, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.1) 100%);
            transform-origin: top center; transform: scaleY(0);
            animation: cableDraw 0.5s ease-out 0.3s forwards;
          }
          .tc-box-wrap {
            position: absolute; bottom: 0; left: 50%;
            transform: translateX(-50%) translateY(400px);
            animation: boxRise 1.5s cubic-bezier(0.22, 0.88, 0.36, 1) 0.45s forwards;
          }
          .tc-box {
            background: rgba(255,255,255,0.07); border: 1.5px solid rgba(255,255,255,0.15);
            border-radius: 20px; padding: 18px 44px; backdrop-filter: blur(16px);
            white-space: nowrap; display: flex; align-items: center; gap: 14px;
          }
          .tc-dot { width: 10px; height: 10px; border-radius: 50%; background: #F59E0B; box-shadow: 0 0 10px rgba(245,158,11,0.7); }
          .tc-name { font-size: 26px; font-weight: 800; color: #fff; letter-spacing: -0.3px; }
          .tc-name em { font-style: normal; color: #F59E0B; }

          .hero-tagline { text-align: center; margin-top: 4px; opacity: 0; animation: fadeUp 0.7s ease 2.1s forwards; }
          .hero-tagline h1 { font-size: clamp(32px, 5vw, 52px); font-weight: 800; color: #fff; margin: 0 0 16px; letter-spacing: -0.8px; line-height: 1.12; }
          .hero-tagline p { font-size: clamp(15px, 2vw, 18px); color: rgba(255,255,255,0.55); line-height: 1.65; max-width: 440px; margin: 0 auto; }
          .hero-tagline p strong { color: rgba(255,255,255,0.85); font-weight: 600; }

          .hero-actions { margin-top: 36px; display: flex; flex-direction: column; align-items: center; gap: 12px; opacity: 0; animation: fadeUp 0.7s ease 2.4s forwards; }
          .btn-row { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; justify-content: center; }

          .btn-appstore {
            display: inline-flex; align-items: center; gap: 10px;
            background: #fff; color: #0F172A;
            border-radius: 12px; padding: 13px 24px;
            font-size: 15px; font-weight: 700; text-decoration: none;
            letter-spacing: -0.2px; transition: opacity 0.15s, transform 0.15s;
            white-space: nowrap; box-shadow: 0 2px 12px rgba(0,0,0,0.2);
          }
          .btn-appstore:hover { opacity: 0.92; transform: translateY(-1px); }

          .btn-login {
            display: inline-flex; align-items: center; gap: 8px;
            background: rgba(255,255,255,0.07); border: 1.5px solid rgba(255,255,255,0.18);
            color: rgba(255,255,255,0.8); border-radius: 12px; padding: 13px 24px;
            font-size: 15px; font-weight: 500; text-decoration: none;
            letter-spacing: -0.1px; transition: background 0.15s, transform 0.15s;
            white-space: nowrap; backdrop-filter: blur(8px);
          }
          .btn-login:hover { background: rgba(255,255,255,0.12); transform: translateY(-1px); }

          .trial-note { font-size: 12px; color: rgba(255,255,255,0.28); }

          .hero-stats { margin-top: 56px; display: flex; gap: 0; opacity: 0; animation: fadeUp 0.7s ease 2.7s forwards; }
          .hero-stat { display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 0 36px; border-right: 1px solid rgba(255,255,255,0.08); }
          .hero-stat:last-child { border-right: none; }
          .hero-stat-val { font-size: 28px; font-weight: 800; color: #fff; letter-spacing: -0.5px; line-height: 1; }
          .hero-stat-val span { color: #F59E0B; }
          .hero-stat-lbl { font-size: 12px; color: rgba(255,255,255,0.35); text-align: center; line-height: 1.5; max-width: 100px; }

          .scroll-hint { margin-top: 52px; opacity: 0; animation: fadeUp 0.7s ease 3.0s forwards; display: flex; flex-direction: column; align-items: center; }
          .scroll-arrow { width: 18px; height: 18px; border-right: 2px solid rgba(255,255,255,0.18); border-bottom: 2px solid rgba(255,255,255,0.18); transform: rotate(45deg); animation: bounce 1.8s ease-in-out 3.5s infinite; }
          @keyframes bounce { 0%, 100% { transform: rotate(45deg) translateY(0); } 50% { transform: rotate(45deg) translateY(5px); } }
          @keyframes cableDraw { from { transform: scaleY(0); } to { transform: scaleY(1); } }
          @keyframes boxRise { from { transform: translateX(-50%) translateY(400px); opacity: 0; } to { transform: translateX(-50%) translateY(0); opacity: 1; } }
          @keyframes fadeUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }

          @media (max-width: 480px) {
            .hero-stat { padding: 0 16px; }
            .hero-stat-val { font-size: 20px; }
            .anim-wrap { height: 260px; }
          }
        `}</style>

        <div className="anim-wrap">
          <div className="crane"><GrueSVG width={CRANE_W} /></div>
          <div className="cable" />
          <div className="tc-box-wrap">
            <div className="tc-box">
              <div className="tc-dot" />
              <span className="tc-name">Trace<em>Chantier</em></span>
            </div>
          </div>
        </div>

        <div className="hero-tagline">
          <h1>Votre chantier virtuel</h1>
          <p>Fini les textos de suivi.<br /><strong>Tout est tracé, horodaté, classé — automatiquement.</strong></p>
        </div>

        <div className="hero-actions">
          <div className="btn-row">
            <a href={APP_STORE_URL} target="_blank" rel="noopener noreferrer" className="btn-appstore">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
              </svg>
              Télécharger sur l'App Store
            </a>
            <Link href="/login" className="btn-login">
              Se connecter
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          <span className="trial-note">14 jours d'essai gratuit · Aucune carte requise</span>
        </div>

        <div className="hero-stats">
          {[
            { val: '10', unit: 's', lbl: 'par sous-traitant pour soumettre' },
            { val: '1', unit: ' tap', lbl: 'pour générer un rapport PDF' },
            { val: '14', unit: 'j', lbl: 'd\'essai gratuit, sans engagement' },
          ].map((s, i) => (
            <div key={i} className="hero-stat">
              <span className="hero-stat-val">{s.val}<span>{s.unit}</span></span>
              <span className="hero-stat-lbl">{s.lbl}</span>
            </div>
          ))}
        </div>

        <div className="scroll-hint">
          <div className="scroll-arrow" />
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          VIDÉO
      ══════════════════════════════════════════════════════ */}
      <section style={{ background: C.ink, padding: '96px 24px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% -10%, rgba(245,158,11,0.05) 0%, transparent 55%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 900, margin: '0 auto', position: 'relative' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', display: 'block', marginBottom: 12 }}>
              L'app en action
            </span>
            <h2 style={{ fontSize: 'clamp(26px, 4vw, 40px)', fontWeight: 800, color: '#fff', letterSpacing: '-0.5px', lineHeight: 1.15, margin: '0 auto 14px', maxWidth: 500 }}>
              De la photo terrain au rapport en 30 secondes
            </h2>
            <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.4)', maxWidth: 420, margin: '0 auto', lineHeight: 1.7 }}>
              Pas de formation requise. Vos sous-traitants maîtrisent l'app en 2 minutes.
            </p>
          </div>

          {/* Lecteur vidéo */}
          <div style={{
            borderRadius: 16, overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
            background: '#000',
            aspectRatio: '16/9',
          }}>
            <video
              controls
              playsInline
              preload="metadata"
              style={{ width: '100%', height: '100%', display: 'block', objectFit: 'contain', background: '#000' }}
            >
              <source src="/demo.mp4" type="video/mp4" />
            </video>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          PRIX — affichage seulement
      ══════════════════════════════════════════════════════ */}
      <section id="prix" style={{ background: C.bgLight, padding: '96px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.inkXlight, display: 'block', marginBottom: 12 }}>
              Tarifs
            </span>
            <h2 style={{ fontSize: 'clamp(26px, 4vw, 40px)', fontWeight: 800, color: C.ink, letterSpacing: '-0.5px', margin: '0 0 14px' }}>
              Simple et transparent
            </h2>
            <p style={{ fontSize: 16, color: C.inkLight, margin: '0 auto', maxWidth: 380, lineHeight: 1.7 }}>
              14 jours d'essai gratuit sur tous les plans. Aucune carte requise.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18, alignItems: 'start' }}>
            {PLANS.map((plan) => (
              <div key={plan.id} style={{
                borderRadius: 16, overflow: 'hidden',
                border: plan.highlight ? `2px solid ${C.ink}` : `1px solid ${C.border}`,
                background: C.bgWhite,
                boxShadow: plan.highlight ? '0 8px 28px rgba(0,0,0,0.1)' : '0 1px 4px rgba(0,0,0,0.04)',
                transform: plan.highlight ? 'translateY(-6px)' : 'none',
                position: 'relative',
                userSelect: 'none',
              }}>
                {plan.badge && (
                  <div style={{
                    position: 'absolute', top: 14, right: 14,
                    background: C.accent, color: '#fff',
                    fontSize: 10, fontWeight: 800, borderRadius: 6,
                    padding: '3px 8px', letterSpacing: '0.06em', textTransform: 'uppercase',
                  }}>
                    {plan.badge}
                  </div>
                )}
                <div style={{ padding: '24px 24px 18px', borderBottom: `1px solid ${C.borderLight}`, background: plan.highlight ? '#F9FAFB' : C.bgWhite }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: C.inkLight, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 8px' }}>
                    {plan.label}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 4 }}>
                    <span style={{ fontSize: 42, fontWeight: 800, color: C.ink, letterSpacing: '-1px', lineHeight: 1 }}>{plan.prix}$</span>
                    <span style={{ fontSize: 13, color: C.inkXlight, fontWeight: 400 }}>/mois</span>
                  </div>
                  <p style={{ fontSize: 12, color: C.inkXlight, margin: '4px 0 0' }}>
                    ou {plan.prixAnnuel}$/mois · facturé annuellement
                  </p>
                </div>
                <div style={{ padding: '18px 24px 24px' }}>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {plan.features.map((f, j) => (
                      <li key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: C.inkMid }}>
                        <span style={{ color: C.checkGreen, fontWeight: 700, marginTop: 1, flexShrink: 0 }}>✓</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          {/* CTA App Store sous les plans */}
          <div style={{
            marginTop: 40, padding: '24px 28px',
            background: C.bgWhite, border: `1px solid ${C.border}`,
            borderRadius: 14, maxWidth: 600, margin: '40px auto 0',
            display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap',
          }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <p style={{ fontSize: 15, fontWeight: 600, color: C.ink, margin: '0 0 4px' }}>
                Prêt à commencer votre essai gratuit ?
              </p>
              <p style={{ fontSize: 13, color: C.inkLight, margin: 0, lineHeight: 1.5 }}>
                La création de compte se fait depuis l'application iOS. Téléchargez-la, créez votre entreprise et revenez vous connecter ici.
              </p>
            </div>
            <a
              href={APP_STORE_URL}
              target="_blank" rel="noopener noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 9,
                background: C.ink, color: '#fff', flexShrink: 0,
                padding: '11px 20px', borderRadius: 10,
                fontSize: 14, fontWeight: 600, textDecoration: 'none',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = C.inkMid)}
              onMouseLeave={e => (e.currentTarget.style.background = C.ink)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
              Télécharger sur l'App Store
            </a>
          </div>

          <p style={{ textAlign: 'center', fontSize: 12, color: C.inkXlight, marginTop: 20 }}>
            Besoin de plus d'admins ? Ajoutez-en à 15$/mois chacun.
          </p>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          FAQ
      ══════════════════════════════════════════════════════ */}
      <section style={{ background: C.bgWhite, padding: '96px 24px' }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.inkXlight, display: 'block', marginBottom: 12 }}>
              Questions fréquentes
            </span>
            <h2 style={{ fontSize: 'clamp(24px, 3.5vw, 36px)', fontWeight: 800, color: C.ink, letterSpacing: '-0.5px', margin: 0 }}>
              Tout ce que vous voulez savoir
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {FAQ.map((item, i) => (
              <details key={i} style={{ borderRadius: 12, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
                <summary style={{
                  padding: '16px 18px', fontSize: 14, fontWeight: 600, color: C.ink,
                  cursor: 'pointer', listStyle: 'none',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  userSelect: 'none', background: C.bgWhite,
                }}>
                  {item.q}
                  <span style={{ fontSize: 18, color: C.inkXlight, flexShrink: 0, marginLeft: 12, fontWeight: 300 }}>+</span>
                </summary>
                <div style={{ padding: '0 18px 16px', background: C.bgLight, borderTop: `1px solid ${C.border}` }}>
                  <p style={{ fontSize: 14, color: C.inkLight, lineHeight: 1.75, margin: '14px 0 0' }}>{item.a}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          CTA FINAL
      ══════════════════════════════════════════════════════ */}
      <section style={{ background: C.ink, padding: '80px 24px' }}>
        <div style={{ maxWidth: 580, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 800, color: '#fff', letterSpacing: '-0.5px', margin: '0 0 14px', lineHeight: 1.2 }}>
            Commencez votre essai gratuit aujourd'hui
          </h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.45)', margin: '0 0 32px', lineHeight: 1.7 }}>
            14 jours sans engagement. Votre premier chantier configuré en moins de 5 minutes.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center', alignItems: 'center' }}>
            <a
              href={APP_STORE_URL}
              target="_blank" rel="noopener noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 9,
                background: '#fff', color: C.ink,
                borderRadius: 12, padding: '13px 24px',
                fontSize: 15, fontWeight: 700,
                textDecoration: 'none',
                boxShadow: '0 2px 16px rgba(0,0,0,0.25)',
                transition: 'opacity 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.9')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
              Télécharger sur l'App Store
            </a>
            <Link href="/login" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'rgba(255,255,255,0.07)', border: '1.5px solid rgba(255,255,255,0.15)',
              color: 'rgba(255,255,255,0.7)', borderRadius: 12, padding: '13px 22px',
              fontSize: 14, fontWeight: 500, textDecoration: 'none',
              transition: 'background 0.15s',
            }}>
              Se connecter
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════════════════ */}
      <footer style={{ background: '#0A0F1A', padding: '36px 24px 28px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="13" height="13" viewBox="0 0 108 160" fill="none">
                <rect x="51" y="44" width="12" height="80" rx="2" fill="white" opacity="0.7" />
                <rect x="10" y="44" width="92" height="8" rx="2" fill="white" opacity="0.4" />
                <line x1="57" y1="16" x2="95" y2="44" stroke="white" strokeWidth="2" opacity="0.35" />
                <line x1="57" y1="16" x2="20" y2="44" stroke="white" strokeWidth="2" opacity="0.3" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>TraceChantier</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>© {new Date().getFullYear()} · Montréal, QC</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            {[
              { href: '/cgu', label: 'Conditions d\'utilisation' },
              { href: '/confidentialite', label: 'Confidentialité' },
              { href: '/support', label: 'Support' },
              { href: '/login', label: 'Se connecter' },
            ].map(link => (
              <a key={link.href} href={link.href}
                style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', textDecoration: 'none', transition: 'color 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.3)')}>
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </footer>

    </main>
  )
}
