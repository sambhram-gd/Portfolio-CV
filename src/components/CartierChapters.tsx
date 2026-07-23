import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const CHAPTERS = [
  {
    tag: 'LOG_ENTRY_001',
    headline: 'TEACHING\nMACHINES TO SEE.',
    copy: 'From thermal imaging pipelines at Sandoz to pixel-level anomaly detection with PatchCore — achieving Image-level AUROC ≈ 1.00 on real manufacturing datasets.',
  },
  {
    tag: 'LOG_ENTRY_002',
    headline: 'EDGE TO\nINTELLIGENCE.',
    copy: 'Real-time GMSL link quality analysis on NVIDIA Jetson. Monocular road scene 2D mapping. GAN-based video super resolution at 0.82M params with PSNR 25.65 dB.',
  },
  {
    tag: 'LOG_ENTRY_003',
    headline: 'PUBLISHED,\nDEPLOYED, PROVEN.',
    copy: 'YOLOv8 & RetinaNet on 4,000+ annotated images — presented at IMCL 2025, Bengaluru. From data to deployment: engineering solutions that hold up in the real world.',
  },
];

export const CartierChapters: React.FC = () => {
  const containerRefs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    containerRefs.current.forEach((el) => {
      if (!el) return;
      
      gsap.fromTo(el.querySelector('.chapter-content'), 
        { 
          opacity: 0, 
          y: 60,
        },
        { 
          opacity: 1, 
          y: 0,
          duration: 1.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 90%',
            toggleActions: 'play none none reverse',
          }
        }
      );
    });
  }, []);

  return (
    <div className="relative z-10 w-full flex flex-col gap-32 py-20 bg-[#03060f] border-b border-cyan-500/10">
      {/* Decorative vertical connection line */}
      <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-cyan-500/10 to-transparent -translate-x-1/2 hidden md:block" />

      {CHAPTERS.map((chapter, i) => (
        <section 
          key={i} 
          ref={el => { containerRefs.current[i] = el; }}
          className="w-full flex items-center justify-center pointer-events-none"
        >
          <div 
            className="chapter-content text-center px-6 relative z-10" 
            style={{ maxWidth: '800px', pointerEvents: 'auto' }}
          >
            {/* Tag / Header code style */}
            <div
              className="font-mono text-[10px] tracking-[0.4em] text-cyan-400 uppercase mb-8 flex items-center justify-center gap-4"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              {chapter.tag}
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            </div>
            
            {/* Headline */}
            <h2
              className="font-mono text-4xl md:text-6xl font-bold leading-none text-white margin-0 mb-8 tracking-tighter"
              style={{
                whiteSpace: 'pre-line',
                textShadow: '0 0 30px rgba(0, 240, 255, 0.2)'
              }}
            >
              {chapter.headline}
            </h2>
            
            {/* Copy paragraph */}
            <p
              className="font-mono text-sm leading-relaxed text-cyan-200/70 max-w-xl mx-auto"
            >
              {chapter.copy}
            </p>
          </div>
        </section>
      ))}
    </div>
  );
};
