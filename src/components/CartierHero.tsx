import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { MenuPixelText } from './MenuPixelText';

export const CartierHero: React.FC = () => {
  const photoRef = useRef<HTMLImageElement>(null);
  const scanLineRef = useRef<HTMLDivElement>(null);
  const nameContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    if (isMobile) return;

    const handleMouseMove = (e: MouseEvent) => {
      // Photo Parallax
      if (photoRef.current) {
        const { innerWidth, innerHeight } = window;
        const x = (e.clientX / innerWidth - 0.5);
        const y = (e.clientY / innerHeight - 0.5);
        gsap.to(photoRef.current, {
          x: x * 60, y: y * 60,
          rotationY: x * 15, rotationX: -y * 15,
          duration: 1.2, ease: "power2.out",
          transformPerspective: 1000,
        });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Continuous scanner animation
  useEffect(() => {
    if (!scanLineRef.current) return;
    const tl = gsap.timeline({ repeat: -1 });
    tl.fromTo(scanLineRef.current, 
      { top: '0%' }, 
      { top: '100%', duration: 2.5, ease: "power1.inOut" }
    ).to(scanLineRef.current, 
      { top: '0%', duration: 2.5, ease: "power1.inOut" }
    );
    return () => { tl.kill(); };
  }, []);

  const scrollToProjects = (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById('projects');
    if (!el) return;
    const lenis = (window as any).lenis;
    if (lenis) {
      lenis.scrollTo(el, { duration: 1.4, easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
    } else {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToContact = (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById('contact');
    if (!el) return;
    const lenis = (window as any).lenis;
    if (lenis) {
      lenis.scrollTo(el, { duration: 1.4, easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
    } else {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      className="relative w-full h-[100vh] flex flex-col md:flex-row items-center justify-between px-6 md:px-20 lg:px-32 z-10"
      style={{ perspective: '1000px' }}
    >
      {/* Left Column */}
      <div className="flex flex-col items-start text-left z-20 mt-20 md:mt-0 w-full md:w-1/2">

        {/* Eyebrow */}
        <div className="font-mono text-cyan-400 text-xs tracking-[0.3em] uppercase mb-8 flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-cyan-500 animate-ping" />
          [ AGENT_PORTAL_2026 ]
        </div>

        {/* Name */}
        <div ref={nameContainerRef} className="relative group cursor-none flex flex-col items-start -ml-2">
          <MenuPixelText
            text="SAMBHRAM"
            className="font-bebas text-[clamp(4rem,10vw,8rem)] lg:text-[10rem] xl:text-[12rem] leading-[0.8] text-white tracking-tighter drop-shadow-2xl"
          />
          <MenuPixelText
            text="DODDAMANE"
            className="font-bebas text-[clamp(4rem,10vw,8rem)] lg:text-[10rem] xl:text-[12rem] leading-[0.8] text-white tracking-tighter -mt-[0.1em] drop-shadow-2xl"
          />
        </div>

        {/* Domain tags / Badges */}
        <div className="flex flex-wrap gap-2 mt-10">
          {['Computer Vision', 'Deep Learning', 'Agentic AI', 'Edge ML', 'RAG Pipelines'].map(tag => (
            <span
              key={tag}
              className="text-[10px] font-mono uppercase tracking-[0.18em] px-3 py-1 rounded bg-cyan-950/30 border border-cyan-500/20 text-cyan-400 hover:border-cyan-400 hover:text-white transition-all duration-300 shadow-[0_0_10px_rgba(0,240,255,0.05)]"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* CTA Actions */}
        <div className="flex items-center gap-4 mt-10">
          <button
            onClick={scrollToProjects}
            className="group relative inline-flex items-center gap-3 px-7 py-3.5 bg-cyan-500 text-[#03060f] font-bold text-sm uppercase tracking-widest rounded hover:bg-white transition-colors duration-300 shadow-[0_0_20px_rgba(0,240,255,0.3)]"
          >
            <span className="relative z-10">Explore Projects</span>
            <svg className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 7l-10 10M17 7H7M17 7v10" />
            </svg>
          </button>

          <button
            onClick={scrollToContact}
            className="text-xs font-mono uppercase tracking-widest text-cyan-500/70 hover:text-cyan-400 transition-colors duration-300 underline underline-offset-4 cursor-pointer"
          >
            [ Contact Agent ]
          </button>
        </div>
      </div>

      {/* Right Column: Parallax Photo with Face Detection Scanner overlay */}
      <div className="w-full md:w-1/2 flex justify-center md:justify-end items-center z-20 mt-12 md:mt-0">
        <div
          className="relative w-[280px] h-[380px] md:w-[350px] md:h-[450px] lg:w-[450px] lg:h-[600px] group/photo"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Target Profile Image */}
          <img
            ref={photoRef}
            src={`${import.meta.env.BASE_URL}profile.jpeg`}
            alt="Sambhram Doddamane"
            className="w-full h-full object-cover grayscale-[0.3] group-hover/photo:grayscale-0 transition-all duration-700 brightness-110 contrast-110 rounded border border-cyan-500/20 shadow-[0_0_40px_rgba(0,0,0,0.8)]"
            style={{ willChange: 'transform' }}
          />

          {/* AI Face Detection Bounding Box overlay */}
          <div className="absolute inset-4 border border-emerald-500/40 pointer-events-none rounded transition-opacity duration-300">
            {/* Box Corners */}
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-emerald-400" />
            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-emerald-400" />
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-emerald-400" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-emerald-400" />

            {/* Scanning Sweeper Line */}
            <div
              ref={scanLineRef}
              className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_8px_rgba(52,211,153,0.8)]"
            />

            {/* Target telemetry indicators */}
            <div className="absolute -top-3 -left-1 bg-emerald-950/90 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-wider rounded">
              TARGET: SAMBHRAM_DODDAMANE
            </div>
            <div className="absolute -bottom-3 -right-1 bg-emerald-950/90 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-wider rounded">
              MATCH: 99.8% [SYNCED]
            </div>
          </div>

          {/* Glowing backlights */}
          <div className="absolute inset-0 bg-cyan-500/5 blur-[80px] -z-10 rounded mix-blend-screen" />
        </div>
      </div>

      {/* Scroll hint */}
      <div className="absolute bottom-[5vh] left-1/2 -translate-x-1/2 flex flex-col items-center">
        <span className="font-mono text-[9px] tracking-[0.25em] text-cyan-500/50 uppercase">
          [ SCROLL_TO_PROCESS ]
        </span>
        <div className="w-[1px] h-[45px] bg-gradient-to-b from-cyan-500/30 to-transparent mt-3" />
      </div>
    </section>
  );
};
