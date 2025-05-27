import {
  $Enums,
  crime_categories,
  crime_incidents,
  crimes,
  demographics,
  districts,
  geographics,
  locations,
  incident_logs,
} from '@prisma/client';

export interface ICrimes extends crimes {
  districts: {
    name: string;
    geographics: {
      year: number | null;
      address: string | null;
      longitude: number;
      latitude: number;
      land_area: number | null;
    }[];
    demographics: {
      year: number;
      population: number;
      number_of_unemployed: number;
      population_density: number;
    }[];
  };
  crime_incidents: {
    id: string;
    description: string;
    status: $Enums.crime_status | null;
    timestamp: Date;
    crime_categories: {
      name: string;
      type: string | null;
    };
    locations: {
      address: string | null;
      longitude: number;
      latitude: number;
      distance_to_unit: number | null;
    };
  }[];
}

export interface ICrimesByYearAndMonth extends crimes {
  districts: {
    name: string;
    geographics: {
      year: number | null;
      address: string | null;
      longitude: number;
      latitude: number;
      land_area: number | null;
    };
    demographics: {
      year: number;
      population: number;
      number_of_unemployed: number;
      population_density: number;
    };
  };
  crime_incidents: {
    id: string;
    description: string;
    status: $Enums.crime_status | null;
    timestamp: Date;
    crime_categories: {
      name: string;
      type: string | null;
    };
    locations: {
      address: string | null;
      longitude: number;
      latitude: number;
    };
  }[];
}

export interface IDistanceResult {
  unit_code: string;
  unit_name: string;
  unit_type: string;
  unit_lat: number;
  unit_lng: number;
  incident_id: number;
  incident_description: string;
  incident_lat: number;
  incident_lng: number;
  category_name: string;
  district_name: string;
  distance_meters: number;
}

export interface IIncidentLogs {
  id: string;
  user_id: string;
  role_id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  role: string;
  description: string;
  verified: boolean;
  longitude: number;
  latitude: number;
  timestamp: Date;
  category: string;
  address: string;
  district: string;
  severity: "Low" | "Medium" | "High" | "Unknown";
  source: string;
  isVeryRecent?: boolean;
}

export interface ICrime {
  id: string;
  district_id: string;
  created_at: string;
  level: 'low' | 'medium' | 'high' | 'critical';
  method: string;
  month: number;
  number_of_crime: number;
  score: number;
  updated_at: string;
  year: number;
  source_type: string;
  crime_cleared: number;
  avg_crime: number;
  districts?: {
    name: string;
  };
}

export interface ICrimeIncident {
  id: string;
  crime_id: string;
  crime_category_id: string;
  location_id: string;
  description: string;
  victim_count: number;
  status: string;
  created_at: string;
  updated_at: string;
  timestamp: string;
  crime_categories?: {
    name: string;
    type: string;
  };
  locations?: {
    address: string;
    latitude: number;
    longitude: number;
    districts: {
      name: string;
    };
  };
  crimes?: {
    id: string;
    district_id: string;
  };
}

export interface IIncidentLog {
  id: string;
  user_id: string;
  location_id: string;
  category_id: string;
  description: string;
  source: string;
  time: string;
  verified: boolean;
  created_at: string;
  updated_at: string;
  crime_categories?: {
    name: string;
    type: string;
  };
  locations?: {
    address: string;
    latitude: number;
    longitude: number;
    districts: {
      name: string;
    };
  };
  user?: {
    email: string;
    phone: string;
    profile: {
      first_name: string;
      last_name: string;
      avatar: string;
    };
  };
}
