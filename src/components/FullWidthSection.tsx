"use client";

import React from 'react';

interface FullWidthSectionProps {
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
}

export function FullWidthSection({ 
  children, 
  className = '', 
  contentClassName = '' 
}: FullWidthSectionProps) {
  return (
    <div 
      className={`relative w-screen shadow-sm ${className}`} 
      style={{ 
        marginLeft: 'calc(50% - 50vw)',
        marginRight: 'calc(50% - 50vw)'
      }}
    >
      <div className={`mx-auto max-w-[1800px] ${contentClassName}`}>
        {children}
      </div>
    </div>
  );
}
