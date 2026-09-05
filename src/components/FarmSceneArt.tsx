export function FarmSceneArt({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 260"
      preserveAspectRatio="xMidYMax slice"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="fsa-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#EFE9D4" />
          <stop offset="1" stopColor="#D9E7C7" />
        </linearGradient>
        <linearGradient id="fsa-hill-back" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8FAE6C" />
          <stop offset="1" stopColor="#71964F" />
        </linearGradient>
        <linearGradient id="fsa-hill-front" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5C7F3E" />
          <stop offset="1" stopColor="#4A6B31" />
        </linearGradient>
      </defs>

      <rect width="400" height="260" fill="url(#fsa-sky)" />
      <circle cx="335" cy="55" r="26" fill="#EFC26A" opacity="0.9" />

      <path d="M0 150 C 90 115, 180 175, 260 140 C 320 115, 370 145, 400 130 L400 260 L0 260 Z" fill="url(#fsa-hill-back)" />

      {Array.from({ length: 9 }).map((_, i) => (
        <path
          key={`row-back-${i}`}
          d={`M${-20 + i * 48} 260 C ${10 + i * 48} 190, ${20 + i * 48} 190, ${40 + i * 48} 260`}
          fill="none"
          stroke="#66904A"
          strokeWidth="3"
          opacity="0.55"
        />
      ))}

      <path d="M0 195 C 100 165, 220 210, 320 175 C 350 165, 380 178, 400 172 L400 260 L0 260 Z" fill="url(#fsa-hill-front)" />

      {Array.from({ length: 8 }).map((_, i) => (
        <path
          key={`row-front-${i}`}
          d={`M${-10 + i * 55} 260 C ${20 + i * 55} 210, ${30 + i * 55} 210, ${50 + i * 55} 260`}
          fill="none"
          stroke="#3E5C29"
          strokeWidth="4"
          opacity="0.6"
        />
      ))}

      <g transform="translate(148 108) scale(1.35)">
        <ellipse cx="18" cy="86" rx="24" ry="5" fill="#2F4A1F" opacity="0.3" />
        <path d="M4 86 L10 46 L26 46 L30 86 Z" fill="#C9622E" />
        <path d="M8 46 C 4 30, 30 30, 26 46 Z" fill="#3E5C29" />
        <rect x="12" y="18" width="12" height="16" rx="4" fill="#F0C99A" />
        <circle cx="18" cy="12" r="9" fill="#F0C99A" />
        <path d="M4 10 C 4 -4, 32 -4, 32 10 C 25 3, 11 3, 4 10 Z" fill="#F7F5EF" />
        <path d="M-8 40 L10 30" stroke="#C9622E" strokeWidth="5" strokeLinecap="round" />
        <path d="M28 32 L44 46" stroke="#F0C99A" strokeWidth="5" strokeLinecap="round" />
        <path d="M44 20 L44 52" stroke="#8A6842" strokeWidth="3" strokeLinecap="round" />
      </g>

      <g opacity="0.7">
        <path d="M40 150 C 40 130, 60 130, 60 150 L60 168 L40 168 Z" fill="#3E5C29" />
        <path d="M330 130 C 330 108, 354 108, 354 130 L354 152 L330 152 Z" fill="#3E5C29" />
      </g>
    </svg>
  );
}
