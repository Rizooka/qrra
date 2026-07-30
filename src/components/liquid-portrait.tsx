"use client";

import { Canvas, useFrame, useThree, type RootState } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform sampler2D uTexture;
  uniform vec2 uMouse;
  uniform float uTime;
  uniform float uStrength;
  uniform vec3 uAccent;
  varying vec2 vUv;

  void main() {
    vec2 uv = vUv;
    vec2 d = uv - uMouse;
    float dist = length(d);
    float ripple = sin(dist * 28.0 - uTime * 8.0) * 0.018 * uStrength;
    float falloff = smoothstep(0.55, 0.0, dist);
    vec2 dir = dist > 0.0001 ? normalize(d) : vec2(0.0);
    uv += dir * ripple * falloff;
    uv += dir * uStrength * 0.08 * falloff;

    float glitch = uStrength * 0.012 * falloff;
    float r = texture2D(uTexture, uv + vec2(glitch, 0.0)).r;
    float g = texture2D(uTexture, uv).g;
    float b = texture2D(uTexture, uv - vec2(glitch, 0.0)).b;

    vec3 col = vec3(r, g, b);
    col = mix(col, uAccent, falloff * uStrength * 0.18);
    gl_FragColor = vec4(col, 1.0);
  }
`;

function DistortionMesh({
  texture,
  accent,
}: {
  texture: THREE.Texture;
  accent: string;
}) {
  const mat = useRef<THREE.ShaderMaterial>(null);
  const { viewport, invalidate } = useThree();
  const mouse = useRef(new THREE.Vector2(0.5, 0.5));
  const strength = useRef(0);
  const last = useRef({ x: 0.5, y: 0.5, t: 0 });

  const uniforms = useMemo(
    () => ({
      uTexture: { value: texture },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uTime: { value: 0 },
      uStrength: { value: 0 },
      uAccent: { value: new THREE.Color(accent) },
    }),
    [texture, accent],
  );

  useFrame((state: RootState) => {
    if (!mat.current) return;
    const mx = (state.pointer.x + 1) / 2;
    const my = (state.pointer.y + 1) / 2;
    const now = state.clock.elapsedTime;
    const dx = mx - last.current.x;
    const dy = my - last.current.y;
    const dt = Math.max(now - last.current.t, 0.001);
    const velocity = Math.sqrt(dx * dx + dy * dy) / dt;

    strength.current = THREE.MathUtils.lerp(
      strength.current,
      Math.min(velocity * 0.35, 1.6),
      0.18,
    );
    strength.current *= 0.92;

    mouse.current.set(mx, my);
    mat.current.uniforms.uMouse.value.copy(mouse.current);
    mat.current.uniforms.uTime.value = now;
    mat.current.uniforms.uStrength.value = strength.current;
    last.current = { x: mx, y: my, t: now };

    // Keep rendering only while distortion is alive
    if (strength.current > 0.01) invalidate();
  });

  return (
    <mesh scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        ref={mat}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  );
}

function Scene({ accent, seed }: { accent: string; seed: number }) {
  const texture = useMemo(() => {
    // Smaller canvas = much cheaper upload + less CPU grain
    const w = 512;
    const h = 384;
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d")!;
    const sx = w / 1024;
    const sy = h / 768;

    ctx.fillStyle = "#0a0a0a";
    ctx.fillRect(0, 0, w, h);

    const grad = ctx.createRadialGradient(
      (280 + seed * 40) * sx,
      180 * sy,
      20,
      512 * sx,
      384 * sy,
      260,
    );
    grad.addColorStop(0, "#ffffff");
    grad.addColorStop(0.25, "#c8c8c8");
    grad.addColorStop(1, "#050505");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = seed % 2 === 0 ? "#1a1a1a" : "#2a1810";
    ctx.beginPath();
    ctx.moveTo(180 * sx, h);
    ctx.quadraticCurveTo(320 * sx, 480 * sy, 512 * sx, 500 * sy);
    ctx.quadraticCurveTo(704 * sx, 480 * sy, 844 * sx, h);
    ctx.fill();

    const skins = ["#c4a484", "#8d6e4c", "#e0b896"];
    ctx.fillStyle = skins[seed % 3];
    ctx.beginPath();
    ctx.ellipse(512 * sx, 340 * sy, 150 * sx, 185 * sy, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#0d0d0d";
    ctx.beginPath();
    ctx.ellipse(512 * sx, 220 * sy, 155 * sx, 120 * sy, 0, Math.PI, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#111";
    ctx.lineWidth = 7;
    ctx.fillStyle = accent;
    ctx.globalAlpha = 0.8;
    roundRect(ctx, 330 * sx, 300 * sy, 130 * sx, 90 * sy, 12);
    ctx.fill();
    ctx.stroke();
    roundRect(ctx, 564 * sx, 300 * sy, 130 * sx, 90 * sy, 12);
    ctx.fill();
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.beginPath();
    ctx.moveTo(460 * sx, 345 * sy);
    ctx.quadraticCurveTo(512 * sx, 320 * sy, 564 * sx, 345 * sy);
    ctx.stroke();

    ctx.fillStyle = "rgba(255,255,255,0.45)";
    ctx.beginPath();
    ctx.ellipse(380 * sx, 330 * sy, 14, 9, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(614 * sx, 330 * sy, 14, 9, -0.3, 0, Math.PI * 2);
    ctx.fill();

    // Sparse grain — every 4th pixel
    const img = ctx.getImageData(0, 0, w, h);
    for (let i = 0; i < img.data.length; i += 16) {
      const n = (Math.random() - 0.5) * 36;
      img.data[i] = Math.min(255, Math.max(0, img.data[i] + n));
      img.data[i + 1] = Math.min(255, Math.max(0, img.data[i + 1] + n));
      img.data[i + 2] = Math.min(255, Math.max(0, img.data[i + 2] + n));
    }
    ctx.putImageData(img, 0, 0);

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.generateMipmaps = false;
    tex.minFilter = THREE.LinearFilter;
    tex.needsUpdate = true;
    return tex;
  }, [accent, seed]);

  useEffect(() => {
    return () => {
      texture.dispose();
    };
  }, [texture]);

  return <DistortionMesh texture={texture} accent={accent} />;
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export function LiquidPortrait({
  accent,
  seed = 1,
  className = "",
}: {
  accent: string;
  seed?: number;
  className?: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const invalidateRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const poke = () => invalidateRef.current?.();
    el.addEventListener("pointermove", poke, { passive: true });
    el.addEventListener("pointerenter", poke, { passive: true });
    return () => {
      el.removeEventListener("pointermove", poke);
      el.removeEventListener("pointerenter", poke);
    };
  }, []);

  return (
    <div ref={wrapRef} className={`relative h-full w-full ${className}`}>
      <Canvas
        dpr={1}
        frameloop="demand"
        camera={{ position: [0, 0, 1], fov: 50 }}
        gl={{
          antialias: false,
          alpha: false,
          powerPreference: "low-power",
          stencil: false,
          depth: false,
        }}
        style={{ width: "100%", height: "100%" }}
        onCreated={({ gl, invalidate }) => {
          gl.setClearColor("#0a0a0a");
          invalidateRef.current = invalidate;
          invalidate();
        }}
      >
        <Scene accent={accent} seed={seed} />
      </Canvas>
    </div>
  );
}
