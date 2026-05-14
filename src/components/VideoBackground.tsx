import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export const VideoBackground: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;
    
    let W = 0, H = 0;
    const dpr = window.devicePixelRatio || 1;
    let currentTime = 0;
    let targetTime = 0;
    let duration = 0;
    let ready = false;
    let rafId: number;

    const resize = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width = W + 'px';
      canvas.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const drawFrame = () => {
      if (video.readyState < 2) return;
      const vw = video.videoWidth;
      const vh = video.videoHeight;
      const scale = Math.max(W / vw, H / vh);
      const sw = vw * scale;
      const sh = vh * scale;
      const sx = (W - sw) / 2;
      const sy = (H - sh) / 2;
      ctx.drawImage(video, sx, sy, sw, sh);
    };

    const tick = () => {
      if (ready) {
        if (Math.abs(currentTime - targetTime) > 0.01) {
          currentTime = lerp(currentTime, targetTime, 0.08);
          video.currentTime = Math.max(0, Math.min(currentTime, duration - 0.1));
        }
        drawFrame();
      }
      rafId = requestAnimationFrame(tick);
    };

    const onMeta = () => {
      duration = video.duration || 10;
      video.pause();
      video.currentTime = 0;
      ready = true;
      resize();
      
      // Global scroll trigger — ties video scrubbing to the entire page scroll
      ScrollTrigger.create({
        trigger: document.body,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0,
        onUpdate: (self) => {
          // self.progress goes from 0 (top of page) to 1 (bottom of page)
          targetTime = self.progress * duration;
        }
      });
    };

    video.addEventListener('loadedmetadata', onMeta);
    if (video.readyState >= 1) {
      onMeta();
    }
    
    window.addEventListener('resize', resize);
    resize();
    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      video.removeEventListener('loadedmetadata', onMeta);
      window.removeEventListener('resize', resize);
      ScrollTrigger.getAll().forEach(st => st.kill());
    };
  }, []);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', background: '#020810' }}>
      <video
        ref={videoRef}
        muted
        playsInline
        preload="auto"
        style={{ display: 'none' }}
      >
        {/* Using the 4K MP4 file */}
        <source src="/13322952-uhd_3840_2160_30fps.mp4" type="video/mp4" />
      </video>

      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          zIndex: 1,
        }}
      />

      {/* Cinematic dark overlay so text remains readable */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 2,
          background: 'linear-gradient(180deg, rgba(2,8,16,0.3) 0%, rgba(2,8,16,0.7) 100%)',
        }}
      />
    </div>
  );
};
