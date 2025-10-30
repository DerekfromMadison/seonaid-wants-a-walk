import { useState, useEffect } from 'react';

export interface RouteStep {
  instruction: string;
  distance: number;
  duration: number;
  maneuver?: {
    type: string;
    modifier?: string;
  };
}

export interface RouteData {
  duration: number; // in seconds
  distance: number; // in meters
  steps: RouteStep[];
}

interface UseRouteParams {
  startLocation: string;
  destination: string;
  accessToken: string | undefined;
}

export function useRoute({ startLocation, destination, accessToken }: UseRouteParams) {
  const [routeData, setRouteData] = useState<RouteData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!accessToken || !startLocation || !destination) {
      return;
    }

    const fetchRoute = async () => {
      setLoading(true);
      setError(null);

      try {
        // Geocode locations first
        const startCoords = await geocodeLocation(startLocation, accessToken);
        const destCoords = await geocodeLocation(destination, accessToken);

        if (!startCoords || !destCoords) {
          throw new Error('Could not geocode locations');
        }

        // Fetch walking route
        const response = await fetch(
          `https://api.mapbox.com/directions/v5/mapbox/walking/${startCoords[0]},${startCoords[1]};${destCoords[0]},${destCoords[1]}?geometries=geojson&steps=true&banner_instructions=true&access_token=${accessToken}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch route');
        }

        const data = await response.json();

        if (!data.routes || data.routes.length === 0) {
          throw new Error('No route found');
        }

        const route = data.routes[0];
        const leg = route.legs[0];

        interface MapboxStep {
          distance: number;
          duration: number;
          maneuver?: {
            instruction?: string;
            type: string;
            modifier?: string;
          };
        }

        const steps: RouteStep[] = leg.steps.map((step: MapboxStep) => ({
          instruction: step.maneuver?.instruction || 'Continue',
          distance: step.distance,
          duration: step.duration,
          maneuver: step.maneuver
            ? {
                type: step.maneuver.type,
                modifier: step.maneuver.modifier,
              }
            : undefined,
        }));

        setRouteData({
          duration: route.duration,
          distance: route.distance,
          steps,
        });
      } catch (err) {
        console.error('Error fetching route:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch route');
      } finally {
        setLoading(false);
      }
    };

    fetchRoute();
  }, [startLocation, destination, accessToken]);

  return { routeData, loading, error };
}

async function geocodeLocation(
  location: string,
  accessToken: string
): Promise<[number, number] | null> {
  try {
    // Check if location is already coordinates
    const coordMatch = location.match(/^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/);
    if (coordMatch) {
      const lat = parseFloat(coordMatch[1]);
      const lng = parseFloat(coordMatch[2]);
      return [lng, lat];
    }

    // Geocode using Mapbox
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
        location
      )}.json?access_token=${accessToken}&proximity=-0.1276,51.5074&limit=1`
    );

    if (!response.ok) {
      throw new Error('Geocoding failed');
    }

    const data = await response.json();

    if (data.features && data.features.length > 0) {
      return data.features[0].center as [number, number];
    }

    return null;
  } catch (error) {
    console.error(`Error geocoding ${location}:`, error);
    return null;
  }
}
