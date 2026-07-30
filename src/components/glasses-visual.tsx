type GlassesProps = {
  frame: string;
  accent: string;
  className?: string;
};

export function GlassesVisual({ frame, accent, className = "" }: GlassesProps) {
  return (
    <svg
      viewBox="0 0 320 140"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <path
        d="M78 58h164"
        stroke={frame}
        strokeWidth="6"
        strokeLinecap="round"
      />
      <rect
        x="28"
        y="38"
        width="92"
        height="68"
        rx="18"
        fill={accent}
        fillOpacity="0.85"
        stroke={frame}
        strokeWidth="8"
      />
      <rect
        x="200"
        y="38"
        width="92"
        height="68"
        rx="18"
        fill={accent}
        fillOpacity="0.85"
        stroke={frame}
        strokeWidth="8"
      />
      <path
        d="M120 68c8-10 24-10 32 0"
        stroke={frame}
        strokeWidth="7"
        strokeLinecap="round"
      />
      <path
        d="M28 58H12c-4 0-6 3-6 7v8"
        stroke={frame}
        strokeWidth="7"
        strokeLinecap="round"
      />
      <path
        d="M292 58h16c4 0 6 3 6 7v8"
        stroke={frame}
        strokeWidth="7"
        strokeLinecap="round"
      />
      <ellipse
        cx="74"
        cy="68"
        rx="28"
        ry="18"
        fill="white"
        fillOpacity="0.22"
      />
      <ellipse
        cx="246"
        cy="68"
        rx="28"
        ry="18"
        fill="white"
        fillOpacity="0.22"
      />
    </svg>
  );
}
