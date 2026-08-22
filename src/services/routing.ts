export type TransportMode = 'Road' | 'Rail' | 'Sea' | 'Air';

export interface MaritimePortInfo {
  originPortName: string;
  originPortCoords: [number, number];
  destPortName: string;
  destPortCoords: [number, number];
}

export interface RouteAnalysisResult {
  origin: string;
  destination: string;
  originCoords: [number, number]; // [lat, lng]
  destinationCoords: [number, number]; // [lat, lng]
  transport_mode: TransportMode;
  distance_km: number;
  estimated_travel_time_hours: number;
  route_coordinates: Array<[number, number]>; // Array of [lat, lng] for Leaflet
  maritime_info?: MaritimePortInfo;
  ml_payload: {
    origin: string;
    destination: string;
    transport_mode: string;
    distance_km: number;
    estimated_travel_time_hours: number;
    route_coordinates: Array<[number, number]>;
    maritime_info?: MaritimePortInfo;
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

interface SeaPort {
  name: string;
  portCoords: [number, number];
  seaAccess: [number, number];
}

const SEA_PORTS: SeaPort[] = [
  { name: 'Mundra Port', portCoords: [22.8396, 69.7247], seaAccess: [22.40, 69.50] },
  { name: 'Kandla Port', portCoords: [23.0100, 70.2200], seaAccess: [22.60, 69.90] },
  { name: 'Hazira / Surat Port', portCoords: [21.1000, 72.6300], seaAccess: [20.80, 72.40] },
  { name: 'JNPT / Mumbai Port', portCoords: [18.9499, 72.9525], seaAccess: [18.85, 72.55] },
  { name: 'Marmagao Port (Goa)', portCoords: [15.4089, 73.8078], seaAccess: [15.35, 73.50] },
  { name: 'New Mangalore Port', portCoords: [12.9224, 74.8118], seaAccess: [12.85, 74.50] },
  { name: 'Cochin / Kochi Port', portCoords: [9.9312, 76.2673], seaAccess: [9.85, 75.85] },
  { name: 'Tuticorin / Thoothukudi Port', portCoords: [8.7642, 78.1348], seaAccess: [8.65, 78.35] },
  { name: 'Chennai Port', portCoords: [13.0827, 80.2707], seaAccess: [13.08, 80.45] },
  { name: 'Krishnapatnam Port', portCoords: [14.2500, 80.1333], seaAccess: [14.25, 80.35] },
  { name: 'Visakhapatnam Port', portCoords: [17.6868, 83.2185], seaAccess: [17.60, 83.45] },
  { name: 'Paradeep Port', portCoords: [20.2628, 86.6772], seaAccess: [20.15, 86.90] },
  { name: 'Haldia / Kolkata Port', portCoords: [22.0667, 88.0667], seaAccess: [21.10, 88.00] },
];

const PORT_NAVIGATION_CHANNELS: Record<string, Array<[number, number]>> = {
  'Haldia / Kolkata Port': [
    [21.1000, 88.0000], // Deep sea anchorage south of Sagar Island
    [21.4500, 87.9000], // SW Sagar fairway channel in water west of Sagar Island
    [21.7200, 87.9200], // Hooghly river mouth channel (west of Sagar Island)
    [21.9000, 88.0000], // Jellingham river channel
    [22.0200, 88.0500], // Haldia turning basin
    [22.0667, 88.0667], // Haldia Docks
  ],
  'Paradeep Port': [
    [20.1500, 86.9000],
    [20.2400, 86.7800],
    [20.2628, 86.6772],
  ],
  'Visakhapatnam Port': [
    [17.6000, 83.4500],
    [17.6700, 83.3200],
    [17.6868, 83.2185],
  ],
  'Krishnapatnam Port': [
    [14.2500, 80.3500],
    [14.2500, 80.2000],
    [14.2500, 80.1333],
  ],
  'Chennai Port': [
    [13.0800, 80.4500],
    [13.0800, 80.3200],
    [13.0827, 80.2707],
  ],
  'Tuticorin / Thoothukudi Port': [
    [8.6500, 78.3500],
    [8.7400, 78.2000],
    [8.7642, 78.1348],
  ],
  'Cochin / Kochi Port': [
    [9.8500, 75.8500],
    [9.9600, 76.2000],
    [9.9312, 76.2673],
  ],
  'New Mangalore Port': [
    [12.8500, 74.5000],
    [12.9200, 74.7500],
    [12.9224, 74.8118],
  ],
  'Marmagao Port (Goa)': [
    [15.3500, 73.5000],
    [15.4000, 73.7500],
    [15.4089, 73.8078],
  ],
  'JNPT / Mumbai Port': [
    [18.8500, 72.5500],
    [18.8800, 72.7800],
    [18.9499, 72.9525],
  ],
  'Hazira / Surat Port': [
    [20.8000, 72.4000],
    [21.0500, 72.5500],
    [21.1000, 72.6300],
  ],
  'Kandla Port': [
    [22.6000, 69.9000],
    [22.9000, 70.1000],
    [23.0100, 70.2200],
  ],
  'Mundra Port': [
    [22.4000, 69.5000],
    [22.7000, 69.6500],
    [22.8396, 69.7247],
  ],
};

function getPortNavigationWaypoints(portName: string, reverse: boolean): Array<[number, number]> {
  const channel = PORT_NAVIGATION_CHANNELS[portName];
  if (!channel) return [];

  const nodes = reverse ? [...channel].reverse() : [...channel];
  const waypoints: Array<[number, number]> = [];

  for (let i = 0; i < nodes.length - 1; i++) {
    const seg = generateIntermediateWaypoints(nodes[i], nodes[i + 1], 6, 0);
    waypoints.push(...seg.slice(i === 0 ? 0 : 1));
  }

  return waypoints;
}

const COASTAL_OCEAN_HIGHWAY: Array<[number, number]> = [
  [22.40, 69.50], // 0: Mundra Sea
  [22.60, 69.90], // 1: Kandla Sea
  [20.60, 71.40], // 2: Kathiawar Coast Sea
  [20.80, 72.40], // 3: Hazira/Surat Sea
  [18.85, 72.55], // 4: JNPT / Mumbai Sea
  [15.35, 73.50], // 5: Goa Sea
  [12.85, 74.50], // 6: Mangalore Sea
  [9.85, 75.85],  // 7: Kochi Sea
  [7.60, 77.20],  // 8: South-West Arabian Sea (Off Kanyakumari)
  [7.40, 78.40],  // 9: South Ocean Water (Gulf of Mannar)
  [8.65, 78.35],  // 10: Tuticorin Sea
  [10.80, 80.10], // 11: Coromandel Coast Deep Sea
  [13.08, 80.45], // 12: Chennai Sea
  [14.25, 80.35], // 13: Krishnapatnam Sea
  [17.60, 83.45], // 14: Visakhapatnam Sea
  [20.15, 86.90], // 15: Paradeep Sea
  [21.10, 88.00], // 16: Haldia / Kolkata Sea Approach (Deep sea south of Sagar Island)
];

function findNearestSeaPort(coords: [number, number]): SeaPort {
  let nearestPort = SEA_PORTS[0];
  let minDistance = Infinity;

  for (const port of SEA_PORTS) {
    const dist = calculateHaversineDistance(
      coords[0],
      coords[1],
      port.portCoords[0],
      port.portCoords[1]
    );
    if (dist < minDistance) {
      minDistance = dist;
      nearestPort = port;
    }
  }

  return nearestPort;
}

function generateMaritimeSeaRoute(
  originCoords: [number, number],
  destCoords: [number, number]
): {
  routeCoords: Array<[number, number]>;
  distanceKm: number;
  durationHours: number;
  maritimeInfo: MaritimePortInfo;
} {
  const originPort = findNearestSeaPort(originCoords);
  let destPort = findNearestSeaPort(destCoords);

  if (originPort.name === destPort.name) {
    const sorted = [...SEA_PORTS].sort((a, b) => {
      const d1 = calculateHaversineDistance(destCoords[0], destCoords[1], a.portCoords[0], a.portCoords[1]);
      const d2 = calculateHaversineDistance(destCoords[0], destCoords[1], b.portCoords[0], b.portCoords[1]);
      return d1 - d2;
    });
    if (sorted.length > 1) destPort = sorted[1];
  }

  // 1. Inland origin leg: originCoords -> originPort.portCoords
  const landLegOrigin = generateIntermediateWaypoints(originCoords, originPort.portCoords, 12, 0);

  // 2. Port egress through navigation channel: originPort.portCoords -> originPort.seaAccess
  const portEgress = getPortNavigationWaypoints(originPort.name, true);
  const fallbackEgress = portEgress.length > 0 ? portEgress : generateIntermediateWaypoints(originPort.portCoords, originPort.seaAccess, 5, 0);

  // 3. Maritime Ocean Highway traversal
  let origIdx = 0;
  let minOrigDist = Infinity;
  COASTAL_OCEAN_HIGHWAY.forEach((hw, i) => {
    const d = calculateHaversineDistance(originPort.seaAccess[0], originPort.seaAccess[1], hw[0], hw[1]);
    if (d < minOrigDist) {
      minOrigDist = d;
      origIdx = i;
    }
  });

  let destIdx = 0;
  let minDestDist = Infinity;
  COASTAL_OCEAN_HIGHWAY.forEach((hw, i) => {
    const d = calculateHaversineDistance(destPort.seaAccess[0], destPort.seaAccess[1], hw[0], hw[1]);
    if (d < minDestDist) {
      minDestDist = d;
      destIdx = i;
    }
  });

  const seaHighwayNodes: Array<[number, number]> = [];
  seaHighwayNodes.push(originPort.seaAccess);

  if (origIdx <= destIdx) {
    for (let i = origIdx; i <= destIdx; i++) {
      seaHighwayNodes.push(COASTAL_OCEAN_HIGHWAY[i]);
    }
  } else {
    for (let i = origIdx; i >= destIdx; i--) {
      seaHighwayNodes.push(COASTAL_OCEAN_HIGHWAY[i]);
    }
  }

  seaHighwayNodes.push(destPort.seaAccess);

  // Interpolate ocean waypoints
  const seaWaypoints: Array<[number, number]> = [];
  for (let i = 0; i < seaHighwayNodes.length - 1; i++) {
    const segment = generateIntermediateWaypoints(seaHighwayNodes[i], seaHighwayNodes[i + 1], 10, 0.02);
    seaWaypoints.push(...segment.slice(i === 0 ? 0 : 1));
  }

  // 4. Port ingress through navigation channel: destPort.seaAccess -> destPort.portCoords
  const portIngress = getPortNavigationWaypoints(destPort.name, false);
  const fallbackIngress = portIngress.length > 0 ? portIngress : generateIntermediateWaypoints(destPort.seaAccess, destPort.portCoords, 5, 0);

  // 5. Inland destination leg: destPort.portCoords -> destCoords
  const landLegDest = generateIntermediateWaypoints(destPort.portCoords, destCoords, 12, 0);

  // Assemble full route
  const fullRoute: Array<[number, number]> = [
    ...landLegOrigin,
    ...fallbackEgress.slice(1),
    ...seaWaypoints.slice(1),
    ...fallbackIngress.slice(1),
    ...landLegDest.slice(1),
  ];

  // Distances
  const originLandDist = calculateHaversineDistance(originCoords[0], originCoords[1], originPort.portCoords[0], originPort.portCoords[1]);
  const destLandDist = calculateHaversineDistance(destCoords[0], destCoords[1], destPort.portCoords[0], destPort.portCoords[1]);

  let seaDist = 0;
  for (let i = 0; i < seaHighwayNodes.length - 1; i++) {
    seaDist += calculateHaversineDistance(seaHighwayNodes[i][0], seaHighwayNodes[i][1], seaHighwayNodes[i + 1][0], seaHighwayNodes[i + 1][1]);
  }

  const totalDist = Math.round((originLandDist * 1.15) + (seaDist * 1.1) + (destLandDist * 1.15));
  const travelHours = parseFloat(((originLandDist / 55) + (seaDist / 28) + (destLandDist / 55) + 10).toFixed(1));

  return {
    routeCoords: fullRoute,
    distanceKm: Math.max(totalDist, 180),
    durationHours: Math.max(travelHours, 10),
    maritimeInfo: {
      originPortName: originPort.name,
      originPortCoords: originPort.portCoords,
      destPortName: destPort.name,
      destPortCoords: destPort.portCoords,
    },
  };
}

const RAIL_JUNCTIONS: Array<[number, number]> = [
  [28.6139, 77.2090], // Delhi
  [26.4499, 80.3319], // Kanpur
  [25.2818, 83.1147], // Pt. Deen Dayal Upadhyaya
  [23.7957, 86.4304], // Dhanbad
  [22.5726, 88.3639], // Kolkata
  [21.1458, 79.0882], // Nagpur
  [23.2599, 77.4126], // Bhopal
  [22.6120, 77.7663], // Itarsi
  [16.5062, 80.6480], // Vijayawada
  [17.6868, 83.2185], // Visakhapatnam
  [13.0827, 80.2707], // Chennai
  [12.9716, 77.5946], // Bengaluru
  [18.5204, 73.8567], // Pune
  [19.0760, 72.8777], // Mumbai
  [23.0225, 72.5714], // Ahmedabad
];

const EAST_COAST_RAIL_LAND_NODES: Array<[number, number]> = [
  [13.0827, 80.2707], // Chennai
  [14.4426, 79.9865], // Nellore
  [16.5062, 80.6480], // Vijayawada
  [17.0005, 81.7799], // Rajahmundry
  [17.6868, 83.2185], // Visakhapatnam
  [18.1124, 83.3956], // Vizianagaram
  [18.2969, 83.8968], // Srikakulam
  [18.7700, 84.4100], // Palasa
  [19.3150, 84.7941], // Brahmapur
  [19.7400, 85.2000], // Balugaon (Land detour WEST of Chilika Lake!)
  [20.1500, 85.6200], // Khurda Road
  [20.2961, 85.8245], // Bhubaneswar
  [20.4625, 85.8828], // Cuttack
  [21.0574, 86.4969], // Bhadrak
  [21.4934, 86.9135], // Balasore
  [22.3460, 87.2320], // Kharagpur
  [22.5726, 88.3639], // Kolkata
];

function generateRailRoute(
  originCoords: [number, number],
  destCoords: [number, number]
): Array<[number, number]> {
  // Check if route travels along the East Coast Corridor (e.g. Visakhapatnam/Chennai <-> Kolkata)
  let origIdx = -1;
  let destIdx = -1;
  let minOrigD = Infinity;
  let minDestD = Infinity;

  EAST_COAST_RAIL_LAND_NODES.forEach((node, i) => {
    const dO = calculateHaversineDistance(originCoords[0], originCoords[1], node[0], node[1]);
    if (dO < minOrigD) {
      minOrigD = dO;
      origIdx = i;
    }
    const dD = calculateHaversineDistance(destCoords[0], destCoords[1], node[0], node[1]);
    if (dD < minDestD) {
      minDestD = dD;
      destIdx = i;
    }
  });

  if (minOrigD < 150 && minDestD < 150 && origIdx !== destIdx) {
    const corridorNodes: Array<[number, number]> = [];
    corridorNodes.push(originCoords);

    if (origIdx <= destIdx) {
      for (let i = origIdx; i <= destIdx; i++) {
        corridorNodes.push(EAST_COAST_RAIL_LAND_NODES[i]);
      }
    } else {
      for (let i = origIdx; i >= destIdx; i--) {
        corridorNodes.push(EAST_COAST_RAIL_LAND_NODES[i]);
      }
    }

    corridorNodes.push(destCoords);

    const railWaypoints: Array<[number, number]> = [];
    for (let i = 0; i < corridorNodes.length - 1; i++) {
      const seg = generateIntermediateWaypoints(corridorNodes[i], corridorNodes[i + 1], 6, 0);
      railWaypoints.push(...seg.slice(i === 0 ? 0 : 1));
    }
    return railWaypoints;
  }

  // Generic Rail Junction interpolation fallback
  const midLat = (originCoords[0] + destCoords[0]) / 2;
  const midLon = (originCoords[1] + destCoords[1]) / 2;

  let nearestJunction: [number, number] | null = null;
  let minJunctDist = Infinity;

  for (const j of RAIL_JUNCTIONS) {
    const d = calculateHaversineDistance(midLat, midLon, j[0], j[1]);
    const dStart = calculateHaversineDistance(originCoords[0], originCoords[1], j[0], j[1]);
    const dEnd = calculateHaversineDistance(destCoords[0], destCoords[1], j[0], j[1]);

    if (d < minJunctDist && dStart > 50 && dEnd > 50) {
      minJunctDist = d;
      nearestJunction = j;
    }
  }

  if (nearestJunction && minJunctDist < 400) {
    const leg1 = generateIntermediateWaypoints(originCoords, nearestJunction, 15, 0);
    const leg2 = generateIntermediateWaypoints(nearestJunction, destCoords, 15, 0);
    return [...leg1, ...leg2.slice(1)];
  }

  return generateIntermediateWaypoints(originCoords, destCoords, 30, 0);
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

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=in&limit=1`,
      {
        headers: {
          'User-Agent': 'VyuhaSupplyChainPlatform/1.0',
        },
      }
    );

    if (response.ok) {
      const data = await response.json();
      if (data && data.length > 0) {
        return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
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
  let maritimeInfo: MaritimePortInfo | undefined = undefined;

  const directDistance = calculateHaversineDistance(
    originCoords[0],
    originCoords[1],
    destCoords[0],
    destCoords[1]
  );

  if (mode === 'Road' || mode === 'Rail') {
    try {
      // Query OSRM API for real land network routing (road & railway land corridors)
      const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${originCoords[1]},${originCoords[0]};${destCoords[1]},${destCoords[0]}?overview=full&geometries=geojson`;
      const response = await fetch(osrmUrl);

      if (response.ok) {
        const data = await response.json();
        if (data.routes && data.routes.length > 0) {
          const route = data.routes[0];
          distanceKm = Math.round(route.distance / 1000);

          if (mode === 'Rail') {
            distanceKm = Math.round(distanceKm * 1.04);
            durationHours = parseFloat((distanceKm / 50 + 1.5).toFixed(1));
          } else {
            durationHours = parseFloat((route.duration / 3600).toFixed(1));
          }

          // GeoJSON returns [lon, lat], leaflet expects [lat, lon]
          routeCoordinates = route.geometry.coordinates.map(
            (coord: [number, number]) => [coord[1], coord[0]] as [number, number]
          );
        }
      }
    } catch (osrmError) {
      console.warn('OSRM Routing API failed, falling back to land network corridor:', osrmError);
    }

    // Fallback if OSRM is unreachable
    if (routeCoordinates.length === 0) {
      if (mode === 'Rail') {
        distanceKm = Math.round(directDistance * 1.25);
        durationHours = parseFloat((distanceKm / 50 + 1.5).toFixed(1));
        routeCoordinates = generateRailRoute(originCoords, destCoords);
      } else {
        distanceKm = Math.round(directDistance * 1.22);
        durationHours = parseFloat((distanceKm / 55).toFixed(1));
        routeCoordinates = generateIntermediateWaypoints(originCoords, destCoords, 25, 0);
      }
    }
  } else if (mode === 'Sea') {
    const seaResult = generateMaritimeSeaRoute(originCoords, destCoords);
    distanceKm = seaResult.distanceKm;
    durationHours = seaResult.durationHours;
    routeCoordinates = seaResult.routeCoords;
    maritimeInfo = seaResult.maritimeInfo;
  } else if (mode === 'Air') {
    distanceKm = Math.round(directDistance * 1.05);
    durationHours = parseFloat((distanceKm / 650 + 2.0).toFixed(1));
    routeCoordinates = generateIntermediateWaypoints(originCoords, destCoords, 40, 0.4);
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
    maritime_info: maritimeInfo,
    ml_payload: {
      origin: originName,
      destination: destName,
      transport_mode: mode,
      distance_km: distanceKm,
      estimated_travel_time_hours: durationHours,
      route_coordinates: routeCoordinates,
      maritime_info: maritimeInfo,
    },
  };

  return result;
}
