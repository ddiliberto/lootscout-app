"use client";

import React, { useState } from 'react';
import { platformFilters } from '@/lib/mock-data';
import { Card } from '@/components/ui/card';
import { useRouter } from 'next/navigation';

export function PlatformMarquee() {
  const router = useRouter();
  const [isPaused, setIsPaused] = useState(false);

  const handlePlatformClick = (query: string) => {
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  // Duplicate the platforms array to create a seamless loop
  const duplicatedPlatforms = [...platformFilters, ...platformFilters, ...platformFilters];

  return (
    <div 
      className="w-full overflow-hidden bg-background py-4"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="relative">
        <div 
          className={`flex space-x-4 ${!isPaused ? 'animate-marquee' : ''}`}
          style={{ 
            willChange: 'transform',
            transform: 'translateX(0)'
          }}
        >
          {duplicatedPlatforms.map((platform, index) => (
            <Card
              key={`${platform.query}-${index}`}
              className="flex-none cursor-pointer bg-white/50 hover:bg-white/80 transition-all duration-200 hover:scale-105"
              style={{ 
                minWidth: '200px',
                borderColor: platform.color,
                borderWidth: '2px'
              }}
              onClick={() => handlePlatformClick(platform.query)}
            >
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-1" style={{ color: platform.color }}>
                  {platform.name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Browse games →
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
} 