type FlashWearerProps = {
  frame: string;
  accent: string;
  seed?: number;
  className?: string;
};

/** Grainy flash-photography portrait wearing the product glasses */
export function FlashWearer({
  frame,
  accent,
  seed = 1,
  className = "",
}: FlashWearerProps) {
  const tilt = ((seed % 5) - 2) * 2.5;
  const flashX = 90 + (seed % 3) * 40;
  const flashY = 40 + (seed % 4) * 18;
  const hair = seed % 2 === 0 ? "#1a1a1a" : "#0a0a0a";
  const skin = seed % 3 === 0 ? "#c4a484" : seed % 3 === 1 ? "#8d6e4c" : "#e0b896";
  const uid = `fw-${seed}`;

  return (
    <svg
      viewBox="0 0 320 240"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
      preserveAspectRatio="xMidYMid slice"
      style={{ transform: `rotate(${tilt}deg) scale(1.12)` }}
    >
      <defs>
        <filter id={`${uid}-grain`} x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="1.1"
            numOctaves="3"
            stitchTiles="stitch"
            result="noise"
          />
          <feColorMatrix type="saturate" values="0" in="noise" result="mono" />
          <feBlend in="SourceGraphic" in2="mono" mode="overlay" />
        </filter>
        <radialGradient
          id={`${uid}-flash`}
          cx={`${flashX}`}
          cy={`${flashY}`}
          r="160"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="35%" stopColor="#ffffff" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.85" />
        </radialGradient>
        <clipPath id={`${uid}-crop`}>
          <rect x="0" y="0" width="320" height="240" />
        </clipPath>
      </defs>

      <g clipPath={`url(#${uid}-crop)`} filter={`url(#${uid}-grain)`}>
        <rect width="320" height="240" fill="#0a0a0a" />
        <rect width="320" height="240" fill={`url(#${uid}-flash)`} />

        <ellipse cx="160" cy="250" rx="120" ry="70" fill="#111" />
        <path
          d="M40 240 Q80 170 160 175 Q240 170 280 240"
          fill={seed % 2 === 0 ? "#1c1c1c" : "#2a1810"}
        />

        <rect x="140" y="155" width="40" height="40" fill={skin} />
        <ellipse cx="160" cy="110" rx="58" ry="70" fill={skin} />

        <path
          d={
            seed % 3 === 0
              ? "M102 95 Q100 40 160 35 Q220 40 218 95 Q200 55 160 52 Q120 55 102 95"
              : seed % 3 === 1
                ? "M105 100 Q108 38 160 32 Q212 38 215 100 L210 70 Q160 45 110 70 Z"
                : "M100 110 Q105 45 160 38 Q215 45 220 110 Q200 60 160 55 Q120 60 100 110"
          }
          fill={hair}
        />

        <ellipse
          cx={flashX > 160 ? 185 : 135}
          cy="125"
          rx="18"
          ry="22"
          fill="#fff"
          fillOpacity="0.35"
        />

        <path
          d="M160 115 L168 140 L152 140"
          stroke="#000"
          strokeOpacity="0.2"
          strokeWidth="2"
          fill="none"
        />

        <path
          d="M145 155 Q160 162 175 155"
          stroke="#000"
          strokeOpacity="0.35"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
        />

        <g transform="translate(0, 8)">
          <path
            d="M118 108h84"
            stroke={frame}
            strokeWidth="4"
            strokeLinecap="round"
          />
          <rect
            x="88"
            y="92"
            width="52"
            height="38"
            rx="10"
            fill={accent}
            fillOpacity="0.75"
            stroke={frame}
            strokeWidth="5"
          />
          <rect
            x="180"
            y="92"
            width="52"
            height="38"
            rx="10"
            fill={accent}
            fillOpacity="0.75"
            stroke={frame}
            strokeWidth="5"
          />
          <path
            d="M140 108c6-7 18-7 24 0"
            stroke={frame}
            strokeWidth="4.5"
            strokeLinecap="round"
          />
          <ellipse cx="108" cy="105" rx="12" ry="8" fill="#fff" fillOpacity="0.45" />
          <ellipse cx="200" cy="105" rx="12" ry="8" fill="#fff" fillOpacity="0.45" />
        </g>

        <rect
          width="320"
          height="240"
          fill="none"
          stroke="#000"
          strokeWidth="28"
          strokeOpacity="0.4"
        />
      </g>
    </svg>
  );
}
