export type TransportMode = 'Road' | 'Rail' | 'Sea' | 'Air';

export interface RouteAnalysisResult {
  origin: string;
  destination: string;
  originCoords: [number, number]; // [lat, lng]
  destinationCoords: [number, number]; // [lat, lng]
  transport_mode: TransportMode;
  distance_km: number;
  estimated_travel_time_hours: number;
  route_coordinates: Array<[number, number]>; // Array of [lat, lng] for Leaflet
  ml_payload: {
    origin: string;
    destination: string;
    transport_mode: string;
    distance_km: number;
    estimated_travel_time_hours: number;
    route_coordinates: Array<[number, number]>;
  };
}

// Dictionary of pre-seeded Indian logistics hubs for instant fallback & high accuracy
const INDIAN_CITIES_COORDS: Record<string, [number, number]> = {
  mumbai: [19.0760, 72.8777],
  delhi: [28.6139, 77.2090],
  newdelhi: [28.6139, 77.2090],
  bengaluru: [12.9716, 77.5946],
  bangalore: [12.9716, 77.5946],
  chennai: [13.0827, 80.2707],
  hyderabad: [17.3850, 78.4867],
  kolkata: [22.5726, 88.3639],
  pune: [18.5204, 73.8567],
  ahmedabad: [23.0225, 72.5714],
  surat: [21.1702, 72.8311],
  jaipur: [26.9124, 75.7873],
  visakhapatnam: [17.6868, 83.2185],
  vizag: [17.6868, 83.2185],
  kochi: [9.9312, 76.2673],
  cochin: [9.9312, 76.2673],
  coimbatore: [11.0168, 76.9558],
  nagpur: [21.1458, 79.0882],
  lucknow: [26.8467, 80.9462],
  indore: [22.7196, 75.8577],
  patna: [25.5941, 85.1376],
  bhopal: [23.2599, 77.4126],
  ludhiana: [30.9010, 75.8573],
  agra: [27.1767, 78.0081],
  nashik: [19.9975, 73.7898],
  vadodara: [22.3072, 73.1812],
  rajkot: [22.3039, 70.8022],
  kanpur: [26.4499, 80.3319],
  varanasi: [25.3176, 82.9739],
  mundra: [22.8396, 69.7247],
  jnpt: [18.9499, 72.9525],
  nhavasheva: [18.9499, 72.9525],
  haldia: [22.0667, 88.0667],
  tuticorin: [8.7642, 78.1348],
  thoothukudi: [8.7642, 78.1348]
};

// Haversine formula to compute great-circle distance between two points on Earth (in km)
export function calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Generate smooth intermediate waypoints between two coordinates
function generateIntermediateWaypoints(
  start: [number, number],
  end: [number, number],
  steps: number = 20,
  curvature: number = 0
): Array<[number, number]> {
  const waypoints: Array<[number, number]> = [];
  const [lat1, lon1] = start;
  const [lat2, lon2] = end;

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    // Linear interpolation
    let lat = lat1 + t * (lat2 - lat1);
    let lon = lon1 + t * (lon2 - lon1);

    // Apply optional curvature arc for Air/Sea visualization
    if (curvature !== 0) {
      const offset = Math.sin(t * Math.PI) * curvature;
      lat += offset;
      lon += offset * 0.5;
    }

    waypoints.push([parseFloat(lat.toFixed(6)), parseFloat(lon.toFixed(6))]);
  }

  return waypoints;
}

/**
 * Reverse geocodes [latitude, longitude] to a human-readable city/location name
 */
export async function reverseGeocode(lat: number, lon: number): Promise<string> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`,
      {
        headers: {
          'User-Agent': 'VyuhaSupplyChainPlatform/1.0',
        },
      }
    );

    if (response.ok) {
      const data = await response.json();
      const addr = data.address;
      if (addr) {
        const place =
          addr.city ||
          addr.town ||
          addr.village ||
          addr.county ||
          addr.state_district ||
          addr.suburb;
        const state = addr.state || 'India';
        if (place) {
          return `${place}, ${state}`;
        }
      }
      if (data.display_name) {
        return data.display_name.split(',').slice(0, 2).join(',').trim();
      }
    }
  } catch (error) {
    console.warn('Reverse geocoding error:', error);
  }

  return `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
}

/**
 * Geocodes a location query string to [latitude, longitude]
 */
export async function geocodeLocation(query: string): Promise<[number, number]> {
  // Check if query is in lat, lon format e.g. "17.385, 78.4867"
  const coordParts = query.split(',').map((p) => p.trim());
  if (coordParts.length === 2) {
    const lat = parseFloat(coordParts[0]);
    const lon = parseFloat(coordParts[1]);
    if (!isNaN(lat) && !isNaN(lon) && Math.abs(lat) <= 90 && Math.abs(lon) <= 180) {
      return [lat, lon];
    }
  }

  const normalized = query.trim().toLowerCase().replace(/[^a-z0-9]/g, '');

  if (INDIAN_CITIES_COORDS[normalized]) {
    return INDIAN_CITIES_COORDS[normalized];
  }

  // In-memory cache for Nominatim responses
  const _geocodeCache: Record<string, [number, number]> = (geocodeLocation as any)._cache ??
    ((geocodeLocation as any)._cache = {});
  if (_geocodeCache[normalized]) return _geocodeCache[normalized];

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=in&limit=1`,
      {
        headers: {
          'User-Agent': 'VyuhaSupplyChainPlatform/1.0',
        },
        signal: AbortSignal.timeout(2000),
      }
    );

    if (response.ok) {
      const data = await response.json();
      if (data && data.length > 0) {
        const coords: [number, number] = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
        _geocodeCache[normalized] = coords;
        return coords;
      }
    }
  } catch (error) {
    console.warn('Nominatim geocoding API error, checking fuzzy fallback:', error);
  }

  // Check fuzzy fallback in city dictionary
  const keyMatch = Object.keys(INDIAN_CITIES_COORDS).find((city) =>
    normalized.includes(city) || city.includes(normalized)
  );

  if (keyMatch) {
    return INDIAN_CITIES_COORDS[keyMatch];
  }

  throw new Error(`Unable to geocode location "${query}". Please check city name.`);
}

/**
 * Analyzes route between origin and destination for a given transportation mode
 */
export async function analyzeRoute(
  originName: string,
  destName: string,
  mode: TransportMode
): Promise<RouteAnalysisResult> {
  const originCoords = await geocodeLocation(originName);
  const destCoords = await geocodeLocation(destName);

  let distanceKm = 0;
  let durationHours = 0;
  let routeCoordinates: Array<[number, number]> = [];

  const directDistance = calculateHaversineDistance(
    originCoords[0],
    originCoords[1],
    destCoords[0],
    destCoords[1]
  );

  if (mode === 'Road') {
    try {
      // Query OSRM API for road routing
      const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${originCoords[1]},${originCoords[0]};${destCoords[1]},${destCoords[0]}?overview=full&geometries=geojson`;
      const response = await fetch(osrmUrl);

      if (response.ok) {
        const data = await response.json();
        if (data.routes && data.routes.length > 0) {
          const route = data.routes[0];
          distanceKm = Math.round(route.distance / 1000);
          durationHours = parseFloat((route.duration / 3600).toFixed(1));

          // GeoJSON returns [lon, lat], leaflet expects [lat, lon]
          routeCoordinates = route.geometry.coordinates.map(
            (coord: [number, number]) => [coord[1], coord[0]] as [number, number]
          );
        }
      }
    } catch (osrmError) {
      console.warn('OSRM Routing API failed, falling back to simulated road network:', osrmError);
    }

    // Fallback if OSRM is unreachable
    if (routeCoordinates.length === 0) {
      distanceKm = Math.round(directDistance * 1.22); // Typical Indian road distance factor
      durationHours = parseFloat((distanceKm / 55).toFixed(1)); // Avg speed ~55 km/h
      routeCoordinates = generateIntermediateWaypoints(originCoords, destCoords, 25, 0.2);
    }
  } else if (mode === 'Rail') {
    distanceKm = Math.round(directDistance * 1.25); // Rail track alignment multiplier
    durationHours = parseFloat((distanceKm / 50 + 1.5).toFixed(1)); // Freight train average speed ~50 km/h
    routeCoordinates = generateIntermediateWaypoints(originCoords, destCoords, 30, 0.1);
  } else if (mode === 'Sea') {
    distanceKm = Math.round(directDistance * 1.45); // Maritime coastal path factor
    durationHours = parseFloat((distanceKm / 25 + 4).toFixed(1)); // Cargo vessel speed ~25 km/h
    routeCoordinates = generateIntermediateWaypoints(originCoords, destCoords, 35, 0.8);
  } else if (mode === 'Air') {
    distanceKm = Math.round(directDistance * 1.05); // Direct air vector + flight pattern
    durationHours = parseFloat((distanceKm / 650 + 2.0).toFixed(1)); // Air freight speed ~650 km/h + handling
    routeCoordinates = generateIntermediateWaypoints(originCoords, destCoords, 40, 1.2);
  }

  const result: RouteAnalysisResult = {
    origin: originName,
    destination: destName,
    originCoords,
    destinationCoords: destCoords,
    transport_mode: mode,
    distance_km: distanceKm,
    estimated_travel_time_hours: durationHours,
    route_coordinates: routeCoordinates,
    ml_payload: {
      origin: originName,
      destination: destName,
      transport_mode: mode,
      distance_km: distanceKm,
      estimated_travel_time_hours: durationHours,
      route_coordinates: routeCoordinates,
    },
  };

  return result;
}
