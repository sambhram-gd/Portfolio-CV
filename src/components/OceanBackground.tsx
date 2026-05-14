import React, { useEffect, useRef } from 'react';

function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }

interface Star {
  x: number; y: number; r: number;
  baseAlpha: number; twinkleSpd: number; twinklePhs: number;
}

interface NNode {
  x: number; y: number;
  vx: number; vy: number;
  activation: number; fireTimer: number; hue: number;
}

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
  '  vec3 color = vec3(0.008, 0.025, 0.055);',
  '',
  '  vec2 b1orbit = vec2(0.5 + sin(uTime*0.31)*0.28, 0.5 + cos(uTime*0.23)*0.22);',
  '  vec2 b1c = mix(b1orbit, mouseN, 0.20);',
  '  float b1d = length(uv - b1c);',
  '  float b1s = smoothstep(0.55, 0.0, b1d);',
  '  color = mix(color, vec3(0.05, 0.28, 0.52), b1s * 0.75);',
  '',
  '  vec2 b2orbit = vec2(0.5 + cos(uTime*0.27)*0.32, 0.5 + sin(uTime*0.19)*0.26);',
  '  vec2 b2c = mix(b2orbit, mouseN, 0.12);',
  '  float b2d = length(uv - b2c);',
  '  float b2s = smoothstep(0.50, 0.0, b2d);',
  '  color = mix(color, vec3(0.02, 0.38, 0.45), b2s * 0.75);',
  '',
  '  vec2 b3orbit = vec2(0.5 + sin(uTime*0.18)*0.25, 0.5 + cos(uTime*0.34)*0.30);',
  '  vec2 b3c = mix(b3orbit, mouseN, 0.07);',
  '  float b3d = length(uv - b3c);',
  '  float b3s = smoothstep(0.60, 0.0, b3d);',
  '  color = mix(color, vec3(0.03, 0.18, 0.38), b3s * 0.75);',
  '',
  '  float b4d = length(uv - mouseN);',
  '  float b4s = smoothstep(0.30, 0.0, b4d);',
  '  color = mix(color, vec3(0.08, 0.40, 0.55), b4s * 0.75);',
  '',
  '  vec2 vigUV = uv * (1.0 - uv.yx);',
  '  float vig = vigUV.x * vigUV.y * 18.0;',
  '  vig = pow(vig, 0.38);',
  '  color *= vig;',
  '',
  '  color = pow(color, vec3(0.88));',
  '',
  '  gl_FragColor = vec4(color, 1.0);',
  '}'
].join('\n');

export const OceanBackground: React.FC = () => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const glCanvasRef = useRef<HTMLCanvasElement>(null);
  const starCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const glCanvas = glCanvasRef.current;
    const starCanvas = starCanvasRef.current;
    if (!wrapper || !glCanvas || !starCanvas) return;

    const gl = glCanvas.getContext('webgl', { alpha: false, antialias: false });
    if (!gl) return;

    // Compile shaders
    const compileShader = (src: string, type: number): WebGLShader | null => {
      const s = gl.createShader(type);
      if (!s) return null;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
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
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1, -1, 1, -1, -1, 1, 1, -1, 1, 1, -1, 1
    ]), gl.STATIC_DRAW);

    const aPos = gl.getAttribLocation(prog, 'aPos');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(prog, 'uTime');
    const uResolution = gl.getUniformLocation(prog, 'uResolution');
    const uMouse = gl.getUniformLocation(prog, 'uMouse');

    const ctx = starCanvas.getContext('2d')!;

    let W = 0, H = 0;
    const dpr = window.devicePixelRatio || 1;

    const resize = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      glCanvas.width = W * dpr;
      glCanvas.height = H * dpr;
      glCanvas.style.width = W + 'px';
      glCanvas.style.height = H + 'px';
      gl.viewport(0, 0, W * dpr, H * dpr);
      starCanvas.width = W * dpr;
      starCanvas.height = H * dpr;
      starCanvas.style.width = W + 'px';
      starCanvas.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    let mRaw: { x: number; y: number } | null = null;
    const smoothMouse = { x: W / 2, y: H / 2 };

    const onMouseMove = (e: MouseEvent) => {
      mRaw = { x: e.clientX, y: e.clientY };
    };
    const onMouseLeave = () => { mRaw = null; };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseleave', onMouseLeave);

    // Stars
    const stars: Star[] = [];
    for (let i = 0; i < 120; i++) {
      stars.push({
        x: Math.random(), y: Math.random(),
        r: 0.3 + Math.random() * 0.7,
        baseAlpha: 0.06 + Math.random() * 0.3,
        twinkleSpd: 0.006 + Math.random() * 0.014,
        twinklePhs: Math.random() * Math.PI * 2
      });
    }

    // Neural nodes (fewer, subtler for bg)
    const nodes: NNode[] = [];
    for (let i = 0; i < 40; i++) {
      nodes.push({
        x: Math.random(), y: Math.random(),
        vx: (Math.random() - 0.5) * 0.001,
        vy: (Math.random() - 0.5) * 0.001,
        activation: Math.random() * 0.05,
        fireTimer: Math.floor(Math.random() * 500),
        hue: 185 + Math.random() * 25
      });
    }

    let t = 0;
    let rafId: number;

    const frame = () => {
      t += 0.008;
      const target = mRaw || { x: W / 2, y: H / 2 };
      smoothMouse.x = lerp(smoothMouse.x, target.x, 0.055);
      smoothMouse.y = lerp(smoothMouse.y, target.y, 0.055);

      // WebGL
      gl.uniform1f(uTime, t);
      gl.uniform2f(uResolution, W * dpr, H * dpr);
      gl.uniform2f(uMouse, smoothMouse.x * dpr, (H - smoothMouse.y) * dpr);
      gl.drawArrays(gl.TRIANGLES, 0, 6);

      // 2D overlay
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

      // Neural
      for (const n of nodes) {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0) { n.x = 0; n.vx *= -1; }
        if (n.x > 1) { n.x = 1; n.vx *= -1; }
        if (n.y < 0) { n.y = 0; n.vy *= -1; }
        if (n.y > 1) { n.y = 1; n.vy *= -1; }
        n.fireTimer--;
        if (n.fireTimer <= 0) {
          n.activation = Math.min(1.0, n.activation + 0.5);
          n.fireTimer = 300 + Math.floor(Math.random() * 400);
        }
        n.activation *= 0.97;
      }

      ctx.globalCompositeOperation = 'screen';
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j];
          const dx = (a.x - b.x) * W, dy = (a.y - b.y) * H;
          const distSq = dx * dx + dy * dy;
          if (distSq > 130 * 130) continue;
          const ca = (a.activation + b.activation) / 2;
          const dist = Math.sqrt(distSq);
          if (ca < 0.01 && dist > 100) continue;
          const dr = 1 - dist / 130;
          const alpha = dr * 0.03 + dr * ca * 0.2;
          if (alpha < 0.005) continue;
          ctx.strokeStyle = 'hsla(195,85%,65%,' + alpha.toFixed(3) + ')';
          ctx.lineWidth = 0.3 + ca * 0.6;
          ctx.beginPath();
          ctx.moveTo(a.x * W, a.y * H);
          ctx.lineTo(b.x * W, b.y * H);
          ctx.stroke();
        }
      }

      for (const n of nodes) {
        const nx = n.x * W, ny = n.y * H;
        if (n.activation > 0.04) {
          const outerR = n.activation * 14;
          const g = ctx.createRadialGradient(nx, ny, 0, nx, ny, outerR);
          g.addColorStop(0, 'hsla(' + n.hue + ',95%,72%,' + (n.activation * 0.3).toFixed(3) + ')');
          g.addColorStop(1, 'hsla(' + n.hue + ',90%,60%,0)');
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(nx, ny, outerR, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = 'hsla(' + n.hue + ',90%,68%,' + (0.06 + n.activation * 0.35).toFixed(3) + ')';
        ctx.beginPath();
        ctx.arc(nx, ny, 1, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalCompositeOperation = 'screen';
      }

      rafId = requestAnimationFrame(frame);
    };

    rafId = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseleave', onMouseLeave);
      gl.deleteProgram(prog);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteBuffer(buf);
    };
  }, []);

  return (
    <div ref={wrapperRef} style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
      <canvas ref={glCanvasRef} style={{ position: 'absolute', top: 0, left: 0, display: 'block', zIndex: 1 }} />
      <canvas ref={starCanvasRef} style={{ position: 'absolute', top: 0, left: 0, display: 'block', zIndex: 2 }} />
    </div>
  );
};
