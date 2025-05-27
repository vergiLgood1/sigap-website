import { PrismaClient } from "@prisma/client";
import { rolesData } from '../data/jsons/roles';

export class RoleSeeder {
  constructor(private prisma: PrismaClient) {}

  async run(): Promise<void> {
    console.log('Seeding roles...');

    await this.prisma.officers.deleteMany({});
    await this.prisma.patrol_units.deleteMany({});
    await this.prisma.sessions.deleteMany({});
    await this.prisma.locations.deleteMany({});
    await this.prisma.events.deleteMany({});
    await this.prisma.permissions.deleteMany({});
    await this.prisma.profiles.deleteMany({});
    await this.prisma.users.deleteMany({});
    await this.prisma.roles.deleteMany({});

    try {
      const newRole = await this.prisma.roles.createMany({
        data: rolesData,
        skipDuplicates: true,
      });

      console.log(
        'Roles seeded:',
        rolesData.map((role) => role.name).join(', ')
      );
    } catch (error) {
      console.error('Error seeding roles:', error);
    }
  }
}