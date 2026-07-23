import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const stats = [
  { target: 5,    suffix: '+', label: 'AI Projects Built', code: 'SYS_0x01' },
  { target: 98,   suffix: '%', label: 'Pixel AUROC (PatchCore)', code: 'SYS_0x02' },
  { target: 4000, suffix: '+', label: 'Images Annotated', code: 'SYS_0x03' },
  { target: 1,    suffix: '',  label: 'IMCL 2025 Publication', code: 'SYS_0x04' },
];

export const StatsCounter: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      stats.forEach((_, i) => {
        const el = document.querySelector(`#stat-${i}`);
        if (!el) return;
        gsap.from(el, {
          textContent: 0,
          duration: 2.5,
          ease: 'power3.out',
          snap: { textContent: 1 },
          scrollTrigger: { 
              trigger: containerRef.current, 
              start: 'top 80%',
          },
        });
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="px-6 md:px-12 lg:px-20 py-32 bg-[#03060f] relative z-10 border-b border-cyan-500/10">
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
        {stats.map((s, i) => (
          <div key={i} className="cyber-card p-6 rounded bg-[#060b1f]/50 border border-cyan-500/10 relative group overflow-hidden">
            {/* Corner tags */}
            <div className="absolute top-2 left-3 font-mono text-[8px] text-cyan-500/50">
              [{s.code}]
            </div>
            <div className="absolute top-2 right-3 font-mono text-[8px] text-emerald-400/60 flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-emerald-400 animate-ping" />
              ONLINE
            </div>

            <div className="mt-6 text-center">
              <p className="text-5xl md:text-6xl font-black text-cyan-400 font-mono tracking-tighter group-hover:scale-105 transition-transform duration-500 drop-shadow-[0_0_10px_rgba(0,240,255,0.2)]">
                <span id={`stat-${i}`}>{s.target}</span>{s.suffix}
              </p>
              <p className="text-cyan-100/60 mt-4 text-xs tracking-widest uppercase font-mono h-8 flex items-center justify-center">
                {s.label}
              </p>
            </div>

            {/* Futuristic Telemetry progress line */}
            <div className="mt-4 w-full h-[2px] bg-cyan-950 rounded overflow-hidden">
              <div 
                className="h-full bg-cyan-400 transition-all duration-1000 delay-300"
                style={{ width: `${s.target > 100 ? 100 : s.target}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
