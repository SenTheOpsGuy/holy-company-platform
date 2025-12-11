'use client';

import { cn } from '@/lib/utils';

interface FilterOption {
  id: string;
  label: string;
  count?: number;
}

interface FilterChipsProps {
  options: FilterOption[];
  selectedFilters: string[];
  onFilterChange: (filters: string[]) => void;
  className?: string;
  multiSelect?: boolean;
  maxVisible?: number;
}

export default function FilterChips({
  options,
  selectedFilters,
  onFilterChange,
  className,
  multiSelect = true,
  maxVisible = 10
}: FilterChipsProps) {
  const [showAll, setShowAll] = useState(false);

  const visibleOptions = showAll ? options : options.slice(0, maxVisible);
  const hasMore = options.length > maxVisible;

  const handleFilterClick = (filterId: string) => {
    if (multiSelect) {
      if (selectedFilters.includes(filterId)) {
        // Remove filter
        onFilterChange(selectedFilters.filter(id => id !== filterId));
      } else {
        // Add filter
        onFilterChange([...selectedFilters, filterId]);
      }
    } else {
      // Single select mode
      if (selectedFilters.includes(filterId)) {
        onFilterChange([]);
      } else {
        onFilterChange([filterId]);
      }
    }
  };

  const clearAllFilters = () => {
    onFilterChange([]);
  };

  return (
    <div className={cn('space-y-3', className)}>
      {/* Filter chips */}
      <div className="flex flex-wrap gap-2">
        {visibleOptions.map(option => {
          const isSelected = selectedFilters.includes(option.id);
          
          return (
            <button
              key={option.id}
              onClick={() => handleFilterClick(option.id)}
              className={cn(
                'inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium',
                'transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-saffron/50',
                isSelected
                  ? 'bg-saffron text-deep-brown shadow-md'
                  : 'bg-white border-2 border-deep-brown/20 text-deep-brown hover:border-saffron hover:bg-saffron/10'
              )}
            >
              <span>{option.label}</span>
              {option.count !== undefined && (
                <span className={cn(
                  'text-xs px-1.5 py-0.5 rounded-full',
                  isSelected 
                    ? 'bg-deep-brown/20 text-deep-brown' 
                    : 'bg-deep-brown/10 text-deep-brown/70'
                )}>
                  {option.count}
                </span>
              )}
              {isSelected && (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          );
        })}

        {/* Show more/less button */}
        {hasMore && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="inline-flex items-center gap-1 px-3 py-2 rounded-full text-sm font-medium text-deep-brown/70 hover:text-deep-brown transition-colors"
          >
            <span>{showAll ? 'Show less' : `+${options.length - maxVisible} more`}</span>
            <svg 
              className={cn('w-4 h-4 transition-transform', showAll && 'rotate-180')} 
              fill="currentColor" 
              viewBox="0 0 20 20"
            >
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>

      {/* Active filters summary and clear all */}
      {selectedFilters.length > 0 && (
        <div className="flex items-center justify-between text-sm">
          <div className="text-deep-brown/60">
            {selectedFilters.length} filter{selectedFilters.length !== 1 ? 's' : ''} applied
          </div>
          <button
            onClick={clearAllFilters}
            className="text-saffron hover:text-saffron/80 font-medium transition-colors"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Selected filters list (when many are selected) */}
      {selectedFilters.length > 3 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-deep-brown/60 uppercase tracking-wide">Active Filters</p>
          <div className="flex flex-wrap gap-1">
            {selectedFilters.map(filterId => {
              const option = options.find(opt => opt.id === filterId);
              if (!option) return null;
              
              return (
                <span
                  key={filterId}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-saffron/20 text-deep-brown text-xs rounded-full"
                >
                  {option.label}
                  <button
                    onClick={() => handleFilterClick(filterId)}
                    className="hover:bg-deep-brown/20 rounded-full p-0.5"
                  >
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// Import useState
import { useState } from 'react';