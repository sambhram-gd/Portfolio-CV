import React, { useState, useRef, useEffect } from 'react';

export const FutureReveal: React.FC = () => {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  // Set initial position to center on mobile, or keep track of screen sizing
  useEffect(() => {
    const mobile = window.matchMedia("(max-width: 768px)").matches;
    setIsMobile(mobile);
    
    if (sectionRef.current) {
      const rect = sectionRef.current.getBoundingClientRect();
      setPos({ x: rect.width / 2, y: rect.height / 2 });
    }
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isMobile || !sectionRef.current) return;
    const rect = sectionRef.current.getBoundingClientRect();
    setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleTouch = (e: React.TouchEvent) => {
    if (!sectionRef.current) return;
    const rect = sectionRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    
    // Boundary checks
    const x = Math.max(0, Math.min(touch.clientX - rect.left, rect.width));
    const y = Math.max(0, Math.min(touch.clientY - rect.top, rect.height));
    
    setPos({ x, y });
  };

  return (
    <section 
      ref={sectionRef} 
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouch}
      onTouchStart={handleTouch}
      className="relative h-[65vh] md:h-[80vh] flex items-center justify-center overflow-hidden bg-[#03060f] border-t border-cyan-500/10 cursor-crosshair z-10 touch-none"
    >
      {/* Target scanning reticle lines centered on mouse/finger */}
      <div 
        className="absolute w-full h-[1px] bg-cyan-500/10 pointer-events-none z-20"
        style={{ top: `${pos.y}px`, left: 0 }}
      />
      <div 
        className="absolute w-[1px] h-full bg-cyan-500/10 pointer-events-none z-20"
        style={{ left: `${pos.x}px`, top: 0 }}
      />

      {/* Hidden content layer - revealed by cursor/finger */}
      <div 
        className="absolute inset-0 z-10 pointer-events-none"
        style={{
          background: 'radial-gradient(circle 350px at center, rgba(0, 240, 255, 0.25) 0%, transparent 100%), url(https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=2000)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          maskImage: `radial-gradient(circle ${isMobile ? '120px' : '200px'} at ${pos.x}px ${pos.y}px, black 0%, transparent 100%)`,
          WebkitMaskImage: `radial-gradient(circle ${isMobile ? '120px' : '200px'} at ${pos.x}px ${pos.y}px, black 0%, transparent 100%)`,
        }} 
      />
      
      {/* Green digital scanning frame */}
      <div 
        className="absolute pointer-events-none z-20 w-16 h-16 border-2 border-cyan-400 -translate-x-1/2 -translate-y-1/2 rounded"
        style={{ left: `${pos.x}px`, top: `${pos.y}px` }}
      >
        <div className="absolute top-1 left-2 font-mono text-[7px] text-cyan-400 bg-black/60 px-1 rounded uppercase tracking-widest whitespace-nowrap">
          SCANNING: RETINA_GRID
        </div>
      </div>
      
      <div className="relative z-20 text-center pointer-events-none mix-blend-difference px-4">
        <p className="text-cyan-400 text-xs uppercase tracking-[0.4em] font-mono mb-6">[ SYSTEM_CAPABILITIES ]</p>
        <h2 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black text-white leading-none tracking-tighter font-mono">
          DECIDE.<br/>ORCHESTRATE.<br/>EXECUTE.
        </h2>
      </div>
    </section>
  );
};
