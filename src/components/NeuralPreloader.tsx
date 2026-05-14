import React, { useEffect, useRef, useState, useCallback } from 'react';

interface NeuralPreloaderProps {
  onComplete: () => void;
}

interface Star {
  x: number; y: number; r: number;
  baseAlpha: number; twinkleSpd: number; twinklePhs: number;
}

interface NNode {
  x: number; y: number;
  vx: number; vy: number;
  activation: number; fireTimer: number; hue: number;
}

function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }

// ─── Shader sources ───
const VERT_SRC = [
  'attribute vec2 aPos;',
  'void main(){',
  '  gl_Position = vec4(aPos, 0.0, 1.0);',
  '}'
].join('\n');

const FRAG_SRC = [
  'precision highp float;',
  'uniform float uTime;',
  'uniform vec2 uResolution;',
  'uniform vec2 uMouse;',
  '',
  'void main(){',
  '  vec2 uv = gl_FragCoord.xy / uResolution;',
  '  vec2 mouseN = uMouse / uResolution;',
  '',
  '  // Base color',
  '  vec3 color = vec3(0.008, 0.025, 0.055);',
  '',
  '  // Blob 1 — deep blue',
  '  vec2 b1orbit = vec2(0.5 + sin(uTime*0.31)*0.28, 0.5 + cos(uTime*0.23)*0.22);',
  '  vec2 b1c = mix(b1orbit, mouseN, 0.20);',
  '  float b1d = length(uv - b1c);',
  '  float b1s = smoothstep(0.55, 0.0, b1d);',
  '  color = mix(color, vec3(0.05, 0.28, 0.52), b1s * 0.75);',
  '',
  '  // Blob 2 — teal cyan',
  '  vec2 b2orbit = vec2(0.5 + cos(uTime*0.27)*0.32, 0.5 + sin(uTime*0.19)*0.26);',
  '  vec2 b2c = mix(b2orbit, mouseN, 0.12);',
  '  float b2d = length(uv - b2c);',
  '  float b2s = smoothstep(0.50, 0.0, b2d);',
  '  color = mix(color, vec3(0.02, 0.38, 0.45), b2s * 0.75);',
  '',
  '  // Blob 3 — navy',
  '  vec2 b3orbit = vec2(0.5 + sin(uTime*0.18)*0.25, 0.5 + cos(uTime*0.34)*0.30);',
  '  vec2 b3c = mix(b3orbit, mouseN, 0.07);',
  '  float b3d = length(uv - b3c);',
  '  float b3s = smoothstep(0.60, 0.0, b3d);',
  '  color = mix(color, vec3(0.03, 0.18, 0.38), b3s * 0.75);',
  '',
  '  // Blob 4 — mouse glow',
  '  float b4d = length(uv - mouseN);',
  '  float b4s = smoothstep(0.30, 0.0, b4d);',
  '  color = mix(color, vec3(0.08, 0.40, 0.55), b4s * 0.75);',
  '',
  '  // Vignette',
  '  vec2 vigUV = uv * (1.0 - uv.yx);',
  '  float vig = vigUV.x * vigUV.y * 18.0;',
  '  vig = pow(vig, 0.38);',
  '  color *= vig;',
  '',
  '  // Brightness lift',
  '  color = pow(color, vec3(0.88));',
  '',
  '  gl_FragColor = vec4(color, 1.0);',
  '}'
].join('\n');

export const NeuralPreloader: React.FC<NeuralPreloaderProps> = ({ onComplete }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const glCanvasRef = useRef<HTMLCanvasElement>(null);
  const starCanvasRef = useRef<HTMLCanvasElement>(null);
  const charRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const brandName = 'SAMBHRAM DODDAMANE';
  const [dots, setDots] = useState('');
  const [isExiting, setIsExiting] = useState(false);
  const [textVisible, setTextVisible] = useState(false);
  const exitTriggered = useRef(false);

  // Dot animation
  useEffect(() => {
    let count = 0;
    const iv = setInterval(() => {
      count = (count + 1) % 4;
      setDots('.'.repeat(count));
    }, 480);
    return () => clearInterval(iv);
  }, []);

  // Text fade-in
  useEffect(() => {
    const timer = setTimeout(() => setTextVisible(true), 400);
    return () => clearTimeout(timer);
  }, []);

  const triggerExit = useCallback(() => {
    if (exitTriggered.current) return;
    exitTriggered.current = true;
    setIsExiting(true);
    setTimeout(onComplete, 700);
  }, [onComplete]);

  // Exit listeners
  useEffect(() => {
    const handler = () => triggerExit();
    window.addEventListener('scroll', handler, { once: true });
    window.addEventListener('click', handler, { once: true });
    window.addEventListener('wheel', handler, { once: true });
    window.addEventListener('touchstart', handler, { once: true });
    const timeout = setTimeout(handler, 3500);
    return () => {
      window.removeEventListener('scroll', handler);
      window.removeEventListener('click', handler);
      window.removeEventListener('wheel', handler);
      window.removeEventListener('touchstart', handler);
      clearTimeout(timeout);
    };
  }, [triggerExit]);

  // Main render loop
  useEffect(() => {
    const wrapper = wrapperRef.current;
    const glCanvas = glCanvasRef.current;
    const starCanvas = starCanvasRef.current;
    if (!wrapper || !glCanvas || !starCanvas) return;

    // ─── WebGL setup ───
    const gl = glCanvas.getContext('webgl', { alpha: false, antialias: false });
    if (!gl) return;

    const compileShader = (src: string, type: number): WebGLShader | null => {
      const s = gl.createShader(type);
      if (!s) return null;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.error('Shader compile error:', gl.getShaderInfoLog(s));
        gl.deleteShader(s);
        return null;
      }
      return s;
    };

    const vs = compileShader(VERT_SRC, gl.VERTEX_SHADER);
    const fs = compileShader(FRAG_SRC, gl.FRAGMENT_SHADER);
    if (!vs || !fs) return;

    const prog = gl.createProgram()!;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(prog));
      return;
    }
    gl.useProgram(prog);

    // Fullscreen quad
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1, -1,  1, -1,  -1, 1,
       1, -1,  1,  1,  -1, 1
    ]), gl.STATIC_DRAW);

    const aPos = gl.getAttribLocation(prog, 'aPos');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(prog, 'uTime');
    const uResolution = gl.getUniformLocation(prog, 'uResolution');
    const uMouse = gl.getUniformLocation(prog, 'uMouse');

    // ─── 2D canvas setup ───
    const ctx = starCanvas.getContext('2d')!;

    // ─── Sizing ───
    let W = 0, H = 0;
    const dpr = window.devicePixelRatio || 1;

    const resize = () => {
      W = wrapper.clientWidth;
      H = wrapper.clientHeight;
      // WebGL canvas
      glCanvas.width = W * dpr;
      glCanvas.height = H * dpr;
      glCanvas.style.width = W + 'px';
      glCanvas.style.height = H + 'px';
      gl.viewport(0, 0, W * dpr, H * dpr);
      // Star canvas
      starCanvas.width = W * dpr;
      starCanvas.height = H * dpr;
      starCanvas.style.width = W + 'px';
      starCanvas.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    // ─── Mouse ───
    let mRaw: { x: number; y: number } | null = null;
    const smoothMouse = { x: W / 2, y: H / 2 };

    const onMouseMove = (e: MouseEvent) => {
      const r = wrapper.getBoundingClientRect();
      mRaw = { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    const onMouseLeave = () => { mRaw = null; };
    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const r = wrapper.getBoundingClientRect();
      mRaw = { x: e.touches[0].clientX - r.left, y: e.touches[0].clientY - r.top };
    };

    wrapper.addEventListener('mousemove', onMouseMove);
    wrapper.addEventListener('mouseleave', onMouseLeave);
    wrapper.addEventListener('touchmove', onTouchMove, { passive: false });

    // ─── Stars ───
    const stars: Star[] = [];
    for (let i = 0; i < 160; i++) {
      stars.push({
        x: Math.random(), y: Math.random(),
        r: 0.3 + Math.random() * 0.8,
        baseAlpha: 0.08 + Math.random() * 0.42,
        twinkleSpd: 0.006 + Math.random() * 0.018,
        twinklePhs: Math.random() * Math.PI * 2
      });
    }

    // ─── Neural nodes ───
    const nodes: NNode[] = [];
    for (let i = 0; i < 70; i++) {
      nodes.push({
        x: Math.random(), y: Math.random(),
        vx: (Math.random() - 0.5) * 0.0016,
        vy: (Math.random() - 0.5) * 0.0016,
        activation: Math.random() * 0.08,
        fireTimer: Math.floor(Math.random() * 400),
        hue: 185 + Math.random() * 25
      });
    }

    let t = 0;
    let rafId: number;

    // ─── Frame loop ───
    const frame = () => {
      t += 0.008;

      // Smooth mouse
      const target = mRaw || { x: W / 2, y: H / 2 };
      smoothMouse.x = lerp(smoothMouse.x, target.x, 0.055);
      smoothMouse.y = lerp(smoothMouse.y, target.y, 0.055);

      // ══════════════════════════════════
      // 1. WebGL — smooth gradient blobs
      // ══════════════════════════════════
      gl.uniform1f(uTime, t);
      gl.uniform2f(uResolution, W * dpr, H * dpr);
      // Flip Y for WebGL coordinate system
      gl.uniform2f(uMouse, smoothMouse.x * dpr, (H - smoothMouse.y) * dpr);
      gl.drawArrays(gl.TRIANGLES, 0, 6);

      // ══════════════════════════════════
      // 2. Stars + Neural on 2D canvas
      // ══════════════════════════════════
      ctx.clearRect(0, 0, W, H);

      // Stars
      ctx.globalCompositeOperation = 'source-over';
      for (const s of stars) {
        const tw = 0.5 + 0.5 * Math.sin(t * s.twinkleSpd * 100 + s.twinklePhs);
        const fa = s.baseAlpha * (0.4 + 0.6 * tw);
        ctx.fillStyle = 'rgba(180,220,255,' + fa.toFixed(3) + ')';
        ctx.beginPath();
        ctx.arc(s.x * W, s.y * H, s.r * dpr, 0, Math.PI * 2);
        ctx.fill();
      }

      // Neural node physics
      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0) { n.x = 0; n.vx *= -1; }
        if (n.x > 1) { n.x = 1; n.vx *= -1; }
        if (n.y < 0) { n.y = 0; n.vy *= -1; }
        if (n.y > 1) { n.y = 1; n.vy *= -1; }
        n.fireTimer--;
        if (n.fireTimer <= 0) {
          n.activation = Math.min(1.0, n.activation + 0.6);
          n.fireTimer = 220 + Math.floor(Math.random() * 280);
        }
        n.activation *= 0.97;
      }

      // Neural edges
      ctx.globalCompositeOperation = 'screen';
      const edgeThresh = 130;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j];
          const dx = (a.x - b.x) * W;
          const dy = (a.y - b.y) * H;
          const distSq = dx * dx + dy * dy;
          if (distSq > edgeThresh * edgeThresh) continue;
          const ca = (a.activation + b.activation) / 2;
          const dist = Math.sqrt(distSq);
          if (ca < 0.01 && dist > 100) continue;
          const dr = 1 - dist / edgeThresh;
          const alpha = dr * 0.04 + dr * ca * 0.28;
          if (alpha < 0.01) continue;
          ctx.strokeStyle = 'hsla(195,85%,65%,' + alpha.toFixed(3) + ')';
          ctx.lineWidth = 0.4 + ca * 0.8;
          ctx.beginPath();
          ctx.moveTo(a.x * W, a.y * H);
          ctx.lineTo(b.x * W, b.y * H);
          ctx.stroke();
        }
      }

      // Neural node glow + core
      for (const n of nodes) {
        const nx = n.x * W, ny = n.y * H;
        if (n.activation > 0.04) {
          const outerR = n.activation * 16;
          const g = ctx.createRadialGradient(nx, ny, 0, nx, ny, outerR);
          g.addColorStop(0, 'hsla(' + n.hue + ',95%,72%,' + (n.activation * 0.4).toFixed(3) + ')');
          g.addColorStop(1, 'hsla(' + n.hue + ',90%,60%,0)');
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(nx, ny, outerR, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = 'hsla(' + n.hue + ',90%,68%,' + (0.08 + n.activation * 0.45).toFixed(3) + ')';
        ctx.beginPath();
        ctx.arc(nx, ny, 1.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalCompositeOperation = 'screen';
      }

      // ══════════════════════════════════
      // 3. Text cloth wave
      // ══════════════════════════════════
      const wRect = wrapper.getBoundingClientRect();
      const mouseCSSx = smoothMouse.x;
      const mouseCSSy = smoothMouse.y;

      for (let ci = 0; ci < charRefs.current.length; ci++) {
        const span = charRefs.current[ci];
        if (!span) continue;

        // Base wave (always running)
        const wave1 = Math.sin(t * 2.2 + ci * 0.5) * 4.5;
        const wave2 = Math.sin(t * 1.5 + ci * 0.38) * 2.0;
        const baseY = wave1 + wave2;

        // Mouse proximity amplifier
        let amp = 0;
        if (mRaw) {
          const sr = span.getBoundingClientRect();
          const cx = sr.left - wRect.left + sr.width / 2;
          const cy = sr.top - wRect.top + sr.height / 2;
          const dx = cx - mouseCSSx;
          const dy = cy - mouseCSSy;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const radius = 120;
          if (dist < radius) {
            const inf = 1 - dist / radius;
            amp = inf * inf;
          }
        }

        const totalY = baseY * (1 + amp * 2.5);
        span.style.transform = 'translateY(' + totalY.toFixed(1) + 'px)';
      }

      rafId = requestAnimationFrame(frame);
    };

    rafId = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
      wrapper.removeEventListener('mousemove', onMouseMove);
      wrapper.removeEventListener('mouseleave', onMouseLeave);
      wrapper.removeEventListener('touchmove', onTouchMove);
      gl.deleteProgram(prog);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteBuffer(buf);
    };
  }, []);

  return (
    <div
      ref={wrapperRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        overflow: 'hidden',
        opacity: isExiting ? 0 : 1,
        transition: 'opacity 700ms ease-in',
      }}
    >
      {/* Layer 1: WebGL gradient */}
      <canvas
        ref={glCanvasRef}
        style={{ position: 'absolute', top: 0, left: 0, display: 'block', zIndex: 1 }}
      />

      {/* Layer 2: Stars + Neural (2D canvas) */}
      <canvas
        ref={starCanvasRef}
        style={{ position: 'absolute', top: 0, left: 0, display: 'block', zIndex: 2 }}
      />

      {/* Layer 3: Text */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%,-50%)',
          pointerEvents: 'none',
          userSelect: 'none',
          textAlign: 'center',
          zIndex: 3,
          opacity: textVisible ? 1 : 0,
          transition: 'opacity 800ms ease-out',
        }}
      >
        <div
          style={{
            fontFamily: 'system-ui, sans-serif',
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            color: 'rgba(255,255,255,0.32)',
            marginBottom: 12,
            whiteSpace: 'nowrap',
          }}
        >
          {brandName.split('').map((ch, i) => (
            <span
              key={i}
              ref={el => { charRefs.current[i] = el; }}
              style={{
                display: 'inline-block',
                whiteSpace: 'pre',
                willChange: 'transform',
              }}
            >
              {ch === ' ' ? '\u00A0' : ch}
            </span>
          ))}
        </div>
        <div
          style={{
            fontFamily: 'monospace',
            fontSize: '0.8rem',
            letterSpacing: '0.25em',
            color: 'rgba(80,200,255,0.28)',
            textTransform: 'uppercase' as const,
          }}
        >
          loading{dots}
        </div>
      </div>
    </div>
  );
};
