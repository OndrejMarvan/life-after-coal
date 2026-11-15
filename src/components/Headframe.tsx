/**
 * Logo tile: a flat black coal-mine headframe on an orange tile: winding wheel, lattice tower,
 * back strut, rope to the winding-engine house and the ground line. No shading, so it stays
 * readable from favicon size up. Size it with className; the corners are rounded in the drawing.
 * public/favicon.svg is the same drawing.
 */
export function Headframe({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <rect width="64" height="64" rx="13" fill="#F47B20" />
      <g transform="translate(0 2)">
        <g fill="none" stroke="#0D0D0D" strokeLinecap="round" strokeLinejoin="round">
          <path d="M36.5 13L53 43" strokeWidth="1.3" />
          <path d="M21.5 31.5H34.5M20 41.5H36M23 24L36 41.5M33 24L20 41.5M20 41.5L38.2 53M36 41.5L17.8 53" strokeWidth="1.7" />
          <path d="M33 24L45 53M23 24L18 53M33 24L38 53" strokeWidth="3.4" />
          <circle cx="28" cy="14.5" r="8.6" strokeWidth="3.2" />
          <path d="M28 14.5V6.4M28 14.5H36.1M28 14.5H19.9M28 14.5L33.7 8.8M28 14.5L22.3 8.8M28 14.5L33.7 20.2M28 14.5L22.3 20.2" strokeWidth="1.3" />
          <path d="M7 53.5H57" strokeWidth="3.4" />
        </g>
        <rect x="19.5" y="22.3" width="17" height="3.4" rx="0.8" fill="#0D0D0D" />
        <circle cx="28" cy="14.5" r="2.3" fill="#0D0D0D" />
        <path d="M47 53V45L52.5 41.5L58 45V53Z" fill="#0D0D0D" />
      </g>
    </svg>
  )
}
