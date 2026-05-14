import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { MenuPixelText } from './MenuPixelText';

export const CartierHero: React.FC = () => {
  const photoRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    if (isMobile) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!photoRef.current) return;
      const { innerWidth, innerHeight } = window;
      
      // Calculate normalized mouse position (-0.5 to 0.5)
      const x = (e.clientX / innerWidth - 0.5);
      const y = (e.clientY / innerHeight - 0.5);
      
      // Apply parallax and 3D rotation to the photo
      gsap.to(photoRef.current, {
        x: x * 60,
        y: y * 60,
        rotationY: x * 15,
        rotationX: -y * 15,
        duration: 1.2,
        ease: "power2.out",
        transformPerspective: 1000
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <section
      className="relative w-full h-[100vh] flex flex-col md:flex-row items-center justify-between px-6 md:px-20 lg:px-32 z-10"
      style={{ perspective: '1000px' }}
    >
      {/* Left Column: Text Content */}
      <div className="flex flex-col items-start text-left z-20 mt-20 md:mt-0 w-full md:w-1/2">
        {/* eyebrow */}
        <div
          className="font-inter font-light tracking-[0.3em] text-[0.75rem] text-white/55 uppercase mb-8"
        >
          Portfolio 2026
        </div>

        {/* Name */}
        <div className="relative group cursor-none flex flex-col items-start -ml-2">
          <MenuPixelText 
            text="SAMBHRAM" 
            className="font-bebas text-[clamp(4rem,10vw,8rem)] lg:text-[10rem] xl:text-[12rem] leading-[0.8] text-white tracking-tighter drop-shadow-2xl"
          />
          <MenuPixelText 
            text="DODDAMANE" 
            className="font-bebas text-[clamp(4rem,10vw,8rem)] lg:text-[10rem] xl:text-[12rem] leading-[0.8] text-white tracking-tighter -mt-[0.1em] drop-shadow-2xl"
          />
        </div>

        {/* Rule + subtitle */}
        <div className="flex items-center gap-4 md:gap-8 mt-10">
          <div className="h-[1px] w-[30px] md:w-[60px] bg-white/20" />
          <p className="font-inter text-[clamp(0.65rem,1vw,0.85rem)] font-light tracking-[0.15em] text-white/80 uppercase m-0">
            AI &amp; Computer Vision Engineer
          </p>
        </div>
      </div>

      {/* Right Column: Parallax Photo */}
      <div className="w-full md:w-1/2 flex justify-center md:justify-end items-center z-20 mt-12 md:mt-0 pointer-events-none">
        <div 
          className="relative w-[280px] h-[380px] md:w-[350px] md:h-[450px] lg:w-[450px] lg:h-[600px]"
          style={{ transformStyle: 'preserve-3d' }}
        >
          <img
            ref={photoRef}
            src="/profile.jpeg"
            alt="Sambhram Doddamane"
            className="w-full h-full object-cover grayscale-[0.5] hover:grayscale-0 transition-all duration-700 brightness-110 contrast-110 rounded-[30px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10"
            style={{ willChange: 'transform' }}
          />
          {/* Subtle glow behind image */}
          <div className="absolute inset-0 bg-emerald-500/10 blur-[60px] -z-10 rounded-[30px] mix-blend-screen"></div>
        </div>
      </div>

      {/* Scroll hint */}
      <div
        className="absolute bottom-[5vh] left-1/2 -translate-x-1/2 flex flex-col items-center"
      >
        <span className="font-inter text-[0.62rem] tracking-[0.22em] text-white/40 uppercase">
          Scroll to Explore
        </span>
        <div className="w-[1px] h-[40px] bg-white/20 mt-3" />
      </div>
    </section>
  );
};
