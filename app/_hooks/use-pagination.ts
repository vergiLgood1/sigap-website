import { useState, useEffect } from 'react';

export function usePagination(availableMonths: string[]) {
  const [paginationState, setPaginationState] = useState<
    Record<string, number>
  >({});

  useEffect(() => {
    if (availableMonths && availableMonths.length > 0) {
      const initialState: Record<string, number> = {};
      availableMonths.forEach((month) => {
        initialState[month] = 0; // Start at page 0 for each month
      });
      setPaginationState(initialState);
    }
  }, [availableMonths]);

  // Pagination handler for a specific month
  const handlePageChange = (monthKey: string, direction: 'next' | 'prev') => {
    setPaginationState((prev) => {
      const currentPage = prev[monthKey] || 0;

      if (direction === 'next') {
        return { ...prev, [monthKey]: currentPage + 1 };
      } else if (direction === 'prev' && currentPage > 0) {
        return { ...prev, [monthKey]: currentPage - 1 };
      }
      return prev;
    });
  };

  return { paginationState, handlePageChange };
}
