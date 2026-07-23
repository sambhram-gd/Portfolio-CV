import React from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

function scrollToProjects(e: React.MouseEvent) {
  e.preventDefault();
  const el = document.getElementById('projects');
  if (!el) return;
  const lenis = (window as any).lenis;
  if (lenis) {
    lenis.scrollTo(el, { duration: 1.4, easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
  } else {
    el.scrollIntoView({ behavior: 'smooth' });
  }
}

export const DiagonalMosaicHero: React.FC = () => {
  const images = {
    row1: [
      "https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=600",
    ],
    row2: [
      "https://images.unsplash.com/photo-1544256718-3bcf237f3974?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&q=80&w=600",
    ],
    row3: [
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1535378917042-10a22c95931a?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1509023467864-1ecbb3403333?auto=format&fit=crop&q=80&w=600",
    ],
    row4: [
      "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=600",
    ],
    row5: [
      "https://images.unsplash.com/photo-1504639725590-34d0984388bd?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=600",
    ]
  };

  const renderRow = (imgs: string[], direction: 'left' | 'right', duration: string) => (
    <div 
      className={`flex-1 overflow-hidden flex items-center group/row`}
      style={{ '--duration': duration } as React.CSSProperties}
    >
      <div className={`flex w-max will-change-transform ${direction === 'left' ? 'animate-marquee-left' : 'animate-marquee-right'}`}>
        {/* Original Set */}
        <div className="flex gap-[15px] pr-[15px] h-full">
          {imgs.map((src, idx) => (
            <div key={`orig-${idx}`} className="relative h-[22vh] md:h-[28vh] w-[300px] md:w-[400px] rounded-[8px] overflow-hidden shrink-0 shadow-xl group">
              <img src={src} alt="Gallery" className="w-full h-full object-cover opacity-50 group-hover:scale-105 transition-all duration-700 brightness-75 contrast-125" />
              {/* Green Bounding Box Layer to look like YOLO vision */}
              <div className="absolute inset-4 border border-emerald-500/20 group-hover:border-cyan-500/60 transition-colors pointer-events-none rounded">
                <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t border-l border-emerald-400 group-hover:border-cyan-400" />
                <div className="absolute top-0 right-0 w-2.5 h-2.5 border-t border-r border-emerald-400 group-hover:border-cyan-400" />
                <div className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b border-l border-emerald-400 group-hover:border-cyan-400" />
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b border-r border-emerald-400 group-hover:border-cyan-400" />
                <div className="absolute top-1 left-2 font-mono text-[7px] text-emerald-400 group-hover:text-cyan-400 bg-black/50 px-1 rounded uppercase tracking-wider">
                  DET_FEED.0{(idx + 1) * 3} [ACC: 99%]
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* Cloned Set */}
        <div className="flex gap-[15px] pr-[15px] h-full">
          {imgs.map((src, idx) => (
            <div key={`clone-${idx}`} className="relative h-[22vh] md:h-[28vh] w-[300px] md:w-[400px] rounded-[8px] overflow-hidden shrink-0 shadow-xl group">
              <img src={src} alt="Gallery" className="w-full h-full object-cover opacity-50 group-hover:scale-105 transition-all duration-700 brightness-75 contrast-125" />
              <div className="absolute inset-4 border border-emerald-500/20 group-hover:border-cyan-500/60 transition-colors pointer-events-none rounded">
                <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t border-l border-emerald-400 group-hover:border-cyan-400" />
                <div className="absolute top-0 right-0 w-2.5 h-2.5 border-t border-r border-emerald-400 group-hover:border-cyan-400" />
                <div className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b border-l border-emerald-400 group-hover:border-cyan-400" />
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b border-r border-emerald-400 group-hover:border-cyan-400" />
                <div className="absolute top-1 left-2 font-mono text-[7px] text-emerald-400 group-hover:text-cyan-400 bg-black/50 px-1 rounded uppercase tracking-wider">
                  DET_FEED.0{(idx + 1) * 3} [ACC: 99%]
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <section className="relative w-full h-screen bg-[#03060f] m-0 p-0 overflow-hidden border-b border-cyan-500/10">
      <div className="w-full h-full overflow-hidden flex items-center justify-center bg-[#03060f]">
        
        {/* Diagonal Container */}
        <div className="absolute w-[150vw] h-[150vh] flex flex-col gap-[15px] py-[15px] -rotate-12 scale-110 opacity-40">
          {renderRow(images.row1, 'left', '45s')}
          {renderRow(images.row2, 'right', '55s')}
          {renderRow(images.row3, 'left', '40s')}
          {renderRow(images.row4, 'right', '60s')}
          {renderRow(images.row5, 'left', '50s')}
        </div>

        {/* Overlay Scrim for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#03060f]/60 via-[#03060f]/80 to-[#03060f] z-10 pointer-events-none" />

        {/* Foreground Content */}
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-6 pointer-events-none">
          <div className="pointer-events-auto flex flex-col items-center max-w-4xl">
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight text-white uppercase font-mono" style={{ textShadow: '0 0 30px rgba(0, 240, 255, 0.2)' }}>
              AI &amp; COMPUTER VISION<br />ENGINEER
            </h1>
            <p className="text-cyan-200/70 text-base md:text-lg max-w-2xl mb-10 leading-relaxed font-mono">
              [SYSTEM_STATEMENT]: Building autonomous agents, training high-precision deep learning architectures, and compiling low-latency edge vision nodes for active production environments.
            </p>

            <div className="flex items-center gap-4">
              <button
                onClick={scrollToProjects}
                className="bg-cyan-500 hover:bg-white text-[#03060f] font-bold text-sm uppercase tracking-widest px-10 py-4 rounded transition-all duration-300 shadow-[0_0_20px_rgba(0,240,255,0.25)]"
              >
                [ EXECUTE_PROJECT_QUERY ]
              </button>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
