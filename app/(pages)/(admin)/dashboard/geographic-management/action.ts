'use server';

import db from '@/prisma/db';
import { getInjection } from '@/di/container';
import {
  AuthenticationError,
  UnauthenticatedError,
} from '@/src/entities/errors/auth';
import { NotFoundError, InputParseError } from '@/src/entities/errors/common';
import { createClient } from '@supabase/supabase-js';

/**
 * Initialize district data in the database from GeoJSON
 * This would be run during setup or to sync GeoJSON with the database
 */
// export async function initializeDistrictsFromGeoJSON() {
//   const instrumentationService = getInjection('IInstrumentationService');
//   return await instrumentationService.instrumentServerAction(
//     'InitializeDistricts',
//     { recordResponse: true },
//     async () => {
//       try {
//         // Create batch of districts from GeoJSON
//         const districtsToCreate = districtsGeoJson.features
//           .filter(
//             (feature) => feature.properties && feature.properties.kode_kec
//           )
//           .map((feature) => {
//             // Calculate center point for the district
//             const centroid = calculateCentroid(feature.geometry as any);

//             return {
//               id: feature.properties!.kode_kec,
//               name: feature.properties!.nama || feature.properties!.kecamatan,
//               code: feature.properties!.kode_kec,
//               region: 'Jember',
//               province: feature.properties!.provinsi || 'Jawa Timur',
//               geometry: JSON.stringify(feature.geometry),
//               center_latitude: centroid[1],
//               center_longitude: centroid[0],
//             };
//           });

//         // Create districts in batches to avoid timeouts
//         const batchSize = 10;
//         for (let i = 0; i < districtsToCreate.length; i += batchSize) {
//           const batch = districtsToCreate.slice(i, i + batchSize);

//           await Promise.all(
//             batch.map((district) =>
//               db.districts.upsert({
//                 where: { id: district.id },
//                 update: district,
//                 create: district,
//               })
//             )
//           );
//         }

//         return {
//           success: true,
//           message: `Successfully initialized ${districtsToCreate.length} districts`,
//         };
//       } catch (err) {
//         const crashReporterService = getInjection('ICrashReporterService');
//         crashReporterService.report(err);
//         throw new Error(
//           'An error happened while initializing districts. The developers have been notified.'
//         );
//       }
//     }
//   );
// }

/**
 * Get all district information from database
 */
export async function getAllDistricts() {
  const instrumentationService = getInjection('IInstrumentationService');
  return await instrumentationService.instrumentServerAction(
    'GetAllDistricts',
    { recordResponse: true },
    async () => {
      try {
        const districts = await db.districts.findMany({
          include: {
            geographics: {
              select: {
                id: true,
                latitude: true,
                longitude: true,
                address: true,
                land_area: true,
              },
            },
            cities: true,
            demographics: {
              where: {
                year: {
                  equals: 2024,
                },
              },
            },
          },
          orderBy: {
            name: 'asc',
          },
        });

        return districts;
      } catch (err) {
        const crashReporterService = getInjection('ICrashReporterService');
        crashReporterService.report(err);
        throw new Error(
          'An error happened while fetching districts. The developers have been notified.'
        );
      }
    }
  );
}

/**
 * Get district information by ID
 */
export async function getDistrictById(id: string) {
  const instrumentationService = getInjection('IInstrumentationService');
  return await instrumentationService.instrumentServerAction(
    'GetDistrictById',
    { recordResponse: true },
    async () => {
      try {
        const district = await db.districts.findUnique({
          where: { id },
          include: {
            geographics: {
              select: {
                id: true,
                latitude: true,
                longitude: true,
                address: true,
                land_area: true,
                year: true,
              },
            },
            cities: true,
            demographics: {
              orderBy: {
                year: 'desc',
              },
            },
          },
        });

        if (!district) {
          throw new NotFoundError(`District with ID ${id} not found`);
        }

        return district;
      } catch (err) {
        if (err instanceof NotFoundError) {
          throw err;
        }

        const crashReporterService = getInjection('ICrashReporterService');
        crashReporterService.report(err);
        throw new Error(
          'An error happened while fetching district data. The developers have been notified.'
        );
      }
    }
  );
}

/**
 * Create a new district
 */
export async function createDistrict(data: {
  id: string;
  city_id: string;
  name: string;
}) {
  const instrumentationService = getInjection('IInstrumentationService');
  return await instrumentationService.instrumentServerAction(
    'CreateDistrict',
    { recordResponse: true },
    async () => {
      try {
        // Check if district ID already exists
        const existingDistrict = await db.districts.findUnique({
          where: { id: data.id },
        });

        if (existingDistrict) {
          throw new InputParseError(`District with ID ${data.id} already exists`);
        }

        // Check if city exists
        const city = await db.cities.findUnique({
          where: { id: data.city_id },
        });

        if (!city) {
          throw new InputParseError(`City with ID ${data.city_id} not found`);
        }

        // Create the district
        const district = await db.districts.create({
          data: {
            id: data.id,
            city_id: data.city_id,
            name: data.name,
          },
        });

        return district;
      } catch (err) {
        if (err instanceof InputParseError) {
          throw err;
        }

        if (err instanceof AuthenticationError) {
          throw new AuthenticationError(
            'There was an error with the credentials. Please try again or contact support.'
          );
        }

        const crashReporterService = getInjection('ICrashReporterService');
        crashReporterService.report(err);
        throw new Error(
          'An error happened while creating district. The developers have been notified.'
        );
      }
    }
  );
}

/**
 * Update an existing district
 */
export async function updateDistrict(id: string, data: {
  name?: string;
  city_id?: string;
}) {
  const instrumentationService = getInjection('IInstrumentationService');
  return await instrumentationService.instrumentServerAction(
    'UpdateDistrict',
    { recordResponse: true },
    async () => {
      try {
        // Check if district exists
        const district = await db.districts.findUnique({
          where: { id },
        });

        if (!district) {
          throw new NotFoundError(`District with ID ${id} not found`);
        }

        // If city_id is provided, check if city exists
        if (data.city_id) {
          const city = await db.cities.findUnique({
            where: { id: data.city_id },
          });

          if (!city) {
            throw new InputParseError(`City with ID ${data.city_id} not found`);
          }
        }

        // Update the district
        const updatedDistrict = await db.districts.update({
          where: { id },
          data: {
            name: data.name,
            city_id: data.city_id,
            updated_at: new Date(),
          },
        });

        return updatedDistrict;
      } catch (err) {
        if (err instanceof NotFoundError || err instanceof InputParseError) {
          throw err;
        }

        if (err instanceof AuthenticationError) {
          throw new AuthenticationError(
            'There was an error with the credentials. Please try again or contact support.'
          );
        }

        const crashReporterService = getInjection('ICrashReporterService');
        crashReporterService.report(err);
        throw new Error(
          'An error happened while updating district. The developers have been notified.'
        );
      }
    }
  );
}

/**
 * Delete a district
 */
export async function deleteDistrict(id: string) {
  const instrumentationService = getInjection('IInstrumentationService');
  return await instrumentationService.instrumentServerAction(
    'DeleteDistrict',
    { recordResponse: true },
    async () => {
      try {
        // Check for related records that would prevent deletion
        const relatedCrimes = await db.crimes.count({
          where: { district_id: id },
        });

        if (relatedCrimes > 0) {
          throw new InputParseError(
            `Cannot delete district with ID ${id} because it has related crime records. Please delete those records first.`
          );
        }

        const relatedUnits = await db.units.count({
          where: { district_id: id },
        });

        if (relatedUnits > 0) {
          throw new InputParseError(
            `Cannot delete district with ID ${id} because it has related police units. Please reassign or delete those units first.`
          );
        }

        // Delete related geographics and demographics first
        await db.geographics.deleteMany({
          where: { district_id: id },
        });

        await db.demographics.deleteMany({
          where: { district_id: id },
        });

        // Delete the district
        const deletedDistrict = await db.districts.delete({
          where: { id },
        });

        return deletedDistrict;
      } catch (err) {
        if (err instanceof NotFoundError || err instanceof InputParseError) {
          throw err;
        }

        if (err instanceof AuthenticationError) {
          throw new AuthenticationError(
            'There was an error with the credentials. Please try again or contact support.'
          );
        }

        const crashReporterService = getInjection('ICrashReporterService');
        crashReporterService.report(err);
        throw new Error(
          'An error happened while deleting district. The developers have been notified.'
        );
      }
    }
  );
}

/**
 * Get all cities
 */
export async function getAllCities() {
  const instrumentationService = getInjection('IInstrumentationService');
  return await instrumentationService.instrumentServerAction(
    'GetAllCities',
    { recordResponse: true },
    async () => {
      try {
        const cities = await db.cities.findMany({
          include: {
            districts: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: {
            name: 'asc',
          },
        });

        return cities;
      } catch (err) {
        const crashReporterService = getInjection('ICrashReporterService');
        crashReporterService.report(err);
        throw new Error(
          'An error happened while fetching cities. The developers have been notified.'
        );
      }
    }
  );
}

/**
 * Get city by ID
 */
export async function getCityById(id: string) {
  const instrumentationService = getInjection('IInstrumentationService');
  return await instrumentationService.instrumentServerAction(
    'GetCityById',
    { recordResponse: true },
    async () => {
      try {
        const city = await db.cities.findUnique({
          where: { id },
          include: {
            districts: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        });

        if (!city) {
          throw new NotFoundError(`City with ID ${id} not found`);
        }

        return city;
      } catch (err) {
        if (err instanceof NotFoundError) {
          throw err;
        }

        const crashReporterService = getInjection('ICrashReporterService');
        crashReporterService.report(err);
        throw new Error(
          'An error happened while fetching city. The developers have been notified.'
        );
      }
    }
  );
}

/**
 * Create a new city
 */
export async function createCity(data: {
  id: string;
  name: string;
}) {
  const instrumentationService = getInjection('IInstrumentationService');
  return await instrumentationService.instrumentServerAction(
    'CreateCity',
    { recordResponse: true },
    async () => {
      try {
        // Check if city ID already exists
        const existingCity = await db.cities.findUnique({
          where: { id: data.id },
        });

        if (existingCity) {
          throw new InputParseError(`City with ID ${data.id} already exists`);
        }

        // Create the city
        const city = await db.cities.create({
          data: {
            id: data.id,
            name: data.name,
          },
        });

        return city;
      } catch (err) {
        if (err instanceof InputParseError) {
          throw err;
        }

        if (err instanceof AuthenticationError) {
          throw new AuthenticationError(
            'There was an error with the credentials. Please try again or contact support.'
          );
        }

        const crashReporterService = getInjection('ICrashReporterService');
        crashReporterService.report(err);
        throw new Error(
          'An error happened while creating city. The developers have been notified.'
        );
      }
    }
  );
}

/**
 * Update a city
 */
export async function updateCity(id: string, data: {
  name?: string;
}) {
  const instrumentationService = getInjection('IInstrumentationService');
  return await instrumentationService.instrumentServerAction(
    'UpdateCity',
    { recordResponse: true },
    async () => {
      try {
        // Check if city exists
        const city = await db.cities.findUnique({
          where: { id },
        });

        if (!city) {
          throw new NotFoundError(`City with ID ${id} not found`);
        }

        // Update the city
        const updatedCity = await db.cities.update({
          where: { id },
          data: {
            name: data.name,
            updated_at: new Date(),
          },
        });

        return updatedCity;
      } catch (err) {
        if (err instanceof NotFoundError) {
          throw err;
        }

        if (err instanceof AuthenticationError) {
          throw new AuthenticationError(
            'There was an error with the credentials. Please try again or contact support.'
          );
        }

        const crashReporterService = getInjection('ICrashReporterService');
        crashReporterService.report(err);
        throw new Error(
          'An error happened while updating city. The developers have been notified.'
        );
      }
    }
  );
}

/**
 * Delete a city
 */
export async function deleteCity(id: string) {
  const instrumentationService = getInjection('IInstrumentationService');
  return await instrumentationService.instrumentServerAction(
    'DeleteCity',
    { recordResponse: true },
    async () => {
      try {
        // Check for related districts that would prevent deletion
        const relatedDistricts = await db.districts.count({
          where: { city_id: id },
        });

        if (relatedDistricts > 0) {
          throw new InputParseError(
            `Cannot delete city with ID ${id} because it has related districts. Please delete those districts first.`
          );
        }

        const relatedUnits = await db.units.count({
          where: { city_id: id },
        });

        if (relatedUnits > 0) {
          throw new InputParseError(
            `Cannot delete city with ID ${id} because it has related police units. Please reassign or delete those units first.`
          );
        }

        // Delete the city
        const deletedCity = await db.cities.delete({
          where: { id },
        });

        return deletedCity;
      } catch (err) {
        if (err instanceof NotFoundError || err instanceof InputParseError) {
          throw err;
        }

        if (err instanceof AuthenticationError) {
          throw new AuthenticationError(
            'There was an error with the credentials. Please try again or contact support.'
          );
        }

        const crashReporterService = getInjection('ICrashReporterService');
        crashReporterService.report(err);
        throw new Error(
          'An error happened while deleting city. The developers have been notified.'
        );
      }
    }
  );
}

/**
 * Helper to create geographic data with Supabase PostGIS support
 */
async function createGeographicWithSupabase({
  district_id,
  address,
  longitude,
  latitude,
  land_area,
  polygon,
  geometry,
  description,
  type,
  year,
}: {
  district_id: string;
  address: string;
  longitude: number;
  latitude: number;
  land_area?: number;
  polygon?: any;
  geometry?: any;
  description?: string;
  type?: string;
  year?: number;
}) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Insert geographic with PostGIS point
  const { data, error } = await supabase
    .from("geographics")
    .insert([
      {
        district_id,
        address,
        longitude,
        latitude,
        land_area,
        polygon,
        geometry,
        description,
        type,
        year,
        location: `POINT(${longitude} ${latitude})`,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Create geographic data for a district
 */
export async function createGeographic(data: {
  district_id: string;
  address: string;
  longitude: number;
  latitude: number;
  land_area?: number;
  description?: string;
  type?: string;
  year?: number;
  polygon?: string;
  geometry?: string;
}) {
  const instrumentationService = getInjection('IInstrumentationService');
  return await instrumentationService.instrumentServerAction(
    'CreateGeographic',
    { recordResponse: true },
    async () => {
      try {
        // Check if district exists
        const district = await db.districts.findUnique({
          where: { id: data.district_id },
        });

        if (!district) {
          throw new InputParseError(`District with ID ${data.district_id} not found`);
        }

        // Use Supabase to insert geographic with PostGIS point
        const supaGeo = await createGeographicWithSupabase({
          district_id: data.district_id,
          address: data.address,
          longitude: data.longitude,
          latitude: data.latitude,
          land_area: data.land_area,
          polygon: data.polygon ? JSON.parse(data.polygon) : undefined,
          geometry: data.geometry ? JSON.parse(data.geometry) : undefined,
          description: data.description,
          type: data.type,
          year: data.year,
        });

        // Fetch the geographic from Prisma after insert to get the correct relation
        const geographic = await db.geographics.findUnique({ where: { id: supaGeo.id } });

        if (!geographic) {
          throw new Error('Failed to fetch newly created geographic data');
        }

        return geographic;
      } catch (err) {
        if (err instanceof InputParseError) {
          throw err;
        }

        if (err instanceof AuthenticationError) {
          throw new AuthenticationError(
            'There was an error with the credentials. Please try again or contact support.'
          );
        }

        const crashReporterService = getInjection('ICrashReporterService');
        crashReporterService.report(err);
        throw new Error(
          'An error happened while creating geographic data. The developers have been notified.'
        );
      }
    }
  );
}

/**
 * Delete geographic data
 */
export async function deleteGeographic(id: string) {
  const instrumentationService = getInjection('IInstrumentationService');
  return await instrumentationService.instrumentServerAction(
    'DeleteGeographic',
    { recordResponse: true },
    async () => {
      try {
        // Delete the geographic data
        const deletedGeographic = await db.geographics.delete({
          where: { id },
        });

        return deletedGeographic;
      } catch (err) {
        if (err instanceof NotFoundError) {
          throw err;
        }

        if (err instanceof AuthenticationError) {
          throw new AuthenticationError(
            'There was an error with the credentials. Please try again or contact support.'
          );
        }

        const crashReporterService = getInjection('ICrashReporterService');
        crashReporterService.report(err);
        throw new Error(
          'An error happened while deleting geographic data. The developers have been notified.'
        );
      }
    }
  );
}

/**
 * Get demographic data by district ID
 */
export async function getDemographicsByDistrict(district_id: string) {
  const instrumentationService = getInjection('IInstrumentationService');
  return await instrumentationService.instrumentServerAction(
    'GetDemographicsByDistrict',
    { recordResponse: true },
    async () => {
      try {
        const demographics = await db.demographics.findMany({
          where: { district_id },
          orderBy: { year: 'desc' },
        });

        return demographics;
      } catch (err) {
        const crashReporterService = getInjection('ICrashReporterService');
        crashReporterService.report(err);
        throw new Error(
          'An error happened while fetching demographic data. The developers have been notified.'
        );
      }
    }
  );
}

/**
 * Create demographic data for a district
 */
export async function createDemographic(data: {
  district_id: string;
  population: number;
  number_of_unemployed: number;
  population_density: number;
  year: number;
}) {
  const instrumentationService = getInjection('IInstrumentationService');
  return await instrumentationService.instrumentServerAction(
    'CreateDemographic',
    { recordResponse: true },
    async () => {
      try {
        // Check if district exists
        const district = await db.districts.findUnique({
          where: { id: data.district_id },
        });

        if (!district) {
          throw new InputParseError(`District with ID ${data.district_id} not found`);
        }

        // Check if demographic data for this district/year already exists
        const existingDemographic = await db.demographics.findFirst({
          where: {
            district_id: data.district_id,
            year: data.year,
          },
        });

        if (existingDemographic) {
          throw new InputParseError(
            `Demographic data for district ${data.district_id} and year ${data.year} already exists`
          );
        }

        // Create the demographic data
        const demographic = await db.demographics.create({
          data: {
            district_id: data.district_id,
            population: data.population,
            number_of_unemployed: data.number_of_unemployed,
            population_density: data.population_density,
            year: data.year,
          },
        });

        return demographic;
      } catch (err) {
        if (err instanceof InputParseError) {
          throw err;
        }

        if (err instanceof AuthenticationError) {
          throw new AuthenticationError(
            'There was an error with the credentials. Please try again or contact support.'
          );
        }

        const crashReporterService = getInjection('ICrashReporterService');
        crashReporterService.report(err);
        throw new Error(
          'An error happened while creating demographic data. The developers have been notified.'
        );
      }
    }
  );
}

/**
 * Update demographic data
 */
export async function updateDemographic(id: string, data: {
  population?: number;
  number_of_unemployed?: number;
  population_density?: number;
}) {
  const instrumentationService = getInjection('IInstrumentationService');
  return await instrumentationService.instrumentServerAction(
    'UpdateDemographic',
    { recordResponse: true },
    async () => {
      try {
        // Check if demographic exists
        const demographic = await db.demographics.findUnique({
          where: { id },
        });

        if (!demographic) {
          throw new NotFoundError(`Demographic data with ID ${id} not found`);
        }

        // Update the demographic
        const updatedDemographic = await db.demographics.update({
          where: { id },
          data: {
            population: data.population,
            number_of_unemployed: data.number_of_unemployed,
            population_density: data.population_density,
            updated_at: new Date(),
          },
        });

        return updatedDemographic;
      } catch (err) {
        if (err instanceof NotFoundError) {
          throw err;
        }

        if (err instanceof AuthenticationError) {
          throw new AuthenticationError(
            'There was an error with the credentials. Please try again or contact support.'
          );
        }

        const crashReporterService = getInjection('ICrashReporterService');
        crashReporterService.report(err);
        throw new Error(
          'An error happened while updating demographic data. The developers have been notified.'
        );
      }
    }
  );
}

/**
 * Delete demographic data
 */
export async function deleteDemographic(id: string) {
  const instrumentationService = getInjection('IInstrumentationService');
  return await instrumentationService.instrumentServerAction(
    'DeleteDemographic',
    { recordResponse: true },
    async () => {
      try {
        // Delete the demographic data
        const deletedDemographic = await db.demographics.delete({
          where: { id },
        });

        return deletedDemographic;
      } catch (err) {
        if (err instanceof NotFoundError) {
          throw err;
        }

        if (err instanceof AuthenticationError) {
          throw new AuthenticationError(
            'There was an error with the credentials. Please try again or contact support.'
          );
        }

        const crashReporterService = getInjection('ICrashReporterService');
        crashReporterService.report(err);
        throw new Error(
          'An error happened while deleting demographic data. The developers have been notified.'
        );
      }
    }
  );
}
