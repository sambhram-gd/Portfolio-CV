import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

interface PreloaderProps {
  onComplete: () => void;
}

export const Preloader: React.FC<PreloaderProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let currentProgress = 0;
    const duration = 2000; // 2 seconds
    const intervalTime = 20;
    const step = 100 / (duration / intervalTime);

    const timer = setInterval(() => {
      currentProgress += step;
      if (currentProgress >= 100) {
        currentProgress = 100;
        clearInterval(timer);
        
        // Trigger exit animation
        const tl = gsap.timeline({
          onComplete: onComplete
        });

        tl.to(textRef.current, {
          y: -50,
          opacity: 0,
          duration: 0.6,
          ease: "power3.inOut"
        })
        .to(containerRef.current, {
          clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
          duration: 1.2,
          ease: "power4.inOut"
        }, "-=0.2");
      }
      setProgress(Math.floor(currentProgress));
    }, intervalTime);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div 
      ref={containerRef} 
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center origin-top"
      style={{ clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)" }}
    >
      <div className="absolute inset-0 noise-overlay"></div>
      <div ref={textRef} className="flex flex-col items-center gap-4">
        <span className="mono-text text-6xl md:text-8xl font-bold tracking-tighter text-white">
          {progress}%
        </span>
        <div className="w-48 h-1 bg-graphite rounded-full overflow-hidden">
          <div 
            className="h-full bg-accent transition-all duration-75 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="mono-text text-sm uppercase tracking-widest text-zinc-500 mt-4">
          Loading Environment
        </span>
      </div>
    </div>
  );
};
