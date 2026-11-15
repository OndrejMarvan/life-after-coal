import { useId } from 'react'

/**
 * Header logo: a coal-mine headframe in 3D at dusk, modelled on Silesian lattice headframes:
 * the tower with two winding wheels, the inclined back strut, ropes to the winding engine, the
 * brick shaft hall with a few lit windows and a spoil heap in the haze. Painted-steel colour and
 * edge highlights from the low sun on the left. Size it with className; corners are rounded inside.
 * Oblique projection with depth vector (11, -6). The flat Headframe is used everywhere else.
 * `wheelDeg` turns the winding wheels (clicking the logo counts towards the hidden game).
 */
export function HeadframeLogo({ className = '', wheelDeg = 0 }: { className?: string; wheelDeg?: number }) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '')
  const sky = `sky${uid}`
  const brick = `brick${uid}`
  const clip = `clip${uid}`
  const sun = `sun${uid}`
  const steel = '#1f2724'
  return (
    <svg viewBox="0 0 200 200" className={className} aria-hidden="true" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <defs>
        <linearGradient id={sky} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#b9531a" />
          <stop offset="0.55" stopColor="#ef7a27" />
          <stop offset="1" stopColor="#ffb36a" />
        </linearGradient>
        <linearGradient id={brick} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#9a4019" />
          <stop offset="1" stopColor="#65250d" />
        </linearGradient>
        <radialGradient id={sun} cx="40" cy="120" r="85" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#fff1c9" />
          <stop offset="0.18" stopColor="#ffd28a" stopOpacity="0.9" />
          <stop offset="1" stopColor="#ffb36a" stopOpacity="0" />
        </radialGradient>
        <clipPath id={clip}>
          <rect width="200" height="200" rx="28" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clip})`}>
        <rect width="200" height="200" fill={`url(#${sky})`} />
        <rect width="200" height="200" fill={`url(#${sun})`} />
        <path d="M108 193C134 150 156 121 172 118C188 116 212 150 240 193Z" fill="#5b2a10" fillOpacity="0.3" />
        <path d="M85.4 17.2L230 69.2M95.9 11.5L230 59.8" stroke={steel} strokeWidth="1.1" />
        <path d="M98 46L186 178M96 62L172 180M96 62L104.3 55.4M104.3 55.4L106.9 78.9M106.9 78.9L116.9 74.3M116.9 74.3L117.7 95.7M117.7 95.7L129.4 93.1M129.4 93.1L128.6 112.6M128.6 112.6L142 112M142 112L139.4 129.4M139.4 129.4L154.6 130.9M154.6 130.9L150.3 146.3M150.3 146.3L167.1 149.7M167.1 149.7L161.1 163.1M161.1 163.1L179.7 168.6M179.7 168.6L172 180" stroke={steel} strokeOpacity="0.45" strokeWidth="1.4" />
        <path d="M63 40L57 130M63 40L94.2 58M93 40L61.8 58M61.8 58L95.4 76M94.2 58L60.6 76M60.6 76L96.6 94M95.4 76L59.4 94M59.4 94L97.8 112M96.6 94L58.2 112M58.2 112L99 130M97.8 112L57 130M63 40L93 40M61.8 58L94.2 58M60.6 76L95.4 76M59.4 94L96.6 94M58.2 112L97.8 112M57 130L99 130" stroke={steel} strokeOpacity="0.35" strokeWidth="1.2" />
        <path d="M82 46L93 40L99 130L88 136Z" fill="#000" fillOpacity="0.16" />
        <path d="M52 46L82 46L88 136L46 136Z" fill="#000" fillOpacity="0.05" />
        <path d="M93 40L99 130M82 46L94.2 58M93 40L83.2 64M83.2 64L95.4 76M94.2 58L84.4 82M84.4 82L96.6 94M95.4 76L85.6 100M85.6 100L97.8 112M96.6 94L86.8 118M86.8 118L99 130M97.8 112L88 136M82 46L93 40M83.2 64L94.2 58M84.4 82L95.4 76M85.6 100L96.6 94M86.8 118L97.8 112M88 136L99 130" stroke={steel} strokeOpacity="0.85" strokeWidth="1.3" />
        <path d="M52 46L83.2 64M82 46L50.8 64M50.8 64L84.4 82M83.2 64L49.6 82M49.6 82L85.6 100M84.4 82L48.4 100M48.4 100L86.8 118M85.6 100L47.2 118M47.2 118L88 136M86.8 118L46 136" stroke={steel} strokeWidth="1.5" />
        <path d="M52 46L82 46M50.8 64L83.2 64M49.6 82L84.4 82M48.4 100L85.6 100M47.2 118L86.8 118M46 136L88 136" stroke={steel} strokeWidth="2.4" />
        <path d="M52 46L46 136M82 46L88 136" stroke={steel} strokeWidth="4.4" />
        <path d="M50.7 47L44.7 136M80.7 47L86.7 136" stroke="#ffd9a0" strokeOpacity="0.55" strokeWidth="1.1" />
        <g className="transition-transform duration-700 ease-out motion-reduce:transition-none" style={{ transform: `rotate(${-wheelDeg}deg)`, transformBox: 'fill-box', transformOrigin: 'center' }}>
          <circle cx="77.5" cy="19.3" r="20" fill="none" stroke={steel} strokeWidth="4.2" opacity="0.5" />
          <circle cx="77.5" cy="19.3" r="17" fill="none" stroke={steel} strokeWidth="1" opacity="0.5" />
          <path d="M80.1 19.7L94.9 21.9M79.4 21.1L90 31.7M77.9 21.9L80.4 36.7M76.3 21.6L69.6 35M75.2 20.5L61.9 27.4M74.9 18.9L60.1 16.7M75.6 17.5L65 6.9M77.1 16.7L74.6 1.9M78.7 17L85.4 3.6M79.8 18.1L93.1 11.2" stroke={steel} strokeWidth="1.2" opacity="0.5" />
          <circle cx="77.5" cy="19.3" r="3.2" fill={steel} opacity="0.5" />
        </g>
        <path d="M42 46L94 46L105 40L53 40ZM44 82L92 82L103 76L55 76ZM42 118L94 118L105 112L53 112Z" fill="#3d3d3d" />
        <path d="M42 46L94 46L94 48.4L42 48.4ZM44 82L92 82L92 84.4L44 84.4ZM42 118L94 118L94 120.4L42 120.4Z" fill={steel} />
        <path d="M42 40L94 40L105 34M42 46L42 40M48.5 46L48.5 40M55 46L55 40M61.5 46L61.5 40M68 46L68 40M74.5 46L74.5 40M81 46L81 40M87.5 46L87.5 40M94 46L94 40M105 40L105 34M42 43L94 43M44 76L92 76L103 70M44 82L44 76M50 82L50 76M56 82L56 76M62 82L62 76M68 82L68 76M74 82L74 76M80 82L80 76M86 82L86 76M92 82L92 76M103 76L103 70M44 79L92 79M42 112L94 112L105 106M42 118L42 112M48.5 118L48.5 112M55 118L55 112M61.5 118L61.5 112M68 118L68 112M74.5 118L74.5 112M81 118L81 112M87.5 118L87.5 112M94 118L94 112M105 112L105 106M42 115L94 115" stroke={steel} strokeWidth="0.9" />
        <path d="M67 25L56 46M67 25L78 46M77.5 19.3L66.5 40.3M77.5 19.3L88.5 40.3" stroke={steel} strokeWidth="2.2" />
        <path d="M47 25L47 138M57.5 19.3L57.5 134" stroke={steel} strokeWidth="1" />
        <g className="transition-transform duration-700 ease-out motion-reduce:transition-none" style={{ transform: `rotate(${wheelDeg}deg)`, transformBox: 'fill-box', transformOrigin: 'center' }}>
          <circle cx="67" cy="25" r="20" fill="none" stroke={steel} strokeWidth="4.2" />
          <circle cx="67" cy="25" r="17" fill="none" stroke={steel} strokeWidth="1" />
          <path d="M69.6 25.4L84.4 27.6M68.9 26.8L79.5 37.4M67.4 27.6L69.9 42.4M65.8 27.3L59.1 40.7M64.7 26.2L51.4 33.1M64.4 24.6L49.6 22.4M65.1 23.2L54.5 12.6M66.6 22.4L64.1 7.6M68.2 22.7L74.9 9.3M69.3 23.8L82.6 16.9" stroke={steel} strokeWidth="1.2" />
          <circle cx="67" cy="25" r="3.2" fill={steel} />
        </g>
        <path d="M48.0 18.1A20.2 20.2 0 0 1 73.9 6.0" fill="none" stroke="#fff" strokeOpacity="0.45" strokeWidth="1.1" />
        <path d="M85 68L161 186L172 180L96 62Z" fill="#000" fillOpacity="0.16" />
        <path d="M87 52L98 46M85 68L96 62M99.6 70.9L110.6 64.9M95.9 84.9L106.9 78.9M112.1 89.7L123.1 83.7M106.7 101.7L117.7 95.7M124.7 108.6L135.7 102.6M117.6 118.6L128.6 112.6M137.3 127.4L148.3 121.4M128.4 135.4L139.4 129.4M149.9 146.3L160.9 140.3M139.3 152.3L150.3 146.3M162.4 165.1L173.4 159.1M150.1 169.1L161.1 163.1M175 184L186 178M161 186L172 180" stroke={steel} strokeOpacity="0.8" strokeWidth="1" />
        <path d="M85 68L93.3 61.4M93.3 61.4L95.9 84.9M95.9 84.9L105.9 80.3M105.9 80.3L106.7 101.7M106.7 101.7L118.4 99.1M118.4 99.1L117.6 118.6M117.6 118.6L131 118M131 118L128.4 135.4M128.4 135.4L143.6 136.9M143.6 136.9L139.3 152.3M139.3 152.3L156.1 155.7M156.1 155.7L150.1 169.1M150.1 169.1L168.7 174.6M168.7 174.6L161 186" stroke={steel} strokeWidth="1.6" />
        <path d="M87 52L175 184M85 68L161 186" stroke={steel} strokeWidth="4.4" />
        <path d="M86.2 50.6L174.2 182.6" stroke="#ffd9a0" strokeOpacity="0.4" strokeWidth="1.1" />
        <path d="M153 186L181 186L192 180L164 180Z" fill="#4a4a4a" />
        <path d="M181 186L192 180L192 187L181 193Z" fill="#161616" />
        <path d="M153 186L181 186L181 193L153 193Z" fill="#2a2a2a" />
        <path d="M16 138L100 138L111 132L27 132Z" fill="#262626" />
        <path d="M100 138L111 132L111 187L100 193Z" fill="#4a1b09" />
        <path d="M16 138L100 138L100 193L16 193Z" fill={`url(#${brick})`} />
        <path d="M16 146L100 146M100 146L111 140M16 150L100 150M100 150L111 144M16 154L100 154M100 154L111 148M16 158L100 158M100 158L111 152M16 162L100 162M100 162L111 156M16 166L100 166M100 166L111 160M16 170L100 170M100 170L111 164M16 174L100 174M100 174L111 168M16 178L100 178M100 178L111 172M16 182L100 182M100 182L111 176M16 186L100 186M100 186L111 180" stroke="#000" strokeOpacity="0.14" strokeWidth="0.6" />
        <path d="M15 138L101 138L101 142L15 142Z" fill="#3d1608" />
        <path d="M16 187L100 187L100 193L16 193Z" fill="#2a0f05" />
        <path d="M24 162L24 151.5A5.5 5.5 0 0 1 35 151.5L35 162ZM62 162L62 151.5A5.5 5.5 0 0 1 73 151.5L73 162ZM81 162L81 151.5A5.5 5.5 0 0 1 92 151.5L92 162ZM43 182L43 171.5A5.5 5.5 0 0 1 54 171.5L54 182ZM81 182L81 171.5A5.5 5.5 0 0 1 92 171.5L92 182Z" fill="#1d130e" />
        <path d="M43 162L43 151.5A5.5 5.5 0 0 1 54 151.5L54 162ZM24 182L24 171.5A5.5 5.5 0 0 1 35 171.5L35 182ZM62 182L62 171.5A5.5 5.5 0 0 1 73 171.5L73 182Z" fill="#ffc76f" />
        <path d="M29.5 147L29.5 162M24 154.8L35 154.8M48.5 147L48.5 162M43 154.8L54 154.8M67.5 147L67.5 162M62 154.8L73 154.8M86.5 147L86.5 162M81 154.8L92 154.8M29.5 167L29.5 182M24 174.8L35 174.8M48.5 167L48.5 182M43 174.8L54 174.8M67.5 167L67.5 182M62 174.8L73 174.8M86.5 167L86.5 182M81 174.8L92 174.8" stroke="#8c3816" strokeWidth="0.9" />
        <path d="M22.5 163.2L36.5 163.2M41.5 163.2L55.5 163.2M60.5 163.2L74.5 163.2M79.5 163.2L93.5 163.2M22.5 183.2L36.5 183.2M41.5 183.2L55.5 183.2M60.5 183.2L74.5 183.2M79.5 183.2L93.5 183.2" stroke="#c96f3b" strokeWidth="1.1" />
        <path d="M103.2 161L103.2 147L107.8 144.5L107.8 158.5ZM103.2 181L103.2 167L107.8 164.5L107.8 178.5Z" fill="#140c08" />
        <path d="M-5 193L205 193L205 205L-5 205Z" fill="#0d0d0d" />
      </g>
    </svg>
  )
}
