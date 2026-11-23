export function BrandLogo({ className = 'h-9 w-9' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="ac-bg" x1="8" y1="6" x2="56" y2="58" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#131f38" />
          <stop offset="100%" stopColor="#090f1d" />
        </linearGradient>
        <linearGradient id="ac-globe" x1="12" y1="50" x2="48" y2="16" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="50%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#10b981" />
        </linearGradient>
        <linearGradient id="ac-spark" x1="34" y1="10" x2="54" y2="30" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="55%" stopColor="#facc15" />
          <stop offset="100%" stopColor="#eab308" />
        </linearGradient>
        <radialGradient id="ac-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Rounded app tile */}
      <rect width="64" height="64" rx="16" fill="url(#ac-bg)" />
      <rect
        x="1"
        y="1"
        width="62"
        height="62"
        rx="15"
        stroke="rgba(148, 163, 184, 0.22)"
        strokeWidth="1.5"
      />

      {/* Soft warm glow behind the AI spark */}
      <circle cx="44" cy="20" r="16" fill="url(#ac-glow)" />

      {/* Clean stylized Earth globe */}
      <g stroke="url(#ac-globe)" strokeWidth="2.4" strokeLinecap="round">
        <circle cx="30" cy="34" r="18" />
        {/* Meridian curve */}
        <ellipse cx="30" cy="34" rx="8.5" ry="18" />
        {/* Equator & latitude */}
        <path d="M12.5 34H47.5" />
        <path d="M15.8 24.5C20.5 26.8 25.1 27.8 30 27.8C34.9 27.8 39.5 26.8 44.2 24.5" />
        <path d="M15.8 43.5C20.5 41.2 25.1 40.2 30 40.2C34.9 40.2 39.5 41.2 44.2 43.5" />
      </g>

      {/* Subtle atmospheric coverage arc */}
      <path
        d="M17 16.5C22.5 11.8 30 10 37.5 11.8"
        stroke="#38bdf8"
        strokeOpacity="0.55"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Crisp 4-point AI spark over the planet */}
      <path
        d="M44.5 9.5L47.1 17.4L55 20L47.1 22.6L44.5 30.5L41.9 22.6L34 20L41.9 17.4L44.5 9.5Z"
        fill="url(#ac-spark)"
      />
      <circle cx="44.5" cy="20" r="2.2" fill="#fefce8" />
    </svg>
  );
}
