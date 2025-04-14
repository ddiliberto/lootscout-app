"use client";

import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CarouselProps {
  children: React.ReactNode[];
  autoPlay?: boolean;
  interval?: number;
  showDots?: boolean;
  showArrows?: boolean;
  itemsToShow?: number;
  fullWidth?: boolean;
  draggable?: boolean;
}

export function Carousel({
  children,
  autoPlay = true,
  interval = 5000,
  showDots = true,
  showArrows = true,
  itemsToShow = 1,
  fullWidth = false,
  draggable = true
}: CarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const maxIndex = Math.max(0, Math.ceil(children.length / itemsToShow) - 1);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Handle auto-play
  useEffect(() => {
    if (autoPlay && !isHovering && children.length > itemsToShow) {
      timerRef.current = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex === maxIndex ? 0 : prevIndex + 1));
      }, interval);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [autoPlay, interval, isHovering, children.length, itemsToShow, maxIndex]);

  // Navigate to previous slide
  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? maxIndex : prevIndex - 1));
  };

  // Navigate to next slide
  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex === maxIndex ? 0 : prevIndex + 1));
  };

  // Go to a specific slide
  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  // Get visible children based on current index and items to show
  const getVisibleChildren = () => {
    const startIndex = currentIndex * itemsToShow;
    return children.slice(startIndex, startIndex + itemsToShow);
  };

  // Handle drag events for swipe functionality
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (!draggable) return;
    
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    setDragStartX(clientX);
    setDragOffset(0);
  };

  const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging || !draggable) return;
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const newOffset = clientX - dragStartX;
    setDragOffset(newOffset);
  };

  const handleDragEnd = () => {
    if (!isDragging || !draggable) return;
    
    setIsDragging(false);
    
    // Determine if we should navigate based on drag distance
    const containerWidth = carouselRef.current?.offsetWidth || 0;
    const threshold = containerWidth * 0.2; // 20% of container width
    
    if (Math.abs(dragOffset) > threshold) {
      if (dragOffset > 0 && currentIndex > 0) {
        // Dragged right - go to previous
        prevSlide();
      } else if (dragOffset < 0 && currentIndex < maxIndex) {
        // Dragged left - go to next
        nextSlide();
      }
    }
    
    setDragOffset(0);
  };

  return (
    <div 
      className={`relative ${fullWidth ? 'w-full max-w-[1800px] mx-auto' : ''}`}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Main carousel container */}
      <div 
        className="overflow-hidden"
        ref={carouselRef}
        onMouseDown={handleDragStart}
        onMouseMove={handleDragMove}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
        onTouchStart={handleDragStart}
        onTouchMove={handleDragMove}
        onTouchEnd={handleDragEnd}
      >
        <div 
          className={`flex ${!isDragging ? 'transition-transform duration-500 ease-in-out' : ''}`}
          style={{ 
            transform: `translateX(calc(-${currentIndex * (100 / Math.min(itemsToShow, children.length))}% + ${dragOffset}px))`,
            width: `${(children.length / Math.min(itemsToShow, children.length)) * 100}%`
          }}
        >
          {children.map((child, index) => (
            <div 
              key={index} 
              className="flex-shrink-0"
              style={{ width: `${100 / (children.length * (itemsToShow / Math.floor(itemsToShow)))}%` }}
            >
              {child}
            </div>
          ))}
        </div>
      </div>

      {/* Navigation arrows */}
      {showArrows && children.length > itemsToShow && (
        <>
          <Button
            variant="outline"
            size="icon"
            className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full z-10 shadow-md"
            onClick={prevSlide}
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full z-10 shadow-md"
            onClick={nextSlide}
            aria-label="Next slide"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </>
      )}

      {/* Pagination dots */}
      {showDots && children.length > itemsToShow && (
        <div className="flex justify-center gap-1 mt-4">
          {Array.from({ length: maxIndex + 1 }).map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex ? 'bg-primary' : 'bg-gray-300'
              }`}
              onClick={() => goToSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
