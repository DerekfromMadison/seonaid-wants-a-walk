'use client';

import { useState } from 'react';
import { LocationAutocomplete } from './location-autocomplete';

interface WalkPlannerFormProps {
  onPlanWalk: (data: WalkPlanData) => void;
}

export interface WalkPlanData {
  startLocation: string;
  destination: string;
  duration: number;
  useCurrentLocation: boolean;
}

export function WalkPlannerForm({ onPlanWalk }: WalkPlannerFormProps) {
  const [startLocation, setStartLocation] = useState('');
  const [destination, setDestination] = useState('');
  const [duration, setDuration] = useState(30);
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const [isCapturingLocation, setIsCapturingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [startValidated, setStartValidated] = useState(false);
  const [destValidated, setDestValidated] = useState(false);

  const handleCaptureLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      return;
    }

    setIsCapturingLocation(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const locationString = `${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`;
        setStartLocation(locationString);
        setUseCurrentLocation(true);
        setStartValidated(true);
        setIsCapturingLocation(false);
      },
      (error) => {
        setLocationError(
          error.code === error.PERMISSION_DENIED
            ? 'Location permission denied'
            : 'Unable to retrieve your location'
        );
        setIsCapturingLocation(false);
      }
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate that locations are properly selected
    if (!startValidated || !destValidated) {
      setLocationError('Please select valid locations from the suggestions');
      return;
    }

    onPlanWalk({
      startLocation,
      destination,
      duration,
      useCurrentLocation,
    });
  };

  const handleStartLocationChange = (value: string, coordinates?: [number, number]) => {
    setStartLocation(value);
    setStartValidated(!!coordinates);
    setUseCurrentLocation(false);
    setLocationError(null);
  };

  const handleDestinationChange = (value: string, coordinates?: [number, number]) => {
    setDestination(value);
    setDestValidated(!!coordinates);
    setLocationError(null);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl space-y-6">
      <div className="space-y-4">
        {/* Starting Location */}
        <div className="space-y-2">
          <label
            htmlFor="start"
            className="block text-sm font-medium text-slate-200"
          >
            Starting Location
          </label>
          <div className="flex gap-2">
            <div className="flex-1">
              <LocationAutocomplete
                id="start"
                value={startLocation}
                onChange={handleStartLocationChange}
                placeholder="Enter station, postcode, or address"
                className="w-full"
              />
            </div>
            <button
              type="button"
              onClick={handleCaptureLocation}
              disabled={isCapturingLocation}
              className="rounded-lg bg-slate-700 px-4 py-3 font-medium text-slate-200 transition hover:bg-slate-600 disabled:opacity-50"
            >
              {isCapturingLocation ? 'Locating...' : '📍 Use Current'}
            </button>
          </div>
        </div>

        {/* Destination */}
        <div className="space-y-2">
          <label
            htmlFor="destination"
            className="block text-sm font-medium text-slate-200"
          >
            Destination
          </label>
          <LocationAutocomplete
            id="destination"
            value={destination}
            onChange={handleDestinationChange}
            placeholder="Where do you want to go?"
          />
        </div>

        {/* Error Message */}
        {locationError && (
          <p className="text-sm text-red-400">{locationError}</p>
        )}

        {/* Duration */}
        <div className="space-y-2">
          <label
            htmlFor="duration"
            className="block text-sm font-medium text-slate-200"
          >
            Target Duration: {duration} minutes
          </label>
          <input
            type="range"
            id="duration"
            min="15"
            max="120"
            step="15"
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            className="w-full accent-slate-500"
          />
          <div className="flex justify-between text-xs text-slate-400">
            <span>15 min</span>
            <span>30 min</span>
            <span>60 min</span>
            <span>120 min</span>
          </div>
        </div>
      </div>

      <button
        type="submit"
        className="w-full rounded-lg bg-slate-100 px-6 py-4 font-semibold text-slate-950 transition hover:bg-white"
      >
        Plan My Walk
      </button>
    </form>
  );
}
