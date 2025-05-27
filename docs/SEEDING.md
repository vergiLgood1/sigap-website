# Discalimer

seed.ts in root project is a seed for dummy datas

# Database Seeding Instructions

This document explains how to seed the SIGAP database with sample data.

## Prerequisites

- Node.js installed
- Required environment variables set (including database and Supabase credentials)
- Required data files in place (Excel files, GeoJSON, etc.)

## Running the Seed Script

The main seeding script is designed to use both Snaplbaet and native Prisma operations to populate the database:

```bash
# Run the seed script
npx tsx seed.ts
```

## What Gets Seeded

The seeding process runs the following operations in sequence:

1. Geographic data (cities, districts, geographic boundaries)
2. Police units (Polres and Polsek locations)
3. Permissions (Role-based access control)
4. Crime categories
5. Crime data (by unit and by type)
6. Crime incidents (by unit and by type)

## Seeding Control

By default, the script will not reset your database. To enable database reset before seeding, uncomment the reset lines in `seed.ts`:

```typescript
// Uncomment to reset database before seeding
// console.log("Resetting database...");
// await seed.$resetDatabase();
// console.log("Database reset complete.");
```

## Customizing Seeds

Each seeder is contained in its own file under `prisma/seeds/`. To customize the seeding behavior, edit the corresponding file:

- `geographic.ts` - Seeds geographic data
- `units.ts` - Seeds police units
- `permission.ts` - Seeds permissions
- `crime-category.ts` - Seeds crime categories
- `crimes.ts` - Seeds crime data
- `crime-incidents.ts` - Seeds crime incidents by unit
- `crime-incidents-cbt.ts` - Seeds crime incidents by type

## Performance Optimizations

The seeders include several optimizations to handle large datasets:

- Chunked batch operations
- Automatic retry with smaller batch sizes on failure
- Progress monitoring
- Throttling to prevent database overload
