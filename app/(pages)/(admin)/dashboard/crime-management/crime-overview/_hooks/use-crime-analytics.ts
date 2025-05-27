import { useMemo } from 'react';
import { ICrimes } from '@/app/_utils/types/crimes';

export interface ICrimeAnalytics {
  todaysIncidents: number;
  totalIncidents: number;
  recentIncidents: any[];
  filteredIncidents: any[];
  categoryCounts: Record<string, number>;
  districts: Record<string, number>;
  incidentsByMonth: number[];
  clearanceRate: number;
  incidentsByMonthDetail: Record<string, any[]>;
  availableMonths: string[];
}

export function useCrimeAnalytics(crimes: ICrimes[]) {
  return useMemo(() => {
    if (!crimes || !Array.isArray(crimes) || crimes.length === 0)
      return {
        todaysIncidents: 0,
        totalIncidents: 0,
        recentIncidents: [],
        filteredIncidents: [],
        categoryCounts: {},
        districts: {},
        incidentsByMonth: Array(12).fill(0),
        clearanceRate: 0,
        incidentsByMonthDetail: {} as Record<string, any[]>,
        availableMonths: [] as string[],
      };

    // Use the already filtered crimes directly, don't filter them again
    const crimeIncidents = crimes.flatMap((crime: ICrimes) =>
      crime.crime_incidents.map((incident) => ({
        id: incident.id,
        timestamp: incident.timestamp,
        description: incident.description,
        status: incident.status,
        category: incident.crime_categories.name,
        type: incident.crime_categories.type,
        address: incident.locations.address,
        latitude: incident.locations.latitude,
        longitude: incident.locations.longitude,
        district_id: crime.district_id,
        district_name: crime.districts?.name || 'Unknown'
      }))
    );

    const totalIncidents = crimeIncidents.length;

    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);

    const recentIncidents = crimeIncidents
      .filter((incident) => {
        if (!incident?.timestamp) return false;
        const incidentDate = new Date(incident.timestamp);
        return incidentDate >= thirtyDaysAgo;
      })
      .sort((a, b) => {
        const bTime = b?.timestamp ? new Date(b.timestamp).getTime() : 0;
        const aTime = a?.timestamp ? new Date(a.timestamp).getTime() : 0;
        return bTime - aTime;
      });

    const filteredIncidents = crimeIncidents.sort((a, b) => {
      const bTime = b?.timestamp ? new Date(b.timestamp).getTime() : 0;
      const aTime = a?.timestamp ? new Date(a.timestamp).getTime() : 0;
      return bTime - aTime;
    });

    const todaysIncidents = recentIncidents.filter((incident) => {
      const incidentDate = incident?.timestamp
        ? new Date(incident.timestamp)
        : new Date(0);
      return incidentDate.toDateString() === today.toDateString();
    }).length;

    const categoryCounts = crimeIncidents.reduce(
      (acc: Record<string, number>, incident) => {
        const category = incident?.category || 'Unknown';
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    // Count by district name from the incidents, not from crimes anymore 
    // since crimes are already filtered
    const districts = crimeIncidents.reduce(
      (acc: Record<string, number>, incident) => {
        const districtName = incident.district_name || 'Unknown';
        acc[districtName] = (acc[districtName] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const incidentsByMonth = Array(12).fill(0);
    crimeIncidents.forEach((incident) => {
      if (!incident?.timestamp) return;

      const date = new Date(incident.timestamp);
      const month = date.getMonth();
      if (month >= 0 && month < 12) {
        incidentsByMonth[month]++;
      }
    });

    const resolvedIncidents = crimeIncidents.filter(
      (incident) => incident?.status?.toLowerCase() === 'resolved'
    ).length;

    const clearanceRate =
      totalIncidents > 0
        ? Math.round((resolvedIncidents / totalIncidents) * 100)
        : 0;

    const incidentsByMonthDetail: Record<string, any[]> = {};
    const availableMonths: string[] = [];

    crimeIncidents.forEach((incident) => {
      if (!incident?.timestamp) return;

      const date = new Date(incident.timestamp);
      const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;

      if (!incidentsByMonthDetail[monthKey]) {
        incidentsByMonthDetail[monthKey] = [];
        availableMonths.push(monthKey);
      }

      incidentsByMonthDetail[monthKey].push(incident);
    });

    Object.keys(incidentsByMonthDetail).forEach((monthKey) => {
      incidentsByMonthDetail[monthKey].sort((a, b) => {
        const bTime = b?.timestamp ? new Date(b.timestamp).getTime() : 0;
        const aTime = a?.timestamp ? new Date(a.timestamp).getTime() : 0;
        return bTime - aTime;
      });
    });

    availableMonths.sort((a, b) => {
      const [yearA, monthA] = a.split('-').map(Number);
      const [yearB, monthB] = b.split('-').map(Number);

      if (yearB !== yearA) return yearB - yearA;
      return monthB - monthA;
    });

    return {
      todaysIncidents,
      totalIncidents,
      recentIncidents: recentIncidents.slice(0, 10),
      filteredIncidents,
      categoryCounts,
      districts,
      incidentsByMonth,
      clearanceRate,
      incidentsByMonthDetail,
      availableMonths,
    };
  }, [crimes]);
}
