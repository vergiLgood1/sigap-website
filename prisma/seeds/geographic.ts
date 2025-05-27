import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import * as turf from '@turf/turf';
import { createClient } from '../../app/_utils/supabase/client';
import axios from 'axios';
import xlsx from 'xlsx';

export interface CreateLocationDto {
  district_id: string;
  name?: string;
  description?: string;
  address?: string;
  type?: string;
  latitude: number;
  longitude: number;
  land_area?: number;
  polygon?: Record<string, any>;
  geometry?: Record<string, any>;
  location?: string;
  year: number; // Added year field
}

interface DistrictAreaData {
  [district: string]: {
    [year: string]: number;
  };
}

export class GeoJSONSeeder {
  private mapboxToken: string;
  private areaData: DistrictAreaData = {};
  private BATCH_SIZE = 20; // Set a smaller batch size to prevent timeout

  constructor(
    private prisma: PrismaClient,
    private supabase = createClient()
  ) {
    this.mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '';

    // Load area data from Excel
    this.loadAreaData();
  }

  private loadAreaData(): void {
    try {
      // Load the Excel file
      const workbook = xlsx.readFile(
        'prisma/data/excels/administrations/geographics.xlsx'
      );
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      // Convert to JSON
      const jsonData = xlsx.utils.sheet_to_json(worksheet);

      // Parse the data into our structure
      jsonData.forEach((row: any) => {
        const districtName = row['Kecamatan'];
        if (districtName) {
          // Get 2024 value to use for 2025
          const value2024 = this.parseAreaValue(row['2024']);
          
          this.areaData[districtName] = {
            '2020': this.parseAreaValue(row['2020']),
            '2021': this.parseAreaValue(row['2021']),
            '2022': this.parseAreaValue(row['2022']),
            '2023': this.parseAreaValue(row['2023']),
            '2024': this.parseAreaValue(row['2024']),
            '2025': value2024, // Use the same value as 2024
          };
        }
      });

      console.log('Area data loaded successfully');
    } catch (error) {
      console.error('Error loading area data from Excel:', error);
    }
  }

  private parseAreaValue(value: string | number): number {
    if (typeof value === 'number') {
      return value;
    }

    if (typeof value === 'string') {
      // Replace comma with dot for decimal
      return parseFloat(value.replace(',', '.'));
    }

    return 0;
  }

  private getDistrictArea(districtName: string, year: number): number {
    // Normalize district name (remove case sensitivity and extra spaces)
    const normalizedName = districtName.trim().toLowerCase();

    // Try to find the district in our data
    for (const district in this.areaData) {
      if (district.trim().toLowerCase() === normalizedName) {
        return this.areaData[district][year.toString()] || 0;
      }
    }

    console.warn(
      `No area data found for district: ${districtName}, year: ${year}`
    );
    return 0;
  }

  /**
   * Split array into chunks of the specified size
   */
  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }

  /**
   * Insert data in smaller batches to avoid timeout
   */
  private async insertInBatches(data: any[]): Promise<void> {
    const batches = this.chunkArray(data, this.BATCH_SIZE);

    console.log(
      `Splitting ${data.length} records into ${batches.length} batches of max ${this.BATCH_SIZE} records`
    );

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      console.log(
        `Processing batch ${i + 1}/${batches.length} (${batch.length} records)`
      );

      try {
        const { error } = await this.supabase
          .from('geographics')
          .insert(batch)
          .select();

        if (error) {
          console.error(`Error inserting batch ${i + 1}:`, error);
          // Reduce batch size and retry for this specific batch
          if (batch.length > 5) {
            console.log(`Retrying batch ${i + 1} with smaller chunks...`);
            await this.insertInBatches(batch); // Recursive retry with smaller chunks
          } else {
            console.error(
              `Failed to insert items even with small batch size:`,
              batch
            );
          }
        } else {
          console.log(
            `Successfully inserted batch ${i + 1} (${batch.length} records)`
          );
        }
      } catch (err) {
        console.error(`Exception when processing batch ${i + 1}:`, err);
        // Try with even smaller chunks
        if (batch.length > 2) {
          const smallerBatchSize = Math.max(1, Math.floor(batch.length / 2));
          console.log(`Retrying with much smaller chunks of size ${smallerBatchSize}...`);
          await this.insertInBatches(this.chunkArray(batch, smallerBatchSize));
        } else {
          // Single item insertion as last resort
          for (const item of batch) {
            try {
              await this.supabase.from('geographics').insert(item);
              console.log(`Inserted single item successfully`);
            } catch (e) {
              console.error(`Failed to insert single item:`, e);
            }
          }
        }
      }

      // Add a small delay between batches to reduce database load
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  async run(): Promise<void> {
    console.log('Seeding GeoJSON data...');

    await this.prisma.units.deleteMany({});
    await this.prisma.districts.deleteMany({});
    await this.prisma.cities.deleteMany({});
    await this.prisma.geographics.deleteMany({});

    try {
      // Load GeoJSON file
      const regencyGeoJson = JSON.parse(
        fs.readFileSync('prisma/data/geojson/jember/regency.geojson', 'utf-8')
      );
      const districtGeoJson = JSON.parse(
        fs.readFileSync('prisma/data/geojson/jember/districts.geojson', 'utf-8')
      );

      // 1. Insert Kota/Kabupaten: Jember
      let regency; // Declare regency variable outside the loop

      for (const feature of regencyGeoJson.features) {
        const properties = feature.properties;

        // Cleanup code
        const regencyCode = properties.kode_kk.replace(/\./g, '').trim();

        // Insert Regency
        regency = await this.prisma.cities.create({
          data: {
            id: regencyCode,
            name: properties.kab_kota,
          },
        });

        // Prepare arrays for batch operations
        const districtsToCreate = [];
        const geographicsToCreate = [];
        const addressPromises = [];
        const years = [2020, 2021, 2022, 2023, 2024, 2025]; // Added 2025

        // 2. Process all districts first to prepare data
        for (let i = 0; i < districtGeoJson.features.length; i++) {
          const feature = districtGeoJson.features[i];
          const properties = feature.properties;

          // Cleanup code
          const districtCode = properties.kode_kec.replace(/\./g, '').trim();

          // Add to districts batch
          districtsToCreate.push({
            id: districtCode,
            name: properties.kecamatan,
            city_id: regency.id,
          });

          // Calculate centroid for each district
          const centroid = turf.centroid(feature);
          const [longitude, latitude] = centroid.geometry.coordinates;

          // Create address lookup promise for this district
          addressPromises.push(this.getStreetFromMapbox(longitude, latitude));
        }

        // 3. Insert all districts at once
        await this.prisma.districts.createMany({
          data: districtsToCreate,
          skipDuplicates: true,
        });

        console.log(`Inserted ${districtsToCreate.length} districts in batch`);

        // 4. Get all addresses in parallel
        const addresses = await Promise.all(addressPromises);

        // 5. Prepare geographic data for batch insertion
        for (let i = 0; i < districtGeoJson.features.length; i++) {
          const feature = districtGeoJson.features[i];
          const properties = feature.properties;
          const geometry = feature.geometry;
          const districtCode = properties.kode_kec.replace(/\./g, '').trim();
          const districtName = properties.kecamatan;
          const address = addresses[i];

          // Calculate centroid
          const centroid = turf.centroid(feature);
          const [longitude, latitude] = centroid.geometry.coordinates;

          // Create geographic entries for each year
          for (const year of years) {
            const landArea = this.getDistrictArea(districtName, year);

            // Add to geographics batch
            geographicsToCreate.push({
              district_id: districtCode,
              description: `Location for ${districtName} District in Jember (${year})`,
              address: address,
              type: 'district location',
              year: year,
              latitude,
              longitude,
              land_area: landArea,
              polygon: geometry,
              geometry: geometry,
              location: `POINT(${longitude} ${latitude})`,
            });
          }
        }

        // 6. Insert all geographic data in smaller batches
        console.log(
          `Preparing to insert ${geographicsToCreate.length} geographic records in smaller batches`
        );
        await this.insertInBatches(geographicsToCreate);
      }

      console.log(
        'GeoJSON data seeded successfully!',
        districtGeoJson.features.length,
        'districts inserted with 5 years of area data.'
      );
    } catch (error) {
      console.error('Error seeding GeoJSON data:', error);
    }
  }

  private async getStreetFromMapbox(lng: number, lat: number): Promise<string> {
    try {
      const response = await axios.get(
        `https://api.mapbox.com/search/geocode/v6/reverse?longitude=${lng}&latitude=${lat}&access_token=${this.mapboxToken}`
      );

      if (
        response.data &&
        response.data.features &&
        response.data.features.length > 0
      ) {
        // Extract full_address from the first feature
        const fullAddress = response.data.features[0].properties.full_address;

        return (
          fullAddress ||
          `Jalan Tidak Diketahui No. ${Math.floor(this.getRandomNumber(1, 100))}`
        );
      }

      // Fallback if no address found
      return `Jalan Tidak Diketahui No. ${Math.floor(this.getRandomNumber(1, 100))}`;
    } catch (error) {
      console.error('Error fetching street from Mapbox:', error);
      return `Jalan Tidak Diketahui No. ${Math.floor(this.getRandomNumber(1, 100))}`;
    }
  }

  private getRandomNumber(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }
}