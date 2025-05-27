"use server";

import { getSeverity } from "@/app/_utils/crime";
import { createClient } from "@/app/_utils/supabase/client";

import {
  ICrimes,
  ICrimesByYearAndMonth,
  IDistanceResult,
  IIncidentLogs,
} from "@/app/_utils/types/crimes";
import { getInjection } from "@/di/container";
import db from "@/prisma/db";
import {
  AuthenticationError,
  UnauthenticatedError,
} from "@/src/entities/errors/auth";
import { InputParseError } from "@/src/entities/errors/common";

export async function getAvailableYears() {
  const instrumentationService = getInjection("IInstrumentationService");
  return await instrumentationService.instrumentServerAction(
    "Available Years",
    { recordResponse: true },
    async () => {
      try {
        const years = await db.crimes.findMany({
          select: {
            year: true,
          },
          distinct: ["year"],
          orderBy: {
            year: "asc",
          },
        });

        return years.map((year) => year.year);
      } catch (err) {
        if (err instanceof InputParseError) {
          throw new InputParseError(err.message);
        }

        if (err instanceof AuthenticationError) {
          throw new AuthenticationError(
            "There was an error with the credentials. Please try again or contact support.",
          );
        }

        const crashReporterService = getInjection("ICrashReporterService");
        crashReporterService.report(err);
        throw new Error(
          "An error happened. The developers have been notified. Please try again later.",
        );
      }
    },
  );
}

export async function getCrimeCategories() {
  const instrumentationService = getInjection("IInstrumentationService");
  return await instrumentationService.instrumentServerAction(
    "Crime Categories",
    { recordResponse: true },
    async () => {
      try {
        const categories = await db.crime_categories.findMany({
          select: {
            id: true,
            name: true,
            type: true,
          },
        });

        return categories;
      } catch (err) {
        if (err instanceof InputParseError) {
          throw new InputParseError(err.message);
        }

        if (err instanceof AuthenticationError) {
          throw new AuthenticationError(
            "There was an error with the credentials. Please try again or contact support.",
          );
        }

        const crashReporterService = getInjection("ICrashReporterService");
        crashReporterService.report(err);
        throw new Error(
          "An error happened. The developers have been notified. Please try again later.",
        );
      }
    },
  );
}

export async function getCrimes(): Promise<ICrimes[]> {
  const instrumentationService = getInjection("IInstrumentationService");
  return await instrumentationService.instrumentServerAction(
    "District Crime Data",
    { recordResponse: true },
    async () => {
      try {
        const crimes = await db.crimes.findMany({
          include: {
            districts: {
              select: {
                name: true,
                geographics: {
                  select: {
                    address: true,
                    land_area: true,
                    year: true,
                    latitude: true,
                    longitude: true,
                  },
                },
                demographics: {
                  select: {
                    number_of_unemployed: true,
                    population: true,
                    population_density: true,
                    year: true,
                  },
                },
              },
            },
            crime_incidents: {
              select: {
                id: true,
                timestamp: true,
                description: true,
                status: true,
                crime_categories: {
                  select: {
                    name: true,
                    type: true,
                  },
                },
                locations: {
                  select: {
                    address: true,
                    latitude: true,
                    longitude: true,
                    distance_to_unit: true
                  },
                },
              },
            },
          },
        });

        return crimes;
      } catch (err) {
        if (err instanceof InputParseError) {
          throw new InputParseError(err.message);
        }

        if (err instanceof AuthenticationError) {
          throw new AuthenticationError(
            "There was an error with the credentials. Please try again or contact support.",
          );
        }

        const crashReporterService = getInjection("ICrashReporterService");
        crashReporterService.report(err);
        throw new Error(
          "An error happened. The developers have been notified. Please try again later.",
        );
      }
    },
  );
}

export async function getRecentIncidents(): Promise<IIncidentLogs[]> {
  const instrumentationService = getInjection("IInstrumentationService");
  return await instrumentationService.instrumentServerAction(
    "Recent Incidents",
    { recordResponse: true },
    async () => {
      try {
        const now = new Date();
        const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        const incidents = await db.incident_logs.findMany({
          where: {
            time: {
              gte: yesterday,
              lte: now,
            },
          },
          orderBy: {
            time: "desc",
          },
          include: {
            user: {
              select: {
                id: true,
                email: true,
                phone: true,
                role: {
                  select: {
                    id: true,
                    name: true,
                  }
                },
                profile: {
                  select: {
                    username: true,
                    first_name: true,
                    last_name: true,
                    avatar: true,
                  }
                }
              },
            },
            crime_categories: {
              select: {
                name: true,
                type: true,
              },
            },
            locations: {
              select: {
                districts: {
                  select: {
                    name:true
                  }
                },
                address: true,
                latitude: true,
                longitude: true,
              },
            },
          },
        });

        if (!incidents) {
          console.error("No incidents found");
          return [];
        }


        // Map DB result to IIncidentLogs interface
        return incidents.map((incident) => ({
          id: incident.id,
          user_id: incident.user_id,
          role_id: incident.user?.role?.id,
          name: `${incident.user?.profile?.first_name} ${incident.user?.profile?.last_name}`,
          email: incident.user?.email,
          phone: incident.user?.phone ?? "",
          role: incident.user?.role?.name,
          avatar: incident.user?.profile?.avatar ?? "",
          latitude: incident.locations?.latitude ?? null,
          longitude: incident.locations?.longitude ?? null,
          district: incident.locations.districts.name ?? "",
          address: incident.locations?.address ?? "",
          category: incident.crime_categories?.name ?? "",
          source: incident.source ?? "",
          description: incident.description ?? "",
          verified: incident.verified ?? false,
          severity: getSeverity(incident.crime_categories.name),
          timestamp: incident.time,
          created_at: incident.created_at ?? incident.time ?? new Date(),
          updated_at: incident.updated_at ?? incident.time ?? new Date(),
        }));
        
      } catch (err) {
        if (err instanceof InputParseError) {
          throw new InputParseError(err.message);
        }

        if (err instanceof AuthenticationError) {
          throw new AuthenticationError(
            "There was an error with the credentials. Please try again or contact support.",
          );
        }

        const crashReporterService = getInjection("ICrashReporterService");
        crashReporterService.report(err);
        throw new Error(
          "An error happened. The developers have been notified. Please try again later.",
        );
      }
    },
  );
}

export async function getCrimeByYearAndMonth(
  year: number,
  month: number | "all",
): Promise<ICrimesByYearAndMonth[]> {
  const instrumentationService = getInjection("IInstrumentationService");
  return await instrumentationService.instrumentServerAction(
    "District Crime Data",
    { recordResponse: true },
    async () => {
      try {
        const whereClause: any = {
          year: year,
        };

        if (month !== "all") {
          whereClause.month = month;
        }

        const crimes = await db.crimes.findMany({
          where: whereClause,
          include: {
            districts: {
              select: {
                name: true,
                geographics: {
                  where: { year },
                  select: {
                    address: true,
                    land_area: true,
                    year: true,
                    latitude: true,
                    longitude: true,
                  },
                },
                demographics: {
                  where: { year },
                  select: {
                    number_of_unemployed: true,
                    population: true,
                    population_density: true,
                    year: true,
                  },
                },
              },
            },
            crime_incidents: {
              select: {
                id: true,
                timestamp: true,
                description: true,
                status: true,
                crime_categories: {
                  select: {
                    name: true,
                    type: true,
                  },
                },
                locations: {
                  select: {
                    address: true,
                    latitude: true,
                    longitude: true,
                  },
                },
              },
            },
          },
        });

        const processedCrimes = crimes.map((crime) => {
          return {
            ...crime,
            districts: {
              ...crime.districts,
              geographics: crime.districts.geographics[0] || null,
              demographics: crime.districts.demographics[0] || null,
            },
          };
        });

        return processedCrimes;
      } catch (err) {
        if (err instanceof InputParseError) {
          throw new InputParseError(err.message);
        }

        if (err instanceof AuthenticationError) {
          throw new AuthenticationError(
            "There was an error with the credentials. Please try again or contact support.",
          );
        }

        const crashReporterService = getInjection("ICrashReporterService");
        crashReporterService.report(err);
        throw new Error(
          "An error happened. The developers have been notified. Please try again later.",
        );
      }
    },
  );
}

/**
 * Calculate distances between units and incidents using PostGIS
 * @param unitId Optional unit code to filter by specific unit
 * @param districtId Optional district ID to filter by specific district
 * @returns Array of distance calculations between units and incidents
 */
export async function calculateDistances(
  p_unit_id?: string,
  p_district_id?: string,
): Promise<IDistanceResult[]> {
  const instrumentationService = getInjection("IInstrumentationService");
  return await instrumentationService.instrumentServerAction(
    "Calculate Distances",
    { recordResponse: true },
    async () => {
      const supabase = createClient();

      try {
        const { data, error } = await supabase.rpc(
          "calculate_unit_incident_distances",
          {
            p_unit_id: p_unit_id || null,
            p_district_id: p_district_id || null,
          },
        );

        if (error) {
          console.error("Error calculating distances:", error);
          return [];
        }

        return data as IDistanceResult[] || [];
      } catch (error) {
        const crashReporterService = getInjection("ICrashReporterService");
        crashReporterService.report(error);
        console.error("Failed to calculate distances:", error);
        return [];
      }
    },
  );
}

export async function getCrimesTypes(): Promise<string[]> {
  const instrumentationService = getInjection("IInstrumentationService");
  return await instrumentationService.instrumentServerAction(
    "Crime Types",
    { recordResponse: true },
    async () => {
      try {
        const types = await db.crimes.findMany({
          distinct: ["source_type"],
          select: {
            source_type: true,
          },
        });

        // Return a clean array of strings with no nulls
        return types
          .map((t) => t.source_type)
          .filter((t): t is string => t !== null && t !== undefined);

      } catch (err) {
        if (err instanceof InputParseError) {
          throw new InputParseError(err.message);
        }

        if (err instanceof AuthenticationError) {
          throw new AuthenticationError(
            "There was an error with the credentials. Please try again or contact support.",
          );
        }

        const crashReporterService = getInjection("ICrashReporterService");
        crashReporterService.report(err);
        throw new Error(
          "An error happened. The developers have been notified. Please try again later.",
        );
      }
    },
  );
}

export async function getActiveOfficers() {
  const instrumentationService = getInjection("IInstrumentationService");
  return await instrumentationService.instrumentServerAction(
    "Active Officers",
    { recordResponse: true },
    async () => {
      try {
        // Get patrol units that are on duty (using correct status value)
        const onDutyPatrolUnits = await db.patrol_units.findMany({
          where: {
            status: "on duty",
          },
          include: {
            members: {
              where: {
                is_banned: false,
              },
              select: {
                id: true,
                name: true,
                rank: true,
                avatar: true,
                nrp: true,
                position: true,
                units: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        });

        // Count unique officers from on-duty patrol units
        const activeOfficersSet = new Set();
        onDutyPatrolUnits.forEach(unit => {
          unit.members.forEach(officer => {
            activeOfficersSet.add(officer.id);
          });
        });

        const onDutyCount = activeOfficersSet.size;

        // Get total number of non-banned officers for comparison
        const totalOfficers = await db.officers.count({
          where: {
            is_banned: false,
          },
        });

        return {
          totalOfficers,
          onDutyCount,
        };
      } catch (err) {
        const crashReporterService = getInjection("ICrashReporterService");
        crashReporterService.report(err);
        throw new Error("Failed to fetch active officers data");
      }
    },
  );
}

export async function getDepartmentPerformance() {
  const instrumentationService = getInjection("IInstrumentationService");
  return await instrumentationService.instrumentServerAction(
    "Department Performance",
    { recordResponse: true },
    async () => {
      try {
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth() + 1;

        // Get total crimes and cleared crimes for case clearance rate
        const crimeStats = await db.crimes.aggregate({
          where: {
            year: currentYear,
            month: currentMonth,
          },
          _sum: {
            number_of_crime: true,
            crime_cleared: true,
          },
        });

        const totalCrimes = crimeStats._sum.number_of_crime || 0;
        const clearedCrimes = crimeStats._sum.crime_cleared || 0;
        const clearanceRate = totalCrimes > 0 ? Math.round((clearedCrimes / totalCrimes) * 100) : 0;

        // Calculate average response time from incident logs (mock calculation)
        const recentIncidents = await db.incident_logs.findMany({
          where: {
            created_at: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
            },
          },
          take: 100,
        });

        const avgResponseTime = 4.2; // Mock calculation - you can implement actual response time logic

        // Evidence processing rate (mock - based on verified incidents)
        const verifiedIncidents = await db.incident_logs.count({
          where: {
            verified: true,
            created_at: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            },
          },
        });

        const totalIncidents = await db.incident_logs.count({
          where: {
            created_at: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            },
          },
        });

        const evidenceProcessingRate = totalIncidents > 0 ? Math.round((verifiedIncidents / totalIncidents) * 100) : 0;

        return {
          caseClearanceRate: clearanceRate,
          avgResponseTime,
          evidenceProcessingRate,
        };
      } catch (err) {
        const crashReporterService = getInjection("ICrashReporterService");
        crashReporterService.report(err);
        throw new Error("Failed to fetch department performance data");
      }
    },
  );
}

export async function getCrimeStatistics() {
  const instrumentationService = getInjection("IInstrumentationService");
  return await instrumentationService.instrumentServerAction(
    "Crime Statistics",
    { recordResponse: true },
    async () => {
      try {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);

        // Get current period crime incidents
        const crimeIncidents = await db.crime_incidents.findMany({
          where: {
            timestamp: {
              gte: thirtyDaysAgo,
            },
          },
          include: {
            crime_categories: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        });

        // Get previous period crime incidents
        const previousPeriodIncidents = await db.crime_incidents.findMany({
          where: {
            timestamp: {
              gte: sixtyDaysAgo,
              lt: thirtyDaysAgo,
            },
          },
          include: {
            crime_categories: {
              select: {
                id: true,
              },
            },
          },
        });

        // Calculate total crimes in the last 30 days
        const totalCrimes = crimeIncidents.length;

        // Count incidents by category for current period
        const categoryCountMap = crimeIncidents.reduce((acc, incident) => {
          const categoryId = incident.crime_categories.id;
          acc[categoryId] = (acc[categoryId] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        // Count incidents by category for previous period
        const previousCountMap = previousPeriodIncidents.reduce((acc, incident) => {
          const categoryId = incident.crime_categories.id;
          acc[categoryId] = (acc[categoryId] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        // Create category stats array
        const categoryStats = Object.entries(categoryCountMap).map(([categoryId, count]) => {
          const category = crimeIncidents.find(
            incident => incident.crime_categories.id === categoryId
          )?.crime_categories;

          if (!category) return null;

          const previousCount = previousCountMap[categoryId] || 0;
          const percentage = totalCrimes > 0 ? (count / totalCrimes) * 100 : 0;
          const change = previousCount > 0
            ? ((count - previousCount) / previousCount * 100).toFixed(1) + '%'
            : 'N/A';

          return {
            id: categoryId,
            name: category.name,
            count,
            percentage,
            change,
            isIncrease: count > previousCount
          };
        }).filter(Boolean);

        // Sort categories by count and take top 3
        const topCategories = categoryStats
          .sort((a, b) => b!.count - a!.count)
          .slice(0, 3);

        return {
          totalCrimes,
          categories: topCategories,
          timeRange: "Last 30 days"
        };
      } catch (error) {
        const crashReporterService = getInjection("ICrashReporterService");
        crashReporterService.report(error);
        console.error('Error fetching crime statistics:', error);
        throw new Error('Failed to fetch crime statistics');
      }
    },
  );
}

export async function getHighPriorityCases() {
  const instrumentationService = getInjection("IInstrumentationService");
  return await instrumentationService.instrumentServerAction(
    "High Priority Cases",
    { recordResponse: true },
    async () => {
      try {
        // First, try to fetch from crime_incidents
        let highPriorityCases = [];

        // Get unresolved cases from crime_incidents
        const unresolvedCrimeIncidents = await db.crime_incidents.findMany({
          where: {
            status: {
              in: ["open", "under_investigation"]
            },
          },
          include: {
            crime_categories: {
              select: {
                name: true,
                type: true,
              },
            },
            locations: {
              select: {
                address: true,
                districts: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
          orderBy: {
            timestamp: "desc",
          },
        });

        // Also get unverified incident_logs
        const unverifiedIncidentLogs = await db.incident_logs.findMany({
          where: {
            verified: false,
          },
          include: {
            crime_categories: {
              select: {
                name: true,
                type: true,
              },
            },
            locations: {
              select: {
                address: true,
                districts: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
          orderBy: {
            time: "desc",
          },
        });

        // Process crime_incidents
        const processedCrimeIncidents = unresolvedCrimeIncidents.map((case_) => {
          const severity = getSeverity(case_.crime_categories.name);

          return {
            id: case_.id,
            type: case_.crime_categories.name,
            location: case_.locations.districts.name,
            priority: severity === "High" ? "Critical" :
              severity === "Medium" ? "High" : "Medium",
            time: `${Math.floor((Date.now() - case_.timestamp.getTime()) / (1000 * 60 * 60))}h ago`,
            source: "crime_incidents",
            severity: severity,
            timestamp: case_.timestamp,
          };
        });

        // Process incident_logs
        const processedIncidentLogs = unverifiedIncidentLogs.map((incident) => {
          const severity = getSeverity(incident.crime_categories.name);

          return {
            id: incident.id,
            type: incident.crime_categories.name,
            location: incident.locations.districts.name,
            priority: severity === "High" ? "Critical" :
              severity === "Medium" ? "High" : "Medium",
            time: `${Math.floor((Date.now() - incident.time.getTime()) / (1000 * 60 * 60))}h ago`,
            source: "incident_logs",
            severity: severity,
            timestamp: incident.time,
          };
        });

        // Combine and sort by severity and timestamp
        const combinedCases = [...processedCrimeIncidents, ...processedIncidentLogs]
          .sort((a, b) => {
            // First sort by severity (High > Medium > Low > Unknown)
            const severityOrder = { "High": 4, "Medium": 3, "Low": 2, "Unknown": 1 };
            const severityDiff = severityOrder[b.severity as keyof typeof severityOrder] -
              severityOrder[a.severity as keyof typeof severityOrder];

            // If same severity, sort by timestamp (newest first)
            if (severityDiff === 0) {
              return b.timestamp.getTime() - a.timestamp.getTime();
            }

            return severityDiff;
          });

        // Return only the top 4 cases
        return combinedCases.slice(0, 4);
      } catch (err) {
        const crashReporterService = getInjection("ICrashReporterService");
        crashReporterService.report(err);
        throw new Error("Failed to fetch high priority cases");
      }
    },
  );
}

export async function getRecentArrests() {
  const instrumentationService = getInjection("IInstrumentationService");
  return await instrumentationService.instrumentServerAction(
    "Top Crime Categories Last Month",
    { recordResponse: true },
    async () => {
      try {
        const now = new Date();
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        // Get incidents from the last month
        const lastMonthIncidents = await db.incident_logs.findMany({
          where: {
            created_at: {
              gte: lastMonth,
              lt: currentMonth,
            },
          },
          include: {
            crime_categories: {
              select: {
                name: true,
                type: true,
              },
            },
          },
        });

        // Group incidents by crime category and count them
        const categoryCount = lastMonthIncidents.reduce((acc, incident) => {
          const categoryName = incident.crime_categories.name;
          acc[categoryName] = (acc[categoryName] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        // Get top 10 categories by incident count
        const topCategories = Object.entries(categoryCount)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 10)
          .map(([category, count]) => ({
            name: category,
            count,
          }));

        const totalIncidents = lastMonthIncidents.length;

        return {
          totalIncidents,
          topCategories,
        };
      } catch (err) {
        const crashReporterService = getInjection("ICrashReporterService");
        crashReporterService.report(err);
        throw new Error("Failed to fetch top crime categories data");
      }
    },
  );
}

export async function getPersonsOfInterest() {
  const instrumentationService = getInjection("IInstrumentationService");
  return await instrumentationService.instrumentServerAction(
    "Recent Reporters",
    { recordResponse: true },
    async () => {
      try {
        // Get recent incident logs with user information
        const recentReports = await db.incident_logs.findMany({
          orderBy: {
            created_at: "desc",
          },
          include: {
            user: {
              select: {
                id: true,
                email: true,
                phone: true,
                profile: {
                  select: {
                    first_name: true,
                    last_name: true,
                    avatar: true,
                    username: true,
                  },
                },
              },
            },
            crime_categories: {
              select: {
                name: true,
                type: true,
              },
            },
          },
          take: 3,
        });

        console.log("Recent Reports:", recentReports);

        // Transform data for the component
        return recentReports.map((report) => ({
          id: report.id,
          userId: report.user_id,
          name: `${report.user.profile?.first_name || "Unknown"} ${report.user.profile?.last_name || "User"}`,
          email: report.user.email,
          phone: report.user.phone || "Not provided",
          avatar: report.user.profile?.avatar || null,
          username: report.user.profile?.username || "user",
          reportType: report.crime_categories.name,
          reportDate: report.created_at || new Date(),
          verified: report.verified ? "Verified" : "Pending",
          status: report.verified ? "Confirmed" : "Reviewing",
        }));
      } catch (err) {
        const crashReporterService = getInjection("ICrashReporterService");
        crashReporterService.report(err);
        throw new Error("Failed to fetch recent reporters data");
      }
    },
  );
}

export async function getEvidenceTracking() {
  const instrumentationService = getInjection("IInstrumentationService");
  return await instrumentationService.instrumentServerAction(
    "Evidence Tracking",
    { recordResponse: true },
    async () => {
      try {
        const evidence = await db.evidence.findMany({
          include: {
            incident: {
              select: {
                id: true,
              },
            },
          },
          orderBy: {
            uploaded_at: "desc",
          },
          take: 3,
        });

        return evidence.map((item) => ({
          id: item.id,
          type: item.type.charAt(0).toUpperCase() + item.type.slice(1),
          case: `CR-${item.incident.id.slice(0, 4)}`,
          status: Math.random() > 0.5 ? "Processing" : Math.random() > 0.5 ? "Secured" : "Lab Analysis",
        }));
      } catch (err) {
        const crashReporterService = getInjection("ICrashReporterService");
        crashReporterService.report(err);
        throw new Error("Failed to fetch evidence tracking data");
      }
    },
  );
}

export async function getEmergencyCallsMetrics() {
  const instrumentationService = getInjection("IInstrumentationService");
  return await instrumentationService.instrumentServerAction(
    "Emergency Calls Metrics",
    { recordResponse: true },
    async () => {
      try {
        // Get current hour range
        const currentHour = new Date();
        currentHour.setMinutes(0, 0, 0);
        const nextHour = new Date(currentHour.getTime() + 60 * 60 * 1000);

        // Get the past hour for response calculations
        const pastHour = new Date(currentHour.getTime() - 60 * 60 * 1000);

        // Count incident logs created in the current hour
        const callsThisHour = await db.incident_logs.count({
          where: {
            created_at: {
              gte: currentHour,
              lt: nextHour,
            },
          },
        });

        // Count patrol units that were recently updated (active in the last hour)
        const respondingUnits = await db.patrol_units.findMany({
          where: {
            updated_at: {
              gte: pastHour,
            },
            status: "on duty",
          },
        });

        // Count total active patrol units
        const totalUnits = await db.patrol_units.count({
          where: {
            status: "on duty",
          },
        });

        // Calculate approximate wait time by comparing incident logs and patrol unit timestamps
        // Get recent incidents from last 24 hours
        const recentIncidents = await db.incident_logs.findMany({
          where: {
            created_at: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
            },
            // Try to get only incidents that have been handled
            updated_at: {
              not: null,
            },
          },
          select: {
            id: true,
            created_at: true,
            updated_at: true,
          },
          take: 30, // Limit to reasonable sample size
        });

        // Calculate average wait time - using the difference between created_at and updated_at
        // as a proxy for response time
        let totalWaitTimeMinutes = 0;
        let countWithResponse = 0;

        recentIncidents.forEach(incident => {
          if (incident.updated_at && incident.created_at) {
            const waitTime = incident.updated_at.getTime() - incident.created_at.getTime();
            // Only count positive wait times that are less than 24 hours (to filter out anomalies)
            if (waitTime > 0 && waitTime < 24 * 60 * 60 * 1000) {
              totalWaitTimeMinutes += waitTime / (1000 * 60); // Convert to minutes
              countWithResponse++;
            }
          }
        });

        let averageWaitMinutes = 0;
        let averageWait = "0:00";

        if (countWithResponse > 0) {
          averageWaitMinutes = Math.round(totalWaitTimeMinutes / countWithResponse);
          const minutes = Math.floor(averageWaitMinutes);
          const seconds = Math.floor((averageWaitMinutes - minutes) * 60);
          averageWait = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }

        return {
          callsThisHour,
          averageWait,
          operatorsAvailable: respondingUnits.length,
          totalOperators: totalUnits,
        };
      } catch (err) {
        const crashReporterService = getInjection("ICrashReporterService");
        crashReporterService.report(err);
        throw new Error("Failed to fetch emergency calls metrics");
      }
    },
  );
}


