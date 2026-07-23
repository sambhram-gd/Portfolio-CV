import React, { useEffect, useState, useRef } from 'react';

interface NeuralPreloaderProps {
  onComplete: () => void;
}

const BOOT_LOGS = [
  'SYSTEM: INITIALIZING QUANTUM CORE...',
  'VRAM: ALLOCATING 24GB SUITE...',
  'LOADER: INGESTING WEIGHTS (yolov8_segmentation.onnx)...',
  'CORE: COMPILED TRT ENGINE FOR JETSON ADAS...',
  'AGENT: INITIALIZING FAISS VECTOR BANK...',
  'AGENT: SPINNING UP LANGCHAIN ORCHESTRATOR...',
  'DL: RESOLVING CUDA DEPS (v12.4)...',
  'CV: DETECTING ROI CALIBRATION MATRIX...',
  'SYSTEM: PATCHCORE METRIC EVALUATION COMPLETED...',
  'SYSTEM: MODEL IMAGE AUROC = 1.00...',
  'AGENT: EXECUTING REASONING LOOP...',
  'SYSTEM: INTEGRITY CHECK OK...',
  'SYSTEM: IGNITION SEQUENCE READY...',
  'SYSTEM: PORTAL CONNECTED SUCCESSFULLY.',
];

export const NeuralPreloader: React.FC<NeuralPreloaderProps> = ({ onComplete }) => {
  const [logs, setLogs] = useState<string[]>([]);
  const [pct, setPct] = useState(0);
  const [exiting, setExiting] = useState(false);
  const exitFired = useRef(false);

  // Auto-scroll logs
  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      if (index < BOOT_LOGS.length) {
        setLogs((l) => [...l, BOOT_LOGS[index]]);
        index++;
      } else {
        clearInterval(interval);
      }
    }, 120);
    return () => clearInterval(interval);
  }, []);

  // Charge progress and complete
  useEffect(() => {
    let start: number | null = null;
    let raf: number;
    const DURATION = 2200;

    const tick = (ts: number) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / DURATION, 1);
      setPct(progress);

      if (progress < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        // Trigger auto exit after 400ms delay once reached 100%
        setTimeout(() => {
          if (!exitFired.current) {
            exitFired.current = true;
            setExiting(true);
            setTimeout(onComplete, 850);
          }
        }, 400);
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [onComplete]);

  return (
    <>
      <style>{`
        @keyframes rotateCW {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes rotateCCW {
          0% { transform: rotate(360deg); }
          100% { transform: rotate(0deg); }
        }
        @keyframes pulseCore {
          0%, 100% { transform: scale(1); filter: drop-shadow(0 0 15px rgba(0, 240, 255, 0.75)); }
          50% { transform: scale(1.08); filter: drop-shadow(0 0 25px rgba(0, 240, 255, 0.95)); }
        }
        @keyframes textBlink {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
        .arc-log-item {
          animation: slideInLog 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes slideInLog {
          from { opacity: 0; transform: translateX(-10px); }
          to { opacity: 0.8; transform: translateX(0); }
        }
        .reactor-curtain-exit {
          animation: reactorExit 850ms cubic-bezier(0.85, 0, 0.15, 1) forwards;
        }
        @keyframes reactorExit {
          0% { clip-path: circle(100% at 50% 50%); }
          100% { clip-path: circle(0% at 50% 50%); }
        }
      `}</style>

      <div
        className={exiting ? 'reactor-curtain-exit' : ''}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          background: '#020409',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          fontFamily: '"JetBrains Mono", monospace',
          color: '#00f0ff',
        }}
      >
        {/* Subtle grid lines background */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `
              linear-gradient(rgba(0, 240, 255, 0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 240, 255, 0.03) 1px, transparent 1px)
            `,
            backgroundSize: '45px 45px',
            backgroundPosition: 'center center',
            pointerEvents: 'none',
          }}
        />

        {/* Diagnostic Logs (Left Side) */}
        <div
          style={{
            position: 'absolute',
            left: '4%',
            bottom: '10%',
            maxWidth: '300px',
          }}
          className="hidden md:flex flex-col gap-2 text-[10px] tracking-wide text-cyan-500/80"
        >
          {logs.slice(-8).map((log, idx) => (
            <div key={idx} className="arc-log-item leading-normal">
              {log}
            </div>
          ))}
        </div>

        {/* System telemetry HUD (Right Side) */}
        <div
          style={{
            position: 'absolute',
            right: '4%',
            bottom: '10%',
            textAlign: 'right',
          }}
          className="hidden md:block text-[10px] tracking-widest text-cyan-500/60 leading-relaxed"
        >
          <div>SYS_STATUS: ACTIVE</div>
          <div>CORE_TEMP: 36.4°C</div>
          <div>POWER_FLOW: {(pct * 12.1).toFixed(2)} GW</div>
          <div>CHARGE_STAGE: {pct === 1 ? 'COMPLETE' : 'STABILIZING'}</div>
        </div>

        {/* 2D Arc Reactor Outer SVG */}
        <div
          style={{
            position: 'relative',
            width: '280px',
            height: '280px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 200 200"
            style={{ position: 'absolute', overflow: 'visible' }}
          >
            {/* Outer dotted ring */}
            <circle
              cx="100"
              cy="100"
              r="92"
              fill="none"
              stroke="rgba(0, 240, 255, 0.15)"
              strokeWidth="1.5"
              strokeDasharray="2 6"
              style={{ animation: 'rotateCW 30s linear infinite', transformOrigin: 'center' }}
            />

            {/* Segmented HUD Ring */}
            <circle
              cx="100"
              cy="100"
              r="84"
              fill="none"
              stroke="rgba(0, 240, 255, 0.3)"
              strokeWidth="2.5"
              strokeDasharray="50 15 10 15"
              style={{ animation: 'rotateCCW 15s linear infinite', transformOrigin: 'center' }}
            />

            {/* Ring with Ticks */}
            <circle
              cx="100"
              cy="100"
              r="74"
              fill="none"
              stroke="rgba(0, 240, 255, 0.45)"
              strokeWidth="1.5"
              strokeDasharray="3 4"
              style={{ animation: 'rotateCW 10s linear infinite', transformOrigin: 'center' }}
            />

            {/* Reactor core gear segments */}
            <circle
              cx="100"
              cy="100"
              r="58"
              fill="none"
              stroke="#00f0ff"
              strokeWidth="3.5"
              strokeDasharray="18 10"
              style={{ 
                animation: 'rotateCCW 8s linear infinite', 
                transformOrigin: 'center',
                filter: 'drop-shadow(0 0 8px rgba(0,240,255,0.4))'
              }}
            />

            {/* Magnetic Coils */}
            <g style={{ animation: 'rotateCW 20s linear infinite', transformOrigin: 'center' }}>
              {[...Array(10)].map((_, i) => {
                const angle = (i * 36 * Math.PI) / 180;
                const x1 = 100 + Math.cos(angle) * 58;
                const y1 = 100 + Math.sin(angle) * 58;
                const x2 = 100 + Math.cos(angle) * 70;
                const y2 = 100 + Math.sin(angle) * 70;
                return (
                  <line
                    key={i}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="rgba(0, 240, 255, 0.85)"
                    strokeWidth="3"
                  />
                );
              })}
            </g>

            {/* Inner Glowing Ring */}
            <circle
              cx="100"
              cy="100"
              r="40"
              fill="rgba(0, 240, 255, 0.05)"
              stroke="rgba(0, 240, 255, 0.75)"
              strokeWidth="2"
            />
          </svg>

          {/* Central Pulsing Energy Core */}
          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, #ffffff 30%, #00f0ff 70%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              animation: 'pulseCore 1.5s ease-in-out infinite',
              zIndex: 10,
              boxShadow: '0 0 30px rgba(0, 240, 255, 0.85)',
            }}
          >
            <div
              style={{
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: '15px',
                fontWeight: 900,
                color: '#020409',
              }}
            >
              {Math.round(pct * 100)}%
            </div>
          </div>
        </div>

        {/* Loading Indicator Text */}
        <div style={{ marginTop: '40px', textAlign: 'center', zIndex: 100 }}>
          <div style={{ letterSpacing: '4px', fontSize: '11px', fontWeight: 'bold' }}>
            <span style={{ animation: 'textBlink 1.5s infinite' }}>REACTOR IGNITING</span>
          </div>
          <div style={{ marginTop: '8px', letterSpacing: '1px', fontSize: '9px', color: 'rgba(0, 240, 255, 0.5)' }}>
            [ PORTAL CONNECTION IN PROGRESS ]
          </div>
        </div>
      </div>
    </>
  );
};
