import GrueSVG from '../components/GrueSVG'
import Link from 'next/link'

/**
 * Landing page publique — tracechantier.app
 *
 * Layout :
 *  - Hero plein écran : grue + cable + box TraceChantier + tagline + actions
 *  - Pas de section prix, pas de features détaillées
 *
 * Géométrie SVG (viewBox 0 0 180 200, width=180) :
 *  - Chariot center X = 140px → left: calc(50% - 140px) pour centrer sur la page
 *  - Chariot bottom Y = 82px  → cable part de top: 82px dans le container
 */

const CRANE_W = 180

export default function Home() {
  return (
    <main className="landing">
      <style>{`
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
          padding: 0 24px 60px;
        }

        /* ── Animation container ── */
        .anim-wrap {
          position: relative;
          width: 100%;
          height: 360px;
          flex-shrink: 0;
        }

        /* Crane — décalé pour que le chariot (x=140) soit centré */
        .crane {
          position: absolute;
          top: 0;
          left: calc(50% - 140px);
        }

        /* Cable — centré sur le chariot, part du bas du chariot (y=82) */
        .cable {
          position: absolute;
          top: 82px;
          left: calc(50% - 1px);
          width: 2px;
          height: 198px;   /* couvre jusqu'au bas de l'anim-wrap */
          background: linear-gradient(
            to bottom,
            rgba(255,255,255,0.55) 0%,
            rgba(255,255,255,0.18) 100%
          );
          transform-origin: top center;
          transform: scaleY(0);
          animation: cableDraw 0.5s ease-out 0.3s forwards;
        }

        /* Box TraceChantier — remonte depuis le bas */
        .tc-box-wrap {
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%) translateY(420px);
          animation: boxRise 1.5s cubic-bezier(0.22, 0.88, 0.36, 1) 0.45s forwards;
        }

        .tc-box {
          background: rgba(255, 255, 255, 0.07);
          border: 1.5px solid rgba(255, 255, 255, 0.2);
          border-radius: 20px;
          padding: 20px 48px;
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
          box-shadow: 0 0 10px rgba(46,143,212,0.8);
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
          margin-top: 8px;
          opacity: 0;
          animation: fadeUp 0.7s ease 2.1s forwards;
        }

        .tagline h1 {
          font-size: clamp(32px, 5vw, 52px);
          font-weight: 800;
          color: #fff;
          margin: 0 0 14px;
          letter-spacing: -0.5px;
          line-height: 1.15;
        }

        .tagline p {
          font-size: clamp(15px, 2vw, 19px);
          color: rgba(255, 255, 255, 0.5);
          margin: 0;
          line-height: 1.6;
          max-width: 440px;
        }

        /* ── Actions ── */
        .actions {
          margin-top: 44px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 18px;
          opacity: 0;
          animation: fadeUp 0.7s ease 2.5s forwards;
        }

        .btn-appstore {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: #fff;
          color: #071c36;
          border-radius: 14px;
          padding: 15px 30px;
          font-size: 16px;
          font-weight: 700;
          text-decoration: none;
          letter-spacing: -0.2px;
          transition: opacity 0.15s, transform 0.15s;
        }
        .btn-appstore:hover {
          opacity: 0.9;
          transform: translateY(-1px);
        }

        .link-login {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.38);
          text-decoration: none;
          letter-spacing: 0.1px;
          transition: color 0.15s;
        }
        .link-login:hover {
          color: rgba(255, 255, 255, 0.7);
        }

        /* ── Keyframes ── */
        @keyframes cableDraw {
          from { transform: scaleY(0); }
          to   { transform: scaleY(1); }
        }

        @keyframes boxRise {
          from { transform: translateX(-50%) translateY(420px); opacity: 0; }
          to   { transform: translateX(-50%) translateY(0);    opacity: 1; }
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
      `}</style>

      {/* Animation grue */}
      <div className="anim-wrap">
        {/* Grue SVG — chariot centré horizontalement */}
        <div className="crane">
          <GrueSVG width={CRANE_W} />
        </div>

        {/* Cable */}
        <div className="cable" />

        {/* Box qui monte */}
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
          Chaque photo, chaque rapport, chaque sous-traitant —<br />
          organisés en temps réel depuis votre téléphone.
        </p>
      </div>

      {/* Actions */}
      <div className="actions">
        {/* Remplacer href="#" par le lien App Store une fois l'app approuvée */}
        <a href="#" className="btn-appstore">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
          </svg>
          Télécharger sur l'App Store
        </a>

        <Link href="/login" className="link-login">
          Déjà un compte ? Se connecter →
        </Link>
      </div>
    </main>
  )
}
