import React, { useEffect, useRef } from 'react';
import { projects } from '../data';
import type { Project } from '../data';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface ProjectGalleryProps {
  onProjectClick: (project: Project) => void;
}

export const ProjectGallery: React.FC<ProjectGalleryProps> = ({ onProjectClick }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray('.project-card');
      
      cards.forEach((card: any) => {
        gsap.from(card, {
          y: 100,
          opacity: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: card,
            start: "top 85%",
            toggleActions: "play none none reverse"
          }
        });
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="py-32 px-6 md:px-12 lg:px-20 relative z-10">
      <div className="container mx-auto">
        <div className="flex items-center gap-6 mb-20">
          <h2 style={{ fontFamily: 'system-ui, sans-serif', fontWeight: 900, letterSpacing: '-0.03em', color: 'rgba(255,255,255,0.88)' }} className="text-4xl md:text-6xl uppercase">Selected Works</h2>
          <div className="flex-1 h-[1px]" style={{ background: 'rgba(80,200,255,0.1)' }}></div>
          <span className="mono-text" style={{ color: 'rgba(80,200,255,0.4)' }}>[ 04 ]</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20">
          {projects.map((project, index) => (
            <div 
              key={project.id}
              className={`project-card group cursor-pointer ${index % 2 !== 0 ? 'md:mt-32' : ''}`}
              onClick={() => onProjectClick(project)}
            >
              <div className="overflow-hidden relative aspect-[4/3] w-full mb-6 group-hover:scale-[0.98] transition-transform duration-500 ease-out" style={{ background: 'rgba(2,8,16,0.6)' }}>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10 mix-blend-overlay" style={{ background: 'rgba(80,200,255,0.15)' }}></div>
                <img 
                  src={project.image} 
                  alt={project.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out grayscale group-hover:grayscale-0"
                />
              </div>
              
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center text-zinc-500 mono-text text-sm uppercase tracking-widest">
                  <span>{project.category}</span>
                  <span>{project.year}</span>
                </div>
                <h3 className="text-2xl md:text-3xl text-white transition-colors duration-300" style={{ fontFamily: 'system-ui, sans-serif', fontWeight: 800, letterSpacing: '-0.02em' }}>
                  <span className="group-hover:text-[rgba(80,200,255,0.7)]" style={{ transition: 'color 0.3s' }}>{project.title}</span>
                </h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
