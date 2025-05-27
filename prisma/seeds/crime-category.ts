// prisma/seeds/CrimeCategoriesSeeder.ts
import { generateId, generateIdWithDbCounter } from '../../app/_utils/common';
import { PrismaClient } from '@prisma/client';
import { crimeCategoriesData } from '../data/jsons/crime-category';

import path from 'path';
import XLSX from 'xlsx';

interface ICrimeCategory {
  id: string;
  name: string;
  description: string;
  type: string;
  created_at: Date;
  updated_at: Date;
}

export class CrimeCategoriesSeeder {
  constructor(private prisma: PrismaClient) {}

  async run(): Promise<void> {
    console.log('Seeding crime categories...');

    // Delete existing data to avoid duplicates
    await this.prisma.crime_categories.deleteMany({});

    const filePath = path.join(
      __dirname,
      '../data/excels/others/crime_categories.xlsx'
    );
    
    let categoriesToCreate = [];
    
    try {
      // Read from Excel file
      const workbook = XLSX.readFile(filePath);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(sheet) as ICrimeCategory[];

      // Generate IDs and prepare data for batch insertion
      for (const category of crimeCategoriesData) {
        const newId = await generateIdWithDbCounter('crime_categories', {
          prefix: 'CC',
          segments: {
            sequentialDigits: 4,
          },
          format: '{prefix}-{sequence}',
          separator: '-',
          uniquenessStrategy: 'counter',
        });

        categoriesToCreate.push({
          id: newId.trim(),
          name: category.name,
          description: category.description,
        });
      }

      console.log(`Prepared ${categoriesToCreate.length} crime categories for creation`);
      
      // Create categories in smaller batches
      const batchSize = 50;
      for (let i = 0; i < categoriesToCreate.length; i += batchSize) {
        const batch = categoriesToCreate.slice(i, i + batchSize);
        
        await this.prisma.crime_categories.createMany({
          data: batch,
          skipDuplicates: true,
        });
        
        console.log(`Created batch ${Math.floor(i/batchSize) + 1} of categories (${batch.length} items)`);
      }

      console.log(`Batch created ${categoriesToCreate.length} crime categories.`);

      // Update types in smaller batches
      const categoriesToUpdate = data.map((row) => ({
        id: row['id'].trim(),
        type: row['type'].trim(),
        name: row['name'].trim(),
      }));

      const updateBatchSize = 20;
      for (let i = 0; i < categoriesToUpdate.length; i += updateBatchSize) {
        const batch = categoriesToUpdate.slice(i, i + updateBatchSize);
        
        await Promise.all(
          batch.map((category) =>
            this.prisma.crime_categories.updateMany({
              where: { id: category.id },
              data: { type: category.type },
            })
          )
        );
        
        console.log(`Updated types for batch ${Math.floor(i/updateBatchSize) + 1}`);
      }

      console.log(
        `Updated types for ${categoriesToUpdate.length} crime categories.`
      );

      console.log(`✅ ${crimeCategoriesData.length} crime categories seeded`);
    } catch (error) {
      console.error('Error seeding crime categories:', error);
    }
  }
}
