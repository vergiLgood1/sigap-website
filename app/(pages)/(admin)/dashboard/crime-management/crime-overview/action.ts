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


