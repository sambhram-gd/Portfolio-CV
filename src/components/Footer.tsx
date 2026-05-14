import React from 'react';
import { skills } from '../data';
import { Download, ArrowRight } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="relative z-10 pt-32 pb-12 px-6 md:px-12 lg:px-20" style={{ borderTop: '1px solid rgba(80,200,255,0.08)', background: 'transparent' }}>
      <div className="container mx-auto">
        
        {/* Skills Section */}
        <div className="mb-32">
          <div className="flex items-center gap-6 mb-16">
            <h2 style={{ fontFamily: 'system-ui, sans-serif', fontWeight: 900, letterSpacing: '-0.03em', color: 'rgba(255,255,255,0.88)' }} className="text-4xl md:text-6xl uppercase">Capabilities</h2>
            <div className="flex-1 h-[1px]" style={{ background: 'rgba(80,200,255,0.1)' }}></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            <div>
              <h3 className="mono-text uppercase tracking-widest text-sm mb-6" style={{ color: 'rgba(80,200,255,0.5)' }}>Hardware / Platforms</h3>
              <ul className="space-y-4">
                {skills.hardware.map(s => (
                  <li key={s} className="text-zinc-400 font-light flex items-center gap-3">
                    <span className="w-1.5 h-1.5 bg-zinc-700"></span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="mono-text text-accent uppercase tracking-widest text-sm mb-6">Domains of Interest</h3>
              <ul className="space-y-4">
                {skills.domains.map(s => (
                  <li key={s} className="text-zinc-400 font-light flex items-center gap-3">
                    <span className="w-1.5 h-1.5 bg-zinc-700"></span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="mono-text text-accent uppercase tracking-widest text-sm mb-6">Tools / Software</h3>
              <ul className="space-y-4">
                {skills.tools.map(s => (
                  <li key={s} className="text-zinc-400 font-light flex items-center gap-3">
                    <span className="w-1.5 h-1.5 bg-zinc-700"></span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="mono-text text-accent uppercase tracking-widest text-sm mb-6">Professional</h3>
              <ul className="space-y-4">
                {skills.professional.map(s => (
                  <li key={s} className="text-zinc-400 font-light flex items-center gap-3">
                    <span className="w-1.5 h-1.5 bg-zinc-700"></span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-12 pt-20" style={{ borderTop: '1px solid rgba(80,200,255,0.08)' }}>
          <div>
            <h2 style={{ fontFamily: 'system-ui, sans-serif', fontWeight: 900, letterSpacing: '-0.03em', color: 'rgba(255,255,255,0.88)' }} className="text-5xl md:text-8xl uppercase mb-6">
              Let's Build.
            </h2>
            <div className="flex flex-col sm:flex-row gap-6 mono-text text-sm uppercase tracking-widest text-zinc-500">
              <a href="mailto:sambhramgd@gmail.com" className="partizan-link hover:text-accent transition-colors flex items-center gap-2" data-text="sambhramgd@gmail.com">
                <span className="partizan-link-text">sambhramgd@gmail.com</span> <ArrowRight className="w-4 h-4" />
              </a>
              <a href="tel:+919483257160" className="partizan-link hover:text-accent transition-colors flex items-center gap-2" data-text="+91 94832 57160">
                <span className="partizan-link-text">+91 94832 57160</span> <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
          
          <button className="group relative inline-flex items-center justify-center gap-4 px-8 py-5 bg-obsidian text-white font-bold uppercase tracking-widest text-sm hover:bg-accent hover:text-obsidian transition-all duration-300 overflow-hidden">
            <span className="relative z-10 flex items-center gap-3">
              Download CV <Download className="w-5 h-5" />
            </span>
            <div className="absolute inset-0 bg-accent transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300 z-0"></div>
            {/* Glow effect */}
            <div className="absolute -inset-2 bg-accent opacity-0 group-hover:opacity-30 blur-xl transition-opacity duration-300 z-0 pointer-events-none"></div>
          </button>
        </div>

        <div className="mt-32 pt-8 flex justify-between items-center mono-text text-xs uppercase tracking-widest" style={{ borderTop: '1px solid rgba(80,200,255,0.06)', color: 'rgba(255,255,255,0.2)' }}>
          <span>© {new Date().getFullYear()} Sambhram G Doddamane</span>
          <span>India</span>
        </div>
      </div>
    </footer>
  );
};
