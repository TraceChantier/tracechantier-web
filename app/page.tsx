import GrueSVG from '../components/GrueSVG'
import Link from 'next/link'

const CRANE_W = 180

export default function Home() {
  return (
    <main className="landing">
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }

        .landing {
          width: 100vw;
          min-height: 100vh;
          background: linear-gradient(170deg, #071c36 0%, #0D3A6E 55%, #092d5a 100%);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          font-family: 'DM Sans', 'Segoe UI', system-ui, sans-serif;
          overflow: hidden;
          padding: 40px 24px 60px;
          position: relative;
        }

        /* Ambient light — donne de la profondeur */
        .landing::before {
          content: '';
          position: absolute;
          top: -200px;
          left: 50%;
          transform: translateX(-50%);
          width: 800px;
          height: 600px;
          background: radial-gradient(ellipse, rgba(46,143,212,0.12) 0%, transparent 65%);
          pointer-events: none;
        }

        /* ── Animation container ── */
        .anim-wrap {
          position: relative;
          width: 100%;
          height: 320px;
          flex-shrink: 0;
        }

        .crane {
          position: absolute;
          top: 0;
          left: calc(50% - 140px);
        }

        .cable {
          position: absolute;
          top: 82px;
          left: calc(50% - 1px);
          width: 2px;
          height: 178px;
          background: linear-gradient(
            to bottom,
            rgba(255,255,255,0.5) 0%,
            rgba(255,255,255,0.15) 100%
          );
          transform-origin: top center;
          transform: scaleY(0);
          animation: cableDraw 0.5s ease-out 0.3s forwards;
        }

        .tc-box-wrap {
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%) translateY(400px);
          animation: boxRise 1.5s cubic-bezier(0.22, 0.88, 0.36, 1) 0.45s forwards;
        }

        .tc-box {
          background: rgba(255, 255, 255, 0.07);
          border: 1.5px solid rgba(255, 255, 255, 0.2);
          border-radius: 20px;
          padding: 18px 44px;
          backdrop-filter: blur(16px);
          white-space: nowrap;
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .tc-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #2E8FD4;
          box-shadow: 0 0 10px rgba(46,143,212,0.9);
          flex-shrink: 0;
        }

        .tc-name {
          font-size: 26px;
          font-weight: 800;
          color: #fff;
          letter-spacing: -0.3px;
        }

        .tc-name em {
          font-style: normal;
          color: #2E8FD4;
        }

        /* ── Tagline ── */
        .tagline {
          text-align: center;
          margin-top: 4px;
          opacity: 0;
          animation: fadeUp 0.7s ease 2.1s forwards;
        }

        .tagline h1 {
          font-size: clamp(34px, 5vw, 56px);
          font-weight: 800;
          color: #fff;
          margin: 0 0 16px;
          letter-spacing: -0.8px;
          line-height: 1.12;
        }

        .tagline p {
          font-size: clamp(16px, 2vw, 20px);
          color: rgba(255, 255, 255, 0.6);
          line-height: 1.6;
          max-width: 460px;
          margin: 0 auto;
        }

        .tagline p strong {
          color: rgba(255,255,255,0.9);
          font-weight: 600;
        }

        /* ── Boutons ── */
        .actions {
          margin-top: 36px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          opacity: 0;
          animation: fadeUp 0.7s ease 2.4s forwards;
        }

        .btn-row {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
          justify-content: center;
        }

        .btn-appstore {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: #fff;
          color: #071c36;
          border-radius: 14px;
          padding: 15px 28px;
          font-size: 16px;
          font-weight: 700;
          text-decoration: none;
          letter-spacing: -0.2px;
          transition: opacity 0.15s, transform 0.15s;
          white-space: nowrap;
        }
        .btn-appstore:hover {
          opacity: 0.9;
          transform: translateY(-1px);
        }

        .btn-login {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(255,255,255,0.08);
          border: 1.5px solid rgba(255,255,255,0.22);
          color: #fff;
          border-radius: 14px;
          padding: 15px 28px;
          font-size: 16px;
          font-weight: 600;
          text-decoration: none;
          letter-spacing: -0.1px;
          transition: background 0.15s, border-color 0.15s, transform 0.15s;
          white-space: nowrap;
          backdrop-filter: blur(8px);
        }
        .btn-login:hover {
          background: rgba(255,255,255,0.14);
          border-color: rgba(255,255,255,0.38);
          transform: translateY(-1px);
        }

        .trial-note {
          font-size: 13px;
          color: rgba(255,255,255,0.3);
          letter-spacing: 0.1px;
        }

        /* ── 3 stats ── */
        .stats {
          margin-top: 52px;
          display: flex;
          gap: 0;
          opacity: 0;
          animation: fadeUp 0.7s ease 2.7s forwards;
        }

        .stat {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          padding: 0 36px;
          border-right: 1px solid rgba(255,255,255,0.1);
        }
        .stat:last-child {
          border-right: none;
        }

        .stat-val {
          font-size: 28px;
          font-weight: 800;
          color: #fff;
          letter-spacing: -0.5px;
          line-height: 1;
        }

        .stat-val span {
          color: #2E8FD4;
        }

        .stat-label {
          font-size: 13px;
          color: rgba(255,255,255,0.4);
          text-align: center;
          line-height: 1.4;
          max-width: 110px;
        }

        /* ── Keyframes ── */
        @keyframes cableDraw {
          from { transform: scaleY(0); }
          to   { transform: scaleY(1); }
        }

        @keyframes boxRise {
          from { transform: translateX(-50%) translateY(400px); opacity: 0; }
          to   { transform: translateX(-50%) translateY(0);     opacity: 1; }
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0);    }
        }

        @media (max-width: 480px) {
          .stat { padding: 0 20px; }
          .stat-val { font-size: 22px; }
          .anim-wrap { height: 280px; }
        }
      `}</style>

      {/* Ambient glow */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />

      {/* Animation grue */}
      <div className="anim-wrap">
        <div className="crane">
          <GrueSVG width={CRANE_W} />
        </div>
        <div className="cable" />
        <div className="tc-box-wrap">
          <div className="tc-box">
            <div className="tc-dot" />
            <span className="tc-name">Trace<em>Chantier</em></span>
          </div>
        </div>
      </div>

      {/* Tagline */}
      <div className="tagline">
        <h1>Votre chantier virtuel</h1>
        <p>
          Fini les textos de suivi.<br />
          <strong>Tout est tracé, horodaté, classé — automatiquement.</strong>
        </p>
      </div>

      {/* Actions */}
      <div className="actions">
        <div className="btn-row">
          {/* Remplacer href="#" par le lien App Store une fois approuvé */}
          <a href="#" className="btn-appstore">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
            </svg>
            Télécharger l'app
          </a>

          <Link href="/login" className="btn-login">
            Se connecter
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </Link>
        </div>

        <span className="trial-note">14 jours d'essai gratuit · Aucune carte requise</span>
      </div>

      {/* Stats */}
      <div className="stats">
        <div className="stat">
          <span className="stat-val">10<span>s</span></span>
          <span className="stat-label">par sous-traitant pour soumettre</span>
        </div>
        <div className="stat">
          <span className="stat-val">1<span> tap</span></span>
          <span className="stat-label">pour générer un rapport PDF</span>
        </div>
        <div className="stat">
          <span className="stat-val">14<span>j</span></span>
          <span className="stat-label">d'essai gratuit, sans engagement</span>
        </div>
      </div>
    </main>
  )
}
