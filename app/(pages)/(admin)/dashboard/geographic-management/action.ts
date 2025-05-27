'use server';

import db from '@/prisma/db';
import { getInjection } from '@/di/container';
import {
  AuthenticationError,
  UnauthenticatedError,
} from '@/src/entities/errors/auth';
import { NotFoundError } from '@/src/entities/errors/common';


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
          where: {
            geographics: {
              some: {
                year: {
                  equals: 2024,
                },
              },
            },
          },
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
          where: {
            id,
            geographics: {
              some: {
                year: {
                  equals: 2024,
                },
              },
            },
          },
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
