export function UvSticker({ className = "" }: { className?: string }) {
  return (
    <div
      className={`pointer-events-none absolute z-20 ${className}`}
      aria-hidden
    >
      <div className="animate-sticker origin-center">
        <svg
          viewBox="0 0 120 120"
          width="112"
          height="112"
          className="drop-shadow-[3px_4px_0_rgba(12,12,12,0.35)]"
        >
          <circle cx="60" cy="60" r="56" fill="#B8FF00" stroke="#0c0c0c" strokeWidth="4" />
          <circle
            cx="60"
            cy="60"
            r="48"
            fill="none"
            stroke="#0c0c0c"
            strokeWidth="1.5"
            strokeDasharray="3 4"
          />
          <text
            x="60"
            y="54"
            textAnchor="middle"
            fill="#0c0c0c"
            style={{
              fontFamily: "var(--font-display), sans-serif",
              fontWeight: 900,
              fontSize: "22px",
              letterSpacing: "0.04em",
            }}
          >
            UV400
          </text>
          <text
            x="60"
            y="74"
            textAnchor="middle"
            fill="#0c0c0c"
            style={{
              fontFamily: "var(--font-body), sans-serif",
              fontWeight: 700,
              fontSize: "9px",
              letterSpacing: "0.18em",
            }}
          >
            БЕЗ ПОЩАДЫ
          </text>
        </svg>
      </div>
    </div>
  );
}
