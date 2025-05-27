import { PrismaClient } from "@prisma/client";
import { resourcesData } from '../data/jsons/resources';

export class ResourceSeeder {
  constructor(private prisma: PrismaClient) {}

  async run(): Promise<void> {
    console.log('Seeding resources...');

    // Delete existing resources to avoid duplicates
    await this.prisma.resources.deleteMany({});
    // Create resources based on Prisma schema models
    try {
      await this.prisma.resources.createMany({
        data: resourcesData,
        skipDuplicates: true, // Skip duplicates if they exist
      });

      console.log(
        'Resources created successfully:',
        resourcesData.map((resource) => resource.name).join(', ')
      );
    } catch (error) {
      console.error('Error creating resources:', error);
    }
  }
}
