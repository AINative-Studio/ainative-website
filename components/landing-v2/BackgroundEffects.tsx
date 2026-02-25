'use client';

import { useId } from 'react';

export default function BackgroundEffects() {
  const id = useId();
  const f1 = `${id}-f1`;
  const f2 = `${id}-f2`;
  const f3 = `${id}-f3`;

  return (
    <>
      {/* SVG glow blobs */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Top glow */}
        <div className="absolute -top-[200px] left-1/2 -translate-x-1/2 w-[1789px] h-[1769px]">
          <svg width="100%" height="100%" viewBox="0 0 1789 1769" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <filter id={f1} x="0" y="0" width="1789" height="1769" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                <feFlood floodOpacity="0" result="bg" />
                <feBlend mode="normal" in="SourceGraphic" in2="bg" result="s" />
                <feGaussianBlur stdDeviation="279" result="blur" />
              </filter>
            </defs>
            <g filter={`url(#${f1})`}>
              <ellipse cx="894.5" cy="884.5" rx="336.5" ry="326.5" fill="#5461D6" />
            </g>
          </svg>
        </div>

        {/* Mid glow */}
        <div className="absolute top-[900px] left-1/2 -translate-x-[10%] w-[1908px] h-[1884px]">
          <svg width="100%" height="100%" viewBox="0 0 1908 1884" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <filter id={f2} x="0" y="0" width="1908" height="1884" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                <feFlood floodOpacity="0" result="bg" />
                <feBlend mode="normal" in="SourceGraphic" in2="bg" result="s" />
                <feGaussianBlur stdDeviation="279" result="blur" />
              </filter>
            </defs>
            <g filter={`url(#${f2})`}>
              <ellipse cx="954" cy="942" rx="396" ry="384" fill="#5461D6" fillOpacity="0.5" />
            </g>
          </svg>
        </div>

        {/* Bottom glow */}
        <div className="absolute top-[1500px] left-1/2 -translate-x-[80%] w-[1908px] h-[1884px]">
          <svg width="100%" height="100%" viewBox="0 0 1908 1884" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <filter id={f3} x="0" y="0" width="1908" height="1884" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                <feFlood floodOpacity="0" result="bg" />
                <feBlend mode="normal" in="SourceGraphic" in2="bg" result="s" />
                <feGaussianBlur stdDeviation="279" result="blur" />
              </filter>
            </defs>
            <g filter={`url(#${f3})`}>
              <ellipse cx="954" cy="942" rx="396" ry="384" fill="#5461D6" fillOpacity="0.5" />
            </g>
          </svg>
        </div>
      </div>

      {/* Purple gradient overlay */}
      <div className="absolute top-0 left-0 w-full h-[946px] bg-gradient-to-b from-brand-primary/40 to-transparent pointer-events-none z-[1]" />
    </>
  );
}
