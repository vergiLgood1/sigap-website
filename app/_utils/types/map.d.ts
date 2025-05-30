import { Map } from "mapbox-gl";

export interface IClusterLayerProps {
    map?: Map;
    visible?: boolean;
    crimes?: ICrimesByYearAndMonth[];
    filterCategory?: string;
    focusedDistrictId?: string;
    clusteringEnabled?: boolean;
    showClusters?: boolean;
    showIncidents?: boolean;
    sourceType?: string;
}

export interface ICrimesByYearAndMonth {
    id: string;
    year: number;
    month: number | null;
    crime_category_id: string;
    crime_type_id: string;
    crime_category_name: string;
    crime_type_name: string;
    total_crimes: number;
    population_density: number;
    unemployment_rate: number;
    risk_level: string;
    centroid_features: any[];
    member_count: number;
    last_update_type: string;
    update_count: number;
    needs_recompute: boolean;
    migrated_to_crimes: boolean;
    migration_date: Date | null;
    created_at: Date;
    updated_at: Date;
}

// Add new interfaces for district clusters with incidents
export interface IIncident {
    id: string;
    crime_category_id: string;
    description: string;
    status: string;
    timestamp: Date;
    crime_categories: {
        name: string;
        type: string;
    };
    locations: {
        latitude: number;
        longitude: number;
        address: string;
        districts?: {
            name: string;
        };
    };
}

export interface IDistrictClusterWithIncidents {
    id: string;
    district_id: string;
    year: number;
    month: number | null;
    risk_level: string;
    total_crimes: number;
    population_density: number;
    unemployment_rate: number;
    crime_score: number;
    density_score: number;
    unemployment_score: number;
    cluster_score: number;
    centroid_features: any[];
    member_count: number;
    last_update_type: string;
    update_count: number;
    needs_recompute: boolean;
    migrated_to_crimes: boolean;
    migration_date: Date | null;
    created_at: Date;
    updated_at: Date;
    district?: {
        name: string;
        geographics?: {
            latitude: number;
            longitude: number;
        }[];
    };
    incidents?: IIncident[];
    incidents_count?: number;
    incidents_data?: string;
}