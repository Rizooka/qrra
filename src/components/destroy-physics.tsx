"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Matter from "matter-js";

export type ElementBlock = {
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

const DEFAULT_DEBRIS: ElementBlock[] = [
  { id: 1, label: "QRRA", bgColor: "#B8FF00", textColor: "#0c0c0c", borderColor: "#0c0c0c", x: 200, y: 150, w: 180, h: 54 },
  { id: 2, label: "STARE FIRST", bgColor: "#FF3B00", textColor: "#f4f2ee", borderColor: "#0c0c0c", x: 450, y: 200, w: 220, h: 50 },
  { id: 3, label: "UV400 SHIELD", bgColor: "#0c0c0c", textColor: "#B8FF00", borderColor: "#B8FF00", x: 300, y: 280, w: 200, h: 48 },
  { id: 4, label: "ZERO APOLOGY", bgColor: "#B8FF00", textColor: "#0c0c0c", borderColor: "#0c0c0c", x: 600, y: 120, w: 240, h: 56 },
  { id: 5, label: "СМОТРИ ПЕРВЫМ", bgColor: "#f4f2ee", textColor: "#0c0c0c", borderColor: "#0c0c0c", x: 350, y: 360, w: 230, h: 52 },
  { id: 6, label: "ОПРАВА КАДРА", bgColor: "#FF3B00", textColor: "#0c0c0c", borderColor: "#0c0c0c", x: 700, y: 250, w: 210, h: 48 },
];

export function DestroyPhysics({
  initialBlocks,
  onReboot,
}: {
  initialBlocks?: ElementBlock[];
  onReboot: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  const hostRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<Matter.Engine | null>(null);
  const renderRef = useRef<Matter.Render | null>(null);
  const runnerRef = useRef<Matter.Runner | null>(null);
  const bodiesRef = useRef<Matter.Body[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  const bootPhysics = useCallback(() => {
    const host = hostRef.current;
    if (!host) return;
    teardown();

    const w = window.innerWidth;
    const h = window.innerHeight;
    const engine = Matter.Engine.create({ gravity: { x: 0, y: 1.3 } });
    engineRef.current = engine;

    const wallOpts = { isStatic: true, render: { visible: false } };
    const walls = [
      Matter.Bodies.rectangle(w / 2, h + 30, w + 400, 60, wallOpts),
      Matter.Bodies.rectangle(-30, h / 2, 60, h * 3, wallOpts),
      Matter.Bodies.rectangle(w + 30, h / 2, 60, h * 3, wallOpts),
    ];

    const blocks = (initialBlocks && initialBlocks.length > 0) ? initialBlocks : DEFAULT_DEBRIS;

    const pieces = blocks.map((b, idx) => {
      const startX = Math.max(60, Math.min(b.x || 150 + idx * 40, w - 60));
      const startY = Math.max(60, Math.min(b.y || 100 + idx * 30, h - 120));

      const body = Matter.Bodies.rectangle(startX, startY, b.w, b.h, {
        restitution: 0.5,
        friction: 0.1,
        frictionAir: 0.012,
        angle: (Math.random() - 0.5) * 0.3,
        render: {
          fillStyle: b.bgColor || "#B8FF00",
          strokeStyle: "#0c0c0c",
          lineWidth: 2,
        },
        label: b.label,
      });

      Matter.Body.setVelocity(body, {
        x: (Math.random() - 0.5) * 16,
        y: -2 - Math.random() * 6,
      });
      Matter.Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.3);
      return body;
    });

    const lenses = Array.from({ length: 6 }, (_, i) =>
      Matter.Bodies.circle(
        80 + Math.random() * (w - 160),
        -60 - i * 40,
        22 + Math.random() * 16,
        {
          restitution: 0.85,
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
    canvas.className = "absolute inset-0 h-full w-full bg-[#0c0c0c]";
    host.innerHTML = "";
    host.appendChild(canvas);

    const render = Matter.Render.create({
      canvas,
      engine,
      options: {
        width: w,
        height: h,
        wireframes: false,
        background: "#0c0c0c",
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
        ctx.font = "black 14px sans-serif";

        const text = body.label.length > 22 ? body.label.slice(0, 20) + "…" : body.label;
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
  }, [initialBlocks, teardown]);

  useEffect(() => {
    if (!mounted) return;
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
  }, [mounted, bootPhysics, teardown]);

  if (!mounted) return null;

  return createPortal(
    <div id="destroy-physics-overlay" className="fixed inset-0 z-[99999] bg-[#0c0c0c]">
      <div ref={hostRef} className="absolute inset-0" />
      <div className="pointer-events-none absolute inset-x-0 top-8 text-center px-4">
        <p className="font-[family-name:var(--font-display)] text-2xl font-black uppercase tracking-widest text-acid sm:text-4xl drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]">
          САЙТ РАЗРУШЕН
        </p>
        <p className="mt-1 text-xs uppercase tracking-[0.16em] text-paper/80 font-bold sm:text-sm">
          Элементы обрушились. Тащи их мышкой.
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
    </div>,
    document.body,
  );
}
