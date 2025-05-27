import { IDistrictGeoData } from "./district";

export interface IGeoJSONPolygon {
    type: 'Polygon' | 'MultiPolygon';
    coordinates: number[][][];
}

export interface IGeoJSONFeature {
    type: 'Feature';
    geometry: IGeoJSONPolygon;
    properties: IDistrictGeoData;
}

export interface IGeoJSONFeatureCollection {
    type: 'FeatureCollection';
    features: IGeoJSONFeature[];
}

import { $Enums } from '@prisma/client';
import type { ICrimes } from '@/app/_utils/types/crimes';
import mapboxgl from 'mapbox-gl';
import { ITooltipsControl } from "@/app/_components/map/controls/top/tooltips";

// Types for district properties
export interface IDistrictFeature {
  id: string;
  name: string;
  longitude: number;
  latitude: number;
  number_of_crime: number;
  level: $Enums.crime_rates;
  demographics: {
    number_of_unemployed: number;
    population: number;
    population_density: number;
    year: number;
  };
  geographics: {
    address: string;
    land_area: number;
    year: number;
    latitude: number;
    longitude: number;
  };
  crime_incidents: Array<{
    id: string;
    timestamp: Date;
    description: string;
    status: string;
    category: string;
    type: string;
    address: string;
    latitude: number;
    longitude: number;
  }>;
  selectedYear?: string;
  selectedMonth?: string;
  isFocused?: boolean;
}

// Base props for all map layers
export interface IBaseLayerProps {
  visible?: boolean;
  map: mapboxgl.Map | null;
  tilesetId?: string;
}

// District layer props
export interface IDistrictLayerProps {
  map: mapboxgl.Map | null;
  visible?: boolean;
  showFill?: boolean;
  onClick?: (feature: IDistrictFeature) => void;
  year: string;
  month: string;
  filterCategory: string | 'all';
  crimes: ICrimes[];
  tilesetId?: string;
  activeControl: ITooltipsControl;
  focusedDistrictId: string | null;
  setFocusedDistrictId?: (id: string | null) => void;
  crimeDataByDistrict?: any;
}

// Extrusion layer props
export interface IExtrusionLayerProps extends IBaseLayerProps {
  focusedDistrictId: string | null;
  crimeDataByDistrict: Record<
    string,
    { number_of_crime?: number; level?: $Enums.crime_rates }
  >;
}

// Cluster layer props
export interface IClusterLayerProps extends IBaseLayerProps {
  crimes?: ICrimes[];
  filterCategory?: string | 'all';
  focusedDistrictId?: string | null;
  clusteringEnabled?: boolean;
  showClusters?: boolean;
}

// Unclustered point layer props
export interface IUnclusteredPointLayerProps extends IBaseLayerProps {
  crimes: ICrimes[];
  filterCategory: string | 'all';
  focusedDistrictId: string | null;
  showIncidentMarkers?: boolean; // Add this prop to control marker visibility
}

// Source type crimes
export type ICrimeSourceTypes = "cbt" | "cbu"
