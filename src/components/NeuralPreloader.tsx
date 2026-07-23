import React, { useEffect, useState, useRef } from 'react';

interface NeuralPreloaderProps {
  onComplete: () => void;
}

export const NeuralPreloader: React.FC<NeuralPreloaderProps> = ({ onComplete }) => {
  const [pct, setPct] = useState(0);
  const [exiting, setExiting] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const phaseRef = useRef(0);
  const exitFired = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // High DPI scaling (2x resolution)
    canvas.width = 800 * 2;
    canvas.height = 200 * 2;
    ctx.scale(2, 2);

    let start: number | null = null;
    let rafId: number;
    const DURATION = 4200; // Slow, satisfying 4.2s sequence

    const animate = (ts: number) => {
      if (!start) start = ts;
      const elapsed = ts - start;
      const progress = Math.min(elapsed / DURATION, 1);
      
      setPct(progress);
      phaseRef.current += 0.035; // Calmer wave ripple speed

      const waterY = 200 - progress * 200;
      const amplitude = progress >= 0.98 ? 0 : 11 * (1 - progress);
      const frequency = 0.015;

      // 1. Clear Canvas
      ctx.clearRect(0, 0, 800, 200);

      // Configure text properties (high compatibility across browsers)
      ctx.font = '900 110px "Bebas Neue", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      if ('letterSpacing' in ctx || (ctx as any).letterSpacing !== undefined) {
        try {
          (ctx as any).letterSpacing = '12px';
        } catch (e) {
          // Fallback for older browsers
        }
      }

      // 2. Draw low-opacity background text
      ctx.fillStyle = 'rgba(255, 255, 255, 0.07)';
      ctx.fillText("SAMBHRAM", 400, 100);

      // 3. Draw rising wave path & clip
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(0, 200);
      ctx.lineTo(0, waterY);
      for (let x = 0; x <= 800; x += 10) {
        const y = waterY + Math.sin(x * frequency + phaseRef.current) * amplitude;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(800, 200);
      ctx.closePath();
      ctx.clip();

      // 4. Draw high-opacity white text inside the clipped area
      ctx.fillStyle = '#ffffff';
      ctx.fillText("SAMBHRAM", 400, 100);
      ctx.restore();

      if (progress < 1) {
        rafId = requestAnimationFrame(animate);
      } else {
        // Smooth exit transition once complete
        setTimeout(() => {
          if (!exitFired.current) {
            exitFired.current = true;
            setExiting(true);
            setTimeout(onComplete, 850);
          }
        }, 400);
      }
    };

    // Ensure fonts are loaded before starting animation to guarantee perfect alignment
    document.fonts.ready.then(() => {
      rafId = requestAnimationFrame(animate);
    });

    return () => cancelAnimationFrame(rafId);
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center transition-opacity duration-700 ease-in-out ${
        exiting ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{
        background: '#04060e', // Premium deep obsidian background
      }}
    >
      {/* Subtle background network grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 0.01) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.01) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
          backgroundPosition: 'center center',
        }}
      />

      <div className="w-[90%] max-w-4xl flex flex-col items-center relative z-10">
        {/* High performance 2D Canvas rendering wave fill */}
        <canvas
          ref={canvasRef}
          className="w-full max-w-[800px] aspect-[800/200] select-none"
          style={{ display: 'block' }}
        />

        {/* Loading progress telemetry details */}
        <div className="w-full flex justify-between mt-6 px-4 font-mono text-[10px] tracking-widest text-white/30">
          <div>SYS.BOOT_SEQUENCE: ACTIVE</div>
          <div>
            LOADING... <span className="text-white/80 font-bold">{Math.round(pct * 100)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};
