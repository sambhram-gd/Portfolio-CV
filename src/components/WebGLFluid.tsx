import React, { useEffect, useRef } from 'react';
import { FluidSolver, DEFAULT_CONFIG } from '../utils/fluidSolver';
import type { FluidConfig } from '../utils/fluidSolver';

/* ─── Colour palette for splats ─────────────────────────────────── */
const PALETTE: [number, number, number][] = [
  [0.15, 0.25, 0.75],   // deep indigo
  [0.55, 0.12, 0.65],   // violet
  [0.10, 0.60, 0.45],   // emerald
  [0.20, 0.35, 0.85],   // royal blue
  [0.65, 0.20, 0.55],   // magenta
  [0.08, 0.45, 0.72],   // ocean
];

function randomColor(): [number, number, number] {
  return PALETTE[Math.floor(Math.random() * PALETTE.length)];
}

/* ─── Component ─────────────────────────────────────────────────── */
interface Props {
  config?: Partial<FluidConfig>;
}

export const WebGLFluid: React.FC<Props> = ({ config }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const solverRef = useRef<FluidSolver | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    /* ── Resize canvas to window ───────────────────────────────── */
    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    /* ── Init WebGL ────────────────────────────────────────────── */
    const gl = canvas.getContext('webgl', {
      alpha: true,
      depth: false,
      stencil: false,
      antialias: false,
      preserveDrawingBuffer: false,
    });

    if (!gl) {
      console.warn('WebGL unavailable — fluid simulation disabled');
      return;
    }

    const mergedConfig = { ...DEFAULT_CONFIG, ...config };
    const solver = new FluidSolver(gl, mergedConfig);
    solverRef.current = solver;

    /* ── Mouse tracking ────────────────────────────────────────── */
    let mouseX = 0, mouseY = 0;
    let lastX  = 0, lastY  = 0;
    let mouseDown = false;

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX / canvas.width;
      mouseY = 1.0 - e.clientY / canvas.height;

      const dx = (mouseX - lastX) * mergedConfig.SPLAT_FORCE;
      const dy = (mouseY - lastY) * mergedConfig.SPLAT_FORCE;

      if (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1) {
        const force = mouseDown ? 3 : 1;
        solver.splat(mouseX, mouseY, dx * force, dy * force, randomColor());
      }

      lastX = mouseX;
      lastY = mouseY;
    };

    const onMouseDown = () => { mouseDown = true; };
    const onMouseUp   = () => { mouseDown = false; };

    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      for (let i = 0; i < e.touches.length; i++) {
        const t = e.touches[i];
        const x = t.clientX / canvas.width;
        const y = 1.0 - t.clientY / canvas.height;
        const dx = (x - lastX) * mergedConfig.SPLAT_FORCE;
        const dy = (y - lastY) * mergedConfig.SPLAT_FORCE;
        solver.splat(x, y, dx, dy, randomColor());
        lastX = x;
        lastY = y;
      }
    };

    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('touchmove', onTouchMove, { passive: false });

    /* ── RAF loop ──────────────────────────────────────────────── */
    let rafId: number;
    let lastTime = performance.now();
    const frame = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.016667);
      lastTime = now;

      solver.step(dt);
      solver.render();

      rafId = requestAnimationFrame(frame);
    };

    rafId = requestAnimationFrame(frame);

    /* ── Cleanup ───────────────────────────────────────────────── */
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      canvas.removeEventListener('touchmove', onTouchMove);
    };
  }, [config]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'auto',
        display: 'block',
      }}
    />
  );
};
