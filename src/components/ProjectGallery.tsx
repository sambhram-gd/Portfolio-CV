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
  const lineRef = useRef<HTMLDivElement>(null);
  const bugRef = useRef<HTMLDivElement>(null);
  const projectsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (!containerRef.current || !lineRef.current || !bugRef.current) return;

    const ctx = gsap.context(() => {
      // Reactor pulse moving down the line
      gsap.to(bugRef.current, {
        top: '100%',
        ease: 'none',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top center',
          end: 'bottom center',
          scrub: 1.5,
        }
      });

      // Animate each project card
      projectsRef.current.forEach((card, i) => {
        if (!card) return;
        const isLeft = i % 2 === 0;
        const node = card.querySelector('.timeline-node');
        
        gsap.fromTo(card, 
          { 
            opacity: 0, 
            x: isLeft ? -50 : 50 
          },
          {
            opacity: 1,
            x: 0,
            duration: 1.2,
            ease: 'expo.out',
            scrollTrigger: {
              trigger: card,
              start: 'top 85%',
              toggleActions: 'play none none reverse',
              onEnter: () => {
                 if(node) gsap.to(node, { backgroundColor: '#00f0ff', boxShadow: '0 0 15px rgba(0,240,255,1)', scale: 1.4, duration: 0.4 });
              },
              onLeaveBack: () => {
                 if(node) gsap.to(node, { backgroundColor: '#1e293b', boxShadow: 'none', scale: 1, duration: 0.4 });
              }
            }
          }
        );
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="py-32 px-6 md:px-12 lg:px-20 relative z-10 bg-[#03060f] border-b border-cyan-500/10">
      <div className="container mx-auto max-w-6xl relative">
        <div className="text-center mb-32">
          <h2 className="text-4xl md:text-6xl uppercase text-white tracking-widest font-mono" style={{ textShadow: '0 0 20px rgba(0, 240, 255, 0.15)' }}>
            [ PROJECT_REGISTRY ]
          </h2>
          <p className="mt-4 text-cyan-400 font-mono tracking-widest uppercase text-xs">ARCHIVED RUNTIME EXECUTION MODELS</p>
        </div>

        {/* Central Pipeline Line */}
        <div className="absolute left-1/2 top-48 bottom-0 w-[2px] bg-cyan-950 -translate-x-1/2 hidden md:block" ref={lineRef}>
           {/* Glow Line Indicator */}
           <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/40 via-cyan-400/80 to-cyan-500/40 w-full" />
           {/* Floating HUD pulse core */}
           <div ref={bugRef} className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 z-20 will-change-transform">
              <div className="w-8 h-8 rounded-full bg-[#03060f] border-2 border-cyan-400 flex items-center justify-center shadow-[0_0_20px_rgba(0,240,255,0.8)]">
                 <div className="w-2.5 h-2.5 bg-cyan-400 rounded-full animate-ping" />
              </div>
           </div>
        </div>

        <div className="flex flex-col gap-16 relative">
          {projects.map((project, index) => {
            const isLeft = index % 2 === 0;
            return (
              <div 
                key={project.id}
                ref={el => { projectsRef.current[index] = el; }}
                className={`relative flex items-center justify-between w-full ${isLeft ? 'flex-row-reverse md:flex-row' : 'flex-row-reverse'}`}
              >
                {/* Empty space for alternating layout on desktop */}
                <div className="hidden md:block w-[45%]"></div>
                
                {/* Central Pipeline Node */}
                <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 w-8 h-8 items-center justify-center z-10">
                   <div className="timeline-node w-3.5 h-3.5 rounded-full bg-slate-800 border border-cyan-500/40 transition-all duration-300"></div>
                </div>

                {/* Card */}
                <div 
                  className="w-full md:w-[45%] cursor-pointer group"
                  onClick={() => onProjectClick(project)}
                >
                  <div className="cyber-card p-8 rounded border border-cyan-500/10 bg-[#060b1f]/80 shadow-2xl hover:border-cyan-500/40 transition-all duration-500 relative overflow-hidden group-hover:-translate-y-1">
                    
                    {/* Background glow on hover */}
                    <div className="absolute inset-0 bg-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                    {/* Faded Background Year */}
                    <div className="absolute -top-4 -right-4 p-4 opacity-[0.02] pointer-events-none select-none transition-opacity duration-500 group-hover:opacity-0">
                      <span className="text-8xl font-black italic font-mono">
                        {project.year}
                      </span>
                    </div>
                    
                    <div className="flex flex-col gap-5 relative z-10">
                      <div className="flex items-center flex-wrap gap-2">
                        <span className="px-3 py-1 text-[10px] font-mono tracking-widest uppercase bg-cyan-500/10 text-cyan-400 rounded border border-cyan-500/30 group-hover:bg-cyan-500 group-hover:text-[#03060f] transition-colors duration-300">
                          YEAR: {project.year}
                        </span>
                        <span className="text-[10px] font-mono uppercase text-cyan-500/60 tracking-wider">
                          [{project.category}]
                        </span>
                        {project.highlight && (
                          <span className="px-2 py-0.5 text-[9px] font-mono uppercase tracking-wider text-emerald-400 border border-emerald-500/20 rounded bg-emerald-500/5">
                            {project.highlight}
                          </span>
                        )}
                      </div>

                      {project.collaborator && (
                        <p className="text-[10px] font-mono uppercase tracking-widest text-cyan-400/55">
                          // {project.collaborator}
                        </p>
                      )}
                      
                      <h3 className="text-2xl font-bold text-white tracking-tight font-mono">
                        {project.title}
                      </h3>
                      
                      <p className="text-sm text-cyan-100/70 leading-relaxed font-mono">
                        {project.description[0]}
                      </p>

                      {/* Tech tags */}
                      <div className="flex flex-wrap gap-2 mt-1">
                        {project.tech.map(t => (
                          <span key={t} className="px-2 py-0.5 text-[9px] font-mono uppercase tracking-wider text-cyan-400/40 border border-cyan-500/10 rounded bg-cyan-950/20">{t}</span>
                        ))}
                      </div>

                      {/* Expanding Image Container */}
                      <div className="grid grid-rows-[1fr] opacity-100 mt-2 md:grid-rows-[0fr] md:opacity-0 md:group-hover:grid-rows-[1fr] md:group-hover:opacity-100 md:transition-all md:duration-700 md:ease-[cubic-bezier(0.16,1,0.3,1)] md:group-hover:mt-2">
                        <div className="overflow-hidden min-h-0">
                          <div className="rounded aspect-[16/9] w-full relative border border-cyan-500/10 overflow-hidden mt-1 md:mt-3">
                            <img 
                              src={project.image} 
                              alt={project.title}
                              className="w-full h-full object-cover md:grayscale-[0.5] md:group-hover:grayscale-0 md:group-hover:scale-105 transition-all duration-1000 ease-out"
                            />
                            {/* Scanning HUD overlay on image */}
                            <div className="absolute inset-0 bg-gradient-to-t from-cyan-950/30 to-transparent pointer-events-none" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
