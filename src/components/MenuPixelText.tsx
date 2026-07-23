import React, { useRef, useEffect } from "react";
import gsap from "gsap";

interface Props {
  text: string;
  className?: string;
  activeColor?: string;
}

export const MenuPixelText: React.FC<Props> = ({ 
  text, 
  className = "", 
  activeColor = "rgb(0, 240, 255)" // Cyber cyan
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    if (isMobile || !canvasRef.current || !containerRef.current) return;

    const canvas = canvasRef.current;
    const gl = canvas.getContext("webgl", { alpha: true });
    
    if (!gl) return;

    const textCanvas = document.createElement("canvas");
    const textCtx = textCanvas.getContext("2d");
    if (!textCtx) return;

    const drawText = () => {
      if (!containerRef.current || !textCtx) return;
      const rect = containerRef.current.getBoundingClientRect();
      const pr = Math.min(window.devicePixelRatio, 2);
      
      canvas.width = rect.width * pr;
      canvas.height = rect.height * pr;
      textCanvas.width = canvas.width;
      textCanvas.height = canvas.height;
      
      textCtx.clearRect(0, 0, textCanvas.width, textCanvas.height);
      
      const parentStyle = window.getComputedStyle(containerRef.current);
      const rawFontSize = parseFloat(parentStyle.fontSize);
      const canvasFontSize = rawFontSize * pr;
      
      textCtx.font = `${parentStyle.fontWeight} ${canvasFontSize}px ${parentStyle.fontFamily}`;
      textCtx.fillStyle = "white";
      textCtx.textAlign = "center";
      textCtx.textBaseline = "middle";
      textCtx.letterSpacing = parentStyle.letterSpacing;
      
      textCtx.fillText(text, textCanvas.width / 2, textCanvas.height / 2);
    };

    const vsSource = `
      attribute vec4 a_position;
      attribute vec2 a_texcoord;
      varying vec2 v_texcoord;
      void main() {
        gl_Position = a_position;
        v_texcoord = a_texcoord;
      }
    `;

    const fsSource = `
      precision highp float;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;
      uniform float u_hover;
      uniform float u_time;
      uniform sampler2D u_texture;
      uniform vec3 u_activeColor;
      varying vec2 v_texcoord;
      
      void main() {
        vec2 p = v_texcoord;
        vec2 pixelCoords = p * u_resolution;
        vec2 mouseCoords = vec2(u_mouse.x, u_mouse.y) * u_resolution;
        
        float dist = distance(pixelCoords, mouseCoords);
        float radius = 180.0;
        
        // Watery gel stretching distortion
        if (dist < radius) {
          float force = (radius - dist) / radius; // 0 to 1
          float strength = pow(force, 2.2) * 0.14 * u_hover;
          
          // Wave dynamics
          float wave = sin(dist * 0.08 - u_time * 6.0) * 0.02 * force * u_hover;
          
          vec2 dir = normalize(pixelCoords - mouseCoords);
          // Apply push/stretch displacement
          p -= dir * (strength + wave);
        }
        
        // Keep bounds check to avoid coordinate bleeding
        if (p.x < 0.0 || p.x > 1.0 || p.y < 0.0 || p.y > 1.0) {
          discard;
        }

        vec4 colorCrisp = texture2D(u_texture, p);
        
        // Glow effect
        vec4 finalColor = colorCrisp;
        if (finalColor.a > 0.0) {
          float glow = smoothstep(radius, 0.0, dist) * u_hover;
          finalColor.rgb = mix(finalColor.rgb, u_activeColor, glow * 0.75);
        }
        
        gl_FragColor = finalColor;
      }
    `;

    const createShader = (gl: WebGLRenderingContext, type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      return shader;
    };

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fsSource);
    if (!vertexShader || !fragmentShader) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.useProgram(program);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]), gl.STATIC_DRAW);
    const posLoc = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    const texcoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0,1, 1,1, 0,0, 0,0, 1,1, 1,0]), gl.STATIC_DRAW);
    const texLoc = gl.getAttribLocation(program, "a_texcoord");
    gl.enableVertexAttribArray(texLoc);
    gl.vertexAttribPointer(texLoc, 2, gl.FLOAT, false, 0, 0);

    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    const uResolution = gl.getUniformLocation(program, "u_resolution");
    const uMouse = gl.getUniformLocation(program, "u_mouse");
    const uHover = gl.getUniformLocation(program, "u_hover");
    const uTime = gl.getUniformLocation(program, "u_time");
    const uColor = gl.getUniformLocation(program, "u_activeColor");

    const uniforms = { mouse: { x: 0.5, y: 0.5 }, hover: 0.0, time: 0.0 };

    const resize = () => {
      if (!containerRef.current) return;
      drawText();
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uResolution, canvas.width, canvas.height);
      
      const rgb = activeColor.match(/\d+/g)?.map(Number) || [0, 240, 255];
      gl.uniform3f(uColor, rgb[0]/255, rgb[1]/255, rgb[2]/255);
      
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textCanvas);
    };

    window.addEventListener("resize", resize);
    document.fonts.ready.then(resize);

    let frameId: number;
    let startTime = Date.now();
    const render = () => {
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform2f(uMouse, uniforms.mouse.x, uniforms.mouse.y);
      gl.uniform1f(uHover, uniforms.hover);
      gl.uniform1f(uTime, (Date.now() - startTime) / 1000.0);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      frameId = requestAnimationFrame(render);
    };
    render();

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      uniforms.mouse.x = x;
      uniforms.mouse.y = y;
    };

    const onMouseEnter = () => { gsap.to(uniforms, { hover: 1.0, duration: 0.4 }); };
    const onMouseLeave = () => { gsap.to(uniforms, { hover: 0.0, duration: 0.6 }); };

    const parent = containerRef.current;
    if (parent) {
      parent.addEventListener("mousemove", onMouseMove);
      parent.addEventListener("mouseenter", onMouseEnter);
      parent.addEventListener("mouseleave", onMouseLeave);
    }

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", resize);
      if (parent) {
        parent.removeEventListener("mousemove", onMouseMove);
        parent.removeEventListener("mouseenter", onMouseEnter);
        parent.removeEventListener("mouseleave", onMouseLeave);
      }
    };
  }, [text, activeColor]);

  return (
    <div ref={containerRef} className={`relative flex items-center justify-center ${className}`}>
      <span className="opacity-0 pointer-events-none select-none">{text}</span>
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />
    </div>
  );
};
