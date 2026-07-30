"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

type SoundContextValue = {
  enabled: boolean;
  toggle: () => void;
  playHover: () => void;
  playAdd: () => void;
  playClick: () => void;
  playBreak: () => void;
};

const SoundContext = createContext<SoundContextValue | null>(null);

function createClickBuffer(ctx: AudioContext, kind: "hover" | "add" | "click" | "break") {
  const sampleRate = ctx.sampleRate;
  const duration =
    kind === "hover" ? 0.045 : kind === "click" ? 0.06 : kind === "add" ? 0.28 : 0.55;
  const length = Math.floor(sampleRate * duration);
  const buffer = ctx.createBuffer(1, length, sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < length; i++) {
    const t = i / sampleRate;
    const n = Math.random() * 2 - 1;

    if (kind === "hover") {
      // Mechanical shutter / hinge click
      const env = Math.exp(-t * 90);
      const tone = Math.sin(2 * Math.PI * 1800 * t) * 0.35;
      data[i] = (tone + n * 0.55) * env * 0.22;
    } else if (kind === "click") {
      const env = Math.exp(-t * 70);
      data[i] = (Math.sin(2 * Math.PI * 900 * t) * 0.4 + n * 0.4) * env * 0.2;
    } else if (kind === "add") {
      // Heavy stamp / bass swoosh
      const env = Math.exp(-t * 9);
      const bass = Math.sin(2 * Math.PI * (90 - t * 40) * t);
      const thud = Math.sin(2 * Math.PI * 55 * t) * Math.exp(-t * 14);
      data[i] = (bass * 0.55 + thud * 0.7 + n * 0.12 * Math.exp(-t * 20)) * env * 0.55;
    } else {
      // Break / shatter
      const env = Math.exp(-t * 4);
      data[i] = (n * 0.8 + Math.sin(2 * Math.PI * (200 + n * 800) * t) * 0.2) * env * 0.45;
    }
  }

  return buffer;
}

export function SoundProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabled] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);
  const buffersRef = useRef<Partial<Record<"hover" | "add" | "click" | "break", AudioBuffer>>>({});

  const ensureCtx = useCallback(async () => {
    if (!ctxRef.current) {
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      ctxRef.current = new Ctx();
    }
    if (ctxRef.current.state === "suspended") {
      await ctxRef.current.resume();
    }
    const ctx = ctxRef.current;
    (["hover", "add", "click", "break"] as const).forEach((kind) => {
      if (!buffersRef.current[kind]) {
        buffersRef.current[kind] = createClickBuffer(ctx, kind);
      }
    });
    return ctx;
  }, []);

  const play = useCallback(
    async (kind: "hover" | "add" | "click" | "break") => {
      if (!enabled) return;
      try {
        const ctx = await ensureCtx();
        const buffer = buffersRef.current[kind];
        if (!buffer) return;
        const src = ctx.createBufferSource();
        const gain = ctx.createGain();
        src.buffer = buffer;
        gain.gain.value = kind === "add" ? 0.85 : kind === "break" ? 0.7 : 0.45;
        src.connect(gain);
        gain.connect(ctx.destination);
        src.start();
      } catch {
        // ignore autoplay / audio errors
      }
    },
    [enabled, ensureCtx],
  );

  const toggle = useCallback(() => {
    setEnabled((prev) => {
      const next = !prev;
      if (next) {
        void (async () => {
          try {
            const ctx = await ensureCtx();
            const buffer = buffersRef.current.click ?? createClickBuffer(ctx, "click");
            buffersRef.current.click = buffer;
            const src = ctx.createBufferSource();
            const gain = ctx.createGain();
            src.buffer = buffer;
            gain.gain.value = 0.4;
            src.connect(gain);
            gain.connect(ctx.destination);
            src.start();
          } catch {
            // ignore
          }
        })();
      }
      return next;
    });
  }, [ensureCtx]);

  useEffect(() => {
    return () => {
      void ctxRef.current?.close();
    };
  }, []);

  const value = useMemo(
    () => ({
      enabled,
      toggle,
      playHover: () => void play("hover"),
      playAdd: () => void play("add"),
      playClick: () => void play("click"),
      playBreak: () => void play("break"),
    }),
    [enabled, toggle, play],
  );

  return <SoundContext.Provider value={value}>{children}</SoundContext.Provider>;
}

export function useSound() {
  const ctx = useContext(SoundContext);
  if (!ctx) throw new Error("useSound must be used within SoundProvider");
  return ctx;
}
