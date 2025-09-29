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
  size = 36, 
  showText = true, 
  className = '',
  iconClassName = '',
  textClassName = ''
}: TransferLogoProps) {
  // Generate unique ID for gradient to avoid conflicts
  const gradientId = `iconGradient-${Math.random().toString(36).substring(2, 9)}`;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Custom Car-Plane Icon with Background */}
      <div 
        className={`bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg ${iconClassName}`}
        style={{ width: size, height: size }}
      >
        <svg 
          width={size * 0.85} 
          height={size * 0.85} 
          viewBox="0 0 100 100" 
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.95)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0.85)" />
            </linearGradient>
          </defs>
          {/* Airplane Element */}
          <path 
            d="M66,18a4,4,0,0,0-4,4v4.25a2.07,2.07,0,0,1-1.14,1.85L52.4,32.33a4.14,4.14,0,0,0-2.12,5.13,4,4,0,0,0,5.51,2.11L62,36.47V45h-.79A4.14,4.14,0,0,0,57,48.64,4,4,0,0,0,61,53H71a4,4,0,0,0,4-4.36A4.14,4.14,0,0,0,70.79,45H70V36.47l6.21,3.1a4,4,0,0,0,5.51-2.11,4.14,4.14,0,0,0-2.12-5.13L71.14,28.1A2.07,2.07,0,0,1,70,26.25V22a4,4,0,0,0-4-4" 
            fill={`url(#${gradientId})`}
          />
          {/* Car Element */}
          <path 
            d="M82,71.88q0-4.11-.35-8.19a4,4,0,1,0-8,.73q.32,3.71.33,7.46V74H64.77L63,69.24A5,5,0,0,0,58.31,66H41.69A5,5,0,0,0,37,69.24L35.23,74H26V71.89a88.73,88.73,0,0,1,9.39-39.73A4,4,0,0,1,38.94,30h2.94A4.12,4.12,0,0,0,46,26.39a4,4,0,0,0-4-4.39H38.94a11.92,11.92,0,0,0-10.68,6.52A96.72,96.72,0,0,0,18,71.88V76a6,6,0,0,0,6,6H36.61a6,6,0,0,0,5.62-3.89L43.77,74H56.23l1.54,4.11A6,6,0,0,0,63.38,82H76a6,6,0,0,0,6-6Z" 
            fill={`url(#${gradientId})`}
          />
        </svg>
      </div>
      
      {/* Optional Text */}
      {showText && (
        <span className={`font-[family-name:var(--font-bungee)] text-gray-800 tracking-wide ${textClassName}`}>
          venboo
        </span>
      )}
    </div>
  );
}
