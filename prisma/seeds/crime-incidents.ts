import {
  PrismaClient,
  crime_rates,
  crime_status,
  crimes,
} from '@prisma/client';
import { generateId, generateIdWithDbCounter } from '../../app/_utils/common';
import { createClient } from '../../app/_utils/supabase/client';
import * as fs from 'fs';
import * as path from 'path';
import csv from 'csv-parser';
import { CRegex } from '../../app/_utils/const/regex';

type ICreateLocations = {
  id: string;
  created_at: Date;
  updated_at: Date;
  district_id: string;
  event_id: string;
  address: string;
  type: string;
  latitude: number;
  longitude: number;
  land_area: number;
  location: string;
};

export class CrimeIncidentsByUnitSeeder {
  private crimeMonthlyData: Map<
    string,
    { number_of_crime: number; crime_cleared: number }
  > = new Map();

  constructor(
    private prisma: PrismaClient,
    private supabase = createClient()
  ) {}

  private async loadCrimeMonthlyData(): Promise<void> {
    const csvFilePath = path.resolve(
      __dirname,
      '../data/excels/crimes/crime_monthly.csv'
    );

    return new Promise((resolve, reject) => {
      fs.createReadStream(csvFilePath)
        .pipe(csv())
        .on('data', (row) => {
          const key = `${row.district_id}-${row.month_num}-${row.year}`;
          this.crimeMonthlyData.set(key, {
            number_of_crime: parseInt(row.number_of_crime),
            crime_cleared: parseInt(row.crime_cleared),
          });
        })
        .on('end', () => {
          console.log(
            `Loaded ${this.crimeMonthlyData.size} crime monthly records.`
          );
          resolve();
        })
        .on('error', (error) => {
          console.error('Error loading crime monthly data:', error);
          reject(error);
        });
    });
  }

 /**
 * Generates well-distributed points within a district's area with geographical constraints
 * @param centerLat - The center latitude of the district
 * @param centerLng - The center longitude of the district
 * @param landArea - Land area in square km
 * @param numPoints - Number of points to generate
 * @param districtId - ID of the district for special handling
 * @param districtName - Name of the district for constraints
 * @returns Array of {latitude, longitude, radius} points
 */
private generateDistributedPoints(
  centerLat: number,
  centerLng: number,
  landArea: number,
  numPoints: number,
  districtId: string,
  districtName: string
): Array<{ latitude: number; longitude: number; radius: number }> {
  const points = [];
  const districtNameLower = districtName.toLowerCase();

  // Special centers for specific districts
  if (districtNameLower === 'puger') {
    centerLat = -8.28386264271547;
    centerLng = 113.48075672799605;
  // } else if (districtNameLower === 'tempurejo') {
  //   centerLat = -8.276417231420199;
  //   centerLng = 113.69726469589183;
  } else if (districtNameLower === 'mumbulsari') {
    centerLat = -8.25042152635794;
    centerLng = 113.74209367242942;
  }

  // Calculate radius proportional to sqrt(landArea) but with better constraints
  let scalingFactor = 0.3;

  // Special radius handling for specific districts
  if (districtNameLower === 'mumbulsari') {
    scalingFactor = 0.1; // Tighter scaling for Mumbulsari
  } else if (landArea > 300) {
    scalingFactor = 0.25;
  } else if (landArea < 50) {
    scalingFactor = 0.35;
  }

  const radiusKm = Math.sqrt(landArea) * scalingFactor;
  const radiusDeg = radiusKm / 111;

  // Generate points in a circle around the center
  for (let i = 0; i < numPoints; i++) {
    const angle = Math.random() * 2 * Math.PI;

    // Adjust distance factor for Mumbulsari and Tempurejo
    let distanceFactor = Math.pow(Math.random(), 1.5);
    if (districtNameLower === 'mumbulsari') {
      distanceFactor = Math.pow(Math.random(), 2); // Concentrate points closer to the center
    }

    const distance = distanceFactor * radiusDeg;

    let latitude = centerLat + distance * Math.cos(angle);
    let longitude = centerLng + distance * Math.sin(angle) / Math.cos(centerLat * Math.PI / 180);

    // Bias points for Tempurejo towards the south
    // if (districtNameLower === 'tempurejo') {
    //   latitude -= Math.abs(distance * 0.2); // Shift points slightly southward
    // }

    let pointRadius = distance * 111000;

    if (districtNameLower === 'mumbulsari') {
      pointRadius = Math.min(pointRadius, 5000);
    } else {
      const maxRadiusMeters = Math.min(10000, radiusKm * 500);
      pointRadius = Math.min(pointRadius, maxRadiusMeters);
    }

    points.push({
      latitude,
      longitude,
      radius: pointRadius,
    });
  }

  return points;
}

  // Helper for chunked insertion
  private async chunkedInsertIncidents(data: any[], chunkSize: number = 100) {
    console.log(`Inserting ${data.length} incidents in batches of ${chunkSize}...`);
    const total = data.length;
    let inserted = 0;
    
    for (let i = 0; i < data.length; i += chunkSize) {
      const chunk = data.slice(i, i + chunkSize);
      try {
        await this.prisma.crime_incidents.createMany({
          data: chunk,
          skipDuplicates: true,
        });
        
        inserted += chunk.length;
        if (inserted % 500 === 0 || inserted === total) {
          console.log(`Progress: ${inserted}/${total} incidents inserted (${Math.round(inserted/total*100)}%)`);
        }
        
        // Add small delay to prevent database overload
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (error) {
        console.error(`Error inserting chunk of incidents:`, error);
        
        // If chunk is already small, try one by one
        if (chunkSize <= 10) {
          console.log("Attempting to insert incidents one by one...");
          for (const incident of chunk) {
            try {
              await this.prisma.crime_incidents.create({
                data: incident
              });
              inserted++;
            } catch (err) {
              console.error(`Failed to insert individual incident:`, err);
            }
          }
        } else {
          // Try with smaller chunk size
          const smallerChunk = Math.max(10, Math.floor(chunkSize / 2));
          console.log(`Retrying with smaller chunk size: ${smallerChunk}`);
          await this.chunkedInsertIncidents(chunk, smallerChunk);
        }
      }
    }
    
    console.log(`Successfully inserted ${inserted} incidents`);
  }

  // Helper for chunked Supabase insert
  private async chunkedInsertLocations(
    locations: any[],
    chunkSize: number = 100
  ) {
    console.log(`Inserting ${locations.length} locations in batches of ${chunkSize}...`);
    const total = locations.length;
    let inserted = 0;
    
    for (let i = 0; i < locations.length; i += chunkSize) {
      const chunk = locations.slice(i, i + chunkSize);
      try {
        const { error } = await this.supabase
          .from('locations')
          .insert(chunk)
          .select();
          
        if (error) {
          throw error;
        }
        
        inserted += chunk.length;
        if (inserted % 500 === 0 || inserted === total) {
          console.log(`Progress: ${inserted}/${total} locations inserted (${Math.round(inserted/total*100)}%)`);
        }
        
        // Add small delay
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (error) {
        console.error(`Error inserting chunk of locations:`, error);
        
        if (chunkSize <= 10) {
          console.log("Attempting to insert locations one by one...");
          for (const location of chunk) {
            try {
              await this.supabase.from('locations').insert(location).select();
              inserted++;
            } catch (err) {
              console.error(`Failed to insert individual location:`, err);
            }
          }
        } else {
          // Try with smaller chunk size
          const smallerChunk = Math.max(10, Math.floor(chunkSize / 2));
          console.log(`Retrying with smaller chunk size: ${smallerChunk}`);
          await this.chunkedInsertLocations(chunk, smallerChunk);
        }
      }
    }
    
    console.log(`Successfully inserted ${inserted} locations`);
  }

  async run(): Promise<void> {
    console.log('🌱 Seeding crime incidents data...');

    try {
      // Load crime monthly data first
      await this.loadCrimeMonthlyData();

      // Check if crime incidents already exist
      const existingIncidents = await this.prisma.crime_incidents.findFirst({
        where: {
          crimes: {
            source_type: "cbu"
          }
        }
      });
      
      if (existingIncidents) {
        console.log('Crime incidents data already exists, skipping import.');
        return;
      }

      // Get all monthly crime records (exclude yearly summaries)
      const crimeRecords = await this.prisma.crimes.findMany({
        where: {
          month: { not: null },
          number_of_crime: { gt: 0 },
          source_type: "cbu"
        },
        orderBy: [{ district_id: 'asc' }, { year: 'asc' }, { month: 'asc' }],
      });

      console.log(
        `Found ${crimeRecords.length} monthly crime records with incidents to process.`
      );

      // Get all crime categories for random assignment
      const crimeCategories = await this.prisma.crime_categories.findMany();
      if (crimeCategories.length === 0) {
        console.error(
          'No crime categories found, please seed crime categories first.'
        );
        return;
      }

      // Process each crime record
      let totalIncidentsCreated = 0;
      for (const crimeRecord of crimeRecords) {
        const incidents = await this.createIncidentsForCrime(
          crimeRecord,
          crimeCategories
        );
        totalIncidentsCreated += incidents.length;

        // Log progress every 50 crime records
        if (totalIncidentsCreated % 50 === 0) {
          console.log(`Created ${totalIncidentsCreated} incidents so far...`);
        }
      }

      console.log(
        `✅ Successfully created ${totalIncidentsCreated} crime incidents.`
      );
    } catch (error) {
      console.error('❌ Error seeding crime incidents:', error);
      throw error;
    }
  }

  private async createIncidentsForCrime(
    crime: crimes,
    categories: any[]
  ): Promise<any[]> {
    const incidentsCreated = [];

    // Get district information
    const district = await this.prisma.districts.findUnique({
      where: { id: crime.district_id },
      include: { cities: true },
    });

    if (!district) {
      console.error(`District ${crime.district_id} not found, skipping.`);
      return [];
    }

    const geo = await this.prisma.geographics.findFirst({
      where: {
        district_id: district.id,
        year: crime.year,
      },
      select: {
        latitude: true,
        longitude: true,
        land_area: true,
      },
    });

    if (!geo) {
      console.error(
        `Geographic data for district ${district.id} in year ${crime.year} not found, skipping.`
      );
      return [];
    }

    // Use the actual number of crimes instead of a random count
    const numLocations = crime.number_of_crime;

    // Gunakan hanya geographic sebagai center
    const centerLat = geo.latitude;
    const centerLng = geo.longitude;
    const landArea = geo.land_area ?? 100;

    const locationPool = this.generateDistributedPoints(
      centerLat,
      centerLng,
      landArea,
      numLocations,
      district.id,
      district.name
    );

    // List of common street names in Jember with more variety
    const jemberStreets = [
      'Jalan Pahlawan',
      'Jalan Merdeka',
      'Jalan Cendrawasih',
      'Jalan Srikandi',
      'Jalan Sumbermujur',
      'Jalan Taman Siswa',
      'Jalan Pantai',
      'Jalan Raya Sumberbaru',
      'Jalan Abdurrahman Saleh',
      'Jalan Mastrip',
      'Jalan PB Sudirman',
      'Jalan Kalimantan',
      'Jalan Sumatra',
      'Jalan Jawa',
      'Jalan Gajah Mada',
      'Jalan Letjen Suprapto',
      'Jalan Hayam Wuruk',
      'Jalan Trunojoyo',
      'Jalan Imam Bonjol',
      'Jalan Diponegoro',
      'Jalan Ahmad Yani',
      'Jalan Kartini',
      'Jalan Gatot Subroto',
    ];

    // More varied place types
    const placeTypes = [
      'Perumahan',
      'Apartemen',
      'Komplek',
      'Pasar',
      'Toko',
      'Terminal',
      'Stasiun',
      'Kampus',
      'Sekolah',
      'Perkantoran',
      'Pertokoan',
      'Pusat Perbelanjaan',
      'Taman',
      'Alun-alun',
      'Simpang',
      'Pertigaan',
      'Perempatan',
    ];

    const user = await this.prisma.users.findFirst({
      where: {
        email: 'sigapcompany@gmail.com',
      },
      select: {
        id: true,
      },
    });

    if (!user) {
      console.error(`User not found, skipping.`);
      return [];
    }

    const event = await this.prisma.events.findFirst({
      where: {
        user_id: user.id,
      },
    });

    if (!event) {
      console.error(`Event not found, skipping.`);
      return [];
    }

    // Get crime_cleared data from the loaded CSV
    const key = `${crime.district_id}-${crime.month}-${crime.year}`;
    const crimeMonthlyInfo = this.crimeMonthlyData.get(key);

    // Default values if not found in CSV
    let crimesCleared = 0;

    if (crimeMonthlyInfo) {
      crimesCleared = crimeMonthlyInfo.crime_cleared;
      // Safety check to ensure crime_cleared doesn't exceed number_of_crime
      if (crimesCleared > crime.number_of_crime) {
        crimesCleared = crime.number_of_crime;
      }
    } else {
      console.warn(
        `No crime monthly data found for ${key}, using default values.`
      );
    }

    const incidentsToCreate = [];
    const locationsToCreate = [];

    // Create incidents based on the number_of_crime value
    for (let i = 0; i < crime.number_of_crime; i++) {
      // Select random category
      const randomCategory =
        categories[Math.floor(Math.random() * categories.length)];

      // Calculate a date within the crime's month
      const year = crime.year;

      if (!year) {
        console.error(
          `Year is not defined for crime record ${crime.id}, skipping.`
        );
        return [];
      }

      const month = (crime.month as number) - 1; // JavaScript months are 0-indexed
      const maxDay = new Date(year, month + 1, 0).getDate(); // Get last day of month
      const day = Math.floor(Math.random() * maxDay) + 1;
      const hour = Math.floor(Math.random() * 24);
      const minute = Math.floor(Math.random() * 60);

      const timestamp = new Date(year, month, day, hour, minute);

      // Select a random location from our pool
      const randomLocationIndex = Math.floor(
        Math.random() * locationPool.length
      );
      const selectedLocation = locationPool[randomLocationIndex];

      // Generate varied address details
      const streetName =
        jemberStreets[Math.floor(Math.random() * jemberStreets.length)];
      const buildingNumber = Math.floor(Math.random() * 200) + 1;
      const placeType =
        placeTypes[Math.floor(Math.random() * placeTypes.length)];

      // Create more varied addresses
      let randomAddress;
      const addressType = Math.floor(Math.random() * 3);
      switch (addressType) {
        case 0:
          randomAddress = `${streetName} No. ${buildingNumber}, ${district.name}, Jember`;
          break;
        case 1:
          randomAddress = `${placeType} ${district.name}, ${streetName}, Jember`;
          break;
        case 2:
          randomAddress = `${streetName} Blok ${String.fromCharCode(65 + Math.floor(Math.random() * 26))}-${Math.floor(Math.random() * 20) + 1}, ${district.name}, Jember`;
          break;
      }

      const locationData: Partial<ICreateLocations> = {
        district_id: district.id,
        event_id: event.id,
        address: randomAddress,
        type: 'crime',
        latitude: selectedLocation.latitude,
        longitude: selectedLocation.longitude,
        location: `POINT(${selectedLocation.longitude} ${selectedLocation.latitude})`,
      };

      // Tambahkan ke array, bukan langsung create ke database
      locationsToCreate.push(locationData);

      const incidentId = await generateIdWithDbCounter(
        'crime_incidents',
        {
          prefix: 'CI',
          segments: {
            codes: [district.city_id],
            sequentialDigits: 4,
            year,
          },
          format: '{prefix}-{codes}-{sequence}-{year}',
          separator: '-',
          uniquenessStrategy: 'counter',
        },
        CRegex.FORMAT_ID_YEAR_SEQUENCE
      );

      // Determine status based on crime_cleared
      // If i < crimesCleared, this incident is resolved, otherwise unresolved
      const status =
        i < crimesCleared
          ? ('resolved' as crime_status)
          : ('unresolved' as crime_status);

      // More detailed location descriptions
      const locs = [
        `di daerah ${district.name}`,
        `di sekitar ${district.name}`,
        `di wilayah ${district.name}`,
        `di jalan utama ${district.name}`,
        `di perumahan ${district.name}`,
        `di pasar ${district.name}`,
        `di perbatasan ${district.name}`,
        `di kawasan ${placeType.toLowerCase()} ${district.name}`,
        `di persimpangan jalan ${streetName}`,
        `di dekat ${placeType.toLowerCase()} ${district.name}`,
        `di belakang ${placeType.toLowerCase()} ${district.name}`,
        `di area ${streetName}`,
        `di sekitar ${streetName} ${district.name}`,
        `tidak jauh dari pusat ${district.name}`,
        `di pinggiran ${district.name}`,
      ];

      const randomLocation = locs[Math.floor(Math.random() * locs.length)];

      const descriptions = [
        `Kasus ${randomCategory.name.toLowerCase()} ${randomAddress}`,
        `Laporan ${randomCategory.name.toLowerCase()} terjadi pada ${timestamp} ${randomLocation}`,
        `${randomCategory.name} dilaporkan ${randomLocation}`,
        `Insiden ${randomCategory.name.toLowerCase()} terjadi ${randomLocation}`,
        `Kejadian ${randomCategory.name.toLowerCase()} ${randomLocation}`,
        `${randomCategory.name} terdeteksi ${randomLocation} pada ${timestamp.toLocaleTimeString()}`,
        `Pelaporan ${randomCategory.name.toLowerCase()} di ${randomAddress}`,
        `Kasus ${randomCategory.name.toLowerCase()} terjadi di ${streetName}`,
        `${randomCategory.name} terjadi di dekat ${placeType.toLowerCase()} ${district.name}`,
        `Insiden ${randomCategory.name.toLowerCase()} dilaporkan warga setempat ${randomLocation}`,
      ];

      const randomDescription =
        descriptions[Math.floor(Math.random() * descriptions.length)];

      incidentsToCreate.push({
        id: incidentId,
        crime_id: crime.id,
        crime_category_id: randomCategory.id,
        location_id: undefined as string | undefined, // This will be updated after locations are created
        description: randomDescription,
        victim_count: 0,
        status: status,
        timestamp: timestamp,
      });
    }

    // Batch insert locations in chunks
    try {
      await this.chunkedInsertLocations(locationsToCreate);
    } catch (error) {
      console.error(
        `Error inserting into locations for district ${district.name} (${crime.year}):`,
        error
      );
      return [];
    }

    // Fetch all created locations for this batch
    const createdLocations = await this.prisma.locations.findMany({
      where: {
        event_id: event.id,
        district_id: district.id,
        address: {
          in: locationsToCreate
            .map((loc) => loc.address)
            .filter((address): address is string => address !== undefined),
        },
      },
      select: {
        id: true,
        address: true,
      },
    });

    // Map addresses to location IDs
    const addressToId = new Map<string, string>();
    for (const loc of createdLocations) {
      if (loc.address !== null) {
        addressToId.set(loc.address, loc.id);
      }
    }

    // Assign location_id to each incident
    for (let i = 0; i < incidentsToCreate.length; i++) {
      const address = locationsToCreate[i].address;
      if (typeof address === 'string') {
        incidentsToCreate[i].location_id = addressToId.get(address);
      }
    }

    // Batch insert incidents in chunks
    await this.chunkedInsertIncidents(incidentsToCreate);

    incidentsCreated.push(...incidentsToCreate);

    return incidentsCreated;
  }
}

// This allows the file to be executed standalone for testing
if (require.main === module) {
  const testSeeder = async () => {
    const prisma = new PrismaClient();
    const seeder = new CrimeIncidentsByUnitSeeder(prisma);
    try {
      await seeder.run();
    } catch (e) {
      console.error('Error during seeding:', e);
      process.exit(1);
    } finally {
      await prisma.$disconnect();
    }
  };

  testSeeder();
}
