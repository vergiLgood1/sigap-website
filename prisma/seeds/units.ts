import { locations, PrismaClient, unit_type, units } from '@prisma/client';
import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { createClient } from '../../app/_utils/supabase/client';
import { generateId, generateIdWithDbCounter } from '../../app/_utils/common';


// Interface untuk data Excel row
interface ExcelRow {
  KESATUAN: string;
  [key: string]: any; // Untuk kolom dinamis seperti "JAN CT", "JAN CC", dll
}

// Interface untuk mapping bulan
interface MonthMap {
  [key: string]: number;
}

// Interface untuk statistik unit
interface UnitStatistics {
  unit_id: string;
  month: number;
  year: number;
  crime_total: number;
  crime_cleared: number;
  percentage: number;
  pending: number;
}

interface CreateLocationDto {
  district_id: string;
  code_unit: string;
  city_id: string;
  name?: string;
  description?: string;
  address?: string;
  type?: string;
  phone?: string;
  latitude: number;
  longitude: number;
  land_area?: number;
  polygon?: Record<string, any>;
  geometry?: Record<string, any>;
  location?: string;
}

interface ICsvUnitLocations {
  unit: string;
  alamat: string;
  telepon: string;
  lat: string;
  long: string;
}

export class UnitSeeder {
  private mapboxToken: string;

  constructor(
    private prisma: PrismaClient,
    private supabase = createClient()
  ) {
    this.mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '';
  }

  async run(): Promise<void> {
    await this.prisma.units.deleteMany({});

    const districts = await this.prisma.districts.findMany({
      include: {
        cities: true,
      },
    });

    const city = await this.prisma.cities.findFirst({
      where: {
        name: 'Jember',
      },
      include: {
        districts: true,
      },
    });

    if (!city) {
      console.error('City not found: Jember');
      return;
    }

    // Find the Patrang district
    const patrangDistrict = await this.prisma.districts.findFirst({
      where: {
        name: 'Patrang',
        city_id: city.id,
      },
    });

    if (!patrangDistrict) {
      console.error('District not found: Patrang');
      return;
    }

    // Prepare arrays for batch operations
    const unitsToInsert = [];

    // First, get the Polres unit data
    const polresLocation = await this.getUnitsLocation(city.name);

    if (polresLocation) {
      const [lng, lat] = [polresLocation.lng, polresLocation.lat];
      const address = polresLocation.address;
      const phone = polresLocation.telepon?.replace(/-/g, '');

      // Create a custom ID for Polres (using 00 as the district suffix)
      const polresId = `UT-0000`;

      unitsToInsert.push({
        city_id: city.id,
        code_unit: polresId,
        name: `Polres ${city.name}`,
        description: `Unit ${city.name} is categorized as POLRES and operates in the ${city.name} area.`,
        type: 'polres',
        address,
        phone,
        longitude: lng,
        latitude: lat,
        location: `POINT(${lng} ${lat})`,
      });
    } else {
      console.warn(`No location found for city: ${city.name}`);
    }

    // Now prepare data for all Polseks
    const locationPromises = districts.map((district) =>
      this.getUnitsLocation(district.name)
        .then((location) => ({ district, location }))
        .catch(() => ({ district, location: null }))
    );

    // Wait for all location lookups to complete
    const results = await Promise.all(locationPromises);

    // Process results and add to unitsToInsert
    results.forEach(({ district, location }) => {
      if (!location) {
        console.warn(`No location found for district: ${district.name}`);
        return;
      }

      const [lng, lat] = [location.lng, location.lat];
      const address = location.address;
      const phone = location.telepon?.replace(/-/g, '');

      // Extract the last two digits from district_id for the unit ID
      const districtIdStr = district.id.toString();
      const lastTwoDigits = districtIdStr.slice(-2);
      const newId = `UT-00${lastTwoDigits}`;

      unitsToInsert.push({
        district_id: district.id,
        city_id: district.city_id,
        code_unit: newId,
        name: `Polsek ${district.name}`,
        description: `Unit ${district.name} is categorized as POLSEK and operates in the ${district.name} area.`,
        type: 'polsek',
        address: address,
        phone,
        longitude: lng,
        latitude: lat,
        location: `POINT(${lng} ${lat})`,
      });

      console.log(
        `Prepared unit data for district: ${district.name}, ID: ${newId} (from district ID: ${district.id})`
      );
    });

    // Insert units in smaller batches
    if (unitsToInsert.length > 0) {
      const batchSize = 10;
      for (let i = 0; i < unitsToInsert.length; i += batchSize) {
        const batch = unitsToInsert.slice(i, i + batchSize);
        try {
          const { error } = await this.supabase
            .from('units')
            .insert(batch)
            .select();

          if (error) {
            console.error(`Error inserting units batch ${i / batchSize + 1}:`, error);
          } else {
            console.log(`Successfully inserted batch ${i / batchSize + 1} (${batch.length} units)`);
          }
          
          // Small delay between batches
          await new Promise(resolve => setTimeout(resolve, 300));
        } catch (err) {
          console.error(`Exception when inserting units batch ${i / batchSize + 1}:`, err);
        }
      }
    } else {
      console.warn('No unit data to insert');
    }
  }

  private parseNumber(value: any): number {
    if (value === undefined || value === null) return 0;
    const num = Number(value);
    return isNaN(num) ? 0 : num;
  }

  private async getUnitsLocation(districtName: string): Promise<{
    lng: number;
    lat: number;
    address: string;
    telepon: string;
  } | null> {
    // Path to the CSV file
    const fallbackFilePath = path.join(
      __dirname,
      '../data/excels/administrations/polsek_jember.csv'
    );

    try {
      // Read the CSV file
      const csvData = await new Promise<ICsvUnitLocations[]>((resolve, reject) => {
        const results: ICsvUnitLocations[] = [];

        fs.createReadStream(fallbackFilePath)
          .pipe(parse({
            columns: true,
            skip_empty_lines: true,
          }))
          .on('data', (data: ICsvUnitLocations) => results.push(data))
          .on('end', () => resolve(results))
          .on('error', (error) => reject(error));
      });

      // Special handling for districts with similar names or potential conflicts
      const exactMatchingRow = csvData.find(
        (row) => row.unit === `Polsek ${districtName}`
      );

      // If we have an exact match, use it
      if (exactMatchingRow) {
        console.log(`Found exact match for district: ${districtName}`);
        return this.parsePoliceUnitData(exactMatchingRow, districtName);
      }

      // Special case handling for conflicting districts (Mumbulsari and Umbulsari)
      if (districtName.toLowerCase() === 'mumbulsari') {
        // Check for exact match of Polsek Mumbulsari
        const mumbulsariRow = csvData.find(
          (row) => row.unit.toLowerCase() === 'polsek mumbulsari'
        );
        if (mumbulsariRow) {
          return this.parsePoliceUnitData(mumbulsariRow, districtName);
        }
      }

      if (districtName.toLowerCase() === 'umbulsari') {
        // Check for exact match of Polsek Umbulsari
        const umbulsariRow = csvData.find(
          (row) => row.unit.toLowerCase() === 'polsek umbulsari'
        );
        if (umbulsariRow) {
          return this.parsePoliceUnitData(umbulsariRow, districtName);
        }
      }

      // For city name (Jember), find Polres
      if (districtName.toLowerCase() === 'jember') {
        const polresRow = csvData.find(
          (row) => row.unit.toLowerCase().includes('polres')
        );
        if (polresRow) {
          return this.parsePoliceUnitData(polresRow, districtName);
        }
      }

      // More flexible matching for other districts
      const matchedRow = csvData.find(
        (row) =>
          row.unit.toLowerCase().includes(districtName.toLowerCase()) ||
          row.alamat.toLowerCase().includes(districtName.toLowerCase())
      );

      if (!matchedRow) {
        console.warn(
          `No matching Polsek found in CSV for district: ${districtName}`
        );
        return null;
      }

      return this.parsePoliceUnitData(matchedRow, districtName);
    } catch (error) {
      console.error(`Error reading CSV for district ${districtName}:`, error);
      return null;
    }
  }

  // Helper method to parse police unit data
  private parsePoliceUnitData(row: ICsvUnitLocations, districtName: string): {
    lng: number;
    lat: number;
    address: string;
    telepon: string;
  } | null {
    // Double check that we have valid coordinates
    const lng = parseFloat(row.long);
    const lat = parseFloat(row.lat);

    if (isNaN(lng) || isNaN(lat)) {
      console.warn(`Invalid coordinates for district ${districtName}`);
      return null;
    }

    const polsekName = row.unit;
    const polsekAddress = row.alamat;
    const telepon = row.telepon;

    console.log(
      `District: ${districtName} -> Polsek Name: ${polsekName}, Address: ${polsekAddress}, Coordinates: ${lng}, ${lat}`
    );

    return {
      lng,
      lat,
      telepon,
      address: polsekAddress,
    };
  }
}
