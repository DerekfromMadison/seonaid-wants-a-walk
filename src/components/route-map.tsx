'use client';

import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { clientEnv } from '@/env';

interface RouteMapProps {
  startLocation: string;
  destination: string;
  className?: string;
}

export default function RouteMap({
  startLocation,
  destination,
  className = '',
}: RouteMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  // Check if Mapbox token is available
  const hasMapboxToken = clientEnv.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

  useEffect(() => {
    if (!mapContainer.current || map.current || !hasMapboxToken) return;

    // Initialize Mapbox
    mapboxgl.accessToken = clientEnv.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN!;

    // Create map centered on London
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: `mapbox://styles/mapbox/${clientEnv.NEXT_PUBLIC_MAPBOX_STYLE_ID}`,
      center: [-0.1276, 51.5074], // London coordinates
      zoom: 12,
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Geocode locations and add markers
    const geocodeAndAddMarkers = async () => {
      if (!map.current) return;

      try {
        // Geocode start location
        const startCoords = await geocodeLocation(startLocation);
        if (startCoords) {
          new mapboxgl.Marker({ color: '#22c55e' })
            .setLngLat(startCoords)
            .setPopup(
              new mapboxgl.Popup({ offset: 25 }).setHTML(
                `<strong>Start:</strong> ${startLocation}`
              )
            )
            .addTo(map.current);
        }

        // Geocode destination
        const destCoords = await geocodeLocation(destination);
        if (destCoords) {
          new mapboxgl.Marker({ color: '#ef4444' })
            .setLngLat(destCoords)
            .setPopup(
              new mapboxgl.Popup({ offset: 25 }).setHTML(
                `<strong>Destination:</strong> ${destination}`
              )
            )
            .addTo(map.current);
        }

        // If both locations are geocoded, fit bounds to show both
        if (startCoords && destCoords && map.current) {
          const bounds = new mapboxgl.LngLatBounds();
          bounds.extend(startCoords);
          bounds.extend(destCoords);
          map.current.fitBounds(bounds, { padding: 100 });

          // Wait for the map to load before drawing the route
          map.current.on('load', () => {
            if (map.current && startCoords && destCoords) {
              drawRoute(startCoords, destCoords);
            }
          });

          // If map is already loaded, draw immediately
          if (map.current.isStyleLoaded()) {
            drawRoute(startCoords, destCoords);
          }
        }
      } catch (error) {
        console.error('Error geocoding locations:', error);
      }
    };

    geocodeAndAddMarkers();

    // Cleanup
    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, [startLocation, destination, hasMapboxToken]);

  // Geocode a location string to coordinates
  const geocodeLocation = async (
    location: string
  ): Promise<[number, number] | null> => {
    try {
      // Check if location is already coordinates (lat, lng format)
      const coordMatch = location.match(/^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/);
      if (coordMatch) {
        const lat = parseFloat(coordMatch[1]);
        const lng = parseFloat(coordMatch[2]);
        return [lng, lat]; // Mapbox uses lng, lat order
      }

      // Use Mapbox Geocoding API
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          location
        )}.json?access_token=${mapboxgl.accessToken}&proximity=-0.1276,51.5074&limit=1`
      );

      if (!response.ok) {
        throw new Error('Geocoding request failed');
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
  };

  // Draw a route line between two points
  const drawRoute = (start: [number, number], end: [number, number]) => {
    if (!map.current) return;

    // Create a simple straight line route (in production, you'd use Mapbox Directions API)
    const routeGeoJSON: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: [start, end],
          },
        },
      ],
    };

    // Check if the source already exists
    if (map.current.getSource('route')) {
      (map.current.getSource('route') as mapboxgl.GeoJSONSource).setData(
        routeGeoJSON
      );
    } else {
      // Add route source
      map.current.addSource('route', {
        type: 'geojson',
        data: routeGeoJSON,
      });

      // Add route layer
      map.current.addLayer({
        id: 'route',
        type: 'line',
        source: 'route',
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': '#3b82f6',
          'line-width': 5,
          'line-opacity': 0.75,
        },
      });
    }
  };

  // Show message if no Mapbox token is configured
  if (!hasMapboxToken) {
    return (
      <div className={className}>
        <div className="flex h-full w-full items-center justify-center rounded-lg border border-slate-700 bg-slate-900/50 p-8">
          <div className="max-w-md text-center">
            <div className="mb-3 text-4xl">🗺️</div>
            <h3 className="mb-2 text-lg font-semibold text-slate-200">
              Map Configuration Required
            </h3>
            <p className="text-sm text-slate-400">
              To display the interactive map, you need to add a Mapbox access
              token to your environment variables. Get a free token at{' '}
              <a
                href="https://account.mapbox.com/access-tokens/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:underline"
              >
                account.mapbox.com
              </a>
            </p>
            <p className="mt-3 text-xs text-slate-500">
              Set NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN in your environment
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div ref={mapContainer} className="h-full w-full rounded-lg" />
    </div>
  );
}
