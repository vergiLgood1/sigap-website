import { evidence, PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";
import { districtCenters } from "../data/jsons/district-center";

import { createClient } from "../../app/_utils/supabase/client";
import db from "../db";
import { generateId, generateIdWithDbCounter } from "../../app/_utils/common";
import { CRegex } from "../../app/_utils/const/regex";

export class IncidentLogSeeder {
    constructor(
        private prisma: PrismaClient,
        private supabase = createClient(),
    ) { }

    // Add run method to satisfy the Seeder interface
    async run(): Promise<void> {
        await db.incident_logs.deleteMany({});

        await this.seed();
    }

    async seed() {
        // Step 1: Create a mock user if needed
        const user = await this.getOrCreateUser();

        // Step 2: Create an event
        const event = await this.createEvent(user.id);

        // Step 3: Create a session
        const session = await this.createSession(user.id, event.id);

        // Step 4: Create locations
        const locations = await this.createLocations(event.id);

        // Step 5: Create incident logs for the past 24 hours
        await this.createIncidentLogs(user.id, locations);

        console.log("Incident logs seeded successfully");
    }

    private async getOrCreateUser() {
        // Check if we have an existing user
        const existingUser = await this.prisma.users.findFirst({
            where: { email: "incident-reporter@sigap.com" },
        });

        if (existingUser) return existingUser;

        // Get a valid role ID
        const role = await this.prisma.roles.findFirst();
        if (!role) {
            throw new Error("No roles found. Please seed roles first.");
        }

        // Create a new user if none exists
        return await this.prisma.users.create({
            data: {
                email: "incident-reporter@sigap.com",
                roles_id: role.id,
                is_anonymous: false,
            },
        });
    }

    private async createEvent(userId: string) {
        return await this.prisma.events.create({
            data: {
                name: "Incident Monitoring Event",
                description: "24-hour incident monitoring",
                user_id: userId,
            },
        });
    }

    private async createSession(userId: string, eventId: string) {
        return await this.prisma.sessions.create({
            data: {
                user_id: userId,
                event_id: eventId,
                status: "active",
            },
        });
    }

    private async createLocations(eventId: string) {
        const districts = await this.prisma.districts.findMany({});

        if (!districts.length) {
            throw new Error("No districts found. Please seed districts first.");
        }

        const locations = [];

        // Create 10 random locations across the districts
        for (let i = 0; i < 10; i++) {
            const district =
                districts[Math.floor(Math.random() * districts.length)];

            // Find matching district center by name
            const districtCenter = districtCenters.find(
                (center) =>
                    center.kecamatan.toLowerCase() ===
                    district.name.toLowerCase(),
            );

            // If we have matching center coordinates, use them as base point
            // Otherwise generate random coordinates
            let latitude, longitude;

            if (districtCenter) {
                // Generate random coordinates within 3-5km of district center
                const radius = this.getRandomInt(3000, 5000); // 3-5 km in meters
                const randomPoint = this.getRandomPointInRadius(
                    districtCenter.lat,
                    districtCenter.lng,
                    radius,
                );

                latitude = randomPoint.latitude;
                longitude = randomPoint.longitude;
            }

            const locationType = [
                "residential",
                "commercial",
                "public",
                "transportation",
            ][Math.floor(Math.random() * 4)];
            const address = faker.location.streetAddress();

            // Insert using Supabase with PostGIS
            const { data, error } = await this.supabase
                .from("locations")
                .insert({
                    district_id: district.id,
                    event_id: eventId,
                    address: address,
                    type: locationType,
                    latitude: latitude,
                    longitude: longitude,
                    location: `POINT(${longitude} ${latitude})`, // PostGIS format
                })
                .select();

            if (error) {
                console.error("Error inserting location:", error);
                continue;
            }

            if (data && data.length > 0) {
                locations.push(data[0]);
            }
        }

        return locations;
    }

    private async createIncidentLogs(userId: string, locations: any[]) {
        // Get crime categories
        const categories = await this.prisma.crime_categories.findMany({});

        if (!categories.length) {
            throw new Error(
                "No crime categories found. Please seed crime categories first.",
            );
        }

        const now = new Date();

        // Create 24 incidents data array
        const incidentData = [];
        const evidenceData = [];

        for (let i = 0; i < 24; i++) {
            const hourOffset = this.getRandomInt(0, 24); // Random hour within last 24 hours
            const timestamp = new Date(
                now.getTime() - hourOffset * 60 * 60 * 1000,
            );

            const location =
                locations[Math.floor(Math.random() * locations.length)];
            const category =
                categories[Math.floor(Math.random() * categories.length)];

            // Create incident data
            const incidentId = faker.string.uuid();
            incidentData.push({
                id: incidentId, // Generate ID here to reference in evidence
                user_id: userId,
                location_id: location.id,
                category_id: category.id,
                description: this.getRandomIncidentDescription(),
                time: timestamp,
                source: Math.random() > 0.3 ? "resident" : "reporter",
                verified: Math.random() > 0.5,
            });

            // Generate 1-3 evidence items per incident
            const numEvidenceItems = this.getRandomInt(1, 3);
            for (let j = 0; j < numEvidenceItems; j++) {
                const evidenceType = this.getRandomEvidenceType();
                // Make sure metadata is a proper Prisma InputJsonValue
                const metadata = JSON.stringify(this.generateRandomMetadata(evidenceType));

                const newEvidenceId = await generateIdWithDbCounter(
                    "evidence",
                    {
                        prefix: "EV",
                        segments: {
                            sequentialDigits: 4,
                        },
                        format: "{prefix}-{sequence}",
                        separator: "-",
                        uniquenessStrategy: "counter"
                    },
                    CRegex.FORMAT_ID_SEQUENCE
                );

                evidenceData.push({
                    id: newEvidenceId,
                    incident_id: incidentId,
                    type: evidenceType,
                    url: this.getRandomFileUrl(evidenceType),
                    description: this.getRandomEvidenceDescription(),
                    caption: faker.lorem.sentence(),
                    metadata: metadata as any,
                    uploaded_at: timestamp,
                });
            }
        }

        // Bulk insert all incidents at once
        const createdIncidents = await this.prisma.incident_logs.createMany({
            data: incidentData,
        });

        console.log(`Created ${createdIncidents.count} incident logs in bulk`);

        // Insert evidence for all incidents
        if (evidenceData.length > 0) {
            try {
                const createdEvidence = await this.prisma.evidence.createMany({
                    data: evidenceData,
                });
                console.log(`Created ${createdEvidence.count} evidence items`);
            } catch (error) {
                console.error("Error creating evidence:", error);
            }
        }

        // If you need the actual created records, query them after creation
        // const incidents = await this.prisma.incident_logs.findMany({
        //     where: {
        //         user_id: userId,
        //         time: {
        //             gte: new Date(now.getTime() - 24 * 60 * 60 * 1000),
        //         },
        //     },
        //     include: {
        //         evidence: true, // Include evidence in the results
        //     },
        //     orderBy: {
        //         time: "asc",
        //     },
        // });

        // return incidents;
    }

    // New helper methods for evidence generation
    private getRandomEvidenceType(): string {
        const types = ['image', 'video', 'audio', 'document'];
        return types[Math.floor(Math.random() * types.length)];
    }

    private getRandomFileUrl(type: string): string {
        const fileTypes: Record<string, string[]> = {
            'image': ['.jpg', '.png', '.jpeg'],
            'video': ['.mp4', '.mov', '.avi'],
            'audio': ['.mp3', '.wav', '.ogg'],
            'document': ['.pdf', '.docx', '.txt']
        };

        // Pick a random extension for that type
        const extensions = fileTypes[type] || fileTypes['image'];
        const extension = extensions[Math.floor(Math.random() * extensions.length)];

        // Generate a fake file URL
        if (type === 'image') {
            return faker.image.url();
        } else {
            // For other types, create a plausible URL
            const fileName = faker.system.fileName().replace(/\.\w+$/, '') + extension;
            return `https://evidence-storage.sigap.com/${faker.string.uuid()}/${fileName}`;
        }
    }

    private getRandomEvidenceDescription(): string {
        const descriptions = [
            "Photo of the suspect",
            "CCTV footage of the incident",
            "Audio recording of the witness statement",
            "Police report document",
            "Screenshot of online threat",
            "Image of damaged property",
            "Photo of the crime scene",
            "Video of the incident in progress",
            "Documentary evidence supporting the claim",
            "Witness photograph",
            "Receipt related to the incident",
            "Official complaint document",
            "Map of incident location with notes",
            "Audio interview with victim",
            "Security footage timestamp"
        ];

        return descriptions[Math.floor(Math.random() * descriptions.length)];
    }

    private generateRandomMetadata(type: string): object {
        // Generate random metadata based on evidence type
        switch (type) {
            case 'image':
                return {
                    width: faker.number.int({ min: 800, max: 3000 }),
                    height: faker.number.int({ min: 600, max: 2000 }),
                    size: faker.number.int({ min: 100000, max: 5000000 }),
                    format: faker.helpers.arrayElement(['jpg', 'png', 'jpeg']),
                    location: {
                        latitude: faker.location.latitude(),
                        longitude: faker.location.longitude(),
                    }
                };
            case 'video':
                return {
                    duration: faker.number.float({ min: 5, max: 180, fractionDigits: 1 }),
                    size: faker.number.int({ min: 1000000, max: 50000000 }),
                    resolution: faker.helpers.arrayElement(['720p', '1080p', '4K']),
                    format: faker.helpers.arrayElement(['mp4', 'mov', 'avi']),
                };
            case 'audio':
                return {
                    duration: faker.number.float({ min: 10, max: 300, fractionDigits: 1 }),
                    size: faker.number.int({ min: 500000, max: 10000000 }),
                    format: faker.helpers.arrayElement(['mp3', 'wav', 'ogg']),
                };
            case 'document':
                return {
                    pages: faker.number.int({ min: 1, max: 20 }),
                    size: faker.number.int({ min: 50000, max: 2000000 }),
                    format: faker.helpers.arrayElement(['pdf', 'docx', 'txt']),
                };
            default:
                return {};
        }
    }

    /**
     * Generates a random point within a specified radius from a center point
     * @param centerLat Center latitude
     * @param centerLng Center longitude
     * @param radiusInMeters Radius in meters
     * @returns Object containing latitude and longitude
     */
    private getRandomPointInRadius(
        centerLat: number,
        centerLng: number,
        radiusInMeters: number,
    ): { latitude: number; longitude: number } {
        // Earth's radius in meters
        const earthRadius = 6378137;

        // Convert radius from meters to degrees
        const radiusInDegrees = radiusInMeters / earthRadius * (180 / Math.PI);

        // Generate random angle in radians
        const randomAngle = Math.random() * Math.PI * 2;

        // Generate random radius within the specified radius
        const randomRadius = Math.sqrt(Math.random()) * radiusInDegrees;

        // Calculate offset
        const latOffset = randomRadius * Math.sin(randomAngle);
        const lngOffset = randomRadius * Math.cos(randomAngle);

        // Adjust for earth's curvature for longitude
        const lngOffsetAdjusted = lngOffset /
            Math.cos(centerLat * Math.PI / 180);

        // Calculate final coordinates
        const randomLat = centerLat + latOffset;
        const randomLng = centerLng + lngOffsetAdjusted;

        return {
            latitude: randomLat,
            longitude: randomLng,
        };
    }

    // Helper methods
    private getRandomInt(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    private getRandomIncidentDescription(): string {
        const descriptions = [
            "Suspicious person loitering in the area",
            "Vehicle break-in reported",
            "Shoplifting incident at local store",
            "Noise complaint from neighbors",
            "Traffic accident with minor injuries",
            "Vandalism to public property",
            "Domestic dispute reported",
            "Trespassing on private property",
            "Armed robbery at convenience store",
            "Drug-related activity observed",
            "Assault reported outside nightclub",
            "Missing person report filed",
            "Public intoxication incident",
            "Package theft from doorstep",
            "Illegal dumping observed",
        ];

        return descriptions[Math.floor(Math.random() * descriptions.length)];
    }
}
