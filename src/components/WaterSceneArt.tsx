export function WaterSceneArt({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 260"
      preserveAspectRatio="xMidYMax slice"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="wsa-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#E3EEF4" />
          <stop offset="1" stopColor="#C7E0EA" />
        </linearGradient>
        <linearGradient id="wsa-field" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#6B9BA8" />
          <stop offset="1" stopColor="#4C7A46" />
        </linearGradient>
      </defs>

      <rect width="400" height="260" fill="url(#wsa-sky)" />

      <path d="M0 145 C 90 120, 200 165, 300 135 C 340 122, 375 138, 400 128 L400 260 L0 260 Z" fill="url(#wsa-field)" opacity="0.85" />

      {Array.from({ length: 8 }).map((_, i) => (
        <path
          key={`furrow-${i}`}
          d={`M${-10 + i * 55} 260 C ${20 + i * 55} 195, ${30 + i * 55} 195, ${50 + i * 55} 260`}
          fill="none"
          stroke="#3E5C29"
          strokeWidth="4"
          opacity="0.45"
        />
      ))}

      <path
        d="M-10 210 C 60 195, 90 225, 160 205 C 230 185, 260 215, 340 198 C 380 190, 400 200, 410 196"
        fill="none"
        stroke="#BFE0EC"
        strokeWidth="10"
        strokeLinecap="round"
        opacity="0.75"
      />
      <path
        d="M-10 210 C 60 195, 90 225, 160 205 C 230 185, 260 215, 340 198 C 380 190, 400 200, 410 196"
        fill="none"
        stroke="#EAF6FA"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.9"
      />

      <g opacity="0.9">
        <path d="M300 60 C 300 40, 330 40, 330 60 C 330 78, 315 92, 315 92 C 315 92, 300 78, 300 60 Z" fill="#8FCBE0" />
        <path d="M330 100 C 330 84, 354 84, 354 100 C 354 114, 342 126, 342 126 C 342 126, 330 114, 330 100 Z" fill="#8FCBE0" opacity="0.75" />
      </g>

      <g opacity="0.7">
        <path d="M40 150 C 40 130, 60 130, 60 150 L60 168 L40 168 Z" fill="#3E5C29" />
        <path d="M330 140 C 330 118, 354 118, 354 140 L354 162 L330 162 Z" fill="#3E5C29" />
      </g>
    </svg>
  );
}
