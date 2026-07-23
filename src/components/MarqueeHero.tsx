import React from 'react';

export const MarqueeHero: React.FC = () => {
  const images = {
    row1: [
      "https://picsum.photos/seed/r1i1/600/400",
      "https://picsum.photos/seed/r1i2/600/400",
      "https://picsum.photos/seed/r1i3/600/400",
      "https://picsum.photos/seed/r1i4/600/400",
      "https://picsum.photos/seed/r1i5/600/400",
      "https://picsum.photos/seed/r1i6/600/400",
    ],
    row2: [
      "https://picsum.photos/seed/r2i1/600/400",
      "https://picsum.photos/seed/r2i2/600/400",
      "https://picsum.photos/seed/r2i3/600/400",
      "https://picsum.photos/seed/r2i4/600/400",
      "https://picsum.photos/seed/r2i5/600/400",
      "https://picsum.photos/seed/r2i6/600/400",
    ],
    row3: [
      "https://picsum.photos/seed/r3i1/600/400",
      "https://picsum.photos/seed/r3i2/600/400",
      "https://picsum.photos/seed/r3i3/600/400",
      "https://picsum.photos/seed/r3i4/600/400",
      "https://picsum.photos/seed/r3i5/600/400",
      "https://picsum.photos/seed/r3i6/600/400",
    ],
    row4: [
      "https://picsum.photos/seed/r4i1/600/400",
      "https://picsum.photos/seed/r4i2/600/400",
      "https://picsum.photos/seed/r4i3/600/400",
      "https://picsum.photos/seed/r4i4/600/400",
      "https://picsum.photos/seed/r4i5/600/400",
      "https://picsum.photos/seed/r4i6/600/400",
    ],
  };

  const renderRow = (imgs: string[], direction: 'left' | 'right', duration: string) => (
    <div 
      className={`flex-1 overflow-hidden flex items-center group/row`}
      style={{ '--duration': duration } as React.CSSProperties}
    >
      <div className={`flex w-max will-change-transform ${direction === 'left' ? 'animate-marquee-left' : 'animate-marquee-right'}`}>
        {/* Original Set */}
        <div className="flex gap-[10px] pr-[10px] h-full">
          {imgs.map((src, idx) => (
            <img key={`orig-${idx}`} src={src} alt="Gallery" className="h-[calc(25vh-20px)] w-[320px] object-cover rounded-[4px] shrink-0 opacity-80 transition-opacity duration-500 hover:opacity-100" />
          ))}
        </div>
        {/* Cloned Set */}
        <div className="flex gap-[10px] pr-[10px] h-full">
          {imgs.map((src, idx) => (
            <img key={`clone-${idx}`} src={src} alt="Gallery" className="h-[calc(25vh-20px)] w-[320px] object-cover rounded-[4px] shrink-0 opacity-80 transition-opacity duration-500 hover:opacity-100" />
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <section className="relative w-full h-[100vh] overflow-hidden bg-[#060b1f] flex z-10 group">
      
      {/* Background Marquee Container */}
      <div className="absolute inset-0 flex flex-col h-full w-full gap-[10px] py-[10px] group-hover:[&_.will-change-transform]:[animation-play-state:paused]">
        {renderRow(images.row1, 'left', '45s')}
        {renderRow(images.row2, 'right', '55s')}
        {renderRow(images.row3, 'left', '40s')}
        {renderRow(images.row4, 'right', '60s')}
      </div>

      {/* Overlay Scrim */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#060b1f]/50 via-[#060b1f]/70 to-[#060b1f]/95 z-10 pointer-events-none"></div>

      {/* Content */}
      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-6 pointer-events-none">
        <div className="pointer-events-auto flex flex-col items-center">
          <h2 className="text-white text-5xl md:text-7xl mb-4 tracking-tight drop-shadow-2xl font-heading">
            Infinite Gallery
          </h2>
          <p className="text-gray-300 text-lg md:text-xl max-w-2xl mb-10 drop-shadow-md font-body font-light">
            Experience a continuous, immersive visual journey. A cinematic multi-row marquee designed to showcase technical mastery and premium execution.
          </p>
          <button className="px-8 py-4 bg-white/10 backdrop-blur-md border border-white/20 text-white font-mono uppercase tracking-widest text-sm hover:bg-white hover:text-black transition-all shadow-xl hover:shadow-2xl">
            Explore Projects
          </button>
        </div>
      </div>
    </section>
  );
};
