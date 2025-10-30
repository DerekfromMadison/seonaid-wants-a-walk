'use client';

import { useState, useEffect, useRef } from 'react';
import { clientEnv } from '@/env';

interface LocationSuggestion {
  id: string;
  place_name: string;
  text: string;
  center: [number, number];
}

interface LocationAutocompleteProps {
  value: string;
  onChange: (value: string, coordinates?: [number, number]) => void;
  placeholder?: string;
  id?: string;
  disabled?: boolean;
  className?: string;
}

export function LocationAutocomplete({
  value,
  onChange,
  placeholder = 'Enter location',
  id,
  disabled = false,
  className = '',
}: LocationAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [hasValidSelection, setHasValidSelection] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Check if value is coordinates (from "Use Current" button)
  const isCoordinateValue = (val: string) => {
    return /^-?\d+\.?\d*,\s*-?\d+\.?\d*$/.test(val);
  };

  const fetchSuggestions = async (query: string) => {
    if (!query.trim() || query.length < 3) {
      setSuggestions([]);
      return;
    }

    // Don't fetch if it's coordinates
    if (isCoordinateValue(query)) {
      setSuggestions([]);
      setHasValidSelection(true);
      return;
    }

    const accessToken = clientEnv.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
    if (!accessToken) {
      console.error('Mapbox access token not configured');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          query
        )}.json?access_token=${accessToken}&proximity=-0.1276,51.5074&limit=5&types=place,address,poi`
      );

      if (!response.ok) {
        throw new Error('Geocoding request failed');
      }

      const data = await response.json();
      setSuggestions(data.features || []);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (newValue: string) => {
    onChange(newValue);
    setHasValidSelection(false);
    setSelectedIndex(-1);

    // Clear existing timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Debounce the API call
    debounceTimer.current = setTimeout(() => {
      fetchSuggestions(newValue);
    }, 300);
  };

  const handleSelectSuggestion = (suggestion: LocationSuggestion) => {
    onChange(suggestion.place_name, suggestion.center);
    setHasValidSelection(true);
    setSuggestions([]);
    setShowSuggestions(false);
    setSelectedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSelectSuggestion(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const getValidationColor = () => {
    if (!value) return 'border-slate-600';
    if (isCoordinateValue(value) || hasValidSelection) return 'border-green-600';
    if (value.length >= 3 && !isLoading && suggestions.length === 0) {
      return 'border-red-600';
    }
    return 'border-slate-600';
  };

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          id={id}
          value={value}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) setShowSuggestions(true);
          }}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full rounded-lg border bg-slate-800/50 px-4 py-3 pr-10 text-slate-100 placeholder-slate-500 transition-colors focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400/50 ${getValidationColor()} ${className}`}
        />

        {/* Loading/Validation Indicator */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {isLoading ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-600 border-t-slate-300"></div>
          ) : value && hasValidSelection ? (
            <span className="text-green-400">✓</span>
          ) : value && value.length >= 3 && !isLoading && suggestions.length === 0 && !isCoordinateValue(value) ? (
            <span className="text-red-400" title="No locations found">⚠</span>
          ) : null}
        </div>
      </div>

      {/* Validation Message */}
      {value && value.length >= 3 && !hasValidSelection && !isLoading && suggestions.length === 0 && !isCoordinateValue(value) && (
        <p className="mt-1 text-xs text-red-400">
          No locations found. Try a different search term.
        </p>
      )}

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 mt-2 w-full rounded-lg border border-slate-600 bg-slate-800 shadow-xl">
          <ul className="max-h-60 overflow-y-auto">
            {suggestions.map((suggestion, index) => (
              <li key={suggestion.id}>
                <button
                  type="button"
                  onClick={() => handleSelectSuggestion(suggestion)}
                  className={`w-full px-4 py-3 text-left transition-colors ${
                    index === selectedIndex
                      ? 'bg-slate-700 text-slate-100'
                      : 'text-slate-200 hover:bg-slate-700/50'
                  } ${index === 0 ? 'rounded-t-lg' : ''} ${
                    index === suggestions.length - 1 ? 'rounded-b-lg' : ''
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span className="mt-0.5 text-slate-400">📍</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{suggestion.text}</p>
                      <p className="text-xs text-slate-400">
                        {suggestion.place_name}
                      </p>
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Helper Text */}
      {!value && (
        <p className="mt-1 text-xs text-slate-400">
          Start typing to see suggestions
        </p>
      )}
    </div>
  );
}
