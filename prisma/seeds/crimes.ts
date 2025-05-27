import {
  crime_incidents,
  crime_rates,
  crimes,
  events,
  PrismaClient,
  session_status,
  users,
} from "@prisma/client";
import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";
import { generateId, generateIdWithDbCounter } from "../../app/_utils/common";
import { CRegex } from "../../app/_utils/const/regex";
import db from "../db";

interface ICreateUser {
  id: string;
  email: string;
  roles_id: string;
  confirmed_at: Date | null;
  email_confirmed_at: Date | null;
  last_sign_in_at: Date | null;
  phone: string | null;
  updated_at: Date | null;
  created_at: Date | null;
  app_metadata: any;
  invited_at: Date | null;
  user_metadata: any;
  is_anonymous: boolean;
}

export class CrimesSeeder {
  constructor(private prisma: PrismaClient) {}

  async run(): Promise<void> {
    console.log("🌱 Seeding crimes data...");

    try {
      // Create test user
      const user = await this.createUsers();
      
      await db.crime_incidents.deleteMany({});
      await db.crimes.deleteMany({});

      if (!user) {
        throw new Error("Failed to create user");
      }

      // Create 5 events
      const events = await this.createEvents(user);

      // Create 5 sessions with completed status
      await this.createSessions(user, events);

      // Import original crime data with source_type = 'general'
      await this.importMonthlyCrimeData();
      await this.importYearlyCrimeData();
      await this.importAllYearSummaries();

      // Import new crime data by type with appropriate source_type
      await this.importMonthlyCrimeDataByType();
      await this.importYearlyCrimeDataByType();
      await this.importSummaryByType();

      console.log("✅ Crime seeding completed successfully.");
    } catch (error) {
      console.error("❌ Error seeding crimes:", error);
      throw error;
    }
  }

  private async createUsers() {
    const existingUser = await this.prisma.users.findFirst({
      where: { email: "sigapcompany@gmail.com" },
    });

    if (existingUser) {
      console.log("Users already exist, skipping creation.");
      return existingUser;
    }

    let roleId = await this.prisma.roles.findFirst({
      where: { name: "admin" },
    });

    if (!roleId) {
      roleId = await this.prisma.roles.create({
        data: {
          name: "admin",
          description: "Administrator role",
        },
      });
    }

    const newUser = await this.prisma.users.create({
      data: {
        email: "sigapcompany@gmail.com",
        roles_id: roleId.id,
        confirmed_at: new Date(),
        email_confirmed_at: new Date(),
        last_sign_in_at: null,
        phone: null,
        updated_at: new Date(),
        created_at: new Date(),
        app_metadata: {},
        invited_at: null,
        user_metadata: {},
        is_anonymous: false,
        profile: {
          create: {
            first_name: "Admin",
            last_name: "Sigap",
            username: "adminsigap",
          },
        },
      },
    });

    return newUser;
  }

  private async createEvents(user: ICreateUser) {
    const existingEvent = await this.prisma.events.findFirst({
      where: {
        user_id: user.id,
      },
    });

    if (existingEvent) {
      console.log("Events already exist, skipping creation.");
      return existingEvent;
    }

    const event = await this.prisma.events.create({
      data: {
        name: `Crime Inserting Event For Crime 2020 - 2024`,
        description: `Event for inserting crimes in region Jember`,
        user_id: user.id,
      },
    });

    return event;
  }

  private async createSessions(user: ICreateUser, events: events) {
    const existingSession = await this.prisma.sessions.findFirst();

    if (existingSession) {
      console.log("Sessions already exist, skipping creation.");
      return;
    }

    const newSession = await this.prisma.sessions.create({
      data: {
        user_id: user.id,
        event_id: events.id,
        status: session_status.completed,
      },
    });

    return newSession;
  }

  private async chunkedCreateMany(data: any[], chunkSize: number = 500) {
    for (let i = 0; i < data.length; i += chunkSize) {
      const chunk = data.slice(i, i + chunkSize);
      await this.prisma.crimes.createMany({
        data: chunk,
      });
    }
  }

  private async importMonthlyCrimeData() {
    console.log("Importing monthly crime data...");

    // const existingCrimes = await this.prisma.crimes.findFirst({
    //   where: {
    //     source_type: "cbu",
    //   },
    // });

    // if (existingCrimes) {
    //   console.log("General crimes data already exists, skipping import.");
    //   return;
    // }

    const csvFilePath = path.resolve(
      __dirname,
      "../data/excels/crimes/crime_monthly_by_unit.csv",
    );
    const fileContent = fs.readFileSync(csvFilePath, { encoding: "utf-8" });

    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
    });

    const processedDistricts = new Set<string>();
    const crimesData: Array<Partial<crimes>> = [];

    for (const record of records) {
      const crimeRate = record.level.toLowerCase() as crime_rates;

      const city = await this.prisma.cities.findFirst({
        where: {
          name: "Jember",
        },
      });

      if (!city) {
        console.error("City not found: Jember");
        return;
      }

      const year = parseInt(record.year);
      const crimeId = await generateIdWithDbCounter(
        "crimes",
        {
          prefix: "CR",
          segments: {
            codes: [city.id],
            sequentialDigits: 4,
            year,
          },
          format: "{prefix}-{codes}-{sequence}-{year}",
          separator: "-",
          uniquenessStrategy: "counter",
        },
        CRegex.FORMAT_ID_YEAR_SEQUENCE,
      );

      crimesData.push({
        id: crimeId,
        district_id: record.district_id,
        level: crimeRate,
        method: record.method || null,
        month: parseInt(record.month_num),
        year: parseInt(record.year),
        number_of_crime: parseInt(record.number_of_crime),
        crime_cleared: parseInt(record.crime_cleared) || 0,
        score: parseFloat(record.score),
        source_type: "cbu",
      });

      processedDistricts.add(record.district_id);
    }

    await this.chunkedCreateMany(crimesData);

    console.log(`Imported ${records.length} monthly crime records.`);
  }

  private async importYearlyCrimeData() {
    console.log("Importing yearly crime data...");

    // const existingYearlySummary = await this.prisma.crimes.findFirst({
    //   where: {
    //     month: null,
    //     source_type: "cbu",
    //   },
    // });

    // if (existingYearlySummary) {
    //   console.log("Yearly crime data already exists, skipping import.");
    //   return;
    // }

    const csvFilePath = path.resolve(
      __dirname,
      "../data/excels/crimes/crime_yearly_by_unit.csv",
    );
    const fileContent = fs.readFileSync(csvFilePath, { encoding: "utf-8" });

    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
    });

    const crimesData: Array<Partial<crimes>> = [];

    for (const record of records) {
      const crimeRate = record.level.toLowerCase() as crime_rates;
      const year = parseInt(record.year);

      const city = await this.prisma.cities.findFirst({
        where: {
          districts: {
            some: {
              id: record.district_id,
            },
          },
        },
      });

      if (!city) {
        console.error(`City not found for district ${record.district_id}`);
        continue;
      }

      const crimeId = await generateIdWithDbCounter(
        "crimes",
        {
          prefix: "CR",
          segments: {
            codes: [city.id],
            sequentialDigits: 4,
            year,
          },
          format: "{prefix}-{codes}-{sequence}-{year}",
          separator: "-",
          uniquenessStrategy: "counter",
        },
        CRegex.FORMAT_ID_YEAR_SEQUENCE,
      );

      crimesData.push({
        id: crimeId,
        district_id: record.district_id,
        level: crimeRate,
        method: record.method || "kmeans",
        month: null,
        year: year,
        number_of_crime: parseInt(record.number_of_crime),
        crime_cleared: parseInt(record.crime_cleared) || 0,
        avg_crime: parseFloat(record.avg_crime) || 0,
        score: parseInt(record.score),
        source_type: "cbu",
      });
    }

    await this.chunkedCreateMany(crimesData);

    console.log(`Imported ${records.length} yearly crime records.`);
  }

  private async importAllYearSummaries() {
    console.log("Importing all-year (2020-2024) crime summaries...");

    // const existingAllYearSummaries = await this.prisma.crimes.findFirst({
    //   where: {
    //     month: null,
    //     year: null,
    //     source_type: "cbu",
    //   },
    // });

    // if (existingAllYearSummaries) {
    //   console.log("All-year crime summaries already exist, skipping import.");
    //   return;
    // }

    const csvFilePath = path.resolve(
      __dirname,
      "../data/excels/crimes/crime_summary_by_unit.csv",
    );

    const fileContent = fs.readFileSync(csvFilePath, { encoding: "utf-8" });

    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
    });

    const crimesData: Array<Partial<crimes>> = [];

    for (const record of records) {
      const crimeRate = record.level.toLowerCase() as crime_rates;
      const districtId = record.district_id;

      const city = await this.prisma.cities.findFirst({
        where: {
          districts: {
            some: {
              id: districtId,
            },
          },
        },
      });

      if (!city) {
        console.error(`City not found for district ${districtId}`);
        continue;
      }

      const crimeId = await generateIdWithDbCounter(
        "crimes",
        {
          prefix: "CR",
          segments: {
            codes: [city.id],
            sequentialDigits: 4,
          },
          format: "{prefix}-{codes}-{sequence}",
          separator: "-",
          uniquenessStrategy: "counter",
        },
        CRegex.FORMAT_ID_SEQUENCE_END,
      );

      crimesData.push({
        id: crimeId,
        district_id: districtId,
        level: crimeRate,
        method: "kmeans",
        month: null,
        year: null,
        number_of_crime: parseInt(record.crime_total),
        crime_cleared: parseInt(record.crime_cleared) || 0,
        avg_crime: parseFloat(record.avg_crime) || 0,
        score: parseFloat(record.score),
        source_type: "cbu",
      });
    }

    await this.chunkedCreateMany(crimesData);

    console.log(`Imported ${records.length} all-year crime summaries.`);
  }

  private async importMonthlyCrimeDataByType() {
    console.log("Importing monthly crime data by type...");

    // const existingCrimeByType = await this.prisma.crimes.findFirst({
    //   where: {
    //     source_type: "cbt",
    //   },
    // });

    // if (existingCrimeByType) {
    //   console.log("Crime data by type already exists, skipping import.");
    //   return;
    // }

    const csvFilePath = path.resolve(
      __dirname,
      "../data/excels/crimes/crime_monthly_by_type.csv",
    );
    const fileContent = fs.readFileSync(csvFilePath, { encoding: "utf-8" });

    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
    });

    const crimesData: Array<Partial<crimes>> = [];

    for (const record of records) {
      const crimeRate = record.level.toLowerCase() as crime_rates;

      const city = await this.prisma.cities.findFirst({
        where: {
          name: "Jember",
        },
      });

      if (!city) {
        console.error("City not found: Jember");
        continue;
      }

      const year = parseInt(record.year);
      const crimeId = await generateIdWithDbCounter(
        "crimes",
        {
          prefix: "CR",
          segments: {
            codes: [city.id],
            sequentialDigits: 4,
            year,
          },
          format: "{prefix}-{codes}-{sequence}-{year}",
          separator: "-",
          uniquenessStrategy: "counter",
        },
        CRegex.FORMAT_ID_YEAR_SEQUENCE,
      );

      crimesData.push({
        id: crimeId,
        district_id: record.district_id,
        level: crimeRate,
        method: record.method || "kmeans",
        month: parseInt(record.month_num),
        year: parseInt(record.year),
        number_of_crime: parseInt(record.number_of_crime),
        crime_cleared: parseInt(record.crime_cleared) || 0,
        score: parseFloat(record.score),
        source_type: "cbt",
      });
    }

    await this.chunkedCreateMany(crimesData);

    console.log(`Imported ${records.length} monthly crime by type records.`);
  }

  private async importYearlyCrimeDataByType() {
    console.log("Importing yearly crime data by type...");

    // const existingYearlySummary = await this.prisma.crimes.findFirst({
    //   where: {
    //     month: null,
    //     source_type: "cbt",
    //   },
    // });

    // if (existingYearlySummary) {
    //   console.log("Yearly crime data by type already exists, skipping import.");
    //   return;
    // }

    const csvFilePath = path.resolve(
      __dirname,
      "../data/excels/crimes/crime_yearly_by_type.csv",
    );
    const fileContent = fs.readFileSync(csvFilePath, { encoding: "utf-8" });

    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
    });

    const crimesData: Array<Partial<crimes>> = [];

    for (const record of records) {
      const crimeRate = record.level.toLowerCase() as crime_rates;
      const year = parseInt(record.year);

      const city = await this.prisma.cities.findFirst({
        where: {
          districts: {
            some: {
              id: record.district_id,
            },
          },
        },
      });

      if (!city) {
        console.error(`City not found for district ${record.district_id}`);
        continue;
      }

      const crimeId = await generateIdWithDbCounter(
        "crimes",
        {
          prefix: "CR",
          segments: {
            codes: [city.id],
            sequentialDigits: 4,
            year,
          },
          format: "{prefix}-{codes}-{sequence}-{year}",
          separator: "-",
          uniquenessStrategy: "counter",
        },
        CRegex.FORMAT_ID_YEAR_SEQUENCE,
      );

      crimesData.push({
        id: crimeId,
        district_id: record.district_id,
        level: crimeRate,
        method: record.method || "kmeans",
        month: null,
        year: year,
        number_of_crime: parseInt(record.number_of_crime),
        crime_cleared: parseInt(record.crime_cleared) || 0,
        avg_crime: parseFloat(record.avg_crime) || 0,
        score: parseInt(record.score),
        source_type: "cbt",
      });
    }

    await this.chunkedCreateMany(crimesData);

    console.log(`Imported ${records.length} yearly crime by type records.`);
  }

  private async importSummaryByType() {
    console.log("Importing crime summary by type...");

    // const existingSummary = await this.prisma.crimes.findFirst({
    //   where: {
    //     source_type: "cbt",
    //   },
    // });

    // if (existingSummary) {
    //   console.log("Crime summary by type already exists, skipping import.");
    //   return;
    // }

    const csvFilePath = path.resolve(
      __dirname,
      "../data/excels/crimes/crime_summary_by_type.csv",
    );
    const fileContent = fs.readFileSync(csvFilePath, { encoding: "utf-8" });

    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
    });

    const crimesData: Array<Partial<crimes>> = [];

    for (const record of records) {
      const crimeRate = record.level.toLowerCase() as crime_rates;

      const city = await this.prisma.cities.findFirst({
        where: {
          name: "Jember",
        },
      });

      if (!city) {
        console.error("City not found: Jember");
        continue;
      }

      const crimeId = await generateIdWithDbCounter(
        "crimes",
        {
          prefix: "CR",
          segments: {
            codes: [city.id],
            sequentialDigits: 4,
          },
          format: "{prefix}-{codes}-{sequence}",
          separator: "-",
          uniquenessStrategy: "counter",
        },
        CRegex.FORMAT_ID_SEQUENCE_END,
      );

      crimesData.push({
        id: crimeId,
        district_id: record.district_id,
        level: crimeRate,
        method: "kmeans",
        month: null,
        year: null,
        number_of_crime: parseInt(record.crime_total),
        crime_cleared: parseInt(record.crime_cleared) || 0,
        avg_crime: parseFloat(record.avg_crime) || 0,
        score: parseFloat(record.score),
        source_type: "cbt",
      });
    }

    await this.chunkedCreateMany(crimesData);

    console.log(`Imported ${records.length} crime summary by type records.`);
  }
}

// This allows the file to be executed standalone for testing
if (require.main === module) {
  const testSeeder = async () => {
    const prisma = new PrismaClient();
    const seeder = new CrimesSeeder(prisma);
    try {
      await seeder.run();
    } catch (e) {
      console.error("Error during seeding:", e);
      process.exit(1);
    } finally {
      await prisma.$disconnect();
    }
  };

  testSeeder();
}
