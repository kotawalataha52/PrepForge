import React from 'react';

const Logo = ({ size = 'md', showText = true, darkText = false, className = '' }) => {
  const sizeMap = {
    sm: { icon: 'w-7 h-7', text: 'text-lg' },
    md: { icon: 'w-9 h-9', text: 'text-xl' },
    lg: { icon: 'w-11 h-11', text: 'text-2xl' },
    xl: { icon: 'w-14 h-14', text: 'text-3xl' }
  };

  const current = sizeMap[size] || sizeMap.md;

  return (
    <div className={`flex items-center gap-2.5 group select-none ${className}`}>
      {/* Concept 1 Monogram Emblem */}
      <div className={`${current.icon} shrink-0 drop-shadow-sm group-hover:scale-105 transition-transform duration-200`}>
        <svg 
          viewBox="0 0 64 64" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          <defs>
            <linearGradient id="prepForgeBgGrad" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
              <stop stopColor="#3B82F6" />
              <stop offset="1" stopColor="#1D4ED8" />
            </linearGradient>
          </defs>
          
          {/* Rounded Squircle Container */}
          <rect x="2" y="2" width="60" height="60" rx="16" fill="url(#prepForgeBgGrad)" />
          <rect x="2.5" y="2.5" width="59" height="59" rx="15.5" stroke="white" strokeOpacity="0.25" />

          {/* Bold Geometric 'P' + Forge Anvil Notch */}
          <path d="M21 16C21 14.8954 21.8954 14 23 14H35.5C41.299 14 46 18.701 46 24.5C46 30.299 41.299 35 35.5 35H28.5V48C28.5 49.1046 27.6046 50 26.5 50H23C21.8954 50 21 49.1046 21 48V16Z" fill="white"/>
          
          {/* Inner Loop Cutout */}
          <path d="M28.5 21V28H35C36.933 28 38.5 26.433 38.5 24.5C38.5 22.567 36.933 21 35 21H28.5Z" fill="url(#prepForgeBgGrad)"/>
          
          {/* Subtle Golden Star Accent */}
          <path d="M46 8.5L47.5 12L51 13.5L47.5 15L46 18.5L44.5 15L41 13.5L44.5 12L46 8.5Z" fill="#FBBF24" />
          <circle cx="46" cy="13.5" r="1.5" fill="#FEF08A" />
        </svg>
      </div>

      {/* Brand Title */}
      {showText && (
        <span className={`${current.text} font-bold font-display tracking-tight ${darkText ? 'text-slate-900' : 'text-white'}`}>
          Prep<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-500">Forge</span>
        </span>
      )}
    </div>
  );
};

export default Logo;
