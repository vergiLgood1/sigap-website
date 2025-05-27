import {
    crime_incidents,
    crime_rates,
    crime_status,
    crimes,
    locations,
    PrismaClient,
} from "@prisma/client";
import { generateId, generateIdWithDbCounter } from "../../app/_utils/common";
import { createClient } from "../../app/_utils/supabase/client";
import * as fs from "fs";
import * as path from "path";
import { CRegex } from "../../app/_utils/const/regex";

import { districtCenters } from "../data/jsons/district-center";
import { districtsGeoJson } from "../data/geojson/jember/districts-geojson";
import { villagesGeoJson } from "../data/geojson/jember/villages-geojson";
import { districtCoordinates, IDistrictCoordinates } from "../data/jsons/district-coordinates";


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

// New type for crime data structure from JSON
interface CrimeData {
    district_id: string;
    district_name: string;
    month: string;
    year: number;
    [key: string]: string | number; // For dynamic crime category fields ending with "_crimes"
    crime_cleared: number;
    number_of_crime: number;
}

export class CrimeIncidentsByTypeSeeder {
    private crimeMonthlyData: Map<
        string,
        {
            number_of_crime: number;
            crime_cleared: number;
            categories: { [category: string]: number };
        }
    > = new Map();

    private monthNameMap: { [key: string]: number } = {
        "JAN": 1,
        "FEB": 2,
        "MAR": 3,
        "APR": 4,
        "MAY": 5,
        "JUN": 6,
        "JUL": 7,
        "AUG": 8,
        "SEP": 9,
        "OCT": 10,
        "NOV": 11,
        "DEC": 12,
    };

    constructor(
        private prisma: PrismaClient,
        private supabase = createClient(),
    ) { }

    private async loadCrimeMonthlyData(): Promise<void> {
        const jsonFilePath = path.resolve(
            __dirname,
            "../data/jsons/crimes/cbt.json",
        );

        return new Promise((resolve, reject) => {
            fs.readFile(jsonFilePath, "utf8", (err, data) => {
                if (err) {
                    console.error(
                        "Error reading crime monthly JSON data:",
                        err,
                    );
                    reject(err);
                    return;
                }

                try {
                    const crimeData: CrimeData[] = JSON.parse(data);

                    for (const row of crimeData) {
                        const monthNum = this.monthNameToNumber(row.month);
                        const key =
                            `${row.district_id}-${monthNum}-${row.year}`;

                        // Extract crime categories (fields ending with "_crimes")
                        const categories: { [category: string]: number } = {};
                        for (const [field, value] of Object.entries(row)) {
                            if (
                                field.endsWith("_crimes") &&
                                typeof value === "number"
                            ) {
                                // Extract category name from field name (remove "_crimes" suffix)
                                const categoryName = field.slice(0, -7);
                                categories[categoryName] = value;
                            }
                        }

                        this.crimeMonthlyData.set(key, {
                            number_of_crime: row.number_of_crime as number,
                            crime_cleared: row.crime_cleared as number,
                            categories: categories,
                        });
                    }

                    resolve();
                } catch (error) {
                    console.error(
                        "Error parsing crime monthly JSON data:",
                        error,
                    );
                    reject(error);
                }
            });
        });
    }

    private monthNameToNumber(monthName: string): number {
        const month = this.monthNameMap[monthName.toUpperCase()];
        if (!month) {
            console.warn(
                `Unknown month name: ${monthName}, defaulting to January`,
            );
            return 1;
        }
        return month;
    }

    /**
     * Generates mock incidents for 2025 data
     */
    private async generateMock2025Incidents(): Promise<void> {
        const crimes2025 = await this.prisma.crimes.findMany({
            where: {
                year: 2025,
                month: { not: null },
                source_type: "cbt",
            },
            orderBy: [{ district_id: "asc" }, { month: "asc" }],
        });

        if (crimes2025.length === 0) {
            return;
        }

        const crimeCategories = await this.prisma.crime_categories.findMany();

        let totalIncidentsCreated = 0;
        let totalMatched = 0;
        let totalMismatched = 0;
        let totalResolved = 0;
        let districtsProcessed = new Set();

        for (const crimeRecord of crimes2025) {
            if (
                !crimeRecord.number_of_crime || crimeRecord.number_of_crime <= 0
            ) {
                continue;
            }

            const incidents = await this.createMockIncidentsForCrime(
                crimeRecord,
                crimeCategories,
            );

            totalIncidentsCreated += incidents.length;
            districtsProcessed.add(crimeRecord.district_id);
            totalResolved += incidents.filter((inc) =>
                inc.status === "resolved"
            ).length;
            totalMatched += Math.min(3, Math.floor(Math.random() * 5));
        }

        console.log("\n📊 2025 Mock Data Summary:");
        console.log(`├─ Total incidents created: ${totalIncidentsCreated}`);
        console.log(`├─ Districts processed: ${districtsProcessed.size}`);
        console.log(
            `├─ Categories: ${totalMatched} matched, ${totalMismatched} mismatched`,
        );
        console.log(`└─ Total resolved cases: ${totalResolved}`);
    }

    private async createMockIncidentsForCrime(
        crime: crimes,
        allCategories: any[],
    ): Promise<any[]> {
        const incidentsCreated = [];

        const district = await this.prisma.districts.findUnique({
            where: { id: crime.district_id },
            include: { cities: true },
        });

        if (!district) {
            return [];
        }

        const geo = await this.prisma.geographics.findFirst({
            where: {
                district_id: district.id,
                year: crime.year ?? 2025,
            },
            orderBy: {
                year: "desc",
            },
            select: {
                latitude: true,
                longitude: true,
                land_area: true,
            },
        });

        if (!geo) {
            return [];
        }

        const numberOfCrimes = crime.number_of_crime || 10;
        const crimesCleared = Math.floor(
            numberOfCrimes * (0.3 + Math.random() * 0.4),
        );

        const locationPool = this.generateDistributedPoints(
            geo.land_area!,
            numberOfCrimes,
            district.id,
            district.name,
        );

        const jemberStreets = [
            "Jalan Pahlawan",
            "Jalan Merdeka",
            "Jalan Cendrawasih",
            "Jalan Srikandi",
            "Jalan Sumbermujur",
            "Jalan Taman Siswa",
            "Jalan Pantai",
            "Jalan Raya Sumberbaru",
            "Jalan Abdurrahman Saleh",
            "Jalan Mastrip",
            "Jalan PB Sudirman",
            "Jalan Kalimantan",
            "Jalan Sumatra",
            "Jalan Jawa",
            "Jalan Gajah Mada",
            "Jalan Letjen Suprapto",
            "Jalan Hayam Wuruk",
            "Jalan Trunojoyo",
            "Jalan Imam Bonjol",
            "Jalan Diponegoro",
            "Jalan Ahmad Yani",
            "Jalan Kartini",
            "Jalan Gatot Subroto",
        ];

        const placeTypes = [
            "Perumahan",
            "Apartemen",
            "Komplek",
            "Pasar",
            "Toko",
            "Terminal",
            "Stasiun",
            "Kampus",
            "Sekolah",
            "Perkantoran",
            "Pertokoan",
            "Pusat Perbelanjaan",
            "Taman",
            "Alun-alun",
            "Simpang",
            "Pertigaan",
            "Perempatan",
        ];

        const user = await this.prisma.users.findFirst({
            where: {
                email: "sigapcompany@gmail.com",
            },
            select: {
                id: true,
            },
        });

        if (!user) {
            return [];
        }

        const event = await this.prisma.events.findFirst({
            where: {
                user_id: user.id,
            },
        });

        if (!event) {
            return [];
        }

        const incidentsToCreate: Partial<crime_incidents>[] = [];
        const locationsToCreate: Partial<locations>[] = [];

        const categoryDistribution: { categoryId: string; count: number }[] =
            [];

        let remainingCrimes = numberOfCrimes;
        const shuffledCategories = [...allCategories].sort(() =>
            Math.random() - 0.5
        );

        const categoriesToUse = Math.max(
            1,
            Math.min(3, Math.floor(Math.random() * 5)),
        );

        for (
            let i = 0;
            i < categoriesToUse && i < shuffledCategories.length &&
            remainingCrimes > 0;
            i++
        ) {
            const category = shuffledCategories[i];

            if (
                i === categoriesToUse - 1 || i === shuffledCategories.length - 1
            ) {
                categoryDistribution.push({
                    categoryId: category.id,
                    count: remainingCrimes,
                });
                remainingCrimes = 0;
            } else {
                const count = Math.max(
                    1,
                    Math.floor(remainingCrimes * (0.2 + Math.random() * 0.6)),
                );
                categoryDistribution.push({
                    categoryId: category.id,
                    count: count,
                });
                remainingCrimes -= count;
            }
        }

        let resolvedCount = 0;

        for (const category of categoryDistribution) {
            for (let i = 0; i < category.count; i++) {
                const year = 2025;
                const month = (crime.month as number) - 1;

                const maxDay = new Date(year, month + 1, 0).getDate();
                const day = Math.floor(Math.random() * maxDay) + 1;
                const hour = Math.floor(Math.random() * 24);
                const minute = Math.floor(Math.random() * 60);

                const timestamp = new Date(year, month, day, hour, minute);

                const randomLocationIndex = Math.floor(
                    Math.random() * locationPool.length,
                );
                const selectedLocation = locationPool[randomLocationIndex];

                const streetName = jemberStreets[
                    Math.floor(Math.random() * jemberStreets.length)
                ];
                const buildingNumber = Math.floor(Math.random() * 200) + 1;
                const placeType =
                    placeTypes[Math.floor(Math.random() * placeTypes.length)];

                let randomAddress;
                const addressType = Math.floor(Math.random() * 3);
                switch (addressType) {
                    case 0:
                        randomAddress =
                            `${streetName} No. ${buildingNumber}, ${district.name}, Jember`;
                        break;
                    case 1:
                        randomAddress =
                            `${placeType} ${district.name}, ${streetName}, Jember`;
                        break;
                    case 2:
                        randomAddress = `${streetName} Blok ${String.fromCharCode(
                            65 + Math.floor(Math.random() * 26),
                        )
                            }-${Math.floor(Math.random() * 20) + 1
                            }, ${district.name}, Jember`;
                        break;
                }

                const locationData: Partial<ICreateLocations> = {
                    district_id: district.id,
                    event_id: event.id,
                    address: randomAddress,
                    type: "crime incident",
                    latitude: selectedLocation.latitude,
                    longitude: selectedLocation.longitude,
                    location:
                        `POINT(${selectedLocation.longitude} ${selectedLocation.latitude})`,
                };

                locationsToCreate.push(locationData);

                const incidentId = await generateIdWithDbCounter(
                    "crime_incidents",
                    {
                        prefix: "CI",
                        segments: {
                            codes: [district.city_id],
                            sequentialDigits: 4,
                            year,
                        },
                        format: "{prefix}-{codes}-{sequence}-{year}",
                        separator: "-",
                        uniquenessStrategy: "counter",
                    },
                    CRegex.FORMAT_ID_YEAR_SEQUENCE,
                );

                const status = resolvedCount < crimesCleared
                    ? ("resolved" as crime_status)
                    : ("unresolved" as crime_status);

                if (status === "resolved") {
                    resolvedCount++;
                }

                const categoryDetails = allCategories.find((c) =>
                    c.id === category.categoryId
                );

                const categoryName = categoryDetails.name;

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

                const randomLocation =
                    locs[Math.floor(Math.random() * locs.length)];

                const descriptions = [
                    `Kasus ${categoryName.toLowerCase()} ${randomAddress}`,
                    `Laporan ${categoryName.toLowerCase()} terjadi pada ${timestamp} ${randomLocation}`,
                    `${categoryName} dilaporkan ${randomLocation}`,
                    `Insiden ${categoryName.toLowerCase()} terjadi ${randomLocation}`,
                    `Kejadian ${categoryName.toLowerCase()} ${randomLocation}`,
                    `${categoryName} terdeteksi ${randomLocation} pada ${timestamp.toLocaleTimeString()}`,
                    `Pelaporan ${categoryName.toLowerCase()} di ${randomAddress}`,
                    `Kasus ${categoryName.toLowerCase()} terjadi di ${streetName}`,
                    `${categoryName} terjadi di dekat ${placeType.toLowerCase()} ${district.name}`,
                    `Insiden ${categoryName.toLowerCase()} dilaporkan warga setempat ${randomLocation}`,
                ];

                const randomDescription = descriptions[
                    Math.floor(Math.random() * descriptions.length)
                ];

                incidentsToCreate.push({
                    id: incidentId,
                    crime_id: crime.id,
                    crime_category_id: category.categoryId,
                    location_id: undefined as string | undefined,
                    description: randomDescription,
                    victim_count: 0,
                    status: status,
                    timestamp: timestamp,
                });
            }
        }

        try {
            await this.chunkedInsertLocations(locationsToCreate);
        } catch (error) {
            return [];
        }

        const createdLocations = await this.prisma.locations.findMany({
            where: {
                event_id: event.id,
                district_id: district.id,
                address: {
                    in: locationsToCreate
                        .map((loc) => loc.address)
                        .filter((address): address is string =>
                            address !== undefined
                        ),
                },
            },
            select: {
                id: true,
                address: true,
            },
        });

        const addressToId = new Map<string, string>();
        for (const loc of createdLocations) {
            if (loc.address !== null) {
                addressToId.set(loc.address, loc.id);
            }
        }

        for (let i = 0; i < incidentsToCreate.length; i++) {
            const address = locationsToCreate[i].address;
            if (typeof address === "string") {
                incidentsToCreate[i].location_id = addressToId.get(address);
            }
        }

        await this.chunkedInsertIncidents(incidentsToCreate);

        incidentsCreated.push(...incidentsToCreate);

        return incidentsCreated;
    }

    private async chunkedInsertIncidents(data: any[], chunkSize: number = 200) {
        for (let i = 0; i < data.length; i += chunkSize) {
            const chunk = data.slice(i, i + chunkSize);
            await this.prisma.crime_incidents.createMany({
                data: chunk,
                skipDuplicates: true,
            });
        }
    }

    private async chunkedInsertLocations(
        locations: any[],
        chunkSize: number = 200,
    ) {
        for (let i = 0; i < locations.length; i += chunkSize) {
            const chunk = locations.slice(i, i + chunkSize);
            let { error } = await this.supabase
                .from("locations")
                .insert(chunk)
                .select();
            if (error) {
                throw error;
            }
        }
    }

    async run(): Promise<void> {
        console.log("🌱 Seeding crime incidents data...");

        try {
            await this.loadCrimeMonthlyData();

            const existingIncidents = await this.prisma.crime_incidents
                .findFirst({
                    where: {
                        crimes: {
                            source_type: "cbt",
                        },
                    },
                });

            if (existingIncidents) {
                const existing2025Incidents = await this.prisma.crime_incidents
                    .findFirst({
                        where: {
                            timestamp: {
                                gte: new Date("2025-01-01"),
                                lt: new Date("2026-01-01"),
                            },
                        },
                    });

                if (!existing2025Incidents) {
                    await this.generateMock2025Incidents();
                }

                return;
            }

            const crimeRecords = await this.prisma.crimes.findMany({
                where: {
                    month: { not: null },
                    number_of_crime: { gt: 0 },
                    source_type: "cbt",
                    year: { lt: 2025 },
                },
                orderBy: [{ district_id: "asc" }, { year: "asc" }, {
                    month: "asc",
                }],
            });

            const crimeCategories = await this.prisma.crime_categories
                .findMany();
            if (crimeCategories.length === 0) {
                console.error(
                    "No crime categories found, please seed crime categories first",
                );
                return;
            }

            let totalIncidentsCreated = 0;
            let skippedMonths = 0;
            let processingStats = {
                districts: new Set(),
                years: new Set(),
                totalMatched: 0,
                totalMismatched: 0,
                totalResolved: 0,
                totalUnresolved: 0,
            };

            let yearlyStats = new Map<number, {
                incidents: number;
                resolved: number;
                matched: number;
                mismatched: number;
                districts: Set<string>;
            }>();

            for (const crimeRecord of crimeRecords) {
                if (crimeRecord.number_of_crime === 0) {
                    skippedMonths++;
                    continue;
                }

                const key =
                    `${crimeRecord.district_id}-${crimeRecord.month}-${crimeRecord.year}`;
                const crimeMonthlyInfo = this.crimeMonthlyData.get(key);

                if (
                    !crimeMonthlyInfo || crimeMonthlyInfo.number_of_crime <= 0
                ) {
                    skippedMonths++;
                    continue;
                }

                processingStats.districts.add(crimeRecord.district_id);
                processingStats.years.add(crimeRecord.year);

                const incidents = await this.createMockIncidentsForCrime(
                    crimeRecord,
                    crimeCategories,
                );

                const year = crimeRecord.year || 0;
                if (!yearlyStats.has(year)) {
                    yearlyStats.set(year, {
                        incidents: 0,
                        resolved: 0,
                        matched: 0,
                        mismatched: 0,
                        districts: new Set(),
                    });
                }

                const yearStats = yearlyStats.get(year)!;
                yearStats.incidents += incidents.length;
                yearStats.districts.add(crimeRecord.district_id);

                const resolvedCount = incidents.filter((inc) =>
                    inc.status === "resolved"
                ).length;
                yearStats.resolved += resolvedCount;

                if (crimeMonthlyInfo) {
                    const categoryCount =
                        Object.keys(crimeMonthlyInfo.categories).length;
                    yearStats.matched += categoryCount - 1;
                    yearStats.mismatched += 1;
                }

                totalIncidentsCreated += incidents.length;
            }

            for (const [year, stats] of Array.from(yearlyStats.entries())) {
                console.log(`\n📊 ${year} Data Summary:`);
                console.log(`├─ Total incidents created: ${stats.incidents}`);
                console.log(`├─ Districts processed: ${stats.districts.size}`);
                console.log(`└─ Total resolved cases: ${stats.resolved}`);
            }

            await this.generateMock2025Incidents();

            console.log("✅ Seeding selesai!");
        } catch (error) {
            console.error("❌ Error seeding crime incidents:", error);
            throw error;
        }
    }

    private generateDistributedPoints(
        landArea: number,
        numPoints: number,
        districtId: string,
        districtName: string,
    ): Array<{ latitude: number; longitude: number; radius: number }> {
        const points = [];
        const districtNameLower = districtName.toLowerCase();

        // Coba gunakan districtCoordinates terlebih dahulu (sumber data baru)
        const districtCoord = (districtCoordinates as IDistrictCoordinates[]).find(
            (coord) => coord.kecamatan && coord.kecamatan.toLowerCase() === districtNameLower
        );

        if (districtCoord && districtCoord.points && districtCoord.points.length > 0) {
            console.log(`Using districtCoordinates for: ${districtName}`);

            // Filter valid coordinates - check if points are objects with lat/lng
            const validPoints = districtCoord.points.filter(point =>
                point && typeof point === 'object' &&
                'lat' in point && typeof point.lat === 'number' &&
                'lng' in point && typeof point.lng === 'number'
            );

            if (validPoints.length > 0) {
                // If enough points, sample randomly; otherwise, interpolate
                if (numPoints <= validPoints.length) {
                    // Shuffle and pick numPoints
                    const shuffled = [...validPoints].sort(() => 0.5 - Math.random());
                    for (let i = 0; i < numPoints; i++) {
                        const point = shuffled[i];
                        const noise = 0.0002 * (Math.random() - 0.5);
                        points.push({
                            latitude: point.lat + noise,
                            longitude: point.lng + noise,
                            radius: 100 + Math.random() * 400,
                        });
                    }
                } else {
                    // Use all points, then interpolate between random pairs for the rest
                    validPoints.forEach((point) => {
                        const noise = 0.0002 * (Math.random() - 0.5);
                        points.push({
                            latitude: point.lat + noise,
                            longitude: point.lng + noise,
                            radius: 100 + Math.random() * 400,
                        });
                    });

                    for (let i = validPoints.length; i < numPoints; i++) {
                        // Pick two random points and interpolate
                        const idx1 = Math.floor(Math.random() * validPoints.length);
                        let idx2 = Math.floor(Math.random() * validPoints.length);
                        if (idx2 === idx1) idx2 = (idx2 + 1) % validPoints.length;

                        const point1 = validPoints[idx1];
                        const point2 = validPoints[idx2];

                        const t = Math.random();
                        const noise = 0.0003 * (Math.random() - 0.5);
                        points.push({
                            latitude: point1.lat * t + point2.lat * (1 - t) + noise,
                            longitude: point1.lng * t + point2.lng * (1 - t) + noise,
                            radius: 100 + Math.random() * 400,
                        });
                    }
                }

                return points;
            } else {
                console.warn(`No valid coordinates found in districtCoordinates for district: ${districtName}`);
            }
        }

        // Fallback 1: Try using GeoJSON data if districtCoordinates not available
        // Find the district feature in the GeoJSON
        const districtFeature = villagesGeoJson.features.find(
            (feature) =>
                feature.properties &&
                feature.properties.kecamatan &&
                feature.properties.kecamatan.toLowerCase() === districtNameLower
        );

        // Helper to flatten all coordinates from a GeoJSON geometry
        function extractCoordinates(geometry: any): Array<number[]> {
            if (!geometry) return [];

            if (geometry.type === "Polygon") {
                // geometry.coordinates: [ [ [lng, lat, z?], ... ] ]
                return geometry.coordinates.flat();
            }

            if (geometry.type === "MultiPolygon") {
                // geometry.coordinates: [ [ [ [lng, lat, z?], ... ] ], ... ]
                return geometry.coordinates.flat(2);
            }

            return [];
        }

        // Use coordinates from GeoJSON if available
        if (districtFeature && districtFeature.geometry) {
            console.log(`Found GeoJSON for district: ${districtName}`);

            const allCoords = extractCoordinates(districtFeature.geometry);

            // Filter valid coordinates (handle both 2D and 3D coordinates)
            const coords = allCoords.filter(c =>
                Array.isArray(c) &&
                c.length >= 2 &&
                typeof c[0] === 'number' &&
                typeof c[1] === 'number'
            );

            if (coords.length === 0) {
                console.warn(`No valid coordinates found in GeoJSON for district: ${districtName}`);
                console.log("Geometry structure:", JSON.stringify(districtFeature.geometry, null, 2));
            } else {
                console.log(`Found ${coords.length} valid coordinates for district: ${districtName}`);

                // If enough points, sample randomly; otherwise, interpolate
                if (numPoints <= coords.length) {
                    // Shuffle and pick numPoints
                    const shuffled = [...coords].sort(() => 0.5 - Math.random());
                    for (let i = 0; i < numPoints; i++) {
                        const coord = shuffled[i];
                        // Extract lng and lat (first two values), regardless of whether it's 2D or 3D
                        const lng = coord[0];
                        const lat = coord[1];
                        const noise = 0.0002 * (Math.random() - 0.5);
                        points.push({
                            latitude: lat + noise,
                            longitude: lng + noise,
                            radius: 100 + Math.random() * 400,
                        });
                    }
                } else {
                    // Use all points, then interpolate between random pairs for the rest
                    coords.forEach((coord) => {
                        const lng = coord[0];
                        const lat = coord[1];
                        const noise = 0.0002 * (Math.random() - 0.5);
                        points.push({
                            latitude: lat + noise,
                            longitude: lng + noise,
                            radius: 100 + Math.random() * 400,
                        });
                    });

                    for (let i = coords.length; i < numPoints; i++) {
                        // Pick two random points and interpolate
                        const idx1 = Math.floor(Math.random() * coords.length);
                        let idx2 = Math.floor(Math.random() * coords.length);
                        if (idx2 === idx1) idx2 = (idx2 + 1) % coords.length;

                        const coord1 = coords[idx1];
                        const coord2 = coords[idx2];

                        const lng1 = coord1[0];
                        const lat1 = coord1[1];
                        const lng2 = coord2[0];
                        const lat2 = coord2[1];

                        const t = Math.random();
                        const noise = 0.0003 * (Math.random() - 0.5);
                        points.push({
                            latitude: lat1 * t + lat2 * (1 - t) + noise,
                            longitude: lng1 * t + lng2 * (1 - t) + noise,
                            radius: 100 + Math.random() * 400,
                        });
                    }
                }

                return points;
            }
        } else {
            console.warn(`No GeoJSON feature found for district: ${districtName}`);
        }

        // Fallback 2: use district center if neither districtCoordinates nor GeoJSON is available
        const districtCenter = districtCenters.find(
            (center) => center.kecamatan.toLowerCase() === districtNameLower,
        );

        if (districtCenter) {
            console.log(`Using district center fallback for: ${districtName}`);
            const centerLat = districtCenter.lat;
            const centerLng = districtCenter.lng;
            const estimatedRadiusKm = Math.sqrt(landArea / Math.PI) / 1000;
            const radiusKm = Math.min(3, Math.max(0.5, estimatedRadiusKm));
            const radiusDeg = radiusKm / 111;

            for (let i = 0; i < numPoints; i++) {
                const angle = Math.random() * 2 * Math.PI;
                const distance = Math.pow(Math.random(), 1.5) * radiusDeg;
                const latitude = centerLat + distance * Math.cos(angle);
                const longitude = centerLng +
                    distance * Math.sin(angle) / Math.cos(centerLat * Math.PI / 180);
                const pointRadius = distance * 111000;

                points.push({
                    latitude,
                    longitude,
                    radius: pointRadius,
                });
            }
        } else {
            console.error(`No data available for district: ${districtName}`);
        }

        return points;
    }
}

if (require.main === module) {
    const testSeeder = async () => {
        const prisma = new PrismaClient();
        const seeder = new CrimeIncidentsByTypeSeeder(prisma);
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