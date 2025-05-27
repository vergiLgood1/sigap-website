import { IUnits } from '@/app/_utils/types/units';
import { useQuery } from '@tanstack/react-query';
import { getNearestUnits, getUnits, INearestUnits } from '../action';

export const useGetUnitsQuery = () => {
  return useQuery<IUnits[]>({
    queryKey: ['units'],
    queryFn: () => getUnits(),
  });
};

export const useGetNearestUnitsQuery = (lat: number, lon: number, max_results?: number) => {
  return useQuery<INearestUnits[]>({
    queryKey: ['nearest-units', lat, lon],
    queryFn: () => getNearestUnits(lat, lon, max_results),
  });
}