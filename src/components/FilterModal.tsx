"use client";

import React from 'react';
import { X, Gamepad, Tv, Gamepad2, MonitorSmartphone, Rocket, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  platformFilters, 
  genreFilters, 
  priceFilters, 
  sourceFilters 
} from '@/lib/mock-data';

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  activePlatformFilters: string[];
  activeGenreFilters: string[];
  activePriceFilters: string[];
  activeSourceFilters: string[];
  togglePlatformFilter: (filter: string) => void;
  toggleGenreFilter: (filter: string) => void;
  togglePriceFilter: (filter: string) => void;
  toggleSourceFilter: (filter: string) => void;
  clearAllFilters: () => void;
}

export function FilterModal({
  isOpen,
  onClose,
  activePlatformFilters,
  activeGenreFilters,
  activePriceFilters,
  activeSourceFilters,
  togglePlatformFilter,
  toggleGenreFilter,
  togglePriceFilter,
  toggleSourceFilter,
  clearAllFilters
}: FilterModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold">Filters</h2>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearAllFilters}
              className="text-xs"
            >
              Clear All
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="p-4">
          {/* Active Filters */}
          {(activePlatformFilters.length > 0 || 
            activeGenreFilters.length > 0 || 
            activePriceFilters.length > 0 || 
            activeSourceFilters.length > 0) && (
            <div className="mb-6">
              <h3 className="text-sm font-medium mb-2">Active Filters:</h3>
              <div className="flex flex-wrap gap-2">
                {activePlatformFilters.map((filter) => {
                  const platformFilter = platformFilters.find(f => f.query === filter);
                  return (
                    <Button
                      key={filter}
                      variant="default"
                      size="sm"
                      onClick={() => togglePlatformFilter(filter)}
                      className="flex items-center gap-1 bg-primary/80"
                    >
                      {platformFilter?.name}
                      <X className="w-3 h-3 ml-1" />
                    </Button>
                  );
                })}
                {activeGenreFilters.map((filter) => {
                  const genreFilter = genreFilters.find(f => f.query === filter);
                  return (
                    <Button
                      key={filter}
                      variant="default"
                      size="sm"
                      onClick={() => toggleGenreFilter(filter)}
                      className="flex items-center gap-1 bg-primary/80"
                    >
                      {genreFilter?.name}
                      <X className="w-3 h-3 ml-1" />
                    </Button>
                  );
                })}
                {activePriceFilters.map((filter) => {
                  const priceFilter = priceFilters.find(f => f.query === filter);
                  return (
                    <Button
                      key={filter}
                      variant="default"
                      size="sm"
                      onClick={() => togglePriceFilter(filter)}
                      className="flex items-center gap-1 bg-primary/80"
                    >
                      {priceFilter?.name}
                      <X className="w-3 h-3 ml-1" />
                    </Button>
                  );
                })}
                {activeSourceFilters.map((filter) => {
                  const sourceFilter = sourceFilters.find(f => f.query === filter);
                  return (
                    <Button
                      key={filter}
                      variant="default"
                      size="sm"
                      onClick={() => toggleSourceFilter(filter)}
                      className="flex items-center gap-1 bg-primary/80"
                    >
                      {sourceFilter?.name}
                      <X className="w-3 h-3 ml-1" />
                    </Button>
                  );
                })}
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Platform Filters */}
            <div>
              <h3 className="text-sm font-semibold mb-3">Platforms</h3>
              <div className="flex flex-wrap gap-2">
                {platformFilters.map((filter) => (
                  <Button
                    key={filter.query}
                    variant={activePlatformFilters.includes(filter.query) ? "default" : "outline"}
                    size="sm"
                    onClick={() => togglePlatformFilter(filter.query)}
                    className="flex items-center gap-1"
                  >
                    {filter.query === "ps1" && <Gamepad className="w-4 h-4 mr-1" />}
                    {filter.query === "snes" && <Tv className="w-4 h-4 mr-1" />}
                    {filter.query === "n64" && <Gamepad2 className="w-4 h-4 mr-1" />}
                    {filter.query === "game boy" && <MonitorSmartphone className="w-4 h-4 mr-1" />}
                    {filter.query === "genesis" && <Gamepad className="w-4 h-4 mr-1" />}
                    {filter.name}
                  </Button>
                ))}
              </div>
            </div>
            
            {/* Genre Filters */}
            <div>
              <h3 className="text-sm font-semibold mb-3">Genres</h3>
              <div className="flex flex-wrap gap-2">
                {genreFilters.map((filter) => (
                  <Button
                    key={filter.query}
                    variant={activeGenreFilters.includes(filter.query) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleGenreFilter(filter.query)}
                    className="flex items-center gap-1"
                  >
                    {filter.query === "rpg" && <Rocket className="w-4 h-4 mr-1" />}
                    {filter.query === "fighting" && <Gamepad2 className="w-4 h-4 mr-1" />}
                    {filter.name}
                  </Button>
                ))}
              </div>
            </div>
            
            {/* Price Filters */}
            <div>
              <h3 className="text-sm font-semibold mb-3">Price Range</h3>
              <div className="flex flex-wrap gap-2">
                {priceFilters.map((filter) => (
                  <Button
                    key={filter.query}
                    variant={activePriceFilters.includes(filter.query) ? "default" : "outline"}
                    size="sm"
                    onClick={() => togglePriceFilter(filter.query)}
                    className="flex items-center gap-1"
                  >
                    <DollarSign className="w-4 h-4 mr-1" />
                    {filter.name}
                  </Button>
                ))}
              </div>
            </div>
            
            {/* Source Filters */}
            <div>
              <h3 className="text-sm font-semibold mb-3">Source</h3>
              <div className="flex flex-wrap gap-2">
                {sourceFilters.map((filter) => (
                  <Button
                    key={filter.query}
                    variant={activeSourceFilters.includes(filter.query) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleSourceFilter(filter.query)}
                    className="flex items-center gap-1"
                  >
                    {filter.name}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        <div className="sticky bottom-0 bg-white p-4 border-t flex justify-end">
          <Button onClick={onClose}>Apply Filters</Button>
        </div>
      </div>
    </div>
  );
}
