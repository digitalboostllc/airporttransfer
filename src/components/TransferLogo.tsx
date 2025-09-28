'use client';

import React from 'react';
import { RotateCcw } from 'lucide-react';

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
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Simple Transfer Icon with Background */}
      <div 
        className={`bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg ${iconClassName}`}
        style={{ width: size, height: size }}
      >
        <RotateCcw 
          size={size * 0.5} 
          className="text-white" 
          strokeWidth={2.5}
        />
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
