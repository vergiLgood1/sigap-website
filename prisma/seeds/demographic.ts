// prisma/seeds/DemographicsSeeder.ts

import { PrismaClient } from '@prisma/client';
import path from 'path';
import XLSX from 'xlsx';

export class DemographicsSeeder {
  constructor(private prisma: PrismaClient) {}

  async run(): Promise<void> {
    console.log('📥 Seeding demographics data from Excel...');

    // Clear existing data
    await this.prisma.demographics.deleteMany({});

    const districts = await this.prisma.districts.findMany();

    // Load Excel
    const filePath = path.join(
      __dirname,
      '../data/excels/administrations/demographics.xlsx'
    );
    const workbook = XLSX.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet) as any[];

    let counter = 0;

    // Get all district land areas in a single query at the beginning
    const districtLandAreas = await this.getAllDistrictLandAreas();

    // Collect demographic data to be inserted in batch
    const demographicsToInsert = [];
    
    // Track 2024 data to duplicate for 2025
    const data2024ByDistrict: Record<string, any> = {};

    for (const row of data) {
      const districtName = String(row['Kecamatan']).trim();
      const year = Number(row['Tahun']);
      const population = Number(row['Jumlah_Penduduk']);
      const unemployed = Number(row['Jumlah_Pengangguran']);

      const district = districts.find(
        (d) => d.name.toLowerCase() === districtName.toLowerCase()
      );

      if (!district) {
        console.warn(`⚠️ District "${districtName}" not found in database.`);
        continue;
      }

      const districtLandArea = districtLandAreas[district.id] || 0;

      const populationDensity =
        districtLandArea > 0 ? population / districtLandArea : 0;
        
      const demographicRecord = {
        district_id: district.id,
        year,
        population,
        population_density: populationDensity,
        number_of_unemployed: unemployed,
      };

      demographicsToInsert.push(demographicRecord);
      
      // Store 2024 data for later duplication
      if (year === 2024) {
        data2024ByDistrict[district.id] = demographicRecord;
      }

      counter++;
    }
    
    // Create 2025 data based on 2024 data
    for (const districtId in data2024ByDistrict) {
      const record2024 = data2024ByDistrict[districtId];
      const record2025 = {
        ...record2024,
        year: 2025 // Change year to 2025
      };
      
      demographicsToInsert.push(record2025);
      counter++;
    }

    console.log(`✅ Added ${Object.keys(data2024ByDistrict).length} demographic records for 2025 based on 2024 data`);

    // Insert all demographic data at once
    await this.prisma.demographics.createMany({
      data: demographicsToInsert,
      skipDuplicates: true,
    });

    console.log(`✅ ${counter} demographic records prepared for batch insertion`);
    console.log(`✅ ${counter} demographic records seeded from Excel`);
  }

  private getRandomNumber(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }

  // Get all district land areas at once to avoid multiple database queries
  private async getAllDistrictLandAreas(): Promise<Record<string, number>> {
    const geoData = await this.prisma.geographics.findMany({
      select: {
        district_id: true,
        land_area: true,
      }
    });

    const landAreas: Record<string, number> = {};
    geoData.forEach(geo => {
      landAreas[geo.district_id] = geo.land_area || 0;
    });

    return landAreas;
  }

  private async getCityLandArea(): Promise<number> {
    const districtsGeo = await this.prisma.locations.findMany({});
    return districtsGeo.reduce((sum, geo) => sum + (geo.land_area || 0), 0);
  }
}
