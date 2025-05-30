'use client';

import { useQuery } from '@tanstack/react-query';
import { getAvailableYears, getCrimeByYearAndMonth } from '../action';

export function useCrimeMapHandler(
  selectedYear: number, // Changed from number | "all" to number
  selectedMonth: number | 'all'
) {
  // Get available years for dropdown
  const {
    data: availableYears,
    isLoading: yearsLoading,
    error: yearsError,
  } = useQuery({
    queryKey: ['available-years'],
    queryFn: async () => {
      const years = await getAvailableYears();
      // If years array doesn't include 2025, add it
      if (years && !years.includes(2025)) {
        years.push(2025);
      }
      return years || [];
    },
  });

  // Get crime data based on filters
  const {
    data: crimes,
    isLoading: crimesLoading,
    error: crimesError,
    refetch: refetchCrimes,
  } = useQuery({
    queryKey: ['crimes', selectedYear, selectedMonth],
    queryFn: async () => {
      // Handle the case where selectedMonth is 'all'
      const monthParam = selectedMonth === 'all' ? undefined : selectedMonth;
      return await getCrimeByYearAndMonth(selectedYear, monthParam);
    },
  });

  return {
    availableYears,
    yearsLoading,
    yearsError: yearsError ? true : false,
    crimes,
    crimesLoading,
    crimesError: crimesError ? true : false,
    refetchCrimes,
  };
}
