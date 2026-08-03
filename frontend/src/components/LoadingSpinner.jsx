import React from 'react';

export function LoadingSpinner({ label = 'Loading HackHub AI...', size = 'md' }) {
  const sizeMap = {
    sm: { container: 'w-6 h-6', orbit: 'w-6 h-6', dot: 'w-1.5 h-1.5' },
    md: { container: 'w-10 h-10', orbit: 'w-10 h-10', dot: 'w-2.5 h-2.5' },
    lg: { container: 'w-16 h-16', orbit: 'w-16 h-16', dot: 'w-3.5 h-3.5' },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  return (
    <div className="flex flex-col items-center justify-center p-6 space-y-4">
      <div className={`relative flex items-center justify-center ${currentSize.container}`}>
        {/* Core Pulsing Gradient Core */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#0D0856] via-[#221297] to-[#5044D4] blur-sm animate-pulse opacity-80" />

        {/* Inner Morphing Hex Node */}
        <div className="relative z-10 rounded-full bg-[#000002] border border-[#AAACF3]/50 p-2 shadow-[0_0_15px_rgba(80,68,212,0.6)] flex items-center justify-center">
          <svg className="w-full h-full text-[#F5F8FE] animate-spin" viewBox="0 0 24 24" fill="none">
            <circle
              className="opacity-20"
              cx="12"
              cy="12"
              r="10"
              stroke="#AAACF3"
              strokeWidth="3"
            />
            <path
              className="opacity-90"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </div>

        {/* Orbiting Satellite Dot */}
        <div className={`absolute inset-0 animate-spin ${currentSize.orbit}`} style={{ animationDuration: '1.5s' }}>
          <div className={`rounded-full bg-[#AAACF3] shadow-[0_0_8px_#AAACF3] ${currentSize.dot}`} />
        </div>
      </div>

      {label && (
        <p className="text-xs font-bold tracking-wider uppercase text-[#AAACF3] animate-pulse">
          {label}
        </p>
      )}
    </div>
  );
}
