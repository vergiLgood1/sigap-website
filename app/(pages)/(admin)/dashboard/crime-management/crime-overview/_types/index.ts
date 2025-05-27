import { crime_categories, crime_incidents, crime_rates, crime_status } from "@prisma/client";

// Active Officers Response
export interface ActiveOfficersResponse {
    totalOfficers: number;
    onDutyCount: number;
    officers?: Array<{
        id: string;
        name: string;
        rank?: string;
        avatar?: string;
        unit_id?: string;
    }>;
}

// Crime Category Statistics from crime_incidents
export interface CrimeCategoryStatistic {
    id: string;
    name: string;
    count: number;
    percentage: number;
    change: string;
    isIncrease: boolean;
}

export interface CrimeStatisticsResponse {
    totalCrimes: number;
    categories: CrimeCategoryStatistic[];
    timeRange: string; // e.g., "Last 30 days"
}

// Recent Arrests Response based on crime_incidents
export interface RecentArrestsResponse {
    totalIncidents: number;
    topCategories: Array<{
        id: string;
        name: string;
        count: number;
    }>;
}

// High Priority Cases from crime_incidents
export interface HighPriorityCaseResponse {
    id: string;
    crime_id: string;
    crime_category_id: string;
    description: string;
    status: crime_status;
    timestamp: string;
    type: string;
    priority: "Critical" | "High" | "Medium";
    location: string;
    time: string;
    source?: string;
    categoryName?: string;
}

// Person of Interest Response
export interface PersonOfInterestResponse {
    id: string;
    userId: string;
    name: string;
    avatar?: string;
    reportType: string;
    reportDate: string;
    status: string;
}

// Evidence Response based on the evidence table
export interface EvidenceResponse {
    id: string;
    incident_id: string;
    type: string;
    url: string;
    caption?: string;
    uploaded_at: string;
    case: string; // This is for display purposes
    status: string; // This might be derived or added for UI
}

// Emergency Calls Response
export interface EmergencyCallsResponse {
    callsThisHour: number;
    averageWait: string;
    operatorsAvailable: number;
    totalOperators: number;
}

// Department Performance Response
export interface DepartmentPerformanceResponse {
    caseClearanceRate: number;
    avgResponseTime: number;
    evidenceProcessingRate: number;
}
