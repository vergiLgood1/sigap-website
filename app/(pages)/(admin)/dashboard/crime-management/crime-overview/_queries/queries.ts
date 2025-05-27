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
    queryFn: () => getCrimeByYearAndMonth(year, month),
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