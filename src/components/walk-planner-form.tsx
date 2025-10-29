'use client';

import { useState } from 'react';

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

  const handleCaptureLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      return;
    }

    setIsCapturingLocation(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setStartLocation(
          `${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`
        );
        setUseCurrentLocation(true);
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
    onPlanWalk({
      startLocation,
      destination,
      duration,
      useCurrentLocation,
    });
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
            <input
              type="text"
              id="start"
              value={startLocation}
              onChange={(e) => {
                setStartLocation(e.target.value);
                setUseCurrentLocation(false);
              }}
              placeholder="Enter station or postcode"
              className="flex-1 rounded-lg border border-slate-600 bg-slate-800/50 px-4 py-3 text-slate-100 placeholder-slate-500 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400/50"
              required
            />
            <button
              type="button"
              onClick={handleCaptureLocation}
              disabled={isCapturingLocation}
              className="rounded-lg bg-slate-700 px-4 py-3 font-medium text-slate-200 transition hover:bg-slate-600 disabled:opacity-50"
            >
              {isCapturingLocation ? 'Locating...' : '📍 Use Current'}
            </button>
          </div>
          {locationError && (
            <p className="text-sm text-red-400">{locationError}</p>
          )}
        </div>

        {/* Destination */}
        <div className="space-y-2">
          <label
            htmlFor="destination"
            className="block text-sm font-medium text-slate-200"
          >
            Destination
          </label>
          <input
            type="text"
            id="destination"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="Where do you want to go?"
            className="w-full rounded-lg border border-slate-600 bg-slate-800/50 px-4 py-3 text-slate-100 placeholder-slate-500 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400/50"
            required
          />
        </div>

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
