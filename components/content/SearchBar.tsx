'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  className?: string;
  suggestions?: string[];
  autoFocus?: boolean;
}

export default function SearchBar({
  onSearch,
  placeholder = 'Search...',
  className,
  suggestions = [],
  autoFocus = false
}: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      onSearch(query);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [query, onSearch]);

  useEffect(() => {
    if (query.trim() && suggestions.length > 0) {
      const filtered = suggestions.filter(suggestion =>
        suggestion.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredSuggestions(filtered.slice(0, 5)); // Show max 5 suggestions
      setShowSuggestions(filtered.length > 0 && isFocused);
    } else {
      setShowSuggestions(false);
    }
  }, [query, suggestions, isFocused]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    onSearch(suggestion);
    setShowSuggestions(false);
  };

  const handleClear = () => {
    setQuery('');
    onSearch('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowSuggestions(false);
      setIsFocused(false);
    }
  };

  return (
    <div className={cn('relative w-full', className)}>
      <div className="relative">
        {/* Search Icon */}
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-deep-brown/50">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
          </svg>
        </div>

        {/* Input Field */}
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          onKeyDown={handleKeyDown}
          autoFocus={autoFocus}
          placeholder={placeholder}
          className={cn(
            'w-full pl-12 pr-12 py-4 bg-white border-2 border-deep-brown/20 rounded-xl',
            'text-deep-brown placeholder-deep-brown/50',
            'focus:outline-none focus:border-saffron focus:ring-2 focus:ring-saffron/20',
            'transition-all duration-200',
            isFocused && 'border-saffron ring-2 ring-saffron/20'
          )}
        />

        {/* Clear Button */}
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-deep-brown/50 hover:text-deep-brown transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-deep-brown/10 rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto">
          {filteredSuggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className="w-full px-4 py-3 text-left hover:bg-saffron/10 focus:bg-saffron/10 transition-colors border-b border-deep-brown/5 last:border-b-0"
            >
              <div className="flex items-center gap-3">
                <svg className="w-4 h-4 text-deep-brown/40" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
                <span className="text-deep-brown">{suggestion}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Popular Searches (when no query) */}
      {isFocused && !query && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-deep-brown/10 rounded-xl shadow-lg z-50">
          <div className="p-3 border-b border-deep-brown/10">
            <p className="text-sm font-medium text-deep-brown/60">Popular searches</p>
          </div>
          {suggestions.slice(0, 5).map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className="w-full px-4 py-3 text-left hover:bg-saffron/10 focus:bg-saffron/10 transition-colors border-b border-deep-brown/5 last:border-b-0"
            >
              <div className="flex items-center gap-3">
                <svg className="w-4 h-4 text-deep-brown/40" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                </svg>
                <span className="text-deep-brown">{suggestion}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}