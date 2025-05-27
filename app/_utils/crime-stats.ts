/**
 * Calculates crime statistics from raw crime data
 */
export function calculateCrimeStats(
  crimes: any[] | undefined,
  selectedCategory: string | 'all' = 'all'
) {
  if (!crimes || crimes.length === 0) {
    return {
      todaysIncidents: 0,
      totalIncidents: 0,
      recentIncidents: [],
      categoryCounts: {},
      districts: {},
      incidentsByMonth: Array(12).fill(0),
    };
  }

  // Filter incidents by category if needed
  let filteredIncidents: any[] = [];

  crimes.forEach((crime) => {
    if (selectedCategory === 'all') {
      // Include all incidents
      if (crime.incidents) {
        filteredIncidents = [...filteredIncidents, ...crime.incidents];
      }
    } else {
      // Filter by category
      const matchingIncidents =
        crime.incidents?.filter(
          (incident: any) => incident.category === selectedCategory
        ) || [];
      filteredIncidents = [...filteredIncidents, ...matchingIncidents];
    }
  });

  // Calculate statistics
  const today = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(today.getDate() - 30);

  // Get recent incidents (last 30 days)
  const recentIncidents = filteredIncidents
    .filter((incident) => {
      const incidentDate = new Date(incident.timestamp);
      return incidentDate >= thirtyDaysAgo;
    })
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

  // Get today's incidents
  const todaysIncidents = recentIncidents.filter((incident) => {
    const incidentDate = new Date(incident.timestamp);
    return incidentDate.toDateString() === today.toDateString();
  }).length;

  // Count by category
  const categoryCounts = filteredIncidents.reduce(
    (acc: Record<string, number>, incident) => {
      const category = incident.category || 'Unknown';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    },
    {}
  );

  // Count by district
  const districts = crimes.reduce((acc: Record<string, number>, crime) => {
    if (selectedCategory === 'all') {
      acc[crime.district_name] =
        (acc[crime.district_name] || 0) + (crime.number_of_crime || 0);
    } else {
      // Count only matching incidents
      const matchCount =
        crime.incidents?.filter(
          (incident: any) => incident.category === selectedCategory
        ).length || 0;

      if (matchCount > 0) {
        acc[crime.district_name] = (acc[crime.district_name] || 0) + matchCount;
      }
    }
    return acc;
  }, {});

  // Group by month
  const incidentsByMonth = Array(12).fill(0);
  filteredIncidents.forEach((incident) => {
    const date = new Date(incident.timestamp);
    const month = date.getMonth();
    if (month >= 0 && month < 12) {
      incidentsByMonth[month]++;
    }
  });

  return {
    todaysIncidents,
    totalIncidents: filteredIncidents.length,
    recentIncidents,
    categoryCounts,
    districts,
    incidentsByMonth,
  };
}
