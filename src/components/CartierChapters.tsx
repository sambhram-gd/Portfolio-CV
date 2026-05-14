import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const CHAPTERS = [
  {
    tag: 'Chapter I',
    headline: 'Engineering\nIntelligence.',
    copy: 'Building systems that see, understand, and decide. From NVIDIA Jetson to production ML pipelines — turning raw data into real-time insight.',
  },
  {
    tag: 'Chapter II',
    headline: 'Every Frame,\nAnalyzed.',
    copy: 'Real-time GMSL link quality analysis. Monocular depth estimation. Anomaly detection at pixel-level precision. Quality that machines can measure.',
  },
  {
    tag: 'Chapter III',
    headline: 'Building\nWhat\'s Next.',
    copy: 'From embedded hardware to cloud inference — engineering the future of intelligent systems. Let\'s build something extraordinary.',
  },
];

export const CartierChapters: React.FC = () => {
  const containerRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    // Reveal each chapter as it enters the viewport
    containerRefs.current.forEach((el, index) => {
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
    <div className="relative z-10 w-full flex flex-col gap-32 py-20">
      {CHAPTERS.map((chapter, i) => (
        <section 
          key={i} 
          ref={el => { containerRefs.current[i] = el; }}
          className="w-full flex items-center justify-center pointer-events-none"
        >
          <div 
            className="chapter-content text-center px-6" 
            style={{ maxWidth: '800px', pointerEvents: 'auto' }}
          >
            <div
              style={{
                fontFamily: '"Inter", sans-serif',
                fontSize: '0.65rem',
                fontWeight: 400,
                letterSpacing: '0.3em',
                color: 'rgba(255,255,255,0.5)',
                textTransform: 'uppercase',
                marginBottom: '2.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '16px'
              }}
            >
              <span style={{ width: '24px', height: '1px', background: 'rgba(255,255,255,0.3)' }} />
              {chapter.tag}
              <span style={{ width: '24px', height: '1px', background: 'rgba(255,255,255,0.3)' }} />
            </div>
            
            <h2
              style={{
                fontFamily: '"Cormorant Garamond", serif',
                fontSize: 'clamp(3rem, 6vw, 5.5rem)',
                fontWeight: 400,
                fontStyle: 'italic',
                lineHeight: 1.05,
                color: '#fff',
                margin: '0 0 2rem 0',
                textShadow: '0 4px 32px rgba(0,0,0,0.6)',
                letterSpacing: '-0.01em',
                whiteSpace: 'pre-line',
              }}
            >
              {chapter.headline}
            </h2>
            
            <p
              style={{
                fontFamily: '"Inter", sans-serif',
                fontSize: 'clamp(0.85rem, 1.2vw, 1rem)',
                fontWeight: 300,
                lineHeight: 2.0,
                color: 'rgba(255,255,255,0.85)',
                maxWidth: 480,
                margin: '0 auto',
                letterSpacing: '0.02em',
                textShadow: '0 2px 12px rgba(0,0,0,0.8)',
              }}
            >
              {chapter.copy}
            </p>
          </div>
        </section>
      ))}
    </div>
  );
};
