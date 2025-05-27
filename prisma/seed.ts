// prisma/seeder.ts
import { PrismaClient } from '@prisma/client';
import { RoleSeeder } from './seeds/role';
import { ResourceSeeder } from './seeds/resource';
import { PermissionSeeder } from './seeds/permission';
import { GeoJSONSeeder } from './seeds/geographic';
import { execSync } from 'child_process';
import { DemographicsSeeder } from './seeds/demographic';
import { CrimeCategoriesSeeder } from './seeds/crime-category';

import { UnitSeeder } from './seeds/units';
import { PatrolUnitsSeeder } from './seeds/patrol-units';
import { OfficersSeeder } from './seeds/officers';
import { CrimesSeeder } from './seeds/crimes';
import { CrimeIncidentsByUnitSeeder } from './seeds/crime-incidents';
import { CrimeIncidentsByTypeSeeder } from './seeds/crime-incidents-cbt';
import { IncidentLogSeeder } from './seeds/incident-logs';

const prisma = new PrismaClient();

// Interface untuk standarisasi struktur seeder
interface Seeder {
  run: () => Promise<void>;
}

// Class utama untuk menjalankan semua seeders
class DatabaseSeeder {
  private seeders: Seeder[] = [];
  private shouldReset: boolean = false; // Set true jika ingin mereset database sebelum seeding

  constructor(shouldReset: boolean = true) {
    this.shouldReset = shouldReset;

    // Daftar semua seeders di sini
    this.seeders = [
      // new RoleSeeder(prisma),
      // new ResourceSeeder(prisma),
      // new PermissionSeeder(prisma),
      // new CrimeCategoriesSeeder(prisma),
      // new GeoJSONSeeder(prisma),
      // new UnitSeeder(prisma),
      new PatrolUnitsSeeder(prisma),
      // new OfficersSeeder(prisma),
      // new DemographicsSeeder(prisma),
      // new CrimesSeeder(prisma),
      // new CrimeIncidentsByUnitSeeder(prisma),
      // new CrimeIncidentsByTypeSeeder(prisma),
      // new IncidentLogSeeder(prisma),
    ];
  }

  async run() {
    // Jalankan migrate reset jika diperlukan
    if (this.shouldReset) {
      console.log('🔄 Menjalankan prisma migrate reset...');
      try {
        // Jalankan perintah dengan --force untuk melewati konfirmasi
        execSync('npx prisma migrate reset --force', { stdio: 'inherit' });
        console.log('✅ Database telah direset');
      } catch (error) {
        console.error('❌ Gagal mereset database:', error);
        throw error;
      }
    }

    console.log('🌱 Mulai seeding database...');

    for (const seeder of this.seeders) {
      await seeder.run();
    }

    console.log('✅ Seeding selesai!');
  }
}

// File untuk menjalankan seeder
async function main() {
  try {
    // Parameter pertama mengontrol apakah akan melakukan reset database
    // Default: true (akan melakukan reset)
    const shouldReset = process.argv.includes('--no-reset') ? false : true;

    const seeder = new DatabaseSeeder(shouldReset);
    await seeder.run();
  } catch (error) {
    console.error('Error saat seeding:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
