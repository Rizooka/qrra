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
  radioPlaying: boolean;
  toggleRadio: () => void;
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
  const [radioPlaying, setRadioPlaying] = useState(false);

  const ctxRef = useRef<AudioContext | null>(null);
  const buffersRef = useRef<Partial<Record<"hover" | "add" | "click" | "break", AudioBuffer>>>({});

  // Web Audio synth drone for QRRA Ambient Radio
  const droneNodesRef = useRef<{
    osc1?: OscillatorNode;
    osc2?: OscillatorNode;
    filter?: BiquadFilterNode;
    gain?: GainNode;
    lfo?: OscillatorNode;
  } | null>(null);

  const ensureCtx = useCallback(async () => {
    if (!ctxRef.current) {
      const Ctx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
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
        // ignore audio errors
      }
    },
    [enabled, ensureCtx],
  );

  const stopRadio = useCallback(() => {
    if (droneNodesRef.current) {
      try {
        droneNodesRef.current.gain?.gain.exponentialRampToValueAtTime(0.0001, (ctxRef.current?.currentTime || 0) + 0.5);
        setTimeout(() => {
          droneNodesRef.current?.osc1?.stop();
          droneNodesRef.current?.osc2?.stop();
          droneNodesRef.current?.lfo?.stop();
          droneNodesRef.current = null;
        }, 550);
      } catch {
        droneNodesRef.current = null;
      }
    }
    setRadioPlaying(false);
  }, []);

  const startRadio = useCallback(async () => {
    try {
      const ctx = await ensureCtx();
      stopRadio();

      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      const masterGain = ctx.createGain();

      osc1.type = "sawtooth";
      osc1.frequency.setValueAtTime(55, ctx.currentTime); // Low A

      osc2.type = "sine";
      osc2.frequency.setValueAtTime(110.5, ctx.currentTime); // Slight detuned octave A

      lfo.type = "sine";
      lfo.frequency.setValueAtTime(0.2, ctx.currentTime); // Slow breathing LFO
      lfoGain.gain.setValueAtTime(180, ctx.currentTime);

      filter.type = "lowpass";
      filter.frequency.setValueAtTime(320, ctx.currentTime);

      lfo.connect(filter.frequency);

      masterGain.gain.setValueAtTime(0.001, ctx.currentTime);
      masterGain.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + 1.2);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(masterGain);
      masterGain.connect(ctx.destination);

      osc1.start();
      osc2.start();
      lfo.start();

      droneNodesRef.current = { osc1, osc2, filter, gain: masterGain, lfo };
      setRadioPlaying(true);
      setEnabled(true);
    } catch {
      setRadioPlaying(false);
    }
  }, [ensureCtx, stopRadio]);

  const toggleRadio = useCallback(() => {
    if (radioPlaying) {
      stopRadio();
    } else {
      void startRadio();
    }
  }, [radioPlaying, startRadio, stopRadio]);

  const toggle = useCallback(() => {
    setEnabled((prev) => {
      const next = !prev;
      if (!next && radioPlaying) {
        stopRadio();
      }
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
  }, [ensureCtx, radioPlaying, stopRadio]);

  useEffect(() => {
    return () => {
      stopRadio();
      void ctxRef.current?.close();
    };
  }, [stopRadio]);

  const value = useMemo(
    () => ({
      enabled,
      toggle,
      radioPlaying,
      toggleRadio,
      playHover: () => void play("hover"),
      playAdd: () => void play("add"),
      playClick: () => void play("click"),
      playBreak: () => void play("break"),
    }),
    [enabled, toggle, radioPlaying, toggleRadio, play],
  );

  return <SoundContext.Provider value={value}>{children}</SoundContext.Provider>;
}

export function useSound() {
  const ctx = useContext(SoundContext);
  if (!ctx) throw new Error("useSound must be used within SoundProvider");
  return ctx;
}
