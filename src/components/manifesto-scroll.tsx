"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";

const LINES = [
  "Конкуренты делают «красиво».",
  "Мы делаем так,",
  "чтобы тебя заметили.",
];

const THESES = [
  {
    n: "01",
    title: "Взгляд — жест",
    body: "Очки QRRA не дополняют образ. Они его объявляют. Если оправа не меняет, как на тебя смотрят — это не QRRA.",
  },
  {
    n: "02",
    title: "Не милые. Не нейтральные.",
    body: "Мы не смягчаем цвет, силуэт и тон «под всех». Кислота, сигнал, чёрный мат — без скидки на вкус толпы.",
  },
  {
    n: "03",
    title: "Unisex без оговорок",
    body: "Нет «для него» и «для неё». One size. Одна система. Лицо либо держит оправу — либо нет.",
  },
  {
    n: "04",
    title: "UV400. Zero apology.",
    body: "Защита — не маркетинг в сноске. Это базовая броня. Солнце не отменяет характер.",
  },
  {
    n: "05",
    title: "Смотри первым",
    body: "Мы не ждём, пока рынок разрешит. Диктуем правила: улица, flash, скорость. Остальное — шум конкурентов.",
  },
];

export function ManifestoScroll() {
  const ref = useRef<HTMLElement>(null);
  const inView = useRef(false);
  const [progress, setProgress] = useState(0);
  const lastY = useRef(0);
  const lastT = useRef(0);

  const velocity = useMotionValue(0);
  const springVel = useSpring(velocity, {
    stiffness: 120,
    damping: 22,
    mass: 0.6,
  });
  const tracking = useTransform(springVel, [0, 2.5], ["-0.04em", "0.18em"]);
  const stretch = useTransform(springVel, [0, 2.5], [1, 1.22]);
  const weight = useTransform(springVel, [0, 2.5], [700, 900]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let raf = 0;

    const io = new IntersectionObserver(
      ([entry]) => {
        inView.current = entry.isIntersecting;
        if (!entry.isIntersecting) velocity.set(0);
      },
      { rootMargin: "10% 0px" },
    );
    io.observe(el);

    const update = () => {
      if (!inView.current) return;
      const rect = el.getBoundingClientRect();
      const view = window.innerHeight;
      const start = view * 0.85;
      const end = view * 0.15;
      const raw = (start - rect.top) / (start - end + rect.height * 0.45);
      setProgress(Math.min(1, Math.max(0, raw)));

      const now = performance.now();
      const y = window.scrollY;
      const dt = Math.max((now - lastT.current) / 1000, 0.001);
      const dy = Math.abs(y - lastY.current);
      velocity.set(Math.min(dy / dt / 900, 3));
      lastY.current = y;
      lastT.current = now;
    };

    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };

    lastY.current = window.scrollY;
    lastT.current = performance.now();
    update();

    const idle = window.setInterval(() => {
      if (!inView.current) return;
      const v = velocity.get();
      if (v < 0.01) return;
      velocity.set(v * 0.86);
    }, 50);

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      clearInterval(idle);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [velocity]);

  const clip = `inset(${(1 - progress) * 100}% 0 0 0)`;

  return (
    <section
      id="manifesto"
      ref={ref}
      className="relative overflow-hidden border-b-2 border-ink bg-paper"
    >
      <div className="relative mx-auto max-w-[1600px] px-4 py-24 sm:px-6 lg:px-10 lg:py-36">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-signal">
            Манифест / 5 тезисов
          </p>
          <p className="max-w-sm text-[11px] uppercase leading-relaxed tracking-[0.12em] text-mute">
            Это не аксессуар. Это позиция.
          </p>
        </div>

        <div className="relative mt-8 overflow-visible">
          <motion.h2
            aria-hidden
            className="origin-left font-[family-name:var(--font-display)] text-[clamp(2.2rem,7vw,5.5rem)] font-black leading-[1.02] text-ink"
            style={{
              letterSpacing: tracking,
              scaleX: stretch,
              fontWeight: weight,
            }}
          >
            {LINES.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </motion.h2>

          <motion.h2
            className="pointer-events-none absolute inset-0 origin-left font-[family-name:var(--font-display)] text-[clamp(2.2rem,7vw,5.5rem)] font-black leading-[1.02] text-signal"
            style={{
              clipPath: clip,
              letterSpacing: tracking,
              scaleX: stretch,
              fontWeight: weight,
            }}
            aria-hidden
          >
            {LINES.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </motion.h2>

          <h2 className="sr-only">
            Конкуренты делают «красиво». Мы делаем так, чтобы тебя заметили.
          </h2>
        </div>

        <div className="mt-10 max-w-2xl space-y-4 text-base leading-relaxed text-mute sm:text-lg">
          <p style={{ color: progress > 0.35 ? "var(--ink)" : undefined }}>
            QRRA родился против спокойных витрин и «доступной роскоши», которая
            боится цвета. Мы не просим разрешения выглядеть громко. Мы фиксируем
            взгляд — и оставляем конкурентам мягкий минимализм.
          </p>
          <p style={{ color: progress > 0.5 ? "var(--ink)" : undefined }}>
            Каждая оправа — удар: геометрия, материал, UV400. Без смягчения.
            Без «на любой случай». Либо носишь систему — либо листаешь дальше.
          </p>
        </div>

        <div className="mt-16 grid border-2 border-ink md:grid-cols-2 lg:grid-cols-3">
          {THESES.map((thesis, i) => {
            const revealAt = 0.25 + i * 0.12;
            const revealed = progress >= revealAt;
            return (
              <article
                key={thesis.n}
                className={`border-ink p-6 sm:p-8 ${
                  i < 4 ? "border-b-2" : ""
                } ${i % 2 === 0 ? "md:border-r-2" : ""} ${
                  i === 2 ? "md:border-r-0 lg:border-r-2" : ""
                } ${i === 3 ? "lg:border-r-2" : ""} ${
                  i >= 3 ? "lg:border-b-0" : "lg:border-b-2"
                } ${i === 4 ? "md:col-span-2 lg:col-span-1 md:border-r-0" : ""}`}
              >
                <p
                  className={`font-[family-name:var(--font-display)] text-sm font-bold transition-colors duration-300 ${
                    revealed ? "text-signal" : "text-mute"
                  }`}
                >
                  {thesis.n}
                </p>
                <h3
                  className={`mt-3 font-[family-name:var(--font-display)] text-xl font-extrabold tracking-tight transition-colors duration-300 sm:text-2xl ${
                    revealed ? "text-ink" : "text-mute"
                  }`}
                >
                  {thesis.title}
                </h3>
                <p
                  className={`mt-3 text-sm leading-relaxed transition-colors duration-300 sm:text-[15px] ${
                    revealed ? "text-ink/75" : "text-mute/70"
                  }`}
                >
                  {thesis.body}
                </p>
              </article>
            );
          })}

          <div className="flex flex-col justify-between border-t-2 border-ink bg-signal p-6 text-ink md:col-span-2 lg:col-span-2 lg:border-l-2 lg:border-t-0">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em]">
                Итог
              </p>
              <p className="mt-4 font-[family-name:var(--font-display)] text-2xl font-black leading-tight tracking-tight sm:text-3xl">
                Не копируй взгляд.
                <br />
                Купи свой.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 h-1 w-full max-w-xs bg-ink/10">
          <div
            className="h-full bg-signal"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </div>
    </section>
  );
}
