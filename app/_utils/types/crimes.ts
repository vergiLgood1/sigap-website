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
