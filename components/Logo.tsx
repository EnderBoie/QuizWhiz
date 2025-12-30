import React from 'react';

interface LogoProps {
  variant?: 'large' | 'medium' | 'small';
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ variant = 'medium', className = '' }) => {
  
  const config = {
    large: { 
      container: 'w-24 h-24', 
      radius: 'rounded-2xl',
      wrapperClass: 'shadow-xl transform rotate-3 hover:rotate-6 transition-all duration-300'
    },
    medium: { 
      container: 'w-10 h-10', 
      radius: 'rounded-xl',
      wrapperClass: 'shadow-md'
    },
    small: { 
      container: 'w-8 h-8', 
      radius: 'rounded-lg',
      wrapperClass: 'shadow-sm'
    }
  };

  const { container, radius, wrapperClass } = config[variant];

  return (
    <div className={`${container} relative group ${className}`}>
      {variant === 'large' && (
        <div className={`absolute inset-0 bg-violet-600 ${radius} blur opacity-40 group-hover:opacity-60 transition-opacity duration-500`}></div>
      )}
      
      <div className={`relative w-full h-full bg-gradient-to-br from-violet-600 via-fuchsia-600 to-indigo-600 ${radius} ${wrapperClass} overflow-hidden flex items-center justify-center border border-white/20`}>
        {/* Custom SVG Logo Implementation - No external files required */}
        <svg 
          viewBox="0 0 100 100" 
          className="w-full h-full p-[15%]"
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Shadow/Glow */}
          <path 
            d="M55 5L25 55H48L42 95L75 40H50L55 5Z" 
            className="fill-black opacity-20 transform translate-x-1 translate-y-1"
          />
          {/* Main Bolt */}
          <path 
            d="M55 5L25 55H48L42 95L75 40H50L55 5Z" 
            className="fill-white drop-shadow-sm"
            stroke="white" 
            strokeWidth="4" 
            strokeLinejoin="round"
          />
          {/* Sparkle 1 */}
          <path d="M85 20L88 28L96 31L88 34L85 42L82 34L74 31L82 28L85 20Z" className="fill-yellow-300 animate-pulse" />
          {/* Sparkle 2 (only for large) */}
          {variant === 'large' && (
             <path d="M20 75L22 80L27 82L22 84L20 89L18 84L13 82L18 80L20 75Z" className="fill-yellow-300 animate-pulse" style={{ animationDelay: '0.5s' }} />
          )}
        </svg>
      </div>
    </div>
  );
};