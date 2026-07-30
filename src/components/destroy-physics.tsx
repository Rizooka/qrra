"use client";

import { useCallback, useEffect, useRef } from "react";
import Matter from "matter-js";

type Debris = {
  id: number;
  label: string;
  color: string;
  w: number;
  h: number;
};

const DEBRIS: Debris[] = [
  { id: 1, label: "QRRA", color: "#B8FF00", w: 180, h: 48 },
  { id: 2, label: "STARE", color: "#FF3B00", w: 120, h: 40 },
  { id: 3, label: "UV400", color: "#B8FF00", w: 100, h: 100 },
  { id: 4, label: "SIGNAL", color: "#FF3B00", w: 140, h: 36 },
  { id: 5, label: "RIOT", color: "#00E5A0", w: 110, h: 40 },
  { id: 6, label: "СМОТРИ", color: "#f4f2ee", w: 150, h: 42 },
  { id: 7, label: "ПЕРВЫМ", color: "#FF3B00", w: 150, h: 42 },
  { id: 8, label: "◎", color: "#B8FF00", w: 70, h: 70 },
  { id: 9, label: "◎", color: "#FF3B00", w: 56, h: 56 },
  { id: 10, label: "БЕЗ ПОЩАДЫ", color: "#f4f2ee", w: 140, h: 36 },
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

  const bootPhysics = useCallback(() => {
    const host = hostRef.current;
    if (!host) return;
    teardown();

    const w = window.innerWidth;
    const h = window.innerHeight;
    const engine = Matter.Engine.create({ gravity: { x: 0, y: 1.15 } });
    engineRef.current = engine;

    const wallOpts = { isStatic: true, render: { visible: false } };
    const walls = [
      Matter.Bodies.rectangle(w / 2, h + 40, w + 200, 80, wallOpts),
      Matter.Bodies.rectangle(-40, h / 2, 80, h * 2, wallOpts),
      Matter.Bodies.rectangle(w + 40, h / 2, 80, h * 2, wallOpts),
    ];

    const pieces = DEBRIS.map((d, i) => {
      const body = Matter.Bodies.rectangle(
        80 + Math.random() * (w - 160),
        -80 - i * 40,
        d.w,
        d.h,
        {
          restitution: 0.55,
          friction: 0.08,
          frictionAir: 0.012,
          angle: (Math.random() - 0.5) * 1.2,
          render: {
            fillStyle: d.color,
            strokeStyle: "#0c0c0c",
            lineWidth: 3,
          },
          label: d.label,
        },
      );
      Matter.Body.setVelocity(body, {
        x: (Math.random() - 0.5) * 18,
        y: Math.random() * 6,
      });
      return body;
    });

    const lenses = Array.from({ length: 6 }, (_, i) =>
      Matter.Bodies.circle(
        100 + Math.random() * (w - 200),
        -200 - i * 40,
        28 + Math.random() * 18,
        {
          restitution: 0.85,
          friction: 0.02,
          render: {
            fillStyle: i % 2 === 0 ? "#B8FF00" : "#FF3B00",
            strokeStyle: "#0c0c0c",
            lineWidth: 4,
          },
          label: "lens",
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
        pixelRatio: 1,
      },
    });
    renderRef.current = render;

    Matter.Events.on(render, "afterRender", () => {
      const ctx = render.context;
      ctx.save();
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      bodiesRef.current.forEach((body) => {
        if (body.label === "lens") return;
        ctx.save();
        ctx.translate(body.position.x, body.position.y);
        ctx.rotate(body.angle);
        ctx.fillStyle = "#0c0c0c";
        ctx.font = "800 16px Unbounded, sans-serif";
        ctx.fillText(body.label, 0, 0);
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
      constraint: { stiffness: 0.15, render: { visible: false } },
    });
    Matter.World.add(engine.world, mouseConstraint);
  }, [teardown]);

  useEffect(() => {
    bootPhysics();
    let resizeTimer = 0;
    const onResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => bootPhysics(), 200);
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.clearTimeout(resizeTimer);
      window.removeEventListener("resize", onResize);
      teardown();
    };
  }, [bootPhysics, teardown]);

  return (
    <div className="fixed inset-0 z-[20000] bg-ink/92">
      <div ref={hostRef} className="absolute inset-0" />
      <div className="pointer-events-none absolute inset-x-0 top-10 text-center">
        <p className="font-[family-name:var(--font-display)] text-2xl font-black uppercase tracking-widest text-acid sm:text-4xl">
          Система сломана
        </p>
        <p className="mt-2 text-sm text-paper/60">
          Оправы в свободном падении. Правила отменены.
        </p>
      </div>
      <button
        type="button"
        onClick={onReboot}
        data-cursor="hover"
        className="pointer-events-auto absolute bottom-10 left-1/2 z-10 -translate-x-1/2 border-2 border-acid bg-acid px-10 py-4 font-[family-name:var(--font-display)] text-sm font-extrabold uppercase tracking-[0.2em] text-ink shadow-[6px_6px_0_#FF3B00] hover:bg-signal hover:border-signal hover:text-paper"
      >
        Перезапуск
      </button>
    </div>
  );
}
