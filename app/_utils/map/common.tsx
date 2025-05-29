import { $Enums } from '@prisma/client';
import { CRIME_RATE_COLORS } from '@/app/_utils/const/crime';
import type { ICrimes } from '@/app/_utils/types/crimes';

import { AlertTriangle, Shield } from "lucide-react";
import { IDistrictFeature } from '../types/map';
import { ITooltipsControl } from '@/app/_components/map/controls/top/tooltips';

// Process crime data by district
export const processCrimeDataByDistrict = (crimes: ICrimes[]) => {
  return crimes.reduce(
    (acc, crime) => {
      const districtId = crime.district_id;

      acc[districtId] = {
        number_of_crime: crime.number_of_crime,
        level: crime.level,
      };
      return acc;
    },
    {} as Record<
      string,
      { number_of_crime?: number; level?: $Enums.crime_rates }
    >
  );
};

// Get color for crime rate level
export const getCrimeRateColor = (level?: $Enums.crime_rates) => {
  if (!level) return CRIME_RATE_COLORS.default;

  switch (level) {
    case 'low':
      return CRIME_RATE_COLORS.low;
    case 'medium':
      return CRIME_RATE_COLORS.medium;
    case 'high':
      return CRIME_RATE_COLORS.high;
    default:
      return CRIME_RATE_COLORS.default;
  }
};

// Create fill color expression for district layer
export const createFillColorExpression = (
  focusedDistrictId: string | null,
  crimeDataByDistrict: Record<
    string,
    { number_of_crime?: number; level?: $Enums.crime_rates }
  >
) => {
  const colorEntries = focusedDistrictId
    ? [
      [
        focusedDistrictId,
        getCrimeRateColor(crimeDataByDistrict[focusedDistrictId]?.level),
      ],
      'rgba(0,0,0,0.05)',
    ]
    : Object.entries(crimeDataByDistrict).flatMap(([districtId, data]) => {
      return [districtId, getCrimeRateColor(data.level)];
    });

  return [
    'case',
    ['has', 'kode_kec'],
    [
      'match',
      ['get', 'kode_kec'],
      ...colorEntries,
      focusedDistrictId ? 'rgba(0,0,0,0.05)' : CRIME_RATE_COLORS.default,
    ],
    CRIME_RATE_COLORS.default,
  ];
};

// Extract crime incidents for GeoJSON
export const extractCrimeIncidents = (
  crimes: ICrimes[],
  filterCategory: string | 'all'
) => {
  return crimes.flatMap((crime) => {
    if (!crime.crime_incidents) return [];

    let filteredIncidents = crime.crime_incidents;

    if (filterCategory !== 'all') {
      filteredIncidents = crime.crime_incidents.filter(
        (incident) =>
          incident.crime_categories &&
          incident.crime_categories.name === filterCategory
      );
    }

    return filteredIncidents
      .map((incident) => {
        if (!incident.locations) {
          console.warn('Missing location for incident:', incident.id);
          return null;
        }

        return {
          type: 'Feature' as const,
          properties: {
            id: incident.id,
            district: crime.districts?.name || 'Unknown',
            category: incident.crime_categories?.name || 'Unknown',
            incidentType: incident.crime_categories?.type || 'Unknown',
            level: crime.level || 'low',
            description: incident.description || '',
            status: incident.status || '',
          },
          geometry: {
            type: 'Point' as const,
            coordinates: [
              incident.locations.longitude || 0,
              incident.locations.latitude || 0,
            ],
          },
        };
      })
      .filter(Boolean);
  });
};

// Process district feature from map click
export const processDistrictFeature = (
  feature: any,
  e: any,
  districtId: string,
  crimeDataByDistrict: Record<
    string,
    { number_of_crime?: number; level?: $Enums.crime_rates }
  >,
  crimes: ICrimes[],
  year: string,
  month: string
): IDistrictFeature | null => {
  const crimeData = crimeDataByDistrict[districtId] || {};
  let crime_incidents: Array<{
    id: string;
    timestamp: Date;
    description: string;
    status: string;
    category: string;
    type: string;
    address: string;
    latitude: number;
    longitude: number;
  }> = [];

  const districtCrimes = crimes.filter(
    (crime) => crime.district_id === districtId
  );

  districtCrimes.forEach((crimeRecord) => {
    if (crimeRecord && crimeRecord.crime_incidents) {
      const incidents = crimeRecord.crime_incidents.map((incident) => ({
        id: incident.id,
        timestamp: incident.timestamp,
        description: incident.description || '',
        status: incident.status || '',
        category: incident.crime_categories?.name || '',
        type: incident.crime_categories?.type || '',
        address: incident.locations?.address || '',
        latitude: incident.locations?.latitude || 0,
        longitude: incident.locations?.longitude || 0,
      }));

      crime_incidents = [...crime_incidents, ...incidents];
    }
  });

  const firstDistrictCrime =
    districtCrimes.length > 0 ? districtCrimes[0] : null;
  if (!firstDistrictCrime) return null;

  const selectedYearNum = year
    ? Number.parseInt(year)
    : new Date().getFullYear();

  let demographics = firstDistrictCrime?.districts.demographics?.find(
    (d) => d.year === selectedYearNum
  );

  if (!demographics && firstDistrictCrime?.districts.demographics?.length) {
    demographics = firstDistrictCrime.districts.demographics.sort(
      (a, b) => b.year - a.year
    )[0];
    console.log(
      `Tidak ada data demografis untuk tahun ${selectedYearNum}, menggunakan data tahun ${demographics.year}`
    );
  }

  let geographics = firstDistrictCrime?.districts.geographics?.find(
    (g) => g.year === selectedYearNum
  );

  if (!geographics && firstDistrictCrime?.districts.geographics?.length) {
    const validGeographics = firstDistrictCrime.districts.geographics
      .filter((g) => g.year !== null)
      .sort((a, b) => (b.year || 0) - (a.year || 0));

    geographics =
      validGeographics.length > 0
        ? validGeographics[0]
        : firstDistrictCrime.districts.geographics[0];

    console.log(
      `Tidak ada data geografis untuk tahun ${selectedYearNum}, menggunakan data ${geographics.year ? `tahun ${geographics.year}` : 'tanpa tahun'}`
    );
  }

  const clickLng = e.lngLat ? e.lngLat.lng : null;
  const clickLat = e.lngLat ? e.lngLat.lat : null;

  if (!geographics) {
    console.error('Missing geographics data for district:', districtId);
    return null;
  }

  if (!demographics) {
    console.error('Missing demographics data for district:', districtId);
    return null;
  }

  return {
    id: districtId,
    name:
      feature.properties.nama ||
      feature.properties.kecamatan ||
      'Unknown District',
    longitude: geographics.longitude || clickLng || 0,
    latitude: geographics.latitude || clickLat || 0,
    number_of_crime: crimeData.number_of_crime || 0,
    level: crimeData.level || $Enums.crime_rates.low,
    demographics: {
      number_of_unemployed: demographics.number_of_unemployed,
      population: demographics.population,
      population_density: demographics.population_density,
      year: demographics.year,
    },
    geographics: {
      address: geographics.address || '',
      land_area: geographics.land_area || 0,
      year: geographics.year || 0,
      latitude: geographics.latitude,
      longitude: geographics.longitude,
    },
    crime_incidents: crime_incidents || [],
    selectedYear: year,
    selectedMonth: month,
    isFocused: true,
  };
};

/**
 * Format distance in a human-readable way
 * @param meters Distance in meters
 * @returns Formatted distance string
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  } else {
    return `${(meters / 1000).toFixed(1)} km`;
  }
}

// Helper function to determine fill opacity based on active control
export function getFillOpacity(activeControl?: ITooltipsControl, showFill?: boolean): number {
  if (!showFill) return 0

  // Full opacity for incidents and clusters
  if (activeControl === "incidents" || activeControl === "clusters" || activeControl === "units") {
    return 0.6
  }

  // Low opacity for timeline to show markers but still see district boundaries
  if (activeControl === "timeline") {
    return 0.1
  }

  // No fill for other controls, but keep boundaries visible
  return 0
}

// Helper to normalize severity to a number
export const normalizeSeverity = (sev: number | "Low" | "Medium" | "High" | "Critical"): number => {
  if (typeof sev === "number") return sev
  switch (sev) {
    case "Critical":
      return 4
    case "High":
      return 3
    case "Medium":
      return 2
    case "Low":
    default:
      return 1
  }
}

export const normalizeSeverityNumber = (sev?: number | "Low" | "Medium" | "High" | "Critical"): string => {
  if (!sev) return "Medium";

  if (typeof sev === "number") {
    switch (sev) {
      case 4: return "Critical";
      case 3: return "High";
      case 2: return "Medium";
      case 1: return "Low";
      default: return "Medium";
    }
  }
  return sev;
};


export const getSeverityGradient = (severity: number) => {
  switch (severity) {
    case 4:
      return "bg-gradient-to-r from-purple-500/10 to-purple-600/5 dark:from-purple-900/20 dark:to-purple-800/10"
    case 3:
      return "bg-gradient-to-r from-red-500/10 to-red-600/5 dark:from-red-900/20 dark:to-red-800/10"
    case 2:
      return "bg-gradient-to-r from-yellow-500/10 to-yellow-600/5 dark:from-yellow-900/20 dark:to-yellow-800/10"
    case 1:
    default:
      return "bg-gradient-to-r from-blue-500/10 to-blue-600/5 dark:from-blue-900/20 dark:to-blue-800/10"
  }
}

export const getSeverityIconColor = (severity: number) => {
  switch (severity) {
    case 4:
      return "text-purple-600 dark:text-purple-400"
    case 3:
      return "text-red-500 dark:text-red-400"
    case 2:
      return "text-yellow-600 dark:text-yellow-400"
    case 1:
    default:
      return "text-blue-500 dark:text-blue-400"
  }
}

export const getSeverityIcon = (severity: number) => {
  switch (severity) {
    case 4:
    case 3:
      return <AlertTriangle className={`h-6 w-6 ${getSeverityIconColor(severity)}`} />
    case 2:
    case 1:
    default:
      return <Shield className={`h-6 w-6 ${getSeverityIconColor(severity)}`} />
  }
}

export const getStatusInfo = (status?: string | true) => {
  if (status === true) {
    return {
      text: "Verified",
      color: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400"
    };
  }

  if (!status) {
    return {
      text: "Pending",
      color: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400"
    };
  }

  switch (status.toLowerCase()) {
    case "resolved":
      return {
        text: "Resolved",
        color: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400"
      };
    case "in progress":
      return {
        text: "In Progress",
        color: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400"
      };
    case "pending":
      return {
        text: "Pending",
        color: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400"
      };
    default:
      return {
        text: status.charAt(0).toUpperCase() + status.slice(1),
        color: "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/30 dark:text-gray-400"
      };
  }
};
// Get appropriate color for severity badge
export const getSeverityColor = (severity: string) => {
  switch (severity) {
    case "Critical": return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400";
    case "High": return "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400";
    case "Medium": return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400";
    case "Low": return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400";
    default: return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400";
  }
};