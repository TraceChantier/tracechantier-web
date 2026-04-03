'use client'

import { useEffect, useState } from 'react'

export default function SplashScreen() {
  const [visible, setVisible] = useState(true)
  const [fading, setFading] = useState(false)

  useEffect(() => {
    // Show only once per browser session
    if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('tc_splash')) {
      setVisible(false)
      return
    }
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem('tc_splash', '1')
    }

    const t1 = setTimeout(() => setFading(true), 2300)
    const t2 = setTimeout(() => setVisible(false), 2900)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  if (!visible) return null

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: '#0B1221',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: fading ? 0 : 1,
        transition: 'opacity 0.6s cubic-bezier(0.4,0,0.2,1)',
        pointerEvents: fading ? 'none' : 'all',
      }}
    >
      <style>{`
        @keyframes tc-rise {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes tc-cable {
          from { stroke-dashoffset: 36; opacity: 0; }
          to   { stroke-dashoffset: 0;  opacity: 1; }
        }
        @keyframes tc-hook {
          from { opacity: 0; transform: translateY(-10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes tc-brand {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes tc-dot-pulse {
          0%, 100% { opacity: 0.4; }
          50%       { opacity: 1; }
        }
      `}</style>

      {/* Crane SVG */}
      <div style={{
        animation: 'tc-rise 0.65s cubic-bezier(0.22,1,0.36,1) forwards',
        opacity: 0,
      }}>
        <svg
          width="108"
          height="136"
          viewBox="0 0 108 160"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Base / fondation */}
          <rect x="42" y="148" width="30" height="8" rx="2" fill="#1E3A5F" opacity="0.7" />
          <rect x="38" y="153" width="38" height="5" rx="2" fill="#162D4A" opacity="0.5" />

          {/* Mât vertical */}
          <rect x="51" y="44" width="12" height="108" rx="2" fill="#1E3A5F" />
          <rect x="51" y="44" width="3.5" height="108" rx="1.5" fill="#2E5A8E" opacity="0.8" />

          {/* Croisillons mât */}
          <line x1="51" y1="66"  x2="63" y2="78"  stroke="#162D4A" strokeWidth="1.5" />
          <line x1="63" y1="66"  x2="51" y2="78"  stroke="#162D4A" strokeWidth="1.5" />
          <line x1="51" y1="88"  x2="63" y2="100" stroke="#162D4A" strokeWidth="1.5" />
          <line x1="63" y1="88"  x2="51" y2="100" stroke="#162D4A" strokeWidth="1.5" />
          <line x1="51" y1="110" x2="63" y2="122" stroke="#162D4A" strokeWidth="1.5" />
          <line x1="63" y1="110" x2="51" y2="122" stroke="#162D4A" strokeWidth="1.5" />

          {/* Haubans */}
          <line x1="57" y1="12" x2="98" y2="44" stroke="rgba(46,90,142,0.5)" strokeWidth="1.3" strokeLinecap="round" />
          <line x1="57" y1="12" x2="16" y2="44" stroke="rgba(46,90,142,0.4)" strokeWidth="1.1" strokeLinecap="round" />
          <line x1="57" y1="12" x2="57" y2="44" stroke="rgba(46,90,142,0.35)" strokeWidth="1" strokeLinecap="round" />

          {/* Sommet */}
          <circle cx="57" cy="12" r="3.5" fill="#2E5A8E" />

          {/* Flèche horizontale (boom) */}
          <rect x="10" y="44" width="92" height="10" rx="2.5" fill="#1E3A5F" />
          <rect x="10" y="44" width="92" height="3"  rx="1.5" fill="#3068A8" opacity="0.7" />

          {/* Cabine */}
          <rect x="10" y="47" width="22" height="14" rx="2.5" fill="#1B5FA8" />
          <rect x="13" y="50" width="8"  height="7"  rx="1.5" fill="#2E8FD4" opacity="0.5" />

          {/* Contrepoids */}
          <rect x="10" y="38" width="18" height="8"  rx="2"   fill="#162D4A" opacity="0.9" />

          {/* Chariot + câble */}
          <rect x="74" y="52" width="24" height="14" rx="2.5" fill="#1B5FA8" opacity="0.9" />
          <rect x="77" y="55" width="7"  height="6"  rx="1.5" fill="#4A9FD4" opacity="0.5" />
          <rect x="88" y="55" width="7"  height="6"  rx="1.5" fill="#4A9FD4" opacity="0.5" />

          {/* Câble qui descend — animé */}
          <line
            x1="86" y1="66" x2="86" y2="102"
            stroke="rgba(74,159,212,0.55)"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeDasharray="36"
            style={{
              animation: 'tc-cable 0.45s cubic-bezier(0.4,0,0.2,1) forwards',
              animationDelay: '0.7s',
            }}
          />

          {/* Crochet */}
          <g style={{
            animation: 'tc-hook 0.35s cubic-bezier(0.4,0,0.2,1) forwards',
            animationDelay: '1.05s',
            opacity: 0,
          }}>
            <path
              d="M83 100 Q79 106 83 111 Q87 116 84 120"
              stroke="rgba(74,159,212,0.7)"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
            />
          </g>
        </svg>
      </div>

      {/* Brand text */}
      <div style={{ textAlign: 'center', marginTop: 20 }}>
        <div style={{
          animation: 'tc-brand 0.55s cubic-bezier(0.22,1,0.36,1) forwards',
          animationDelay: '1.1s',
          opacity: 0,
          fontSize: 26,
          fontWeight: 700,
          color: '#FFFFFF',
          letterSpacing: '-0.4px',
          fontFamily: "'DM Sans', system-ui, sans-serif",
          lineHeight: 1.1,
        }}>
          TraceChantier
        </div>
        <div style={{
          animation: 'tc-brand 0.45s ease forwards',
          animationDelay: '1.45s',
          opacity: 0,
          fontSize: 11,
          color: 'rgba(255,255,255,0.38)',
          marginTop: 8,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          fontFamily: "'DM Sans', system-ui, sans-serif",
          fontWeight: 500,
        }}>
          Documentation de chantier
        </div>

        {/* Loading dots */}
        <div style={{
          display: 'flex',
          gap: 5,
          justifyContent: 'center',
          marginTop: 28,
          animation: 'tc-brand 0.4s ease forwards',
          animationDelay: '1.6s',
          opacity: 0,
        }}>
          {[0, 1, 2].map(n => (
            <div key={n} style={{
              width: 4,
              height: 4,
              borderRadius: '50%',
              background: 'rgba(46,143,212,0.6)',
              animation: `tc-dot-pulse 1.2s ease ${n * 0.2}s infinite`,
            }} />
          ))}
        </div>
      </div>
    </div>
  )
}
