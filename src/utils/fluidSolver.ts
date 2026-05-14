/* ═══════════════════════════════════════════════════════════════════
   WebGL Navier-Stokes Fluid Solver
   Based on Jos Stam's "Real-Time Fluid Dynamics for Games" and
   Pavel Dobryakov's WebGL Fluid Simulation.
   ═══════════════════════════════════════════════════════════════════ */

// ── Shader sources ─────────────────────────────────────────────────

const BASE_VERT = `
  precision highp float;
  attribute vec2 aPosition;
  varying vec2 vUv;
  varying vec2 vL;
  varying vec2 vR;
  varying vec2 vT;
  varying vec2 vB;
  uniform vec2 texelSize;
  void main () {
    vUv = aPosition * 0.5 + 0.5;
    vL = vUv - vec2(texelSize.x, 0.0);
    vR = vUv + vec2(texelSize.x, 0.0);
    vT = vUv + vec2(0.0, texelSize.y);
    vB = vUv - vec2(0.0, texelSize.y);
    gl_Position = vec4(aPosition, 0.0, 1.0);
  }
`;

const SPLAT_FRAG = `
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D uTarget;
  uniform float aspectRatio;
  uniform vec3 color;
  uniform vec2 point;
  uniform float radius;
  void main () {
    vec2 p = vUv - point.xy;
    p.x *= aspectRatio;
    vec3 splat = exp(-dot(p, p) / radius) * color;
    vec3 base = texture2D(uTarget, vUv).xyz;
    gl_FragColor = vec4(base + splat, 1.0);
  }
`;

const ADVECTION_FRAG = `
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D uVelocity;
  uniform sampler2D uSource;
  uniform vec2 texelSize;
  uniform float dt;
  uniform float dissipation;
  void main () {
    vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * texelSize;
    vec4 result = dissipation * texture2D(uSource, coord);
    gl_FragColor = result;
  }
`;

const CURL_FRAG = `
  precision highp float;
  varying vec2 vUv;
  varying vec2 vL;
  varying vec2 vR;
  varying vec2 vT;
  varying vec2 vB;
  uniform sampler2D uVelocity;
  void main () {
    float L = texture2D(uVelocity, vL).y;
    float R = texture2D(uVelocity, vR).y;
    float T = texture2D(uVelocity, vT).x;
    float B = texture2D(uVelocity, vB).x;
    float vorticity = R - L - T + B;
    gl_FragColor = vec4(0.5 * vorticity, 0.0, 0.0, 1.0);
  }
`;

const VORTICITY_FRAG = `
  precision highp float;
  varying vec2 vUv;
  varying vec2 vL;
  varying vec2 vR;
  varying vec2 vT;
  varying vec2 vB;
  uniform sampler2D uVelocity;
  uniform sampler2D uCurl;
  uniform float curl;
  uniform float dt;
  void main () {
    float L = texture2D(uCurl, vL).x;
    float R = texture2D(uCurl, vR).x;
    float T = texture2D(uCurl, vT).x;
    float B = texture2D(uCurl, vB).x;
    float C = texture2D(uCurl, vUv).x;
    vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
    force /= length(force) + 0.0001;
    force *= curl * C;
    force.y *= -1.0;
    vec2 vel = texture2D(uVelocity, vUv).xy;
    vel += force * dt;
    gl_FragColor = vec4(vel, 0.0, 1.0);
  }
`;

const DIVERGENCE_FRAG = `
  precision highp float;
  varying vec2 vUv;
  varying vec2 vL;
  varying vec2 vR;
  varying vec2 vT;
  varying vec2 vB;
  uniform sampler2D uVelocity;
  void main () {
    float L = texture2D(uVelocity, vL).x;
    float R = texture2D(uVelocity, vR).x;
    float T = texture2D(uVelocity, vT).y;
    float B = texture2D(uVelocity, vB).y;
    vec2 C = texture2D(uVelocity, vUv).xy;
    if (vL.x < 0.0) L = -C.x;
    if (vR.x > 1.0) R = -C.x;
    if (vT.y > 1.0) T = -C.y;
    if (vB.y < 0.0) B = -C.y;
    float div = 0.5 * (R - L + T - B);
    gl_FragColor = vec4(div, 0.0, 0.0, 1.0);
  }
`;

const CLEAR_FRAG = `
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D uTexture;
  uniform float value;
  void main () {
    gl_FragColor = value * texture2D(uTexture, vUv);
  }
`;

const PRESSURE_FRAG = `
  precision highp float;
  varying vec2 vUv;
  varying vec2 vL;
  varying vec2 vR;
  varying vec2 vT;
  varying vec2 vB;
  uniform sampler2D uPressure;
  uniform sampler2D uDivergence;
  void main () {
    float L = texture2D(uPressure, vL).x;
    float R = texture2D(uPressure, vR).x;
    float T = texture2D(uPressure, vT).x;
    float B = texture2D(uPressure, vB).x;
    float C = texture2D(uPressure, vUv).x;
    float divergence = texture2D(uDivergence, vUv).x;
    float pressure = (L + R + B + T - divergence) * 0.25;
    gl_FragColor = vec4(pressure, 0.0, 0.0, 1.0);
  }
`;

const GRADIENT_SUBTRACT_FRAG = `
  precision highp float;
  varying vec2 vUv;
  varying vec2 vL;
  varying vec2 vR;
  varying vec2 vT;
  varying vec2 vB;
  uniform sampler2D uPressure;
  uniform sampler2D uVelocity;
  void main () {
    float L = texture2D(uPressure, vL).x;
    float R = texture2D(uPressure, vR).x;
    float T = texture2D(uPressure, vT).x;
    float B = texture2D(uPressure, vB).x;
    vec2 vel = texture2D(uVelocity, vUv).xy;
    vel.xy -= vec2(R - L, T - B);
    gl_FragColor = vec4(vel, 0.0, 1.0);
  }
`;

const DISPLAY_FRAG = `
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D uTexture;
  uniform sampler2D uDye;
  uniform vec2 texelSize;

  vec3 gradientColor(vec2 uv) {
    vec3 c1 = vec3(0.024, 0.043, 0.122);
    vec3 c2 = vec3(0.098, 0.145, 0.318);
    vec3 c3 = vec3(0.055, 0.102, 0.227);
    vec3 c4 = vec3(0.039, 0.067, 0.192);
    vec3 top    = mix(c1, c2, uv.x);
    vec3 bottom = mix(c4, c3, uv.x);
    return mix(bottom, top, uv.y);
  }

  void main () {
    vec3 dye = texture2D(uDye, vUv).rgb;
    float density = length(dye);

    // Normal-map from dye for 3D liquid look
    float dx = length(texture2D(uDye, vUv + vec2(texelSize.x, 0.0)).rgb)
             - length(texture2D(uDye, vUv - vec2(texelSize.x, 0.0)).rgb);
    float dy = length(texture2D(uDye, vUv + vec2(0.0, texelSize.y)).rgb)
             - length(texture2D(uDye, vUv - vec2(0.0, texelSize.y)).rgb);
    vec3 normal = normalize(vec3(dx * 6.0, dy * 6.0, 1.0));

    // Lighting
    vec3 lightDir = normalize(vec3(0.4, 0.6, 1.0));
    float diff = max(dot(normal, lightDir), 0.0) * 0.6 + 0.4;
    vec3 viewDir = vec3(0.0, 0.0, 1.0);
    vec3 halfDir = normalize(lightDir + viewDir);
    float spec = pow(max(dot(normal, halfDir), 0.0), 64.0) * 0.5;

    // Blend fluid colour over gradient base
    vec3 base = gradientColor(vUv);
    vec3 fluidColor = dye * diff + spec;
    vec3 color = base + fluidColor * 0.85;

    gl_FragColor = vec4(color, 1.0);
  }
`;

// ── Types ──────────────────────────────────────────────────────────

interface FBO {
  texture: WebGLTexture;
  fbo: WebGLFramebuffer;
  width: number;
  height: number;
  attach(id: number): number;
}

interface DoubleFBO {
  width: number;
  height: number;
  texelSizeX: number;
  texelSizeY: number;
  read: FBO;
  write: FBO;
  swap(): void;
}

interface GPUProgram {
  program: WebGLProgram;
  uniforms: Record<string, WebGLUniformLocation>;
  bind(): void;
}

export interface FluidConfig {
  SIM_RESOLUTION: number;
  DYE_RESOLUTION: number;
  PRESSURE_ITERATIONS: number;
  CURL: number;
  SPLAT_RADIUS: number;
  SPLAT_FORCE: number;
  VELOCITY_DISSIPATION: number;
  DENSITY_DISSIPATION: number;
  PRESSURE: number;
}

export const DEFAULT_CONFIG: FluidConfig = {
  SIM_RESOLUTION: 128,
  DYE_RESOLUTION: 1024,
  PRESSURE_ITERATIONS: 20,
  CURL: 30,
  SPLAT_RADIUS: 0.25,
  SPLAT_FORCE: 6000,
  VELOCITY_DISSIPATION: 0.97,
  DENSITY_DISSIPATION: 0.98,
  PRESSURE: 0.8,
};

// ── Helpers ────────────────────────────────────────────────────────

function compileShader(gl: WebGLRenderingContext, type: number, src: string): WebGLShader {
  const shader = gl.createShader(type)!;
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
    console.error('Shader error:', gl.getShaderInfoLog(shader));
  return shader;
}

function createProgram(gl: WebGLRenderingContext, vertSrc: string, fragSrc: string): GPUProgram {
  const prog = gl.createProgram()!;
  gl.attachShader(prog, compileShader(gl, gl.VERTEX_SHADER, vertSrc));
  gl.attachShader(prog, compileShader(gl, gl.FRAGMENT_SHADER, fragSrc));
  gl.linkProgram(prog);
  // FIXED: use getProgramParameter not getLinkParameter
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS))
    console.error('Link error:', gl.getProgramInfoLog(prog));

  const uniforms: Record<string, WebGLUniformLocation> = {};
  const count = gl.getProgramParameter(prog, gl.ACTIVE_UNIFORMS);
  for (let i = 0; i < count; i++) {
    const info = gl.getActiveUniform(prog, i)!;
    uniforms[info.name] = gl.getUniformLocation(prog, info.name)!;
  }
  return {
    program: prog,
    uniforms,
    bind() { gl.useProgram(prog); },
  };
}

function createFBO(gl: WebGLRenderingContext, w: number, h: number, internalFmt: number, fmt: number, type: number, filter: number): FBO {
  gl.activeTexture(gl.TEXTURE0);
  const tex = gl.createTexture()!;
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, internalFmt, w, h, 0, fmt, type, null);

  const fbo = gl.createFramebuffer()!;
  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
  gl.viewport(0, 0, w, h);
  gl.clear(gl.COLOR_BUFFER_BIT);

  return {
    texture: tex, fbo, width: w, height: h,
    attach(id: number) {
      gl.activeTexture(gl.TEXTURE0 + id);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      return id;
    },
  };
}

function createDoubleFBO(gl: WebGLRenderingContext, w: number, h: number, internalFmt: number, fmt: number, type: number, filter: number): DoubleFBO {
  let fbo1 = createFBO(gl, w, h, internalFmt, fmt, type, filter);
  let fbo2 = createFBO(gl, w, h, internalFmt, fmt, type, filter);
  return {
    width: w, height: h,
    texelSizeX: 1 / w,
    texelSizeY: 1 / h,
    get read() { return fbo1; },
    get write() { return fbo2; },
    swap() { const t = fbo1; fbo1 = fbo2; fbo2 = t; },
  };
}

function getResolution(gl: WebGLRenderingContext, res: number) {
  let aspectRatio = gl.drawingBufferWidth / gl.drawingBufferHeight;
  if (aspectRatio < 1) aspectRatio = 1 / aspectRatio;
  const min = Math.round(res);
  const max = Math.round(res * aspectRatio);
  return gl.drawingBufferWidth > gl.drawingBufferHeight
    ? { width: max, height: min }
    : { width: min, height: max };
}

// ── Solver class ───────────────────────────────────────────────────

export class FluidSolver {
  private gl: WebGLRenderingContext;
  private config: FluidConfig;
  private blit: (target: FBO | null) => void;

  // programs
  private splatProg: GPUProgram;
  private advectionProg: GPUProgram;
  private divergenceProg: GPUProgram;
  private curlProg: GPUProgram;
  private vorticityProg: GPUProgram;
  private pressureProg: GPUProgram;
  private clearProg: GPUProgram;
  private gradientSubtractProg: GPUProgram;
  private displayProg: GPUProgram;

  // FBOs
  private dye!: DoubleFBO;
  private velocity!: DoubleFBO;
  private divergence!: FBO;
  private curl!: FBO;
  private pressure!: DoubleFBO;

  constructor(gl: WebGLRenderingContext, config: Partial<FluidConfig> = {}) {
    this.gl = gl;
    this.config = { ...DEFAULT_CONFIG, ...config };

    // Enable float textures
    const halfFloat = gl.getExtension('OES_texture_half_float');
    gl.getExtension('OES_texture_half_float_linear');

    // Compile all programs
    this.splatProg            = createProgram(gl, BASE_VERT, SPLAT_FRAG);
    this.advectionProg        = createProgram(gl, BASE_VERT, ADVECTION_FRAG);
    this.divergenceProg       = createProgram(gl, BASE_VERT, DIVERGENCE_FRAG);
    this.curlProg             = createProgram(gl, BASE_VERT, CURL_FRAG);
    this.vorticityProg        = createProgram(gl, BASE_VERT, VORTICITY_FRAG);
    this.pressureProg         = createProgram(gl, BASE_VERT, PRESSURE_FRAG);
    this.clearProg            = createProgram(gl, BASE_VERT, CLEAR_FRAG);
    this.gradientSubtractProg = createProgram(gl, BASE_VERT, GRADIENT_SUBTRACT_FRAG);
    this.displayProg          = createProgram(gl, BASE_VERT, DISPLAY_FRAG);

    // Full-screen triangle
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, -1,1, 1,1, -1,-1, 1,1, 1,-1]), gl.STATIC_DRAW);

    this.blit = (target: FBO | null) => {
      if (target) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo);
        gl.viewport(0, 0, target.width, target.height);
      } else {
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
      }
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    };

    // Setup vertex attribs — must bind each program first
    const setupAttribs = (prog: GPUProgram) => {
      gl.useProgram(prog.program);
      const loc = gl.getAttribLocation(prog.program, 'aPosition');
      if (loc >= 0) {
        gl.enableVertexAttribArray(loc);
        gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
      }
    };
    [this.splatProg, this.advectionProg, this.divergenceProg, this.curlProg,
     this.vorticityProg, this.pressureProg, this.clearProg,
     this.gradientSubtractProg, this.displayProg].forEach(setupAttribs);

    // Float texture type
    const texType = halfFloat ? halfFloat.HALF_FLOAT_OES : gl.UNSIGNED_BYTE;

    this.initFBOs(texType);
  }

  private initFBOs(texType: number) {
    const gl = this.gl;
    const simRes = getResolution(gl, this.config.SIM_RESOLUTION);
    const dyeRes = getResolution(gl, this.config.DYE_RESOLUTION);

    this.dye        = createDoubleFBO(gl, dyeRes.width, dyeRes.height, gl.RGBA, gl.RGBA, texType, gl.LINEAR);
    this.velocity   = createDoubleFBO(gl, simRes.width, simRes.height, gl.RGBA, gl.RGBA, texType, gl.LINEAR);
    this.divergence = createFBO(gl, simRes.width, simRes.height, gl.RGBA, gl.RGBA, texType, gl.NEAREST);
    this.curl       = createFBO(gl, simRes.width, simRes.height, gl.RGBA, gl.RGBA, texType, gl.NEAREST);
    this.pressure   = createDoubleFBO(gl, simRes.width, simRes.height, gl.RGBA, gl.RGBA, texType, gl.NEAREST);
  }

  splat(x: number, y: number, dx: number, dy: number, color: [number, number, number]) {
    const gl = this.gl;
    const prog = this.splatProg;
    prog.bind();
    gl.uniform1i(prog.uniforms.uTarget, this.velocity.read.attach(0));
    gl.uniform1f(prog.uniforms.aspectRatio, gl.drawingBufferWidth / gl.drawingBufferHeight);
    gl.uniform2f(prog.uniforms.point, x, y);
    gl.uniform3f(prog.uniforms.color, dx, dy, 0);
    gl.uniform1f(prog.uniforms.radius, this.correctRadius(this.config.SPLAT_RADIUS / 100));
    this.blit(this.velocity.write);
    this.velocity.swap();

    gl.uniform1i(prog.uniforms.uTarget, this.dye.read.attach(0));
    gl.uniform3f(prog.uniforms.color, color[0], color[1], color[2]);
    this.blit(this.dye.write);
    this.dye.swap();
  }

  private correctRadius(r: number) {
    const gl = this.gl;
    const aspectRatio = gl.drawingBufferWidth / gl.drawingBufferHeight;
    return r / (aspectRatio > 1 ? aspectRatio : 1);
  }

  step(dt: number) {
    const gl = this.gl;
    const cfg = this.config;

    // Curl
    this.curlProg.bind();
    gl.uniform2f(this.curlProg.uniforms.texelSize, this.velocity.texelSizeX, this.velocity.texelSizeY);
    gl.uniform1i(this.curlProg.uniforms.uVelocity, this.velocity.read.attach(0));
    this.blit(this.curl);

    // Vorticity
    this.vorticityProg.bind();
    gl.uniform2f(this.vorticityProg.uniforms.texelSize, this.velocity.texelSizeX, this.velocity.texelSizeY);
    gl.uniform1i(this.vorticityProg.uniforms.uVelocity, this.velocity.read.attach(0));
    gl.uniform1i(this.vorticityProg.uniforms.uCurl, this.curl.attach(1));
    gl.uniform1f(this.vorticityProg.uniforms.curl, cfg.CURL);
    gl.uniform1f(this.vorticityProg.uniforms.dt, dt);
    this.blit(this.velocity.write);
    this.velocity.swap();

    // Divergence
    this.divergenceProg.bind();
    gl.uniform2f(this.divergenceProg.uniforms.texelSize, this.velocity.texelSizeX, this.velocity.texelSizeY);
    gl.uniform1i(this.divergenceProg.uniforms.uVelocity, this.velocity.read.attach(0));
    this.blit(this.divergence);

    // Clear pressure
    this.clearProg.bind();
    gl.uniform1i(this.clearProg.uniforms.uTexture, this.pressure.read.attach(0));
    gl.uniform1f(this.clearProg.uniforms.value, cfg.PRESSURE);
    this.blit(this.pressure.write);
    this.pressure.swap();

    // Pressure solve (Jacobi iterations)
    this.pressureProg.bind();
    gl.uniform2f(this.pressureProg.uniforms.texelSize, this.velocity.texelSizeX, this.velocity.texelSizeY);
    gl.uniform1i(this.pressureProg.uniforms.uDivergence, this.divergence.attach(0));
    for (let i = 0; i < cfg.PRESSURE_ITERATIONS; i++) {
      gl.uniform1i(this.pressureProg.uniforms.uPressure, this.pressure.read.attach(1));
      this.blit(this.pressure.write);
      this.pressure.swap();
    }

    // Gradient subtract
    this.gradientSubtractProg.bind();
    gl.uniform2f(this.gradientSubtractProg.uniforms.texelSize, this.velocity.texelSizeX, this.velocity.texelSizeY);
    gl.uniform1i(this.gradientSubtractProg.uniforms.uPressure, this.pressure.read.attach(0));
    gl.uniform1i(this.gradientSubtractProg.uniforms.uVelocity, this.velocity.read.attach(1));
    this.blit(this.velocity.write);
    this.velocity.swap();

    // Advect velocity
    this.advectionProg.bind();
    gl.uniform2f(this.advectionProg.uniforms.texelSize, this.velocity.texelSizeX, this.velocity.texelSizeY);
    const velProg = this.advectionProg;
    gl.uniform1i(velProg.uniforms.uVelocity, this.velocity.read.attach(0));
    gl.uniform1i(velProg.uniforms.uSource, this.velocity.read.attach(0));
    gl.uniform1f(velProg.uniforms.dt, dt);
    gl.uniform1f(velProg.uniforms.dissipation, cfg.VELOCITY_DISSIPATION);
    this.blit(this.velocity.write);
    this.velocity.swap();

    // Advect dye
    gl.uniform2f(velProg.uniforms.texelSize, this.dye.texelSizeX, this.dye.texelSizeY);
    gl.uniform1i(velProg.uniforms.uVelocity, this.velocity.read.attach(0));
    gl.uniform1i(velProg.uniforms.uSource, this.dye.read.attach(1));
    gl.uniform1f(velProg.uniforms.dissipation, cfg.DENSITY_DISSIPATION);
    this.blit(this.dye.write);
    this.dye.swap();
  }

  render() {
    const gl = this.gl;
    this.displayProg.bind();
    gl.uniform2f(this.displayProg.uniforms.texelSize, this.dye.texelSizeX, this.dye.texelSizeY);
    gl.uniform1i(this.displayProg.uniforms.uDye, this.dye.read.attach(0));
    this.blit(null);
  }
}
