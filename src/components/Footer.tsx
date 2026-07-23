import React from 'react';
import { skills } from '../data';
import { Download, ArrowRight } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer id="contact" className="relative z-10 pt-32 pb-12 px-6 md:px-12 lg:px-20 border-t border-cyan-500/10 bg-[#03060f]">
      <div className="container mx-auto">

        {/* Skills Section */}
        <div className="mb-32">
          <div className="flex items-center gap-6 mb-16">
            <h2 className="text-4xl md:text-5xl uppercase font-mono tracking-widest text-white">
              [ CAPABILITIES ]
            </h2>
            <div className="flex-1 h-[1px] bg-cyan-500/10" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {/* CV & Deep Learning */}
            <div>
              <h3 className="mono-text uppercase tracking-widest text-xs mb-6 text-cyan-400 font-bold">// CV &amp; DL</h3>
              <ul className="space-y-4">
                {skills.cv_dl.map(s => (
                  <li key={s} className="text-cyan-100/60 font-mono text-xs flex items-center gap-3">
                    <span className="w-1 h-1 bg-cyan-400 rounded-full shrink-0"></span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>

            {/* Platforms & Tools */}
            <div>
              <h3 className="mono-text uppercase tracking-widest text-xs mb-6 text-cyan-400 font-bold">// PLATFORMS &amp; TOOLS</h3>
              <ul className="space-y-4">
                {skills.platforms.map(s => (
                  <li key={s} className="text-cyan-100/60 font-mono text-xs flex items-center gap-3">
                    <span className="w-1 h-1 bg-cyan-400 rounded-full shrink-0"></span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>

            {/* Domains */}
            <div>
              <h3 className="mono-text uppercase tracking-widest text-xs mb-6 text-cyan-400 font-bold">// DOMAINS</h3>
              <ul className="space-y-4">
                {skills.domains.map(s => (
                  <li key={s} className="text-cyan-100/60 font-mono text-xs flex items-center gap-3">
                    <span className="w-1 h-1 bg-cyan-400 rounded-full shrink-0"></span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>

            {/* Professional */}
            <div>
              <h3 className="mono-text uppercase tracking-widest text-xs mb-6 text-cyan-400 font-bold">// PROFESSIONAL</h3>
              <ul className="space-y-4">
                {skills.professional.map(s => (
                  <li key={s} className="text-cyan-100/60 font-mono text-xs flex items-center gap-3">
                    <span className="w-1 h-1 bg-cyan-400 rounded-full shrink-0"></span>
                    {s}
                  </li>
                ))}
              </ul>

              {/* Publication badge */}
              <div className="mt-10 p-4 rounded border border-cyan-500/20 bg-cyan-950/20">
                <p className="mono-text text-[9px] uppercase tracking-widest text-cyan-400 mb-2">SYSTEM_PUBLICATION</p>
                <p className="text-cyan-100/70 text-[11px] leading-relaxed font-mono">
                  IMCL 2025 — <span className="text-white">"ML Powered Malpractice Detection"</span><br />
                  Hubballi, India · Nov 2025 · Accepted
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-12 pt-20 border-t border-cyan-500/10">
          <div>
            <h2 className="text-5xl md:text-7xl font-bold uppercase mb-6 font-mono text-white tracking-tighter">
              LET'S BUILD.
            </h2>
            <div className="flex flex-col sm:flex-row gap-6 mono-text text-xs uppercase tracking-widest text-cyan-500/60">
              <a href="mailto:sambhramgd@gmail.com" className="partizan-link hover:text-cyan-400 transition-colors flex items-center gap-2" data-text="sambhramgd@gmail.com">
                <span className="partizan-link-text">sambhramgd@gmail.com</span> <ArrowRight className="w-4 h-4" />
              </a>
              <a href="tel:+919483257160" className="partizan-link hover:text-cyan-400 transition-colors flex items-center gap-2" data-text="+91 94832 57160">
                <span className="partizan-link-text">+91 94832 57160</span> <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="https://linkedin.com/in/sambhram-doddamane"
                target="_blank"
                rel="noopener noreferrer"
                className="partizan-link hover:text-cyan-400 transition-colors flex items-center gap-2"
                data-text="linkedin.com/in/sambhram-doddamane"
              >
                <span className="partizan-link-text">LinkedIn</span> <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>

          <a
            href="/Sambhram_Doddamane_Resume.pdf"
            download
            className="group relative inline-flex items-center justify-center gap-4 px-8 py-5 bg-cyan-500 text-[#03060f] font-bold uppercase tracking-widest text-sm hover:bg-white transition-all duration-300 rounded"
          >
            <span className="relative z-10 flex items-center gap-3">
              DOWNLOAD RESUME <Download className="w-5 h-5" />
            </span>
          </a>
        </div>

        <div className="mt-32 pt-8 flex justify-between items-center mono-text text-[9px] uppercase tracking-widest text-cyan-500/30 border-t border-cyan-500/5">
          <span>© {new Date().getFullYear()} SAMBHRAM G DODDAMANE</span>
          <span>KLE TECHNOLOGICAL UNIVERSITY · HUBBALLI, INDIA</span>
        </div>
      </div>
    </footer>
  );
};
