import { useQuery } from '@tanstack/react-query';
import {
  getAvailableYears,
  getCrimeByYearAndMonth,
  getCrimeCategories,
  getCrimes,
  getCrimesTypes,
  getRecentIncidents,
  getActiveOfficers,
  getDepartmentPerformance,
  getCrimeStatistics,
  getHighPriorityCases,
  getRecentArrests,
  getPersonsOfInterest,
  getEvidenceTracking,
  getEmergencyCallsMetrics,
  performKMeansClustering,
  getDistrictClusters,
  processIncidentLogsForClustering,
  getRealtimeClusterData,
  initializeCurrentYearClusters,
  triggerIncrementalUpdate,
  markDistrictForUpdate,
} from '../action';

export const useGetAvailableYears = () => {
  return useQuery({
    queryKey: ['available-years'],
    queryFn: () => getAvailableYears(),
  });
};

export const useGetCrimeByYearAndMonth = (
  year: number,
  month: number | 'all'
) => {
  return useQuery({
    queryKey: ['crimes', year, month],
    queryFn: () => getCrimeByYearAndMonth(year, month === 'all' ? undefined : month),
  });
};

export const useGetCrimes = () => {
  return useQuery({
    queryKey: ['crimes'],
    queryFn: () => getCrimes(),
  });
};

export const useGetCrimeCategories = () => {
  return useQuery({
    queryKey: ['crime-categories'],
    queryFn: () => getCrimeCategories(),
  });
};

export const useGetCrimeTypes = () => {
  return useQuery({
    queryKey: ['crime-types'],
    queryFn: () => getCrimesTypes(),
  });
}

export const useGetRecentIncidents = () => {
  return useQuery({
    queryKey: ['recent-incidents'],
    queryFn: () => getRecentIncidents(),
  });
}

export const useGetActiveOfficers = () => {
  return useQuery({
    queryKey: ['active-officers'],
    queryFn: () => getActiveOfficers(),
  });
};

export const useGetDepartmentPerformance = () => {
  return useQuery({
    queryKey: ['department-performance'],
    queryFn: () => getDepartmentPerformance(),
  });
};

export const useGetCrimeStatistics = <T = any>() => {
  return useQuery({
    queryKey: ['crime-statistics'],
    queryFn: () => getCrimeStatistics(),
  });
};

export const useGetHighPriorityCases = () => {
  return useQuery({
    queryKey: ['high-priority-cases'],
    queryFn: () => getHighPriorityCases(),
  });
};

export const useGetRecentArrests = () => {
  return useQuery({
    queryKey: ['recent-arrests'],
    queryFn: () => getRecentArrests(),
  });
};

export const useGetPersonsOfInterest = () => {
  return useQuery({
    queryKey: ['recent-reporters'],
    queryFn: () => getPersonsOfInterest(),
  });
};

export const useGetEvidenceTracking = () => {
  return useQuery({
    queryKey: ['evidence-tracking'],
    queryFn: () => getEvidenceTracking(),
  });
};

export const useGetEmergencyCallsMetrics = () => {
  return useQuery({
    queryKey: ['emergency-calls-metrics'],
    queryFn: () => getEmergencyCallsMetrics(),
  });
};

export const useGetDistrictClusters = (
  year: number,
  month?: number
) => {
  return useQuery({
    queryKey: ['district-clusters', year, month],
    queryFn: () => getDistrictClusters(year, month),
  })
}

export const useGetKMeansClustering = (
  year: number,
  month?: number,
  mode: "incremental" | "batch" = "batch",
  options: { enabled?: boolean } = {}
) => {
  return useQuery({
    queryKey: ['kmeans-clustering', year, month, mode],
    queryFn: () => performKMeansClustering(year, month, mode),
    ...options,
    enabled: options.hasOwnProperty('enabled') ? options.enabled : false, // Disable auto-fetching by default
  });
};

export const useProcessIncidentLogs = (
  year: number,
  month?: number
) => {
  return useQuery({
    queryKey: ['process-incident-logs', year, month],
    queryFn: () => processIncidentLogsForClustering(year, month),
    enabled: false, // Don't run automatically
  });
};

export const useGetRealtimeClusterData = (year: number = new Date().getFullYear()) => {
  return useQuery({
    queryKey: ['realtime-cluster-data', year],
    queryFn: () => getRealtimeClusterData(year),
    refetchInterval: 30000, // Refetch every 30 seconds as fallback
    staleTime: 10000, // Consider data stale after 10 seconds
  });
};

export const useInitializeCurrentYearClusters = () => {
  return useQuery({
    queryKey: ['initialize-current-year-clusters'],
    queryFn: () => initializeCurrentYearClusters(),
    enabled: false, // Only run when explicitly called
  });
};

export const useTriggerIncrementalUpdate = (districtId: string, year?: number) => {
  return useQuery({
    queryKey: ['trigger-incremental-update', districtId, year],
    queryFn: () => triggerIncrementalUpdate(districtId, year),
    enabled: false, // Only run when explicitly called
  });
};

export const useMarkDistrictForUpdate = (districtId?: string, year?: number) => {
  return useQuery({
    queryKey: ['mark-district-update', districtId, year],
    queryFn: () => districtId ? markDistrictForUpdate(districtId, year) : Promise.resolve(null),
    enabled: false, // Only run when explicitly called
  });
};