import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

interface RouteMapProps {
  originName: string;
  destName: string;
  originCoords: [number, number];
  destCoords: [number, number];
  routeCoordinates: Array<[number, number]>;
  transportMode: 'Road' | 'Rail' | 'Sea' | 'Air';
  onMapClick?: (lat: number, lon: number) => void;
  clickSelectionTarget?: 'origin' | 'destination' | null;
}

export const RouteMap: React.FC<RouteMapProps> = ({
  originName,
  destName,
  originCoords,
  destCoords,
  routeCoordinates,
  transportMode,
  onMapClick,
  clickSelectionTarget,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Clean up existing map instance if any
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Default center on India
    const map = L.map(mapContainerRef.current, {
      center: [20.5937, 78.9629],
      zoom: 5,
      zoomControl: true,
    });

    mapInstanceRef.current = map;

    // Add OpenStreetMap Light Tile Layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    // Register Click Event on Map
    map.on('click', (e: L.LeafletMouseEvent) => {
      if (onMapClick) {
        onMapClick(parseFloat(e.latlng.lat.toFixed(6)), parseFloat(e.latlng.lng.toFixed(6)));
      }
    });

    // Custom Start Pin Icon
    const originIcon = L.divIcon({
      className: 'custom-leaflet-marker',
      html: `
        <div class="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-600 text-white font-bold font-mono text-xs shadow-lg border-2 border-white ring-2 ring-emerald-300">
          A
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    // Custom Destination Pin Icon
    const destIcon = L.divIcon({
      className: 'custom-leaflet-marker',
      html: `
        <div class="flex items-center justify-center w-8 h-8 rounded-full bg-sky-600 text-white font-bold font-mono text-xs shadow-lg border-2 border-white ring-2 ring-sky-300">
          B
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    // Add Origin & Destination Markers
    const originMarker = L.marker(originCoords, { icon: originIcon }).addTo(map);
    originMarker.bindPopup(`
      <div class="font-sans text-xs p-1">
        <strong class="text-emerald-700 block uppercase font-mono">Origin (Start)</strong>
        <span class="text-slate-900 font-bold">${originName}</span>
      </div>
    `);

    const destMarker = L.marker(destCoords, { icon: destIcon }).addTo(map);
    destMarker.bindPopup(`
      <div class="font-sans text-xs p-1">
        <strong class="text-sky-700 block uppercase font-mono">Destination (End)</strong>
        <span class="text-slate-900 font-bold">${destName}</span>
      </div>
    `);

    // Polyline styling according to transport mode
    let dashArray: string | undefined = undefined;
    let color = '#0284c7'; // Sky 600

    if (transportMode === 'Air') {
      dashArray = '8, 8';
      color = '#38bdf8'; // Sky 400
    } else if (transportMode === 'Rail') {
      dashArray = '12, 6';
      color = '#0284c7'; // Sky 600
    } else if (transportMode === 'Sea') {
      dashArray = '6, 6';
      color = '#0d9488'; // Teal 600
    }

    // Draw Route Polyline
    const polyline = L.polyline(routeCoordinates, {
      color,
      weight: 5,
      opacity: 0.85,
      dashArray,
    }).addTo(map);

    // Fit map bounds to show full route
    if (routeCoordinates.length > 0) {
      map.fitBounds(polyline.getBounds(), { padding: [50, 50] });
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [originName, destName, originCoords, destCoords, routeCoordinates, transportMode, onMapClick]);

  return (
    <div className="relative w-full h-[480px] rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100 group">
      <div
        ref={mapContainerRef}
        className={`w-full h-full z-10 ${clickSelectionTarget ? 'cursor-crosshair' : 'cursor-grab'}`}
      />

      {/* Map Click Instructions Banner */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-slate-900/90 backdrop-blur-md text-white px-4 py-2 rounded-full border border-slate-700 shadow-lg text-xs font-mono flex items-center gap-2 animate-in fade-in">
        <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
        {clickSelectionTarget === 'origin' ? (
          <span className="text-emerald-300 font-bold">CLICK MAP TO SET ORIGIN (START PIN A)</span>
        ) : clickSelectionTarget === 'destination' ? (
          <span className="text-sky-300 font-bold">CLICK MAP TO SET DESTINATION (END PIN B)</span>
        ) : (
          <span>Click anywhere on the map to set a location pin</span>
        )}
      </div>

      {/* Map Legend Overlay */}
      <div className="absolute bottom-4 left-4 z-20 bg-white/90 backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-slate-200 shadow-md font-mono text-xs flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-600 border border-white" />
          <span className="text-slate-700 font-semibold">{originName} (Start A)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-sky-600 border border-white" />
          <span className="text-slate-700 font-semibold">{destName} (End B)</span>
        </div>
        <div className="flex items-center gap-2 border-l border-slate-200 pl-3">
          <span className="text-slate-500 font-bold uppercase">{transportMode} ROUTE</span>
        </div>
      </div>
    </div>
  );
};
