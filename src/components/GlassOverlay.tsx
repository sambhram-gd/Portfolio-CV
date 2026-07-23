import React, { useEffect, useRef, useState } from "react";

export const GlassOverlay: React.FC = () => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [coordinates, setCoordinates] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setCoordinates({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 pointer-events-none z-[4] overflow-hidden"
    >
      {/* Dynamic Cyber Grid Background */}
      <div className="absolute inset-0 cyber-grid opacity-[0.25] mix-blend-screen" />

      {/* Futuristic Scanline / CRT overlay */}
      <div className="absolute inset-0 scanline-overlay opacity-[0.05] pointer-events-none" />

      {/* Ambient floating neon grid spots */}
      <div className="absolute top-[15%] left-[10%] w-[250px] h-[250px] rounded-full bg-cyan-500/10 blur-[120px] mix-blend-screen animate-pulse" style={{ animationDuration: '6s' }} />
      <div className="absolute bottom-[20%] right-[15%] w-[300px] h-[300px] rounded-full bg-emerald-500/5 blur-[150px] mix-blend-screen animate-pulse" style={{ animationDuration: '9s' }} />

      {/* Screen HUD telemetry text */}
      <div className="absolute top-6 left-6 font-mono text-[9px] text-cyan-500/40 hidden lg:block tracking-widest leading-relaxed">
        <div>SYS_PORTAL: ACTIVE</div>
        <div>AGENT_ORCHESTRATOR: ONLINE</div>
        <div>STABLE_DIMS: 1920 x 1080</div>
      </div>

      <div className="absolute top-6 right-6 font-mono text-[9px] text-cyan-500/40 hidden lg:block tracking-widest text-right leading-relaxed">
        <div>COORDS: X={coordinates.x} | Y={coordinates.y}</div>
        <div>WEIGHTS: fp16_precision</div>
        <div>FPS: 60.00</div>
      </div>

      {/* Top and Bottom decorative horizontal line grids */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />

      {/* Small floating digital nodes/metrics */}
      <div className="absolute top-[35%] right-[5%] border border-cyan-500/20 bg-cyan-950/20 px-2 py-1 rounded font-mono text-[8px] text-cyan-400/50 hidden xl:block">
        <div>MODEL: PatchCore</div>
        <div>ROC_VAL: 1.000</div>
      </div>

      <div className="absolute bottom-[35%] left-[3%] border border-emerald-500/20 bg-emerald-950/20 px-2 py-1 rounded font-mono text-[8px] text-emerald-400/50 hidden xl:block">
        <div>AGENT: LangChain</div>
        <div>STATE: Reasoning</div>
      </div>
    </div>
  );
};
