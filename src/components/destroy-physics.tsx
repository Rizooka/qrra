"use client";

import { useCallback, useEffect, useRef } from "react";
import Matter from "matter-js";

type ElementBlock = {
  id: number;
  label: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
  x: number;
  y: number;
  w: number;
  h: number;
};

const DEFAULT_DEBRIS = [
  { label: "QRRA", bgColor: "#B8FF00", textColor: "#0c0c0c", borderColor: "#0c0c0c" },
  { label: "STARE", bgColor: "#FF3B00", textColor: "#f4f2ee", borderColor: "#0c0c0c" },
  { label: "UV400", bgColor: "#0c0c0c", textColor: "#B8FF00", borderColor: "#B8FF00" },
  { label: "SIGNAL", bgColor: "#FF3B00", textColor: "#0c0c0c", borderColor: "#0c0c0c" },
  { label: "ZERO APOLOGY", bgColor: "#00E5A0", textColor: "#0c0c0c", borderColor: "#0c0c0c" },
  { label: "СМОТРИ ПЕРВЫМ", bgColor: "#f4f2ee", textColor: "#0c0c0c", borderColor: "#0c0c0c" },
];

export function DestroyPhysics({ onReboot }: { onReboot: () => void }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<Matter.Engine | null>(null);
  const renderRef = useRef<Matter.Render | null>(null);
  const runnerRef = useRef<Matter.Runner | null>(null);
  const bodiesRef = useRef<Matter.Body[]>([]);

  const teardown = useCallback(() => {
    if (runnerRef.current) Matter.Runner.stop(runnerRef.current);
    if (renderRef.current) {
      Matter.Render.stop(renderRef.current);
      renderRef.current.canvas.remove();
      renderRef.current.textures = {};
    }
    if (engineRef.current) {
      Matter.World.clear(engineRef.current.world, false);
      Matter.Engine.clear(engineRef.current);
    }
    engineRef.current = null;
    renderRef.current = null;
    runnerRef.current = null;
    bodiesRef.current = [];
  }, []);

  const collectPageElements = useCallback((): ElementBlock[] => {
    const viewW = window.innerWidth;
    const viewH = window.innerHeight;
    const selectors = [
      "h1", "h2", "h3", "button", "a.border", "a[data-cursor]",
      ".product-tile", "p.font-bold", "span.font-black", ".marquee-item"
    ];

    const elements = Array.from(document.querySelectorAll(selectors.join(",")));
    const blocks: ElementBlock[] = [];
    const seen = new Set<string>();

    elements.forEach((el, i) => {
      if (blocks.length >= 18) return;
      const htmlEl = el as HTMLElement;
      const rect = htmlEl.getBoundingClientRect();

      // Only pick visible elements in the current viewport
      if (
        rect.top >= -50 &&
        rect.top <= viewH &&
        rect.width >= 35 &&
        rect.height >= 20 &&
        rect.width <= viewW * 0.95 &&
        rect.height <= viewH * 0.8
      ) {
        const text = (htmlEl.innerText || htmlEl.getAttribute("aria-label") || "")
          .trim()
          .replace(/\s+/g, " ")
          .slice(0, 22);

        if (!text || seen.has(text)) return;
        seen.add(text);

        const computed = window.getComputedStyle(htmlEl);
        let bg = computed.backgroundColor;
        if (!bg || bg === "rgba(0, 0, 0, 0)" || bg === "transparent") {
          bg = i % 3 === 0 ? "#FF3B00" : i % 3 === 1 ? "#B8FF00" : "#f4f2ee";
        }
        let fg = computed.color;
        if (!fg || fg === "transparent") fg = "#0c0c0c";

        blocks.push({
          id: i + 1,
          label: text.toUpperCase(),
          bgColor: bg,
          textColor: fg === bg ? "#0c0c0c" : fg,
          borderColor: "#0c0c0c",
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
          w: Math.max(80, Math.min(rect.width, 360)),
          h: Math.max(36, Math.min(rect.height, 120)),
        });
      }
    });

    // Fallback if page had very few matching elements
    if (blocks.length < 5) {
      DEFAULT_DEBRIS.forEach((d, i) => {
        blocks.push({
          id: 100 + i,
          label: d.label,
          bgColor: d.bgColor,
          textColor: d.textColor,
          borderColor: d.borderColor,
          x: 100 + Math.random() * (viewW - 200),
          y: 80 + i * 50,
          w: 140 + Math.random() * 80,
          h: 44,
        });
      });
    }

    return blocks;
  }, []);

  const bootPhysics = useCallback(() => {
    const host = hostRef.current;
    if (!host) return;
    teardown();

    const w = window.innerWidth;
    const h = window.innerHeight;
    const engine = Matter.Engine.create({ gravity: { x: 0, y: 1.25 } });
    engineRef.current = engine;

    const wallOpts = { isStatic: true, render: { visible: false } };
    const walls = [
      Matter.Bodies.rectangle(w / 2, h + 30, w + 400, 60, wallOpts),
      Matter.Bodies.rectangle(-30, h / 2, 60, h * 3, wallOpts),
      Matter.Bodies.rectangle(w + 30, h / 2, 60, h * 3, wallOpts),
    ];

    const blocks = collectPageElements();

    const pieces = blocks.map((b) => {
      const body = Matter.Bodies.rectangle(b.x, b.y, b.w, b.h, {
        restitution: 0.45,
        friction: 0.1,
        frictionAir: 0.015,
        angle: (Math.random() - 0.5) * 0.4,
        render: {
          fillStyle: b.bgColor,
          strokeStyle: b.borderColor,
          lineWidth: 2,
        },
        label: b.label,
      });

      // Give real element blocks an initial explosion impulse from their positions
      Matter.Body.setVelocity(body, {
        x: (Math.random() - 0.5) * 14,
        y: -3 - Math.random() * 8,
      });
      Matter.Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.25);
      return body;
    });

    const lenses = Array.from({ length: 6 }, (_, i) =>
      Matter.Bodies.circle(
        80 + Math.random() * (w - 160),
        -100 - i * 50,
        24 + Math.random() * 16,
        {
          restitution: 0.8,
          friction: 0.02,
          render: {
            fillStyle: i % 2 === 0 ? "#B8FF00" : "#FF3B00",
            strokeStyle: "#0c0c0c",
            lineWidth: 3,
          },
          label: "LENS",
        },
      ),
    );

    bodiesRef.current = [...pieces, ...lenses];
    Matter.World.add(engine.world, [...walls, ...bodiesRef.current]);

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    canvas.className = "absolute inset-0 h-full w-full";
    host.innerHTML = "";
    host.appendChild(canvas);

    const render = Matter.Render.create({
      canvas,
      engine,
      options: {
        width: w,
        height: h,
        wireframes: false,
        background: "transparent",
        pixelRatio: Math.min(window.devicePixelRatio || 1, 2),
      },
    });
    renderRef.current = render;

    Matter.Events.on(render, "afterRender", () => {
      const ctx = render.context;
      ctx.save();
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      bodiesRef.current.forEach((body) => {
        if (!body.label || body.label === "LENS") return;
        ctx.save();
        ctx.translate(body.position.x, body.position.y);
        ctx.rotate(body.angle);
        ctx.fillStyle = body.render.fillStyle === "#0c0c0c" || body.render.fillStyle === "rgb(12, 12, 12)" ? "#f4f2ee" : "#0c0c0c";
        ctx.font = "bold 13px sans-serif";

        const text = body.label.length > 20 ? body.label.slice(0, 18) + "…" : body.label;
        ctx.fillText(text, 0, 0);
        ctx.restore();
      });
      ctx.restore();
    });

    Matter.Render.run(render);
    const runner = Matter.Runner.create();
    runnerRef.current = runner;
    Matter.Runner.run(runner, engine);

    const mouse = Matter.Mouse.create(canvas);
    const mouseConstraint = Matter.MouseConstraint.create(engine, {
      mouse,
      constraint: { stiffness: 0.2, render: { visible: false } },
    });
    Matter.World.add(engine.world, mouseConstraint);
  }, [collectPageElements, teardown]);

  useEffect(() => {
    bootPhysics();
    let resizeTimer = 0;
    const onResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => bootPhysics(), 250);
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.clearTimeout(resizeTimer);
      window.removeEventListener("resize", onResize);
      teardown();
    };
  }, [bootPhysics, teardown]);

  return (
    <div className="fixed inset-0 z-[20000] bg-ink/90 backdrop-blur-sm">
      <div ref={hostRef} className="absolute inset-0" />
      <div className="pointer-events-none absolute inset-x-0 top-8 text-center px-4">
        <p className="font-[family-name:var(--font-display)] text-2xl font-black uppercase tracking-widest text-acid sm:text-4xl drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">
          Сайт разрушен
        </p>
        <p className="mt-1 text-xs uppercase tracking-[0.16em] text-paper/70 font-semibold sm:text-sm">
          Элементы этой страницы обрушились. Тащи их мышкой.
        </p>
      </div>

      <button
        type="button"
        onClick={onReboot}
        data-cursor="hover"
        className="pointer-events-auto absolute bottom-8 left-1/2 z-10 -translate-x-1/2 border-2 border-acid bg-acid px-8 py-3.5 font-[family-name:var(--font-display)] text-xs font-black uppercase tracking-[0.2em] text-ink shadow-[4px_4px_0_#FF3B00] transition-all hover:scale-105 hover:bg-signal hover:border-signal hover:text-paper sm:px-10 sm:py-4 sm:text-sm"
      >
        Перезапуск системы
      </button>
    </div>
  );
}
