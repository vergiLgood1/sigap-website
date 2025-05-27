'use server';

import { createClient } from '@/app/_utils/supabase/client';
import { IUnits } from '@/app/_utils/types/units';
import { getInjection } from '@/di/container';
import db from '@/prisma/db';
import { AuthenticationError } from '@/src/entities/errors/auth';
import { InputParseError } from '@/src/entities/errors/common';

export interface INearestUnits {
  code_unit: string;
  name: string;
  type: string;
  address: string;
  district_id: string;
  lat_unit: number;
  lon_unit: number;
  distance_meters: number;
}

const supabase = createClient();

export async function getUnits(): Promise<IUnits[]> {
  const instrumentationService = getInjection('IInstrumentationService');
  return await instrumentationService.instrumentServerAction(
    'District Crime Data',
    { recordResponse: true },
    async () => {
      try {
        const units = await db.units.findMany({
          include: {
            districts: {
              select: {
                name: true,
              },
            },
          },
        });

        return units
          .filter((unit) => unit.district_id !== null)
          .map((unit) => ({
            ...unit,
            district_id: unit.district_id as string,
            district_name: unit.districts?.name ?? '',
          }));

      } catch (err) {
        if (err instanceof InputParseError) {
          // return {
          //   error: err.message,
          // };

          throw new InputParseError(err.message);
        }

        if (err instanceof AuthenticationError) {
          // return {
          //   error: 'User not found.',
          // };

          throw new AuthenticationError(
            'There was an error with the credentials. Please try again or contact support.'
          );
        }

        const crashReporterService = getInjection('ICrashReporterService');
        crashReporterService.report(err);
        // return {
        //   error:
        //     'An error happened. The developers have been notified. Please try again later.',
        // };
        throw new Error(
          'An error happened. The developers have been notified. Please try again later.'
        );
      }
    }
  );
}

export async function getNearestUnits(lat: number, lon: number, max_results: number = 5): Promise<INearestUnits[]> {
  const instrumentationService = getInjection('IInstrumentationService');
  return await instrumentationService.instrumentServerAction(
    'District Crime Data',
    { recordResponse: true },
    async () => {
      try {

        const { data, error } = await supabase.rpc('nearby_units', {
          lat,
          lon,
          max_results
        }).select();

        if (error) {
          console.error('Error fetching nearest units:', error);
          return [];
        }

        if (!data) {
          console.error('No data returned from RPC');
          return [];
        }

        return data as INearestUnits[];

      } catch (err) {
        const crashReporterService = getInjection('ICrashReporterService');
        crashReporterService.report(err);
        throw new Error(
          'An error happened. The developers have been notified. Please try again later.'
        );
      }
    }
  );
}