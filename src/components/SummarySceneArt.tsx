export function SummarySceneArt({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 260"
      preserveAspectRatio="xMidYMax slice"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="ssa-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#EFE1C9" />
          <stop offset="1" stopColor="#E8C79A" />
        </linearGradient>
        <linearGradient id="ssa-hill-back" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#B08256" />
          <stop offset="1" stopColor="#8C6540" />
        </linearGradient>
        <linearGradient id="ssa-hill-front" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#6E4B2A" />
          <stop offset="1" stopColor="#513520" />
        </linearGradient>
      </defs>

      <rect width="400" height="260" fill="url(#ssa-sky)" />
      <circle cx="120" cy="52" r="34" fill="#EFBF67" opacity="0.95" />
      <circle cx="120" cy="52" r="50" fill="#EFBF67" opacity="0.25" />

      <path d="M0 130 C 90 100, 180 150, 260 118 C 320 96, 370 122, 400 110 L400 260 L0 260 Z" fill="url(#ssa-hill-back)" />

      {Array.from({ length: 9 }).map((_, i) => (
        <path
          key={`row-back-${i}`}
          d={`M${-20 + i * 48} 260 C ${10 + i * 48} 170, ${20 + i * 48} 170, ${40 + i * 48} 260`}
          fill="none"
          stroke="#7A5836"
          strokeWidth="3"
          opacity="0.5"
        />
      ))}

      <path d="M0 175 C 100 148, 220 188, 320 156 C 350 147, 380 159, 400 154 L400 260 L0 260 Z" fill="url(#ssa-hill-front)" />

      {Array.from({ length: 8 }).map((_, i) => (
        <path
          key={`row-front-${i}`}
          d={`M${-10 + i * 55} 260 C ${20 + i * 55} 192, ${30 + i * 55} 192, ${50 + i * 55} 260`}
          fill="none"
          stroke="#3D2817"
          strokeWidth="4"
          opacity="0.55"
        />
      ))}

      <g opacity="0.7">
        <path d="M55 155 C 55 133, 77 133, 77 155 L77 176 L55 176 Z" fill="#3D2817" />
        <path d="M320 132 C 320 108, 346 108, 346 132 L346 156 L320 156 Z" fill="#3D2817" />
      </g>
    </svg>
  );
}
