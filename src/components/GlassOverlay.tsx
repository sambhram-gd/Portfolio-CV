import React, { useRef, useEffect } from "react";
import gsap from "gsap";

export const GlassOverlay: React.FC = () => {
  const elementsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const isMobile = window.matchMedia("(max-width: 768px)").matches;

    // Subtle idle floating/rotation for solid elements
    elementsRef.current.forEach((el, index) => {
      if (!el) return;
      const rotDir = index % 2 === 0 ? 1 : -1;
      gsap.to(el, {
        rotation: `+=${rotDir * (isMobile ? 10 : 20 + index * 5)}`,
        y: `+=${isMobile ? 10 : 25 + index * 8}`,
        duration: 8 + index * 2,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut"
      });
    });

    const handleMouseMove = (e: MouseEvent) => {
      if (isMobile) return;
      const { innerWidth, innerHeight } = window;
      // Parallax calculations
      const x = (e.clientX / innerWidth - 0.5) * 60;
      const y = (e.clientY / innerHeight - 0.5) * 60;
      
      elementsRef.current.forEach((el, index) => {
        if (!el) return;
        const depth = (index + 1) * 0.4;
        gsap.to(el, {
          x: x * depth,
          y: y * depth,
          duration: 1.2,
          ease: "power2.out"
        });
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[5] overflow-hidden opacity-80 mix-blend-screen" style={{ perspective: '800px' }}>
      
      {/* Element 1: Solid Glowing Sphere / Orb */}
      <div 
        ref={el => { elementsRef.current[0] = el; }} 
        className="absolute top-[10%] left-[5%] w-[120px] h-[120px] md:w-[180px] md:h-[180px] rounded-full bg-gradient-to-br from-emerald-500/40 to-slate-900/80 shadow-[inset_-10px_-10px_30px_rgba(0,0,0,0.8),_0_0_40px_rgba(16,185,129,0.3)] backdrop-blur-md"
        style={{ transformStyle: 'preserve-3d' }}
      />

      {/* Element 2: Solid Floating Data Block (Cube-like) */}
      <div 
        ref={el => { elementsRef.current[1] = el; }} 
        className="absolute bottom-[15%] right-[8%] w-[140px] h-[140px] md:w-[200px] md:h-[200px] rounded-2xl bg-gradient-to-tr from-blue-600/30 via-slate-800/60 to-emerald-500/20 border border-white/10 shadow-[inset_2px_2px_15px_rgba(255,255,255,0.1),_10px_20px_30px_rgba(0,0,0,0.5)] backdrop-blur-lg rotate-12 flex items-end justify-end p-4"
        style={{ transformStyle: 'preserve-3d' }}
      >
        <div className="text-[10px] font-mono font-bold text-white/60 tracking-wider">BLK_SYS.01</div>
      </div>

      {/* Element 3: Solid Tech Pill / Capsule */}
      <div 
        ref={el => { elementsRef.current[2] = el; }} 
        className="absolute top-[35%] right-[20%] w-[60px] h-[160px] md:w-[80px] md:h-[220px] rounded-full bg-slate-900/80 border-2 border-emerald-500/30 shadow-[inset_0_0_20px_rgba(16,185,129,0.2),_0_10px_30px_rgba(0,0,0,0.6)] backdrop-blur-md -rotate-45 overflow-hidden flex flex-col justify-between py-6 items-center"
      >
        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
        <div className="w-2 h-2 rounded-full bg-white/20"></div>
      </div>

      {/* Element 4: Solid Diamond / Pyramid Shape */}
      <div 
        ref={el => { elementsRef.current[3] = el; }} 
        className="hidden md:flex absolute bottom-[25%] left-[20%] w-[120px] h-[120px] bg-gradient-to-b from-white/10 to-slate-900/90 border border-white/15 shadow-[0_15px_35px_rgba(0,0,0,0.4)] backdrop-blur-xl rotate-45 items-center justify-center"
      >
        <div className="w-[60px] h-[60px] border border-emerald-500/40 rotate-0"></div>
      </div>
      
    </div>
  );
};
