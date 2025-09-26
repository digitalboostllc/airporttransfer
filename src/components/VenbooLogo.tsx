'use client';

import React from 'react';

interface VenbooLogoProps {
  size?: number;
  className?: string;
}

export default function VenbooLogo({ size = 32, className = '' }: VenbooLogoProps) {
  return (
    <div className={`relative flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Gradient Definition */}
        <defs>
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="100%" stopColor="#f97316" />
          </linearGradient>
        </defs>

        {/* Background Circle */}
        <circle
          cx="16"
          cy="16"
          r="14"
          fill="url(#logoGradient)"
        />

        {/* Minimalist V with subtle transport hint */}
        <path
          d="M9 10L16 22L23 10"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* Small dot accent (represents destination/movement) */}
        <circle
          cx="20"
          cy="12"
          r="1.5"
          fill="white"
          opacity="0.8"
        />
      </svg>
    </div>
  );
}
