import { useEffect, useState } from 'react';
import Lenis from '@studio-freight/lenis';
import { NeuralPreloader } from './components/NeuralPreloader';
import { WebGLFluid }      from './components/WebGLFluid';
import { BackgroundBrandText } from './components/BackgroundBrandText';
import { GlassOverlay }    from './components/GlassOverlay';
import { CartierHero }     from './components/CartierHero';

import { DiagonalMosaicHero } from './components/DiagonalMosaicHero';
import { ProjectGallery }  from './components/ProjectGallery';
import { CartierChapters } from './components/CartierChapters';
import { DetailDrawer }    from './components/DetailDrawer';
import { Footer }          from './components/Footer';

import { FutureReveal }    from './components/FutureReveal';
import { StatsCounter }    from './components/StatsCounter';
import { ServicesFlipCards } from './components/ServicesFlipCards';
import { BrandTicker }     from './components/BrandTicker';

import type { Project }    from './data';

function App() {
  const [loading, setLoading]               = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  /* Lenis smooth scroll */
  useEffect(() => {
    const lenis = new Lenis({
      duration:          1.2,
      easing:            (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation:       'vertical',
      gestureOrientation:'vertical',
      smoothWheel:       true,
      wheelMultiplier:   1,
      touchMultiplier:   2,
      infinite:          false,
    });
    
    // @ts-ignore - expose globally for easy control
    window.lenis = lenis;

    let rafId: number;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);
    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  /* Pause background scroll when a project modal is open */
  useEffect(() => {
    if (selectedProject) {
      // @ts-ignore
      window.lenis?.stop();
    } else {
      // @ts-ignore
      window.lenis?.start();
    }
  }, [selectedProject]);

  return (
    <div style={{ color: '#fff', position: 'relative', background: '#03060f' }} className="selection:bg-cyan-500 selection:text-white">
      
      {/* Cinematic Overlays */}
      <div className="fixed inset-0 pointer-events-none noise-bg z-[100] opacity-[0.03] mix-blend-overlay"></div>
      <div className="fixed inset-0 pointer-events-none vignette-bg z-[90]"></div>

      {/* Preloader */}
      {loading && <NeuralPreloader onComplete={() => setLoading(false)} />}

      {/* Fixed Background Layers */}
      <BackgroundBrandText text="SAMBHRAM" opacity={0.03} />
      <WebGLFluid />
      <GlassOverlay />

      {/* Scrollable page content */}
      <main
        style={{
          position:   'relative',
          zIndex:      10,
          opacity:     loading ? 0 : 1,
          transition: 'opacity 1.1s cubic-bezier(0.22,1,0.36,1) 0.1s',
        }}
      >
        <CartierHero />

        
        {/* The updated sequence from the reference guide */}
        <BrandTicker />
        <DiagonalMosaicHero />
        <div id="projects">
          <ProjectGallery onProjectClick={(p) => setSelectedProject(p)} />
        </div>
        
        <FutureReveal />
        <StatsCounter />
        <ServicesFlipCards />
        
        <CartierChapters />
        <Footer />
      </main>

      <DetailDrawer project={selectedProject} onClose={() => setSelectedProject(null)} />
    </div>
  );
}

export default App;
