import React from 'react';

const services = [
  {
    num: '01',
    title: 'Computer Vision',
    icon: '👁️',
    description: 'End-to-end object detection, segmentation & anomaly detection pipelines. PatchCore on MVTec achieving Image AUROC ≈ 1.00, YOLOv8 & RetinaNet for behavioural classification.',
    module: 'MOD_CV_ENGINE'
  },
  {
    num: '02',
    title: 'Edge AI & Jetson',
    icon: '⚡',
    description: 'Deploying optimized neural networks on NVIDIA Jetson for real-time inference. Built GMSL link quality analyzers and frame-corruption detectors for automotive systems.',
    module: 'MOD_EDGE_INF'
  },
  {
    num: '03',
    title: 'Industrial Inspection',
    icon: '🔬',
    description: 'Thermal imaging pipelines for manufacturing quality control at Sandoz. Unsupervised anomaly detection on live production data using PyTorch & OpenCV.',
    module: 'MOD_THERMAL_QC'
  },
  {
    num: '04',
    title: 'Deep Learning & GANs',
    icon: '🧠',
    description: 'Training Vision Transformers, CNNs, and GAN models from data to deployment. GAN-based Video Super Resolution achieving PSNR 25.65 dB at just 0.82M parameters.',
    module: 'MOD_DL_GENERATIVE'
  },
  {
    num: '05',
    title: 'ML Dashboards',
    icon: '✨',
    description: 'Streamlit-powered inspection UIs with anomaly heatmaps, overlay visualisation, and automated pass/fail decisions — bridging ML models with real-world workflows.',
    module: 'MOD_UI_TELEMETRY'
  },
  {
    num: '06',
    title: 'Agentic AI & LLMs',
    icon: '🤖',
    description: 'Building autonomous AI pipelines with tool-use, memory, and multi-step reasoning. Orchestrating LLM agents with RAG, function calling, and structured outputs for real-world tasks.',
    module: 'MOD_AGENT_CORE'
  },
];

export const ServicesFlipCards: React.FC = () => {
  return (
    <section className="py-32 px-6 md:px-12 lg:px-20 bg-[#03060f] relative z-10 border-b border-cyan-500/10">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-20 text-center">
          <h2 className="text-4xl md:text-6xl font-black text-white tracking-widest font-mono" style={{ textShadow: '0 0 20px rgba(0, 240, 255, 0.15)' }}>
            [ STACK_CAPABILITIES ]
          </h2>
          <p className="mt-4 text-cyan-400 font-mono tracking-widest uppercase text-xs">DEPLOYABLE AI MODULES &amp; SERVICES</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div 
              key={index}
              className="cyber-card p-8 rounded bg-[#060b1f]/65 border border-cyan-500/10 group relative transition-all duration-300 overflow-hidden"
            >
              {/* Outer top-right status marker */}
              <div className="absolute top-4 right-4 font-mono text-[8px] text-cyan-500/40">
                // {service.module}
              </div>

              {/* Glowing decorative indicator */}
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-cyan-500 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />

              <div className="flex flex-col gap-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                  <span className="text-4xl font-mono text-cyan-500/30 group-hover:text-cyan-400 transition-colors duration-300 font-bold">
                    {service.num}
                  </span>
                  <span className="text-3xl filter saturate-50 group-hover:saturate-100 transition-all duration-300">
                    {service.icon}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-white tracking-wider font-mono">
                  {service.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-cyan-100/60 leading-relaxed font-mono">
                  {service.description}
                </p>

                {/* Footer system details */}
                <div className="mt-6 pt-4 border-t border-cyan-950 flex justify-between items-center text-[9px] font-mono text-cyan-500/40">
                  <div>V1.2.0</div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                    STATUS: COMPILED
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
