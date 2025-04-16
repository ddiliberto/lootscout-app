"use client";

import React from 'react';

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function Container({ children, className = '' }: ContainerProps) {
  return (
    <div className="min-h-screen bg-background px-6 pb-12 md:px-16">
      <div className={`mx-auto max-w-screen-lg ${className}`}>
        {children}
      </div>
    </div>
  );
}
