'use client';

import type { WalkPlanData } from './walk-planner-form';
import RouteMap from './route-map';
import { useRoute } from '@/hooks/use-route';
import { clientEnv } from '@/env';

interface RouteDisplayProps {
  planData: WalkPlanData;
  onReset: () => void;
}

export function RouteDisplay({ planData, onReset }: RouteDisplayProps) {
  const { routeData, loading, error } = useRoute({
    startLocation: planData.startLocation,
    destination: planData.destination,
    accessToken: clientEnv.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN,
  });

  const formatDuration = (seconds: number) => {
    const minutes = Math.round(seconds / 60);
    return `${minutes} min`;
  };

  const formatDistance = (meters: number) => {
    const km = meters / 1000;
    if (km >= 1) {
      return `${km.toFixed(1)} km`;
    }
    return `${Math.round(meters)} m`;
  };

  const getManeuverEmoji = (type: string, modifier?: string) => {
    switch (type) {
      case 'depart':
        return '🚶';
      case 'arrive':
        return '🎯';
      case 'turn':
        if (modifier === 'left') return '↰';
        if (modifier === 'right') return '↱';
        if (modifier === 'slight left') return '↖';
        if (modifier === 'slight right') return '↗';
        if (modifier === 'sharp left') return '⬅';
        if (modifier === 'sharp right') return '➡';
        return '↻';
      case 'continue':
        return '⬆';
      case 'roundabout':
        return '🔄';
      default:
        return '•';
    }
  };
  return (
    <div className="w-full max-w-2xl space-y-6">
      <div className="rounded-2xl border border-slate-700 bg-slate-800/50 p-6 backdrop-blur-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-slate-100">
            Your Walk Plan
          </h2>
          <button
            onClick={onReset}
            className="rounded-lg bg-slate-700 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-600"
          >
            Plan Another
          </button>
        </div>

        <div className="space-y-4">
          {/* Route Summary */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-green-500/20 text-green-400">
                A
              </div>
              <div>
                <p className="text-sm font-medium text-slate-300">
                  Starting Point
                </p>
                <p className="text-base text-slate-100">
                  {planData.useCurrentLocation ? (
                    <span>
                      Current Location{' '}
                      <span className="text-sm text-slate-400">
                        ({planData.startLocation})
                      </span>
                    </span>
                  ) : (
                    planData.startLocation
                  )}
                </p>
              </div>
            </div>

            <div className="ml-4 border-l-2 border-dashed border-slate-600 py-2 pl-4">
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <span>
                  {routeData
                    ? `${formatDuration(routeData.duration)} • ${formatDistance(routeData.distance)}`
                    : `Target duration: ${planData.duration} minutes`}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-blue-400">
                B
              </div>
              <div>
                <p className="text-sm font-medium text-slate-300">
                  Destination
                </p>
                <p className="text-base text-slate-100">
                  {planData.destination}
                </p>
              </div>
            </div>
          </div>

          {/* Interactive Map */}
          <div className="mt-6">
            <h3 className="mb-3 text-sm font-semibold text-slate-200">
              Route Map
            </h3>
            <RouteMap
              startLocation={planData.startLocation}
              destination={planData.destination}
              className="h-96"
            />
          </div>

          {/* Route Details */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-slate-200">
              Walking Route
            </h3>

            {loading && (
              <div className="rounded-lg border border-slate-700 bg-slate-900/30 p-8 text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-slate-600 border-t-slate-300"></div>
                <p className="mt-3 text-sm text-slate-400">
                  Calculating route...
                </p>
              </div>
            )}

            {error && (
              <div className="rounded-lg border border-red-900/50 bg-red-950/20 p-4">
                <p className="text-sm text-red-400">
                  Error loading route: {error}
                </p>
              </div>
            )}

            {routeData && !loading && (
              <>
                <div className="rounded-lg border border-slate-700 bg-slate-900/30 p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <p className="text-lg font-semibold text-slate-200">
                        {formatDuration(routeData.duration)}
                      </p>
                      <p className="text-sm text-slate-400">
                        {formatDistance(routeData.distance)}
                      </p>
                    </div>
                    <span className="text-3xl">🚶</span>
                  </div>

                  <div className="max-h-64 space-y-2 overflow-y-auto">
                    {routeData.steps.map((step, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 border-l-2 border-slate-700 pl-3 py-1"
                      >
                        <span className="text-lg leading-none">
                          {getManeuverEmoji(
                            step.maneuver?.type || '',
                            step.maneuver?.modifier
                          )}
                        </span>
                        <div className="flex-1">
                          <p className="text-sm text-slate-200">
                            {step.instruction}
                          </p>
                          {step.distance > 0 && (
                            <p className="text-xs text-slate-400">
                              {formatDistance(step.distance)}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-lg bg-slate-900/50 p-3">
                  <p className="text-xs text-slate-400">
                    💡 Route calculated using Mapbox Directions API. TfL
                    integration for Tube segments coming soon.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
