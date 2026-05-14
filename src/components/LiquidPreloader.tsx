import React, { useEffect, useRef, useState } from 'react';
import { Renderer, Program, Mesh, Triangle, Texture } from 'ogl';
import gsap from 'gsap';

interface LiquidPreloaderProps {
  onComplete: () => void;
}

const vertex = `
  attribute vec2 position;
  attribute vec2 uv;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

const fragment = `
  precision highp float;

  uniform sampler2D tMap;
  uniform float uTime;
  uniform vec2 uResolution;
  uniform float uDissolve;

  varying vec2 vUv;

  vec3 envMap(vec3 R) {
      float y = R.y;
      vec3 color = mix(vec3(0.1), vec3(0.95), smoothstep(-0.5, 0.5, y));
      
      // Virtual light source (upper right)
      vec3 L = normalize(vec3(0.5, 1.0, 0.5));
      float specular = pow(max(dot(R, L), 0.0), 12.0);
      color += specular * 1.8;
      
      // Secondary light
      vec3 L2 = normalize(vec3(-0.5, 0.5, 0.8));
      float spec2 = pow(max(dot(R, L2), 0.0), 8.0);
      color += spec2 * 0.5;

      // Iridescent tint shift
      vec3 iri = vec3(
          0.5 + 0.5 * cos(3.0 * y + 0.0),
          0.5 + 0.5 * cos(3.0 * y + 2.0),
          0.5 + 0.5 * cos(3.0 * y + 4.0)
      );
      color += iri * 0.15;
      
      // Gold/warmer accent
      color += vec3(0.83, 0.68, 0.21) * pow(max(dot(R, normalize(vec3(-0.3, 0.8, -0.2))), 0.0), 5.0) * 0.2;
      
      return color;
  }

  void main() {
      vec2 uv = vUv;
      // Invert Y for WebGL texture reading from canvas
      uv.y = 1.0 - uv.y;
      
      vec2 texel = 1.0 / uResolution;
      
      float c = texture2D(tMap, uv).r;
      
      // Add a slight downward dissolve effect
      if (uDissolve > 0.0) {
          c -= uDissolve * (2.0 - uv.y * 2.0);
      }
      
      float threshold = 0.45;
      
      if (c < threshold) {
          // Deep black background + grain
          float noise = fract(sin(dot(uv * uTime, vec2(12.9898, 78.233))) * 43758.5453);
          gl_FragColor = vec4(vec3(noise * 0.03), 1.0);
          return;
      }
      
      float h = smoothstep(threshold, 1.0, c);
      
      float cx = texture2D(tMap, uv + vec2(texel.x, 0.0)).r;
      float cy = texture2D(tMap, uv + vec2(0.0, texel.y)).r;
      
      if (uDissolve > 0.0) {
          cx -= uDissolve * (2.0 - uv.y * 2.0);
          cy -= uDissolve * (2.0 - (uv.y + texel.y) * 2.0);
      }

      float hx = smoothstep(threshold, 1.0, cx);
      float hy = smoothstep(threshold, 1.0, cy);
      
      float dx = (hx - h) * 120.0;
      float dy = (hy - h) * 120.0;
      
      vec3 N = normalize(vec3(-dx, dy, 1.0)); // Invert dy due to canvas coordinate space
      vec3 V = vec3(0.0, 0.0, 1.0);
      vec3 R = reflect(-V, N);
      
      vec3 color = envMap(R);
      
      float fresnel = pow(1.0 - max(dot(N, V), 0.0), 3.0);
      color += fresnel * vec3(0.9, 0.95, 1.0) * 0.5;
      
      float noise = fract(sin(dot(uv * uTime, vec2(12.9898, 78.233))) * 43758.5453);
      color += noise * 0.03;
      
      gl_FragColor = vec4(color, 1.0);
  }
`;

interface PhysicsLetter {
  char: string;
  x: number;
  y: number;
  tx: number;
  ty: number;
  vx: number;
  vy: number;
  mass: number;
  damping: number;
  stiffness: number;
  delay: number;
  active: boolean;
  phase: number;
  baseY: number;
}

export const LiquidPreloader: React.FC<LiquidPreloaderProps> = ({ onComplete }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const renderer = new Renderer({ canvas: canvasRef.current, width: window.innerWidth, height: window.innerHeight, dpr: window.devicePixelRatio, alpha: false });
    const gl = renderer.gl;
    
    // Offscreen 2D canvas for text
    const textCanvas = document.createElement('canvas');
    textCanvas.width = window.innerWidth;
    textCanvas.height = window.innerHeight;
    const ctx = textCanvas.getContext('2d', { willReadFrequently: true })!;

    const texture = new Texture(gl, { generateMipmaps: false, image: textCanvas });

    const geometry = new Triangle(gl);
    const program = new Program(gl, {
      vertex,
      fragment,
      uniforms: {
        tMap: { value: texture },
        uTime: { value: 0 },
        uResolution: { value: [window.innerWidth, window.innerHeight] },
        uDissolve: { value: 0.0 }
      },
    });
    
    const mesh = new Mesh(gl, { geometry, program });

    // Physics Setup
    const text = "PARTIZAN";
    const chars = text.split('');
    const letters: PhysicsLetter[] = [];
    
    // Calculate total width to center
    const fontSize = Math.min(window.innerWidth / text.length, 120);
    ctx.font = `bold ${fontSize}px sans-serif`;
    const metrics = chars.map(c => ctx.measureText(c).width);
    const totalWidth = metrics.reduce((a, b) => a + b, 0);
    const gap = 10;
    const fullWidth = totalWidth + gap * (chars.length - 1);
    
    let currentX = (window.innerWidth - fullWidth) / 2;
    const centerY = window.innerHeight / 2;

    chars.forEach((c, i) => {
      const w = ctx.measureText(c).width;
      const tx = currentX + w / 2;
      const ty = centerY;
      currentX += w + gap;

      letters.push({
        char: c,
        x: tx,
        y: -150 - Math.random() * 200, // Fall from above
        tx: tx,
        ty: ty,
        baseY: ty,
        vx: 0,
        vy: 0,
        mass: 1.0 + Math.random() * 0.5,
        damping: 0.75 + Math.random() * 0.1,
        stiffness: 0.03 + Math.random() * 0.02,
        delay: i * 0.15 + Math.random() * 0.1,
        active: false,
        phase: Math.random() * Math.PI * 2
      });
    });

    let time = 0;
    let animationFrameId: number;
    let dissolveProgress = { value: 0 };
    
    // Start dissolve after 2.5 seconds
    setTimeout(() => {
      gsap.to(dissolveProgress, {
        value: 1.0,
        duration: 1.5,
        ease: "power2.inOut",
        onComplete: () => {
          gsap.to(containerRef.current, {
            opacity: 0,
            duration: 0.8,
            ease: "power2.inOut",
            onComplete: () => {
              setIsDone(true);
              onComplete();
            }
          });
        }
      });
    }, 2500);

    const render = () => {
      time += 0.016;

      // 1. Update Physics
      ctx.fillStyle = 'black';
      ctx.fillRect(0, 0, textCanvas.width, textCanvas.height);
      
      // Draw white text
      ctx.fillStyle = 'white';
      ctx.font = `bold ${fontSize}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Heavy blur for SDF metaball effect
      ctx.filter = 'blur(16px)'; 

      letters.forEach((l) => {
        if (time > l.delay) {
          l.active = true;
        }

        if (l.active) {
          // Once near target, add oscillation
          const isSettled = Math.abs(l.y - l.ty) < 5 && Math.abs(l.vy) < 0.5;
          if (isSettled && dissolveProgress.value === 0) {
             l.ty = l.baseY + Math.sin(time * 2.0 + l.phase) * 15.0; // gentle float
             l.tx += Math.sin(time * 1.5 + l.phase) * 0.2; // slight horizontal drift
          }

          // Spring physics
          const fx = (l.tx - l.x) * l.stiffness;
          const fy = (l.ty - l.y) * l.stiffness;
          
          l.vx = (l.vx + fx / l.mass) * l.damping;
          l.vy = (l.vy + fy / l.mass) * l.damping;
          
          l.x += l.vx;
          l.y += l.vy;
          
          // Add some metaball drift
          letters.forEach(other => {
             if (other !== l && other.active) {
                const dx = other.x - l.x;
                const dy = other.y - l.y;
                const dist = Math.sqrt(dx*dx + dy*dy);
                if (dist < 80 && dist > 0) {
                    // pull together like mercury
                    l.vx += (dx / dist) * 0.05;
                    l.vy += (dy / dist) * 0.05;
                }
             }
          });
        }
        
        // Draw character
        ctx.fillText(l.char, l.x, l.y);
      });
      
      // Reset filter for next frame
      ctx.filter = 'none';

      // 2. Update Texture
      texture.image = textCanvas;
      texture.needsUpdate = true;

      // 3. Render WebGL
      program.uniforms.uTime.value = time;
      program.uniforms.uDissolve.value = dissolveProgress.value;
      renderer.render({ scene: mesh });

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    const handleResize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      program.uniforms.uResolution.value = [window.innerWidth, window.innerHeight];
      textCanvas.width = window.innerWidth;
      textCanvas.height = window.innerHeight;
      
      // Re-center logic would go here if needed
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [onComplete]);

  if (isDone) return null;

  return (
    <div ref={containerRef} className="fixed inset-0 z-[100] bg-black">
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
};
