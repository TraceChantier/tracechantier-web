export default function GrueSVG({ width = 160, opacity = 1 }: { width?: number; opacity?: number }) {
  const h = Math.round(width * (200 / 180))

  // Light theme — for dark gradient background (white/translucent tones)
  const c = {
    hauban:       'rgba(255,255,255,0.35)',
    boom:         '#E8EEF4',
    boomLight:    'rgba(255,255,255,0.55)',
    mat:          '#D0DAE4',
    matLight:     '#E8EEF4',
    cross:        '#9AAABB',
    cabin:        '#2E8FD4',
    cabinInner:   '#1B5FA8',
    contrepoids:  '#A8B8C8',
    chariot:      '#2E8FD4',
    chariotInner: 'rgba(255,255,255,0.9)',
    base:         '#A8B8C8',
    baseLight:    '#8A9BAB',
  }

  return (
    <svg
      width={width}
      height={h}
      viewBox="0 0 180 200"
      style={{ opacity }}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Haubans */}
      <line x1="90" y1="12" x2="168" y2="46" stroke={c.hauban} strokeWidth="1.6" strokeLinecap="round"/>
      <line x1="90" y1="12" x2="24"  y2="46" stroke={c.hauban} strokeWidth="1.4" strokeLinecap="round"/>
      <polygon points="90,12 62,46 118,46" fill="none" stroke={c.hauban} strokeWidth="1.4"/>
      <line x1="90" y1="12" x2="90"  y2="46" stroke={c.hauban} strokeWidth="1.2" strokeLinecap="round"/>

      {/* Flèche horizontale (boom) */}
      <rect x="18"  y="46" width="150" height="13" rx="3" fill={c.boom}/>
      <rect x="18"  y="46" width="150" height="4"  rx="2" fill={c.boomLight}/>

      {/* Mât vertical */}
      <rect x="82" y="46" width="16" height="138" rx="3" fill={c.mat}/>
      <rect x="82" y="46" width="5"  height="138" rx="2.5" fill={c.matLight}/>

      {/* Croisillons */}
      <line x1="82" y1="70"  x2="98" y2="86"  stroke={c.cross} strokeWidth="1.8"/>
      <line x1="98" y1="70"  x2="82" y2="86"  stroke={c.cross} strokeWidth="1.8"/>
      <line x1="82" y1="96"  x2="98" y2="112" stroke={c.cross} strokeWidth="1.8"/>
      <line x1="98" y1="96"  x2="82" y2="112" stroke={c.cross} strokeWidth="1.8"/>
      <line x1="82" y1="122" x2="98" y2="138" stroke={c.cross} strokeWidth="1.8"/>
      <line x1="98" y1="122" x2="82" y2="138" stroke={c.cross} strokeWidth="1.8"/>

      {/* Cabine opérateur */}
      <rect x="18" y="50" width="30" height="18" rx="3" fill={c.cabin} opacity="0.9"/>
      <rect x="20" y="52" width="26" height="14" rx="2" fill={c.cabinInner} opacity="0.55"/>

      {/* Contrepoids */}
      <rect x="18" y="38" width="24" height="10" rx="2.5" fill={c.contrepoids}/>

      {/* Chariot + crochet */}
      <rect x="124" y="58" width="32" height="22" rx="3.5" fill={c.chariot} opacity="0.9"/>
      <rect x="127" y="61" width="11" height="8"  rx="2"   fill={c.chariotInner}/>
      <rect x="142" y="61" width="11" height="8"  rx="2"   fill={c.chariotInner}/>
      <rect x="124" y="74" width="32" height="8"  fill={c.cabin} opacity="0.6"/>

      {/* Base / chenilles */}
      <rect x="70"  y="184" width="50" height="9"  rx="3.5" fill={c.base}     opacity="0.7"/>
      <rect x="64"  y="192" width="62" height="6"  rx="3"   fill={c.baseLight} opacity="0.45"/>
    </svg>
  )
}
