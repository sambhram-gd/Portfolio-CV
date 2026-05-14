import React, { useEffect, useRef } from 'react';
import type { Project } from '../data';
import { X } from 'lucide-react';
import gsap from 'gsap';

interface DetailDrawerProps {
  project: Project | null;
  onClose: () => void;
}

export const DetailDrawer: React.FC<DetailDrawerProps> = ({ project, onClose }) => {
  const drawerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (project) {
      // Open animation
      const tl = gsap.timeline();
      tl.to(overlayRef.current, {
        opacity: 1,
        pointerEvents: "auto",
        duration: 0.4,
        ease: "power2.out"
      })
      .fromTo(drawerRef.current,
        { y: "15%", scale: 0.95, opacity: 0, pointerEvents: "none" },
        {
          y: "0%",
          scale: 1,
          opacity: 1,
          pointerEvents: "auto",
          duration: 0.6,
          ease: "power4.out"
        }, "-=0.4")
      .fromTo(contentRef.current?.children || [], {
        y: 30,
        opacity: 0
      }, {
        y: 0,
        opacity: 1,
        stagger: 0.1,
        duration: 0.5,
        ease: "power3.out"
      }, "-=0.2");

    } else if (drawerRef.current && overlayRef.current) {
      // Close animation
      const tl = gsap.timeline();
      tl.to(drawerRef.current, {
        y: "15%",
        scale: 0.95,
        opacity: 0,
        pointerEvents: "none",
        duration: 0.4,
        ease: "power3.in"
      })
      .to(overlayRef.current, {
        opacity: 0,
        pointerEvents: "none",
        duration: 0.3,
        ease: "power2.in"
      }, "-=0.2");
    }
  }, [project]);

  return (
    <>
      {/* Overlay */}
      <div
        ref={overlayRef}
        className="fixed inset-0 bg-obsidian/80 backdrop-blur-sm z-[200] opacity-0 pointer-events-none"
        onClick={onClose}
      />

      {/* Centered Modal (Minimized Full Screen) */}
      <div
        ref={drawerRef}
        data-lenis-prevent="true"
        className="fixed inset-4 md:inset-10 lg:inset-y-12 lg:inset-x-32 glass-heavy border border-white/10 rounded-3xl z-[210] opacity-0 pointer-events-none overflow-y-auto overflow-x-hidden shadow-[0_30px_100px_rgba(0,0,0,0.8)] custom-scrollbar overscroll-contain"
      >
        <div className="absolute inset-0 noise-overlay rounded-3xl pointer-events-none"></div>

        <button
          onClick={onClose}
          className="fixed top-8 right-8 md:top-16 md:right-16 z-30 p-3 bg-white/10 hover:bg-emerald-500 text-white rounded-full backdrop-blur-md transition-all duration-300 group shadow-xl"
        >
          <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
        </button>

        {project && (
          <div ref={contentRef} className="p-6 md:p-16 lg:p-20 relative z-10 flex flex-col min-h-full max-w-5xl mx-auto">
            <div className="font-mono text-emerald-400 text-sm tracking-widest uppercase mb-6 flex items-center gap-4 drop-shadow-md">
              <span>{project.year}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/50"></span>
              <span>{project.category}</span>
            </div>

            <h2 className="font-bebas text-5xl md:text-7xl lg:text-8xl tracking-tight text-white mb-10 drop-shadow-2xl">
              {project.title}
            </h2>

            <div className="aspect-video w-full rounded-2xl overflow-hidden mb-16 shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/5 group relative">
              <div className="absolute inset-0 bg-emerald-500/10 mix-blend-screen opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-10"></div>
              <img
                src={project.image}
                alt={project.title}
                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-1000 ease-out"
              />
            </div>

            <div className="space-y-12 flex-grow">
              <div>
                <h3 className="font-mono text-white/40 uppercase tracking-widest text-sm border-b border-white/10 pb-4 mb-8">
                  Technical Overview
                </h3>
                <ul className="space-y-8">
                  {project.description.map((desc, i) => (
                    <li key={i} className="flex gap-6">
                      <span className="font-mono text-emerald-500/60 mt-1.5 text-sm">0{i + 1}</span>
                      <p className="text-lg md:text-xl lg:text-2xl text-white/80 leading-relaxed font-light font-inter">
                        {desc}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>

              {project.collaborator && (
                <div className="mt-16 bg-white/5 p-8 rounded-2xl border border-white/5 backdrop-blur-md">
                  <h3 className="font-mono text-emerald-500 uppercase tracking-widest text-xs mb-3 opacity-80">
                    Collaboration
                  </h3>
                  <p className="text-lg text-white/90 font-inter">{project.collaborator}</p>
                </div>
              )}
            </div>

            <div className="mt-24 pt-10 border-t border-white/10 flex justify-between items-center">
              <span className="font-mono text-white/30 text-xs uppercase tracking-widest">End of project</span>
              <div className="w-24 h-[1px] bg-gradient-to-r from-emerald-500/0 via-emerald-500/50 to-emerald-500/0"></div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
