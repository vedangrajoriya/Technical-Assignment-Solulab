import React from 'react';

interface ForgeFlowLogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
}

export const ForgeFlowLogo: React.FC<ForgeFlowLogoProps> = ({
  size = 36,
  className = '',
  showText = false
}) => {
  return (
    <div className={`flex items-center space-x-2.5 ${className}`}>
      <div 
        style={{ width: size, height: size }}
        className="relative flex-shrink-0 transition-transform hover:scale-105"
      >
        <svg 
          viewBox="0 0 100 100" 
          fill="none" 
          className="w-full h-full drop-shadow-[0_2px_8px_rgba(37,99,235,0.35)]"
        >
          <defs>
            <linearGradient id="ffGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="50%" stopColor="#2563eb" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
            <linearGradient id="ffInnerGlow" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
          </defs>

          {/* Outer Precision Hexagon / Gear Base */}
          <polygon 
            points="50,6 88,28 88,72 50,94 12,72 12,28" 
            fill="#0f172a" 
            stroke="url(#ffGrad)" 
            strokeWidth="4" 
            strokeLinejoin="round"
          />

          {/* Synchronized Gear Teeth Markers */}
          <path d="M50 2 L54 10 L46 10 Z" fill="#06b6d4"/>
          <path d="M50 98 L54 90 L46 90 Z" fill="#8b5cf6"/>
          <path d="M6 31 L14 34 L10 27 Z" fill="#2563eb"/>
          <path d="M94 31 L86 34 L90 27 Z" fill="#06b6d4"/>
          <path d="M6 69 L14 66 L10 73 Z" fill="#2563eb"/>
          <path d="M94 69 L86 66 L90 73 Z" fill="#8b5cf6"/>

          {/* Interlocking F Forge Flow Monogram */}
          <path 
            d="M36 28 H68 C72 28 75 31 75 35 C75 39 72 42 68 42 H48 V50 H62 C65 50 67 52 67 55 C67 58 65 60 62 60 H48 V72 C48 75 45 77 42 77 C39 77 36 75 36 72 Z" 
            fill="url(#ffGrad)"
          />

          {/* Core Kinetic Diamond */}
          <polygon points="58,45 68,55 58,65 48,55" fill="url(#ffInnerGlow)" opacity="0.95"/>
          <circle cx="58" cy="55" r="3" fill="#ffffff"/>
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center space-x-1.5 font-mono">
            <span className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white">
              ForgeFlow
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300">
              ERP
            </span>
          </div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono tracking-wider uppercase">
            Industrial Precision
          </span>
        </div>
      )}
    </div>
  );
};
