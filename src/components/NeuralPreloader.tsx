import React, { useEffect, useState, useRef } from 'react';

interface NeuralPreloaderProps {
  onComplete: () => void;
}

export const NeuralPreloader: React.FC<NeuralPreloaderProps> = ({ onComplete }) => {
  const [pct, setPct] = useState(0);
  const [exiting, setExiting] = useState(false);
  
  const pathRef = useRef<SVGPathElement>(null);
  const phaseRef = useRef(0);
  const exitFired = useRef(false);

  useEffect(() => {
    let start: number | null = null;
    let rafId: number;
    const DURATION = 4200; // Slow, satisfying 4.2s load sequence

    const animate = (ts: number) => {
      if (!start) start = ts;
      const elapsed = ts - start;
      const progress = Math.min(elapsed / DURATION, 1);
      
      setPct(progress);
      phaseRef.current += 0.035; // Calmer, slower wave ripple speed

      if (pathRef.current) {
        const waterY = 200 - progress * 200; // 200 is bounding box height
        const amplitude = progress >= 0.98 ? 0 : 11 * (1 - progress); // Dampen wave to flat at 100%
        const frequency = 0.015;
        
        let d = `M 0 200 L 0 ${waterY}`;
        for (let x = 0; x <= 800; x += 10) {
          const y = waterY + Math.sin(x * frequency + phaseRef.current) * amplitude;
          d += ` L ${x} ${y}`;
        }
        d += ` L 800 200 Z`;
        pathRef.current.setAttribute('d', d);
      }

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

    rafId = requestAnimationFrame(animate);
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
        <svg viewBox="0 0 800 200" className="w-full select-none overflow-visible">
          <defs>
            <clipPath id="preloader-wave-clip">
              <path ref={pathRef} d="M 0 200 L 0 200 L 800 200 L 800 200 Z" />
            </clipPath>
          </defs>
          
          {/* Bottom Layer: Dark low-opacity outline text */}
          <text
            x="50%"
            y="55%"
            dominantBaseline="middle"
            textAnchor="middle"
            className="font-bebas font-black tracking-[0.12em]"
            style={{
              fontSize: '110px',
              fill: 'rgba(255, 255, 255, 0.07)',
            }}
          >
            SAMBHRAM
          </text>
          
          {/* Top Layer: Solid White Text clipped by water wave */}
          <text
            x="50%"
            y="55%"
            dominantBaseline="middle"
            textAnchor="middle"
            className="font-bebas font-black tracking-[0.12em]"
            style={{
              fontSize: '110px',
              fill: '#ffffff',
              clipPath: 'url(#preloader-wave-clip)',
            }}
          >
            SAMBHRAM
          </text>
        </svg>

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
