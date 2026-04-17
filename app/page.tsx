import GrueSVG from '../components/GrueSVG'
import Link from 'next/link'

const CRANE_W = 180

// ── Données plans (sync avec lib/plans.ts de l'app mobile) ───────────────────
const PLANS = [
  {
    id: 'demarrage',
    label: 'Entrepreneur solo',
    prix: 59,
    prixAnnuel: 49,  // 590$/an = ~49$/mois
    couleur: '#5B87B5',
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
    cta: 'Commencer l\'essai',
  },
  {
    id: 'maitre',
    label: 'PME',
    prix: 149,
    prixAnnuel: 124,  // 1490$/an
    couleur: '#1B5FA8',
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
    cta: 'Commencer l\'essai',
  },
  {
    id: 'entreprise',
    label: 'Entreprise',
    prix: 249,
    prixAnnuel: 207,  // 2490$/an
    couleur: '#0D3A6E',
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
    cta: 'Commencer l\'essai',
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

export default function Home() {
  return (
    <main style={{ fontFamily: "'DM Sans', 'Segoe UI', system-ui, sans-serif", overflowX: 'hidden', background: '#fff' }}>

      {/* ═══════════════════════════════════════════════════════
          HERO
      ═══════════════════════════════════════════════════════ */}
      <section style={{
        width: '100%',
        minHeight: '100vh',
        background: 'linear-gradient(170deg, #071c36 0%, #0D3A6E 55%, #092d5a 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px 80px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <style>{`
          * { box-sizing: border-box; margin: 0; padding: 0; }

          .anim-wrap { position: relative; width: 100%; height: 300px; flex-shrink: 0; }
          .crane { position: absolute; top: 0; left: calc(50% - 140px); }
          .cable {
            position: absolute; top: 82px; left: calc(50% - 1px);
            width: 2px; height: 178px;
            background: linear-gradient(to bottom, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.15) 100%);
            transform-origin: top center; transform: scaleY(0);
            animation: cableDraw 0.5s ease-out 0.3s forwards;
          }
          .tc-box-wrap {
            position: absolute; bottom: 0; left: 50%;
            transform: translateX(-50%) translateY(400px);
            animation: boxRise 1.5s cubic-bezier(0.22, 0.88, 0.36, 1) 0.45s forwards;
          }
          .tc-box {
            background: rgba(255,255,255,0.07); border: 1.5px solid rgba(255,255,255,0.2);
            border-radius: 20px; padding: 18px 44px; backdrop-filter: blur(16px);
            white-space: nowrap; display: flex; align-items: center; gap: 14px;
          }
          .tc-dot { width: 10px; height: 10px; border-radius: 50%; background: #2E8FD4; box-shadow: 0 0 10px rgba(46,143,212,0.9); }
          .tc-name { font-size: 26px; font-weight: 800; color: #fff; letter-spacing: -0.3px; }
          .tc-name em { font-style: normal; color: #2E8FD4; }

          .hero-tagline { text-align: center; margin-top: 4px; opacity: 0; animation: fadeUp 0.7s ease 2.1s forwards; }
          .hero-tagline h1 { font-size: clamp(34px, 5vw, 56px); font-weight: 800; color: #fff; margin: 0 0 16px; letter-spacing: -0.8px; line-height: 1.12; }
          .hero-tagline p { font-size: clamp(16px, 2vw, 20px); color: rgba(255,255,255,0.6); line-height: 1.6; max-width: 460px; margin: 0 auto; }
          .hero-tagline p strong { color: rgba(255,255,255,0.9); font-weight: 600; }

          .hero-actions { margin-top: 36px; display: flex; flex-direction: column; align-items: center; gap: 12px; opacity: 0; animation: fadeUp 0.7s ease 2.4s forwards; }
          .btn-row { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; justify-content: center; }
          .btn-appstore { display: inline-flex; align-items: center; gap: 10px; background: #fff; color: #071c36; border-radius: 14px; padding: 15px 28px; font-size: 16px; font-weight: 700; text-decoration: none; letter-spacing: -0.2px; transition: opacity 0.15s, transform 0.15s; white-space: nowrap; }
          .btn-appstore:hover { opacity: 0.9; transform: translateY(-1px); }
          .btn-login { display: inline-flex; align-items: center; gap: 8px; background: rgba(255,255,255,0.08); border: 1.5px solid rgba(255,255,255,0.22); color: #fff; border-radius: 14px; padding: 15px 28px; font-size: 16px; font-weight: 600; text-decoration: none; letter-spacing: -0.1px; transition: background 0.15s, transform 0.15s; white-space: nowrap; backdrop-filter: blur(8px); }
          .btn-login:hover { background: rgba(255,255,255,0.14); transform: translateY(-1px); }
          .trial-note { font-size: 13px; color: rgba(255,255,255,0.3); }

          .hero-stats { margin-top: 52px; display: flex; gap: 0; opacity: 0; animation: fadeUp 0.7s ease 2.7s forwards; }
          .hero-stat { display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 0 36px; border-right: 1px solid rgba(255,255,255,0.1); }
          .hero-stat:last-child { border-right: none; }
          .hero-stat-val { font-size: 28px; font-weight: 800; color: #fff; letter-spacing: -0.5px; line-height: 1; }
          .hero-stat-val span { color: #2E8FD4; }
          .hero-stat-lbl { font-size: 13px; color: rgba(255,255,255,0.4); text-align: center; line-height: 1.4; max-width: 110px; }

          /* Scroll hint */
          .scroll-hint { margin-top: 48px; opacity: 0; animation: fadeUp 0.7s ease 3.0s forwards; display: flex; flex-direction: column; align-items: center; gap: 6px; }
          .scroll-arrow { width: 20px; height: 20px; border-right: 2px solid rgba(255,255,255,0.2); border-bottom: 2px solid rgba(255,255,255,0.2); transform: rotate(45deg); animation: bounce 1.8s ease-in-out 3.5s infinite; }
          @keyframes bounce { 0%, 100% { transform: rotate(45deg) translateY(0); } 50% { transform: rotate(45deg) translateY(5px); } }

          @keyframes cableDraw { from { transform: scaleY(0); } to { transform: scaleY(1); } }
          @keyframes boxRise { from { transform: translateX(-50%) translateY(400px); opacity: 0; } to { transform: translateX(-50%) translateY(0); opacity: 1; } }
          @keyframes fadeUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }

          @media (max-width: 480px) {
            .hero-stat { padding: 0 18px; }
            .hero-stat-val { font-size: 20px; }
            .anim-wrap { height: 260px; }
          }
        `}</style>

        {/* Ambient glow */}
        <div style={{ position: 'absolute', top: -200, left: '50%', transform: 'translateX(-50%)', width: 800, height: 600, background: 'radial-gradient(ellipse, rgba(46,143,212,0.12) 0%, transparent 65%)', pointerEvents: 'none' }} />

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
            <a href="#prix" className="btn-appstore">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
              </svg>
              Voir les plans
            </a>
            <Link href="/login" className="btn-login">
              Se connecter
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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

      {/* ═══════════════════════════════════════════════════════
          COMMENT ÇA MARCHE
      ═══════════════════════════════════════════════════════ */}
      <section style={{ background: '#F8FBFF', padding: '96px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#1B5FA8', display: 'block', marginBottom: 12 }}>
              Comment ça marche
            </span>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 800, color: '#0D3A6E', letterSpacing: '-0.5px', lineHeight: 1.15, margin: '0 auto 16px', maxWidth: 560 }}>
              De la photo terrain au rapport en 30 secondes
            </h2>
            <p style={{ fontSize: 17, color: '#5B87B5', maxWidth: 500, margin: '0 auto', lineHeight: 1.7 }}>
              Pas de formation requise. Vos sous-traitants maîtrisent l'app en 2 minutes.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
            {[
              {
                num: '01',
                couleur: '#1B5FA8',
                icon: '📲',
                titre: 'Le ST tape son code',
                desc: 'Votre sous-traitant arrive sur le chantier, ouvre l\'app et tape son code à 6 chiffres. En 5 secondes, il est connecté — sans compte, sans mot de passe.',
                screen: '/screen-st-code.png',
              },
              {
                num: '02',
                couleur: '#2A9D5C',
                icon: '📸',
                titre: 'Photo + note vocale',
                desc: 'Il sélectionne sa zone sur le plan, prend une photo et enregistre une courte note vocale. Même sans internet — tout se synchronise automatiquement.',
                screen: '/screen-st-zone.png',
              },
              {
                num: '03',
                couleur: '#D4820A',
                icon: '✨',
                titre: 'Résumé IA instantané',
                desc: 'Vous recevez un résumé structuré : travaux effectués, matériaux utilisés, incidents, prochaines étapes. L\'IA transforme la note vocale en rapport professionnel.',
                screen: '/screen-journal.png',
              },
            ].map((step, i) => (
              <div key={i} style={{
                background: '#fff', borderRadius: 20, overflow: 'hidden',
                border: '1px solid #E8F0F8', boxShadow: '0 2px 12px rgba(13,58,110,0.06)',
                display: 'flex', flexDirection: 'column',
              }}>
                {/* Screenshot */}
                <div style={{ background: '#EAF0F8', height: 200, overflow: 'hidden', position: 'relative' }}>
                  <img
                    src={step.screen}
                    alt={step.titre}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }}
                  />
                  <div style={{ position: 'absolute', top: 12, left: 12, background: step.couleur, borderRadius: 10, padding: '4px 10px' }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: '#fff', letterSpacing: '0.1em' }}>{step.num}</span>
                  </div>
                </div>
                <div style={{ padding: '24px 24px 28px' }}>
                  <div style={{ fontSize: 24, marginBottom: 10 }}>{step.icon}</div>
                  <h3 style={{ fontSize: 17, fontWeight: 700, color: '#0D3A6E', margin: '0 0 10px', letterSpacing: '-0.2px' }}>{step.titre}</h3>
                  <p style={{ fontSize: 14, color: '#5B87B5', lineHeight: 1.7, margin: 0 }}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          DÉMO VIDÉO / SCREENSHOTS
          TODO: Remplacer cette section par un <video> ou <iframe YouTube>
          une fois la vidéo Remotion rendue en MP4.
          Commande: cd demo-video && npx remotion render TraceChantierDemo
      ═══════════════════════════════════════════════════════ */}
      <section style={{ background: '#0D3A6E', padding: '96px 24px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% -20%, rgba(46,143,212,0.18) 0%, transparent 60%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#4A9FD4', display: 'block', marginBottom: 12 }}>
              L'app en action
            </span>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 800, color: '#fff', letterSpacing: '-0.5px', lineHeight: 1.15, margin: '0 auto 16px', maxWidth: 560 }}>
              Dashboard entrepreneur + flow ST
            </h2>
            <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.55)', maxWidth: 500, margin: '0 auto', lineHeight: 1.7 }}>
              Tout ce dont votre équipe a besoin, dans une seule app.
            </p>
          </div>

          {/* Grille screenshots */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr 1fr', gap: 16, alignItems: 'start' }}>
            {/* Dashboard — grande */}
            <div style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.12)', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
              <img src="/screen-dashboard.png" alt="Dashboard entrepreneur" style={{ width: '100%', display: 'block' }} />
              <div style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.06)', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: '#7DB8EC', margin: 0 }}>Dashboard entrepreneur</p>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', margin: '3px 0 0' }}>Vue d'ensemble · Photos · Journaux · Équipe</p>
              </div>
            </div>
            {/* ST code */}
            <div style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.12)', boxShadow: '0 8px 32px rgba(0,0,0,0.3)', marginTop: 24 }}>
              <img src="/screen-st-code.png" alt="Connexion ST" style={{ width: '100%', display: 'block' }} />
              <div style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.06)', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: '#7DB8EC', margin: 0 }}>Connexion ST</p>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', margin: '3px 0 0' }}>Code 6 chiffres · 5 secondes</p>
              </div>
            </div>
            {/* Journal */}
            <div style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.12)', boxShadow: '0 8px 32px rgba(0,0,0,0.3)', marginTop: 48 }}>
              <img src="/screen-journal.png" alt="Journal IA" style={{ width: '100%', display: 'block' }} />
              <div style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.06)', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: '#7DB8EC', margin: 0 }}>Journal IA</p>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', margin: '3px 0 0' }}>Résumé structuré · Incidents · Avancement</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          FEATURES
      ═══════════════════════════════════════════════════════ */}
      <section style={{ background: '#fff', padding: '96px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#1B5FA8', display: 'block', marginBottom: 12 }}>
              Fonctionnalités
            </span>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 800, color: '#0D3A6E', letterSpacing: '-0.5px', lineHeight: 1.15, margin: '0 auto', maxWidth: 520 }}>
              Tout ce qu'il faut pour documenter sans effort
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 }}>
            {[
              {
                icon: '🎙️',
                couleur: '#1B5FA8',
                titre: 'Journal vocal IA',
                desc: 'Le ST enregistre une note vocale de 30 secondes. L\'IA la transcrit et génère un résumé professionnel structuré : travaux, matériaux, incidents, avancement.',
              },
              {
                icon: '📸',
                couleur: '#2A9D5C',
                titre: 'Photos par zone',
                desc: 'Chaque photo est associée à une zone du plan (fondations, charpente, finition). Filtrez par zone, date, ou type. Téléchargez tout en ZIP en un clic.',
              },
              {
                icon: '🗓️',
                couleur: '#D4820A',
                titre: 'Synthèse hebdomadaire',
                desc: 'Chaque lundi, un rapport IA consolide tous les journaux de la semaine — travaux effectués, incidents, retards, et priorités pour la semaine à venir.',
              },
              {
                icon: '⏱️',
                couleur: '#6B3FA0',
                titre: 'Timeline avant/après',
                desc: 'Glissez le curseur pour comparer l\'état du chantier à n\'importe quelle date. Idéal pour les présentations clients et les réunions de chantier.',
              },
            ].map((f, i) => (
              <div key={i} style={{
                borderRadius: 16, padding: '28px 24px',
                border: '1px solid #E8F0F8',
                background: '#fff',
                boxShadow: '0 1px 4px rgba(13,58,110,0.05)',
                transition: 'box-shadow 0.2s, transform 0.2s',
              }}>
                <div style={{ fontSize: 32, marginBottom: 16 }}>{f.icon}</div>
                <div style={{ width: 32, height: 3, borderRadius: 2, background: f.couleur, marginBottom: 14 }} />
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0D3A6E', margin: '0 0 10px', letterSpacing: '-0.2px' }}>{f.titre}</h3>
                <p style={{ fontSize: 14, color: '#5B87B5', lineHeight: 1.7, margin: 0 }}>{f.desc}</p>
              </div>
            ))}
          </div>

          {/* Feature extras */}
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 12, marginTop: 48 }}>
            {['Mode hors-ligne', 'Export PDF & CSV', 'Portail client', 'Dashboard web', 'Codes QR partagés', 'Support Canada'].map(tag => (
              <span key={tag} style={{ fontSize: 13, fontWeight: 600, color: '#1B5FA8', background: '#EFF6FF', borderRadius: 20, padding: '6px 14px', border: '1px solid #DBEAFE' }}>
                ✓ {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          PRIX
      ═══════════════════════════════════════════════════════ */}
      <section id="prix" style={{ background: 'linear-gradient(180deg, #F8FBFF 0%, #EEF5FC 100%)', padding: '96px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#1B5FA8', display: 'block', marginBottom: 12 }}>
              Tarifs
            </span>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 800, color: '#0D3A6E', letterSpacing: '-0.5px', margin: '0 0 16px' }}>
              Simple et transparent
            </h2>
            <p style={{ fontSize: 17, color: '#5B87B5', margin: '0 auto', maxWidth: 420, lineHeight: 1.7 }}>
              14 jours d'essai gratuit sur tous les plans. Aucune carte requise.
            </p>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#E8F2FC', borderRadius: 20, padding: '7px 16px', marginTop: 20, border: '1px solid rgba(27,95,168,0.2)' }}>
              <span style={{ fontSize: 13, color: '#1B5FA8', fontWeight: 600 }}>💰 Annuel — économisez 2 mois</span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, alignItems: 'start' }}>
            {PLANS.map((plan, i) => (
              <div key={plan.id} style={{
                borderRadius: 20, overflow: 'hidden',
                border: plan.highlight ? `2px solid ${plan.couleur}` : '1px solid #D0E4F4',
                background: '#fff',
                boxShadow: plan.highlight ? `0 8px 32px rgba(27,95,168,0.18)` : '0 2px 8px rgba(13,58,110,0.06)',
                transform: plan.highlight ? 'translateY(-8px)' : 'none',
                position: 'relative',
              }}>
                {plan.badge && (
                  <div style={{ position: 'absolute', top: 16, right: 16, background: plan.couleur, color: '#fff', fontSize: 11, fontWeight: 800, borderRadius: 8, padding: '3px 10px', letterSpacing: '0.05em' }}>
                    {plan.badge}
                  </div>
                )}
                {/* Header */}
                <div style={{ padding: '28px 28px 20px', borderBottom: '1px solid #F3F4F6', background: plan.highlight ? '#EFF6FF' : '#fff' }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: plan.couleur, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 6px' }}>
                    {plan.label}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 4 }}>
                    <span style={{ fontSize: 44, fontWeight: 800, color: '#0D3A6E', letterSpacing: '-1px', lineHeight: 1 }}>{plan.prix}$</span>
                    <span style={{ fontSize: 14, color: '#9BBAD6', fontWeight: 500 }}>/mois</span>
                  </div>
                  <p style={{ fontSize: 12, color: '#9BBAD6', margin: '4px 0 0' }}>
                    ou {plan.prixAnnuel}$/mois · facturé annuellement
                  </p>
                </div>
                {/* Features */}
                <div style={{ padding: '20px 28px 28px' }}>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 9 }}>
                    {plan.features.map((f, j) => (
                      <li key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: 9, fontSize: 13, color: '#374151' }}>
                        <span style={{ color: '#059669', fontWeight: 700, marginTop: 1, flexShrink: 0 }}>✓</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link href="/login" style={{
                    display: 'block', textAlign: 'center', marginTop: 24,
                    padding: '13px', borderRadius: 12, fontSize: 14, fontWeight: 700,
                    background: plan.highlight ? plan.couleur : '#fff',
                    color: plan.highlight ? '#fff' : plan.couleur,
                    border: `2px solid ${plan.couleur}`,
                    textDecoration: 'none',
                    transition: 'opacity 0.15s',
                  }}>
                    {plan.cta}
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Add-on note */}
          <p style={{ textAlign: 'center', fontSize: 13, color: '#9BBAD6', marginTop: 32 }}>
            Besoin de plus d'admins ? Ajoutez-en à 15$/mois chacun.
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          FAQ
      ═══════════════════════════════════════════════════════ */}
      <section style={{ background: '#fff', padding: '96px 24px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#1B5FA8', display: 'block', marginBottom: 12 }}>
              Questions fréquentes
            </span>
            <h2 style={{ fontSize: 'clamp(26px, 3.5vw, 38px)', fontWeight: 800, color: '#0D3A6E', letterSpacing: '-0.5px', margin: 0 }}>
              Tout ce que vous voulez savoir
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {FAQ.map((item, i) => (
              <details key={i} style={{ borderRadius: 14, border: '1px solid #E8F0F8', overflow: 'hidden' }}>
                <summary style={{
                  padding: '18px 20px', fontSize: 15, fontWeight: 600, color: '#0D3A6E', cursor: 'pointer',
                  listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  userSelect: 'none', background: '#fff',
                }}>
                  {item.q}
                  <span style={{ fontSize: 20, color: '#9BBAD6', flexShrink: 0, marginLeft: 12, fontWeight: 400 }}>+</span>
                </summary>
                <div style={{ padding: '0 20px 18px', background: '#F8FBFF', borderTop: '1px solid #E8F0F8' }}>
                  <p style={{ fontSize: 14, color: '#5B87B5', lineHeight: 1.75, margin: '16px 0 0' }}>{item.a}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          CTA FINAL
      ═══════════════════════════════════════════════════════ */}
      <section style={{ background: 'linear-gradient(135deg, #0D3A6E 0%, #1B5FA8 100%)', padding: '80px 24px' }}>
        <div style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(26px, 4vw, 38px)', fontWeight: 800, color: '#fff', letterSpacing: '-0.5px', margin: '0 0 16px', lineHeight: 1.2 }}>
            Commencez votre essai gratuit aujourd'hui
          </h2>
          <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.65)', margin: '0 0 36px', lineHeight: 1.7 }}>
            14 jours sans engagement, sans carte de crédit. Votre premier chantier configuré en moins de 5 minutes.
          </p>
          <Link href="/login" style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            background: '#fff', color: '#0D3A6E',
            borderRadius: 14, padding: '16px 36px',
            fontSize: 16, fontWeight: 700,
            textDecoration: 'none',
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
            transition: 'opacity 0.15s',
          }}>
            Créer mon compte gratuit
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          FOOTER
      ═══════════════════════════════════════════════════════ */}
      <footer style={{ background: '#071c36', padding: '40px 24px 32px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(27,95,168,0.3)', border: '1px solid rgba(27,95,168,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="14" height="14" viewBox="0 0 108 160" fill="none">
                <rect x="51" y="44" width="12" height="80" rx="2" fill="#4A9FD4" />
                <rect x="10" y="44" width="92" height="8" rx="2" fill="#4A9FD4" opacity="0.7" />
                <line x1="57" y1="16" x2="95" y2="44" stroke="#4A9FD4" strokeWidth="2" opacity="0.6" />
                <line x1="57" y1="16" x2="20" y2="44" stroke="#4A9FD4" strokeWidth="2" opacity="0.5" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>TraceChantier</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>© {new Date().getFullYear()} Tous droits réservés</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            {[
              { href: '/cgu', label: 'Conditions d\'utilisation' },
              { href: '/confidentialite', label: 'Confidentialité' },
              { href: '/support', label: 'Support' },
              { href: '/login', label: 'Se connecter' },
            ].map(link => (
              <a key={link.href} href={link.href} style={{ fontSize: 13, color: 'rgba(255,255,255,0.38)', textDecoration: 'none', transition: 'color 0.15s' }}
                onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.8)'}
                onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.38)'}>
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </footer>

    </main>
  )
}
