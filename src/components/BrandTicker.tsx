import React from 'react';

const brands = [
  'NVIDIA Jetson', 'PyTorch', 'TensorFlow', 'OpenCV',
  'Spookfish Innovations', 'Sandoz', 'HuggingFace',
  'Streamlit', 'Python', 'YOLOv8', 'PatchCore',
  'LangChain', 'RAG Pipelines', 'AI Agents', 'IMCL 2025',
];

export const BrandTicker: React.FC = () => {
  const doubled = [...brands, ...brands, ...brands, ...brands]; 
  return (
    <div className="overflow-hidden py-2 md:py-3.5 border-y border-white/5 bg-[#0a0c1a] relative z-10 flex w-full">
      <style>
        {`
          @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .animate-marquee {
            animation: marquee 40s linear infinite;
          }
          .animate-marquee:hover {
            animation-play-state: paused;
          }
        `}
      </style>
      <div className="flex w-max animate-marquee whitespace-nowrap cursor-pointer">
        {doubled.map((b, i) => (
          <span key={i} className="px-5 md:px-8 text-white/40 hover:text-white transition-colors duration-300 font-bold tracking-[0.2em] uppercase text-[10px] md:text-sm font-mono flex items-center">
            {b} <span className="mx-5 md:mx-8 text-emerald-500/50 text-[10px] md:text-sm">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
