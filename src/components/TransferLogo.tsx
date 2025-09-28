'use client';

import React from 'react';

interface TransferLogoProps {
  size?: number;
  showText?: boolean;
  className?: string;
  iconClassName?: string;
  textClassName?: string;
}

export default function TransferLogo({ 
  size = 32, 
  showText = true, 
  className = '',
  iconClassName = '',
  textClassName = ''
}: TransferLogoProps) {
  // Generate unique ID for gradient to avoid conflicts
  const gradientId = `iconGradient-${Math.random().toString(36).substring(2, 9)}`;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Custom Love Trip Icon with Background */}
      <div 
        className={`bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg ${iconClassName}`}
        style={{ width: size, height: size }}
      >
        <svg 
          width={size * 0.65} 
          height={size * 0.65} 
          viewBox="3.833 61.375 102 90.833" 
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.95)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0.85)" />
            </linearGradient>
          </defs>
          {/* Airplane/Travel Element */}
          <path 
            d="M95.613,115.104c-0.098-0.855-0.865-1.471-1.725-1.373l-33.223,3.775c-0.846-2.862-3.49-4.952-6.627-4.952  c-3.146,0-5.795,2.101-6.634,4.975l-33.407-3.796c-0.859-0.098-1.627,0.518-1.724,1.372c-0.097,0.856,0.517,1.628,1.373,1.725  l14.901,1.694c-0.673,0.722-1.093,1.683-1.093,2.745c0,2.231,1.81,4.042,4.042,4.042s4.042-1.81,4.042-4.042  c0-0.736-0.212-1.42-0.559-2.016l12.254,1.392c0.56,3.256,3.39,5.736,6.806,5.736c3.424,0,6.259-2.491,6.81-5.759l12.06-1.369  c-0.346,0.595-0.559,1.277-0.559,2.016c0,2.229,1.809,4.041,4.041,4.041c2.23,0,4.041-1.81,4.041-4.041  c0-1.065-0.42-2.026-1.092-2.747l14.902-1.694C95.096,116.729,95.711,115.959,95.613,115.104z" 
            fill={`url(#${gradientId})`}
          />
          {/* Heart/Love Element */}
          <path 
            d="M70.609,72.618c-1.557-1.573-3.958-2.948-7.36-2.915c-5.889,0.422-7.828,4.118-9.26,7.14  c-1.415-3.082-3.778-7.203-9.911-7.14c-5.021,0.322-8.021,3.383-9.109,7.216c-1.326,4.672,0.379,9.822,2.479,12.754  c2.168,3.024,5.321,5.538,8.089,7.945c2.939,2.555,4.796,3.531,8.528,6.61c3.701-3.403,9.518-7.039,14.356-12.076  c2.193-2.379,4.109-4.853,4.736-8.965C73.824,78.834,73.061,75.096,70.609,72.618z" 
            fill={`url(#${gradientId})`}
          />
        </svg>
      </div>
      
      {/* Optional Text */}
      {showText && (
        <span className={`font-bold text-gray-800 tracking-tight ${textClassName}`}>
          Venboo
        </span>
      )}
    </div>
  );
}
