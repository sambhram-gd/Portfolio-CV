import React from 'react';

export const CautionRibbon: React.FC = () => {
  const items = [
    { name: 'OpenCV', url: 'https://cdn.simpleicons.org/opencv/ffffff' },
    { name: 'TensorFlow', url: 'https://cdn.simpleicons.org/tensorflow/ffffff' },
    { name: 'PyTorch', url: 'https://cdn.simpleicons.org/pytorch/ffffff' },
    { name: 'NVIDIA', url: 'https://cdn.simpleicons.org/nvidia/ffffff' },
    { name: 'Quanser', url: null },
    { name: 'Machine Learning', url: null },
  ];

  return (
    <div className="relative w-full overflow-hidden z-20 bg-[#0a0815] border-b border-white/8 h-16 flex items-center">
      <div className="flex w-max animate-scroll-left" style={{ animationDuration: '25s' }}>
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="flex items-center shrink-0">
            {items.map((item, idx) => (
              <div key={idx} className="flex items-center space-x-3 px-6">
                {item.url && (
                  <img 
                    src={item.url} 
                    alt={item.name} 
                    className="h-5 w-5 object-contain opacity-90" 
                  />
                )}
                <span className="text-white font-mono font-medium text-sm tracking-[0.15em] whitespace-nowrap uppercase">
                  {item.name}
                </span>
                <span className="text-[#6B3FE4] font-bold text-sm ml-4 opacity-60">·</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
