import React, { useEffect, useRef } from 'react';
import { Renderer, Program, Mesh, Triangle, Texture } from 'ogl';

interface LiquidTextProps {
  lines: string[];
  className?: string;
  lineClassName?: string;
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

  varying vec2 vUv;

  vec3 envMap(vec3 R) {
      float y = R.y;
      vec3 color = mix(vec3(0.1), vec3(0.95), smoothstep(-0.5, 0.5, y));
      
      vec3 L = normalize(vec3(0.5, 1.0, 0.5));
      float specular = pow(max(dot(R, L), 0.0), 12.0);
      color += specular * 1.8;
      
      vec3 L2 = normalize(vec3(-0.5, 0.5, 0.8));
      float spec2 = pow(max(dot(R, L2), 0.0), 8.0);
      color += spec2 * 0.5;

      vec3 iri = vec3(
          0.5 + 0.5 * cos(3.0 * y + 0.0),
          0.5 + 0.5 * cos(3.0 * y + 2.0),
          0.5 + 0.5 * cos(3.0 * y + 4.0)
      );
      color += iri * 0.15;
      
      color += vec3(0.83, 0.68, 0.21) * pow(max(dot(R, normalize(vec3(-0.3, 0.8, -0.2))), 0.0), 5.0) * 0.2;
      
      return color;
  }

  void main() {
      vec2 uv = vUv;
      uv.y = 1.0 - uv.y;
      
      vec2 texel = 1.0 / uResolution;
      
      float c = texture2D(tMap, uv).r;
      
      float threshold = 0.45;
      
      if (c < threshold) {
          gl_FragColor = vec4(0.0);
          return;
      }
      
      float h = smoothstep(threshold, 1.0, c);
      
      float cx = texture2D(tMap, uv + vec2(texel.x, 0.0)).r;
      float cy = texture2D(tMap, uv + vec2(0.0, texel.y)).r;
      
      float hx = smoothstep(threshold, 1.0, cx);
      float hy = smoothstep(threshold, 1.0, cy);
      
      float dx = (hx - h) * 120.0;
      float dy = (hy - h) * 120.0;
      
      vec3 N = normalize(vec3(-dx, dy, 1.0));
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
  spanRef: HTMLSpanElement | null;
}

export const LiquidText: React.FC<LiquidTextProps> = ({ lines, className, lineClassName }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const spanRefs = useRef<Record<string, HTMLSpanElement | null>>({});

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const renderer = new Renderer({ canvas: canvasRef.current, width: window.innerWidth, height: window.innerHeight, dpr: window.devicePixelRatio, alpha: true });
    const gl = renderer.gl;
    // Set clear color to transparent
    gl.clearColor(0, 0, 0, 0);
    
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
      },
      transparent: true,
    });
    
    const mesh = new Mesh(gl, { geometry, program });

    const letters: PhysicsLetter[] = [];
    
    let fontStyle = 'bold 120px sans-serif'; // fallback
    let currentDelay = 0;

    // Read initial positions
    lines.forEach((line, lineIndex) => {
      line.split('').forEach((char, charIndex) => {
        if (char === ' ') return; // Skip spaces
        const span = spanRefs.current[`${lineIndex}-${charIndex}`];
        if (span) {
           const style = window.getComputedStyle(span);
           fontStyle = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
           
           letters.push({
             char,
             x: window.innerWidth / 2, // Start middle
             y: -200 - Math.random() * 300, // Fall from top
             tx: 0, // will be updated
             ty: 0,
             baseY: 0,
             vx: 0,
             vy: 0,
             mass: 1.0 + Math.random() * 0.4,
             damping: 0.75 + Math.random() * 0.1,
             stiffness: 0.03 + Math.random() * 0.02,
             delay: currentDelay + Math.random() * 0.1,
             active: false,
             phase: Math.random() * Math.PI * 2,
             spanRef: span
           });
           currentDelay += 0.05;
        }
      });
      currentDelay += 0.2; // Add more delay per line
    });

    const updateTargets = () => {
      if (!canvasRef.current) return;
      const canvasRect = canvasRef.current.getBoundingClientRect();
      
      letters.forEach(l => {
        if (l.spanRef) {
          const spanRect = l.spanRef.getBoundingClientRect();
          // Center of the span relative to canvas
          l.tx = spanRect.left - canvasRect.left + spanRect.width / 2;
          l.baseY = spanRect.top - canvasRect.top + spanRect.height / 2;
          // Offset Y slightly based on font baseline (canvas draws from bottom or middle)
          // We'll use textBaseline = 'middle' so this is perfect
          if (!l.active) {
            // Keep it updated if it hasn't fallen yet
             l.ty = l.baseY;
          }
        }
      });
    };

    updateTargets();

    let time = 0;
    let animationFrameId: number;

    const render = () => {
      time += 0.016;

      ctx.clearRect(0, 0, textCanvas.width, textCanvas.height);
      
      ctx.fillStyle = 'white';
      ctx.font = fontStyle;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      ctx.filter = 'blur(16px)'; 

      letters.forEach((l) => {
        if (time > l.delay) {
          l.active = true;
        }

        if (l.active) {
          const isSettled = Math.abs(l.y - l.ty) < 5 && Math.abs(l.vy) < 0.5;
          if (isSettled) {
             l.ty = l.baseY + Math.sin(time * 2.0 + l.phase) * 8.0; 
             l.tx += Math.sin(time * 1.5 + l.phase) * 0.1;
          } else {
             l.ty = l.baseY;
          }

          const fx = (l.tx - l.x) * l.stiffness;
          const fy = (l.ty - l.y) * l.stiffness;
          
          l.vx = (l.vx + fx / l.mass) * l.damping;
          l.vy = (l.vy + fy / l.mass) * l.damping;
          
          l.x += l.vx;
          l.y += l.vy;
          
          // Metaball attraction
          letters.forEach(other => {
             if (other !== l && other.active) {
                const dx = other.x - l.x;
                const dy = other.y - l.y;
                const dist = Math.sqrt(dx*dx + dy*dy);
                if (dist < 60 && dist > 0) {
                    l.vx += (dx / dist) * 0.04;
                    l.vy += (dy / dist) * 0.04;
                }
             }
          });
        }
        
        ctx.fillText(l.char, l.x, l.y);
      });
      
      ctx.filter = 'none';

      texture.image = textCanvas;
      texture.needsUpdate = true;

      program.uniforms.uTime.value = time;
      gl.clear(gl.COLOR_BUFFER_BIT); // Clear transparent before render
      renderer.render({ scene: mesh });

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    const handleResize = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      renderer.setSize(rect.width, rect.height);
      program.uniforms.uResolution.value = [rect.width, rect.height];
      textCanvas.width = rect.width;
      textCanvas.height = rect.height;
      updateTargets();
    };
    window.addEventListener('resize', handleResize);
    // Initial resize to match container, not window
    handleResize();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [lines]);

  return (
    <>
      <div ref={containerRef} className="absolute inset-0 z-20 pointer-events-none">
        <canvas ref={canvasRef} className="w-full h-full block" />
      </div>
      <h1 className={className}>
        {lines.map((line, lineIndex) => (
          <div key={lineIndex} className={lineClassName}>
            {line.split('').map((char, charIndex) => (
              <span
                key={`${lineIndex}-${charIndex}`}
                ref={el => spanRefs.current[`${lineIndex}-${charIndex}`] = el}
                className="inline-block opacity-0"
              >
                {char === ' ' ? '\u00A0' : char}
              </span>
            ))}
          </div>
        ))}
      </h1>
    </>
  );
};
