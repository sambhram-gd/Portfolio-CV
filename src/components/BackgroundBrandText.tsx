import React from "react";
import clsx from "clsx";

interface Props {
  text: string;
  opacity?: number;
}

export const BackgroundBrandText: React.FC<Props> = ({ text, opacity = 0.04 }) => {
  return (
    <div
      className={clsx(
        "fixed left-0 right-0 top-1/2 -translate-y-1/2 z-[1] pointer-events-none select-none overflow-hidden h-auto text-center will-change-[opacity] px-4"
      )}
      style={{
        opacity: opacity,
      }}
    >
      <span className="brand-text-sizing font-bebas uppercase font-black whitespace-nowrap text-white block leading-none tracking-[0.04em]">
        {text}
      </span>

      <style dangerouslySetInnerHTML={{
        __html: `
          .brand-text-sizing {
            font-size: 20vw;
          }
          @media (max-width: 768px) {
            .brand-text-sizing {
              font-size: 28vw;
            }
          }
        `
      }} />
    </div>
  );
};
