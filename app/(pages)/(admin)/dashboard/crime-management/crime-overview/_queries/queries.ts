import { useQuery } from '@tanstack/react-query';
import {
  getAvailableYears,
  getCrimeByYearAndMonth,
  getCrimeCategories,
  getCrimes,
  getCrimesTypes,
  getRecentIncidents,
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