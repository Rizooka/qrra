const phrases = [
  "СМОТРИ ПЕРВЫМ",
  "НЕ ПРОСИМ РАЗРЕШЕНИЯ",
  "UV400 · БЕЗ ИЗВИНЕНИЙ",
  "ВЗГЛЯД — ОРУЖИЕ",
  "QRRA",
  "НЕ МИНИМАЛИЗМ — МАКСИМУМ",
];

export function Marquee({
  tone = "ink",
}: {
  tone?: "ink" | "signal" | "acid";
}) {
  const bg =
    tone === "signal"
      ? "bg-signal text-paper"
      : tone === "acid"
        ? "bg-acid text-ink"
        : "bg-ink text-paper";

  const row = [...phrases, ...phrases];

  return (
    <div className={`overflow-hidden border-y-2 border-ink ${bg}`}>
      <div className="animate-marquee flex w-max whitespace-nowrap py-3">
        {row.map((phrase, i) => (
          <span
            key={`${phrase}-${i}`}
            className="mx-6 font-[family-name:var(--font-display)] text-sm font-bold uppercase tracking-[0.18em] sm:text-base"
          >
            {phrase}
            <span className="ml-6 opacity-40">/</span>
          </span>
        ))}
      </div>
    </div>
  );
}
