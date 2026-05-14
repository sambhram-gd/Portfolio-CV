import React, { useEffect, useRef, useCallback } from 'react';

/* ─── Layer config ─────────────────────────────────────────────────────────── */
interface Layer {
  id: number;
  depth: number;
  x: string;
  y: string;
  size: number;
  gradient: string;
  blur: number;
  opacity: number;
}

interface Card {
  id: number;
  depth: number;
  x: string;
  y: string;
  label: string;
  value: string;
  color: string;
}

const LAYERS: Layer[] = [
  { id: 1, depth: 0.06, x: '8%',  y: '12%', size: 520, gradient: 'radial-gradient(circle, rgba(99,102,241,0.40) 0%, transparent 70%)',  blur: 70, opacity: 0.9 },
  { id: 2, depth: 0.13, x: '72%', y: '6%',  size: 420, gradient: 'radial-gradient(circle, rgba(236,72,153,0.35) 0%, transparent 70%)',  blur: 55, opacity: 0.85 },
  { id: 3, depth: 0.18, x: '58%', y: '60%', size: 380, gradient: 'radial-gradient(circle, rgba(16,185,129,0.32) 0%, transparent 70%)',  blur: 50, opacity: 0.8 },
  { id: 4, depth: 0.08, x: '18%', y: '68%', size: 600, gradient: 'radial-gradient(circle, rgba(245,158,11,0.22) 0%, transparent 70%)',  blur: 90, opacity: 0.75 },
  { id: 5, depth: 0.15, x: '88%', y: '44%', size: 320, gradient: 'radial-gradient(circle, rgba(59,130,246,0.33) 0%, transparent 70%)',  blur: 45, opacity: 0.8 },
];

const CARDS: Card[] = [
  { id: 1, depth: 0.10, x: '4%',  y: '22%', label: 'Computer Vision', value: '4+ yrs',     color: 'rgba(99,102,241,0.85)' },
  { id: 2, depth: 0.16, x: '75%', y: '18%', label: 'Projects Built',   value: '12+',        color: 'rgba(236,72,153,0.85)' },
  { id: 3, depth: 0.07, x: '77%', y: '68%', label: 'Precision',        value: '99.8%',      color: 'rgba(16,185,129,0.85)' },
  { id: 4, depth: 0.13, x: '2%',  y: '64%', label: 'ML Models',        value: 'Production', color: 'rgba(245,158,11,0.85)' },
];

/* ─── Component ─────────────────────────────────────────────────────────────── */
export const ParallaxHero: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Tracked in refs to avoid React re-renders on every frame
  const mouse   = useRef({ x: 0.5, y: 0.5 }); // normalised 0-1
  const target  = useRef({ x: 0.5, y: 0.5 });
  const scroll  = useRef(0);  // normalised 0-1
  const cursor  = useRef({ x: -200, y: -200 }); // absolute px
  const rafId   = useRef(0);
  const inside  = useRef(false);

  // DOM refs for each orb / card / cursor ring
  const orbRefs  = useRef<(HTMLDivElement | null)[]>([]);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const ringRef  = useRef<HTMLDivElement>(null);

  /* Offset helper — combines mouse + scroll displacement */
  const getOffset = useCallback(
    (depth: number): { tx: number; ty: number; scale: number; op: number } => {
      const MAX = 180; // increased for more drama
      const time = performance.now() * 0.001;
      
      const mx = (mouse.current.x - 0.5) * 2 * MAX * depth;
      const my = (mouse.current.y - 0.5) * 2 * MAX * depth;
      
      // scroll moves orbs upward as you scroll down
      const sy = scroll.current * MAX * depth * -3;
      
      // subtle breathing animation
      const breathe = Math.sin(time + depth * 10) * 0.05;
      const scale = 1 + breathe;
      const opMod = Math.sin(time * 0.5 + depth * 5) * 0.1;
      
      return { tx: mx, ty: my + sy, scale, op: opMod };
    },
    []
  );

  /* RAF animation loop — no state, pure DOM manipulation */
  const tick = useCallback(() => {
    const ease = 0.07;
    // Ease mouse toward target
    mouse.current.x += (target.current.x - mouse.current.x) * ease;
    mouse.current.y += (target.current.y - mouse.current.y) * ease;

    // Update scroll
    const docH = document.body.scrollHeight - window.innerHeight;
    scroll.current = docH > 0 ? window.scrollY / docH : 0;

    // Apply transforms to orbs
    LAYERS.forEach((layer, i) => {
      const el = orbRefs.current[i];
      if (!el) return;
      const { tx, ty, scale, op } = getOffset(layer.depth);
      el.style.transform = `translate(${tx}px, ${ty}px) translate(-50%, -50%) scale(${scale})`;
      el.style.opacity = (layer.opacity + op).toString();
    });

    // Apply transforms to cards
    CARDS.forEach((card, i) => {
      const el = cardRefs.current[i];
      if (!el) return;
      const { tx, ty, scale } = getOffset(card.depth);
      el.style.transform = `translate(${tx}px, ${ty}px) scale(${1 + (scale - 1) * 0.2})`;
    });

    // Cursor follower ring
    if (ringRef.current) {
      ringRef.current.style.left   = `${cursor.current.x}px`;
      ringRef.current.style.top    = `${cursor.current.y}px`;
      ringRef.current.style.opacity = inside.current ? '1' : '0';
    }

    rafId.current = requestAnimationFrame(tick);
  }, [getOffset]);

  useEffect(() => {
    rafId.current = requestAnimationFrame(tick);

    const onMove = (e: MouseEvent) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      target.current = {
        x: (e.clientX - rect.left)  / rect.width,
        y: (e.clientY - rect.top)   / rect.height,
      };
      cursor.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const onEnter = () => { inside.current = true; };
    const onLeave = () => {
      inside.current = false;
      target.current = { x: 0.5, y: 0.5 };
    };

    const el = containerRef.current;
    el?.addEventListener('mousemove', onMove);
    el?.addEventListener('mouseenter', onEnter);
    el?.addEventListener('mouseleave', onLeave);

    return () => {
      cancelAnimationFrame(rafId.current);
      el?.removeEventListener('mousemove', onMove);
      el?.removeEventListener('mouseenter', onEnter);
      el?.removeEventListener('mouseleave', onLeave);
    };
  }, [tick]);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'all',
        zIndex: 0,
        /* Rich base gradient — no video needed */
        background: 'linear-gradient(135deg, #060b1f 0%, #0e1a3a 40%, #111827 100%)',
      }}
    >
      {/* Gradient orbs */}
      {LAYERS.map((layer, i) => (
        <div
          key={layer.id}
          ref={el => { orbRefs.current[i] = el; }}
          style={{
            position:     'absolute',
            left:          layer.x,
            top:           layer.y,
            width:         layer.size,
            height:        layer.size,
            borderRadius:  '50%',
            background:    layer.gradient,
            filter:        `blur(${layer.blur}px)`,
            opacity:        layer.opacity,
            willChange:    'transform',
            pointerEvents: 'none',
            // Start centred so translate(-50%,-50%) anchors to the declared x/y
            transform:     'translate(-50%,-50%)',
          }}
        />
      ))}

      {/* Floating stat cards */}
      {CARDS.map((card, i) => (
        <div
          key={card.id}
          ref={el => { cardRefs.current[i] = el; }}
          style={{
            position:      'absolute',
            left:           card.x,
            top:            card.y,
            willChange:    'transform',
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              background:         'rgba(255,255,255,0.04)',
              backdropFilter:     'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border:             `1px solid ${card.color.replace('0.85', '0.22')}`,
              borderRadius:       '14px',
              padding:            '14px 22px',
              minWidth:           '136px',
              boxShadow:          `0 8px 40px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.09)`,
            }}
          >
            <div
              style={{
                fontFamily:    '"Inter", sans-serif',
                fontSize:      '0.58rem',
                fontWeight:     400,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color:          card.color,
                marginBottom:  '7px',
              }}
            >
              {card.label}
            </div>
            <div
              style={{
                fontFamily: '"Cormorant Garamond", serif',
                fontSize:   '1.65rem',
                fontWeight:  500,
                color:      '#fff',
                lineHeight:  1,
              }}
            >
              {card.value}
            </div>
          </div>
        </div>
      ))}

      {/* Cursor follower ring */}
      <div
        ref={ringRef}
        style={{
          position:      'absolute',
          left:           -200,
          top:            -200,
          width:          44,
          height:         44,
          borderRadius:  '50%',
          border:        '1.5px solid rgba(255,255,255,0.6)',
          boxShadow:     '0 0 16px rgba(99,102,241,0.7), 0 0 32px rgba(99,102,241,0.3)',
          transform:     'translate(-50%, -50%)',
          opacity:        0,
          transition:    'opacity 0.3s ease',
          pointerEvents: 'none',
          willChange:    'left, top, opacity',
        }}
      />
    </div>
  );
};
