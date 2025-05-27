
export const MAPBOX_ACCESS_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
export const MAPBOX_TILESET_ID = process.env.NEXT_PUBLIC_MAPBOX_TILESET_ID;

export const BASE_ZOOM = 9.5;
export const BASE_PITCH = 0;
export const BASE_BEARING = 0;
export const BASE_LATITUDE = -8.17; // Default latitude for the map center (Jember region)
export const BASE_LONGITUDE = 113.65; // Default longitude for the map center (Jember region)
export const BASE_DURATION = 2000; // Default duration for map flyTo animation
export const PITCH_3D = 60; // Default pitch for 3D view
export const ZOOM_3D = 12.5; // Default zoom for 3D view


// export const CRIME_RATE_COLORS = {
//   low: '#FFB74D', // green
//   medium: '#FC7216', // yellow
//   high: '#BF360C', // red
//   // critical: '#ef4444', // red
//   default: '#94a3b8', // gray
// };

export const CRIME_RATE_COLORS = {
  low: '#4ade80', // green
  medium: '#facc15', // yellow
  high: '#ef4444', // red
  default: '#94a3b8', // gray
};

export const CRIME_RATE_THRESHOLDS = {
  low: 25, // 0-25%
  medium: 50, // 25-50%
  high: 75, // 50-75%
  critical: 100, // 75-100%
};

// mapStyles.ts
export const MAPBOX_STYLES = {
  Standard: 'mapbox://styles/mapbox/standard',
  StandardSatellite: 'mapbox://styles/mapbox/standard-satellite',
  Streets: 'mapbox://styles/mapbox/streets-v12',
  Outdoors: 'mapbox://styles/mapbox/outdoors-v12',
  Light: 'mapbox://styles/mapbox/light-v11',
  Dark: 'mapbox://styles/mapbox/dark-v11',
  Satellite: 'mapbox://styles/mapbox/satellite-v9',
  SatelliteStreets: 'mapbox://styles/mapbox/satellite-streets-v12',
  NavigationDay: 'mapbox://styles/mapbox/navigation-day-v1',
  NavigationNight: 'mapbox://styles/mapbox/navigation-night-v1',
} as const;

export type MapboxStyle = (typeof MAPBOX_STYLES)[keyof typeof MAPBOX_STYLES];

// Construct vector tile URL using the Mapbox API format
export const VECTOR_TILE_URL = `https://api.mapbox.com/v4/${MAPBOX_TILESET_ID}/${BASE_ZOOM}/1171/1566.mvt?access_token=${MAPBOX_ACCESS_TOKEN}`;
