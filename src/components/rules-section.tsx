const RULES = [
  {
    n: "01",
    title: "Не прячь лицо",
    body: "Оправа — жест. Если сомневаешься, бери громче.",
  },
  {
    n: "02",
    title: "One size — не компромисс",
    body: "Unisex. Средняя посадка. Система не делит на «для него / для неё».",
  },
  {
    n: "03",
    title: "Смотри первым",
    body: "UV400. Улица. Ноль извинений. Остальное — шум.",
  },
];

export function RulesSection() {
  return (
    <section className="border-b-2 border-ink bg-ink text-paper">
      <div className="mx-auto max-w-[1600px] px-4 py-20 sm:px-6 lg:px-10 lg:py-28">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-acid">
          Правила ношения
        </p>
        <h2 className="mt-4 max-w-3xl font-[family-name:var(--font-display)] text-[clamp(2rem,5vw,3.5rem)] font-black leading-[1.05] tracking-tight">
          Три правила. Без FAQ.
        </h2>

        <ol className="mt-14 grid gap-8 border-t border-paper/20 pt-10 md:grid-cols-3 md:gap-6">
          {RULES.map((rule) => (
            <li key={rule.n} className="md:border-l md:border-paper/20 md:pl-6">
              <p className="font-[family-name:var(--font-display)] text-sm font-bold text-signal">
                {rule.n}
              </p>
              <h3 className="mt-3 font-[family-name:var(--font-display)] text-xl font-extrabold tracking-tight sm:text-2xl">
                {rule.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-paper/65">
                {rule.body}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
