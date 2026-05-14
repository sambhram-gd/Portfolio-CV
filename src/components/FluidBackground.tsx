import React, { useEffect, useRef } from 'react';
import { Renderer, Camera, Geometry, Program, Mesh, Vec2, RenderTarget } from 'ogl';

const baseVertex = `
    attribute vec2 position;
    attribute vec2 uv;
    varying vec2 vUv;
    void main() {
        vUv = uv;
        gl_Position = vec4(position, 0, 1);
    }
`;

const fluidShader = {
    // Splat shader to add velocity/density
    splat: `
        precision highp float;
        varying vec2 vUv;
        uniform sampler2D tTarget;
        uniform float uAspect;
        uniform vec2 uPoint;
        uniform vec3 uColor;
        uniform float uRadius;

        void main() {
            vec2 p = vUv - uPoint;
            p.x *= uAspect;
            vec3 splat = exp(-dot(p, p) / uRadius) * uColor;
            vec3 base = texture2D(tTarget, vUv).xyz;
            gl_FragColor = vec4(base + splat, 1.0);
        }
    `,
    // Advection shader to move the fluid
    advect: `
        precision highp float;
        varying vec2 vUv;
        uniform sampler2D tVelocity;
        uniform sampler2D tSource;
        uniform vec2 uTexelSize;
        uniform float uDt;
        uniform float uDissipation;

        void main() {
            vec2 coord = vUv - uDt * texture2D(tVelocity, vUv).xy * uTexelSize;
            gl_FragColor = uDissipation * texture2D(tSource, coord);
        }
    `,
    // Final display shader that creates a 3D liquid look
    display: `
        precision highp float;
        uniform sampler2D tFluid;
        uniform vec2 uTexelSize;
        varying vec2 vUv;

        void main() {
            vec3 fluid = texture2D(tFluid, vUv).rgb;
            float density = length(fluid);
            
            // Normal approximation for 3D look
            float left = length(texture2D(tFluid, vUv - vec2(uTexelSize.x, 0.0)).rgb);
            float right = length(texture2D(tFluid, vUv + vec2(uTexelSize.x, 0.0)).rgb);
            float top = length(texture2D(tFluid, vUv - vec2(0.0, uTexelSize.y)).rgb);
            float bottom = length(texture2D(tFluid, vUv + vec2(0.0, uTexelSize.y)).rgb);
            
            vec3 normal = normalize(vec3(left - right, top - bottom, 0.1));
            
            // Lighting
            vec3 lightDir = normalize(vec3(0.5, 0.5, 1.0));
            float diff = max(0.0, dot(normal, lightDir));
            
            // Specular
            vec3 viewDir = vec3(0.0, 0.0, 1.0);
            vec3 reflectDir = reflect(-lightDir, normal);
            float spec = pow(max(0.0, dot(viewDir, reflectDir)), 32.0);
            
            // Colors: Obsidian to NVIDIA Green
            vec3 baseColor = mix(vec3(0.05, 0.05, 0.05), vec3(0.46, 0.72, 0.0), density);
            vec3 finalColor = baseColor * (diff + 0.5) + spec * 0.8;
            
            gl_FragColor = vec4(finalColor, density * 1.5);
        }
    `
};

export const FluidBackground: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const mouse = useRef(new Vec2(0, 0));
    const lastMouse = useRef(new Vec2(0, 0));
    const velocity = useRef(new Vec2(0, 0));

    useEffect(() => {
        if (!containerRef.current) return;

        const renderer = new Renderer({ alpha: true, premultipliedAlpha: false });
        const gl = renderer.gl;
        containerRef.current.appendChild(gl.canvas);

        const camera = new Camera(gl);
        camera.position.z = 1;

        const geometry = new Geometry(gl, {
            position: { size: 2, data: new Float32Array([-1, -1, 3, -1, -1, 3]) },
            uv: { size: 2, data: new Float32Array([0, 0, 2, 0, 0, 2]) },
        });

        const resolution = { value: new Vec2() };
        function resize() {
            renderer.setSize(window.innerWidth, window.innerHeight);
            resolution.value.set(gl.canvas.width, gl.canvas.height);
        }
        window.addEventListener('resize', resize, false);
        resize();

        const params = {
            width: 128,
            height: 128,
            type: (gl as any).HALF_FLOAT || 0x8D61 || gl.FLOAT,
            format: gl.RGBA,
            internalFormat: (gl as any).RGBA16F || 0x881A || (gl as any).RGBA32F || 0x8814 || gl.RGBA,
            minFilter: gl.LINEAR,
            depth: false,
        };

        let density = {
            read: new RenderTarget(gl, params),
            write: new RenderTarget(gl, params),
            swap: () => {
                let tmp = density.read;
                density.read = density.write;
                density.write = tmp;
            }
        };

        let vel = {
            read: new RenderTarget(gl, params),
            write: new RenderTarget(gl, params),
            swap: () => {
                let tmp = vel.read;
                vel.read = vel.write;
                vel.write = tmp;
            }
        };

        const splatProgram = new Program(gl, {
            vertex: baseVertex,
            fragment: fluidShader.splat,
            uniforms: {
                tTarget: { value: null },
                uAspect: { value: gl.canvas.width / gl.canvas.height },
                uPoint: { value: new Vec2() },
                uColor: { value: new Vec2() },
                uRadius: { value: 0.001 },
            },
        });

        const advectProgram = new Program(gl, {
            vertex: baseVertex,
            fragment: fluidShader.advect,
            uniforms: {
                tVelocity: { value: null },
                tSource: { value: null },
                uTexelSize: { value: new Vec2(1 / params.width, 1 / params.height) },
                uDt: { value: 0.016 },
                uDissipation: { value: 0.98 },
            },
        });

        const displayProgram = new Program(gl, {
            vertex: baseVertex,
            fragment: fluidShader.display,
            uniforms: {
                tFluid: { value: null },
                uTexelSize: { value: new Vec2(1 / params.width, 1 / params.height) }
            },
        });

        const mesh = new Mesh(gl, { geometry, program: displayProgram });

        const handleMouseMove = (e: MouseEvent) => {
            mouse.current.set(e.clientX / window.innerWidth, 1 - e.clientY / window.innerHeight);
            velocity.current.set(mouse.current.x - lastMouse.current.x, mouse.current.y - lastMouse.current.y);
            lastMouse.current.copy(mouse.current);
        };
        window.addEventListener('mousemove', handleMouseMove);

        let raf: number;
        let time = 0;
        const update = () => {
            raf = requestAnimationFrame(update);
            time += 0.016;

            // Advect velocity and density
            advectProgram.uniforms.tVelocity.value = vel.read.texture;
            advectProgram.uniforms.tSource.value = vel.read.texture;
            advectProgram.uniforms.uDissipation.value = 0.99;
            mesh.program = advectProgram;
            renderer.render({ scene: mesh, target: vel.write });
            vel.swap();

            advectProgram.uniforms.tSource.value = density.read.texture;
            advectProgram.uniforms.uDissipation.value = 0.98;
            renderer.render({ scene: mesh, target: density.write });
            density.swap();

            // Auto-splat for loading state
            if (time < 10.0) {
                const autoPoint = new Vec2(
                    0.5 + Math.sin(time * 1.5) * 0.3,
                    0.5 + Math.cos(time * 1.2) * 0.3
                );
                splatProgram.uniforms.uPoint.value.copy(autoPoint);
                splatProgram.uniforms.uColor.value.set(Math.sin(time) * 5, Math.cos(time) * 5, 0);
                splatProgram.uniforms.uRadius.value = 0.003;
                
                splatProgram.uniforms.tTarget.value = vel.read.texture;
                mesh.program = splatProgram;
                renderer.render({ scene: mesh, target: vel.write });
                vel.swap();
            }

            // Mouse splat
            if (velocity.current.length() > 0.0001) {
                splatProgram.uniforms.uPoint.value.copy(mouse.current);
                splatProgram.uniforms.uColor.value.set(velocity.current.x * 500, velocity.current.y * 500, 0);
                splatProgram.uniforms.uRadius.value = 0.005;

                splatProgram.uniforms.tTarget.value = vel.read.texture;
                mesh.program = splatProgram;
                renderer.render({ scene: mesh, target: vel.write });
                vel.swap();

                splatProgram.uniforms.uColor.value.set(0.1, 0.2, 0.0);
                splatProgram.uniforms.tTarget.value = density.read.texture;
                renderer.render({ scene: mesh, target: density.write });
                density.swap();
                
                velocity.current.multiply(0.9);
            }

            // Display
            displayProgram.uniforms.tFluid.value = density.read.texture;
            mesh.program = displayProgram;
            renderer.render({ scene: mesh });
        };
        raf = requestAnimationFrame(update);

        return () => {
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(raf);
            gl.canvas.remove();
        };
    }, []);

    return (
        <div 
            ref={containerRef} 
            className="fixed inset-0 z-[200] pointer-events-none opacity-90 mix-blend-screen" 
        />
    );
};
