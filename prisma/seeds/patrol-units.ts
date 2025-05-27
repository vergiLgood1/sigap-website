import { PrismaClient } from '@prisma/client';
import { createClient } from '../../app/_utils/supabase/client';
import { faker } from '@faker-js/faker';
import { generateIdWithDbCounter } from "../../app/_utils/common";
import { districtsGeoJson } from '../data/geojson/jember/districts-geojson';
import { CRegex } from '../../app/_utils/const/regex';

export class PatrolUnitsSeeder {
    constructor(
        private prisma: PrismaClient,
        private supabase = createClient()
    ) { }

    // Add tactical callsigns as a class property
    private tacticalCallsigns = [
        'Alpha', 'Bravo', 'Charlie', 'Delta', 'Echo',
        'Foxtrot', 'Ghost', 'Hunter', 'Ice', 'Jaguar',
        'Kilo', 'Lima', 'Mike', 'Nova', 'Omega',
        'Phoenix', 'Quebec', 'Romeo', 'Sierra', 'Tango',
        'Ultra', 'Victor', 'Whiskey', 'X-Ray', 'Yankee',
        'Zulu', 'Raptor', 'Viper', 'Cobra', 'Eagle',
    ];

    // Mapping type to code
    private typeCodeMap: Record<string, string> = {
        car: "C",
        motorcycle: "M",
        foot: "F",
        mixed: "X",
        drone: "D",
    };

    // Helper method to get random callsign
    private getRandomCallsign(): string {
        return this.tacticalCallsigns[Math.floor(Math.random() * this.tacticalCallsigns.length)];
    }

    async run(isUpdate: boolean = true): Promise<void> {
        console.log('🚓 Seeding patrol units...');

        if (isUpdate) {
            console.log('Updating patrol unit categories based on member count...');

            // Get all patrol units with their member counts
            const patrolUnitsWithMembers = await this.prisma.patrol_units.findMany({
                select: {
                    id: true,
                    unit_id: true,
                    type: true,
                    _count: {
                        select: {
                            members: true
                        }
                    }
                }
            });

            // Update each patrol unit's member_count and category
            for (const pu of patrolUnitsWithMembers) {
                const memberCount = pu._count.members;
                const category = memberCount > 1 ? 'group' : 'individual';
                const callsign = this.getRandomCallsign();
                const patrolName = `${callsign}-${pu.id.split('-')[1]}`;

                try {
                    await this.prisma.patrol_units.update({
                        where: { id: pu.id },
                        data: {
                            member_count: memberCount,
                            category: category,
                            name: patrolName.toUpperCase()
                        }
                    });

                    // Update in Supabase as well
                    // await this.supabase
                    //     .from('patrol_units')
                    //     .update({
                    //         member_count: memberCount,
                    //         category: category
                    //     })
                    //     .eq('id', pu.id);

                } catch (error) {
                    console.error(`Error updating patrol unit ${pu.id}:`, error);
                }
            }

            console.log('✅ Updated patrol unit categories and member counts');
            return;
        }

        // First, let's clear existing patrol units
        try {
            await this.prisma.patrol_units.deleteMany({});
            // Also delete from Supabase to maintain consistency
            await this.supabase.from('patrol_units').delete().neq('id', 'dummy');
            console.log('✅ Removed existing patrol units');
        } catch (error) {
            console.error('❌k Error removing existing patrol units:', error);
            return; // Exit if we can't clean up properly
        }

        // Make sure we have a user and event
        const event = await this.ensureEventAndSession();
        if (!event) {
            console.error("❌ Could not create or find event");
            return;
        }
        console.log(`✅ Using event: ${event.id} (${event.name})`);

        // Get all police units to assign patrol units to
        const policeUnits = await this.prisma.units.findMany({
            select: {
                code_unit: true,
                name: true,
                type: true,
                district_id: true, // Include district_id directly
            },
        });

        if (!policeUnits.length) {
            console.error('❌ No police units found. Please seed units first.');
            return;
        }

        // Patrol unit types with proper weighting
        const patrolTypes = ['car', 'motorcycle', 'foot', 'mixed', 'drone'];
        const weightedPatrolTypes = {
            'polres': { car: 40, motorcycle: 30, foot: 10, mixed: 15, drone: 5 },
            'polsek': { car: 30, motorcycle: 40, foot: 20, mixed: 10, drone: 0 },
            'default': { car: 35, motorcycle: 35, foot: 15, mixed: 10, drone: 5 }
        };

        // Status options with proper weighting
        const statusOptions = ['active', 'standby', 'maintenance', 'patrol', 'on duty', 'off duty'];
        const weightedStatus = {
            'active': 30,
            'standby': 25,
            'maintenance': 5,
            'patrol': 20,
            'on duty': 15,
            'off duty': 5
        };

        // Define patrol radius ranges based on type
        const getPatrolRadius = (type: string): number => {
            switch (type) {
                case 'car':
                    return parseFloat(faker.number.float({ min: 5000, max: 8000, fractionDigits: 2 }).toFixed(2));
                case 'motorcycle':
                    return parseFloat(faker.number.float({ min: 3000, max: 5000, fractionDigits: 2 }).toFixed(2));
                case 'foot':
                    return parseFloat(faker.number.float({ min: 500, max: 1500, fractionDigits: 2 }).toFixed(2));
                case 'drone':
                    return parseFloat(faker.number.float({ min: 2000, max: 4000, fractionDigits: 2 }).toFixed(2));
                case 'mixed':
                default:
                    return parseFloat(faker.number.float({ min: 2000, max: 6000, fractionDigits: 2 }).toFixed(2));
            }
        };

        // Get locations for each district to assign to patrol units
        const locationsByDistrict = await this.getLocationsByDistrict();

        // Generate patrol units for each police unit
        const patrolUnits = [];

        for (const unit of policeUnits) {
            // Number of patrol units per police unit varies by type
            const patrolCount = unit.type === 'polres' ?
                faker.number.int({ min: 5, max: 8 }) :
                faker.number.int({ min: 2, max: 5 });

            const unitTypeWeights = weightedPatrolTypes[unit.type as keyof typeof weightedPatrolTypes] ||
                weightedPatrolTypes.default;

            for (let i = 1; i <= patrolCount; i++) {
                // Select patrol type based on weighted distribution
                const patrolType = this.getWeightedRandomItem(unitTypeWeights) as string;
                const callsign = this.getRandomCallsign();
                const patrolName = `${callsign}-${unit.code_unit}-${this.typeCodeMap[patrolType]}${i}`;

                const radius = getPatrolRadius(patrolType);
                const status = this.getWeightedRandomItem(weightedStatus) as string;

                const districtId = unit.district_id;
                if (!districtId) {
                    console.log(`⚠️ No district_id for unit ${unit.name}, skipping patrol unit`);
                    continue;
                }

                // Get or create a location for this patrol unit
                const locationId = await this.getOrCreateLocation(districtId, locationsByDistrict, event.id);

                if (!locationId) {
                    console.log(`⚠️ Could not get/create location for patrol unit in ${unit.name}, skipping`);
                    continue;
                }

                const typeCode = this.typeCodeMap[patrolType] || "P";
                const codeUnitLast2 = unit.code_unit.slice(-2);

                try {
                    const newId = await generateIdWithDbCounter(
                        "patrol_units",
                        {
                            prefix: "PU",
                            segments: {
                                codes: [typeCode + codeUnitLast2],
                                sequentialDigits: 2,
                            },
                            format: "{prefix}-{codes}{sequence}",
                        },
                        CRegex.PATROL_UNIT_ID_REGEX
                    );

                    // Generate random member count and set category
                    const memberCount = faker.number.int({ min: 1, max: 4 });
                    const category = memberCount > 1 ? 'group' : 'individual';

                    patrolUnits.push({
                        id: newId,
                        unit_id: unit.code_unit,
                        location_id: locationId,
                        name: patrolName,
                        type: patrolType,
                        status: status,
                        radius: radius,
                        member_count: memberCount,
                        category: category
                    });
                } catch (error) {
                    console.error(`Error generating ID for patrol unit: ${error}`);
                }
            }
        }

        // Insert patrol units in smaller batches
        if (patrolUnits.length > 0) {
            await this.insertPatrolUnitsInBatches(patrolUnits);
            console.log(`🚓 Created ${patrolUnits.length} patrol units for ${policeUnits.length} police units`);
        } else {
            console.warn('⚠️ No patrol unit data to insert');
        }
    }

    // Helper: Ensure we have a user, event and session
    private async ensureEventAndSession(): Promise<any> {
        // Find or create a user
        let user = await this.prisma.users.findFirst({
            where: {
                email: "sigapcompany@gmail.com"
            }
        });

        if (!user) {
            // Get the system admin role
            const adminRole = await this.prisma.roles.findFirst({
                where: {
                    name: "admin"
                }
            });

            if (!adminRole) {
                console.error("❌ Admin role not found. Please seed roles first.");
                return null;
            }

            // Create a user if none exists
            try {
                user = await this.prisma.users.create({
                    data: {
                        email: "sigapcompany@gmail.com",
                        roles_id: adminRole.id,
                        is_anonymous: false,
                        email_confirmed_at: new Date(),
                        confirmed_at: new Date()
                    }
                });
                console.log("✅ Created user for patrol units");
            } catch (error) {
                console.error("❌ Error creating user:", error);
                return null;
            }
        }

        // Find or create an event
        let event = await this.prisma.events.findFirst({
            where: {
                user_id: user.id
            }
        })

        if (!event) {
            try {
                event = await this.prisma.events.create({
                    data: {
                        name: "Patrol Operations",
                        description: "System-generated event for patrol units",
                        user_id: user.id
                    }
                });
                console.log("✅ Created event for patrol units");

                // Create a session for this event
                const session = await this.prisma.sessions.create({
                    data: {
                        user_id: user.id,
                        event_id: event.id,
                        status: "active"
                    }
                });
                console.log("✅ Created session for patrol units");
            } catch (error) {
                console.error("❌ Error creating event or session:", error);
                return null;
            }
        }

        return event;
    }

    // Helper: Get locations organized by district
    private async getLocationsByDistrict(): Promise<Record<string, any[]>> {
        const locationsData = await this.prisma.locations.findMany({
            select: {
                id: true,
                district_id: true,
                latitude: true,
                longitude: true,
            },
            take: 500 // Limit the number of locations to query
        });

        return locationsData.reduce((acc, location) => {
            if (!acc[location.district_id]) {
                acc[location.district_id] = [];
            }
            acc[location.district_id].push(location);
            return acc;
        }, {} as Record<string, any[]>);
    }

    // Helper: Get a random coordinate from district GeoJSON
    private getRandomDistrictCoordinate(districtId: string): { latitude: number, longitude: number } | null {
        console.log(`Trying to find coordinates for district ID: ${districtId}`);

        // Check if districtsGeoJson is properly loaded
        if (!districtsGeoJson || !districtsGeoJson.features || !Array.isArray(districtsGeoJson.features)) {
            console.error("GeoJSON data is missing or malformed:", districtsGeoJson);
            return null;
        }

        // Try to find the district feature using multiple property checks
        const feature = districtsGeoJson.features.find(f => {
            if (!f.properties) return false;

            // Try different property names that might contain the district ID
            return (
                f.properties.kode_kec === districtId
            );
        });

        if (!feature) {
            console.error(`No matching district found for ID: ${districtId}`);
            console.log("Available district properties:", districtsGeoJson.features.slice(0, 2).map(f => f.properties));
            return null;
        }

        if (!feature.geometry) {
            console.error(`District found but has no geometry: ${districtId}`);
            return null;
        }

        console.log(`Found district: ${feature.properties?.kecamatan || 'Unknown'}`);

        // Extract coordinates based on geometry type
        let allCoords: number[][] = [];

        if (feature.geometry.type === "Polygon") {
            // For Polygon, get all coordinate points from all rings
            allCoords = feature.geometry.coordinates.flat(2);
        }
        else if (feature.geometry.type === "MultiPolygon") {
            // For MultiPolygon, flatten to get all points from all polygons
            // MultiPolygon structure: [[[[x,y,z], [x,y,z]]], [[[x,y,z], [x,y,z]]]]
            allCoords = feature.geometry.coordinates.flat(2);
        }

        // Filter out any invalid coordinates and handle 3D coordinates (x,y,z)
        const validCoords = allCoords.filter(coord =>
            Array.isArray(coord) &&
            coord.length >= 2 &&
            typeof coord[0] === 'number' &&
            typeof coord[1] === 'number'
        );

        if (validCoords.length === 0) {
            console.error(`No valid coordinates found in the geometry for district: ${districtId}`);
            console.log("Geometry structure:", JSON.stringify(feature.geometry, null, 2));
            return null;
        }

        // Get a random coordinate pair, handling 3D coordinates if present
        const randomCoord = validCoords[Math.floor(Math.random() * validCoords.length)];
        // Get longitude (x) and latitude (y) from the coordinate
        const lng = randomCoord[0];
        const lat = randomCoord[1];

        console.log(`Generated coordinates: ${lat}, ${lng} for district ${districtId}`);
        return { latitude: lat, longitude: lng };
    }

    // Helper: Get or create a location for the patrol unit
    private async getOrCreateLocation(
        districtId: string,
        locationsByDistrict: Record<string, any[]>,
        eventId?: string
    ): Promise<string | undefined> {
        // Try to use an existing location for this district
        const districtLocations = locationsByDistrict[districtId] || [];

        if (districtLocations.length > 0) {
            const randomLocation = faker.helpers.arrayElement(districtLocations);
            return randomLocation.id;
        }

        // Find the event to use
        if (!eventId) {
            const event = await this.prisma.events.findFirst();
            if (!event) {
                console.error("❌ No event found. Cannot create location.");
                return undefined;
            }
            eventId = event.id;
        }

        // Generate a new location using districtGeoJson if no existing locations
        const coord = this.getRandomDistrictCoordinate(districtId);

        if (!coord) {
            console.warn(`Could not generate coordinates from GeoJSON for district ${districtId}, using fallback...`);
            return undefined;
        }

        // Create location in both databases for consistency
        try {
            const newLocation = {
                district_id: districtId,
                event_id: eventId,
                address: `Generated Patrol Location, District ${districtId}`,
                type: "patrol",
                latitude: coord.latitude,
                longitude: coord.longitude,
                land_area: null,
                location: `POINT(${coord.longitude} ${coord.latitude})`,
            };

            // Insert to both databases for consistency
            const { data, error } = await this.supabase
                .from("locations")
                .insert([newLocation])
                .select('id')
                .single();

            if (error) {
                console.error("Failed to insert location to Supabase:", error);
                return undefined;
            }

            // Update our local cache
            if (!locationsByDistrict[districtId]) {
                locationsByDistrict[districtId] = [];
            }
            locationsByDistrict[districtId].push({ ...newLocation, id: data.id });

            return data.id;
        } catch (err) {
            console.error("Failed to create location:", err);
            return undefined;
        }
    }

    // Helper: Insert patrol units in batches with better error handling
    private async insertPatrolUnitsInBatches(patrolUnits: any[]): Promise<void> {
        const batchSize = 50; // Smaller batch size for better reliability

        for (let i = 0; i < patrolUnits.length; i += batchSize) {
            const batch = patrolUnits.slice(i, i + batchSize);
            try {
                // Insert to Supabase
                const { error } = await this.supabase
                    .from('patrol_units')
                    .insert(batch);

                if (error) {
                    console.error(`Error inserting patrol units batch ${Math.floor(i / batchSize) + 1}:`, error);
                }

                // Small delay between batches to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 500));
            } catch (err) {
                console.error(`Exception when inserting patrol units batch ${Math.floor(i / batchSize) + 1}:`, err);
            }
        }
    }

    // Helper: Get a weighted random item from a weighted object
    private getWeightedRandomItem(weightedItems: Record<string, number>): string | number {
        const entries = Object.entries(weightedItems);
        const weights = entries.map(([_, weight]) => weight);
        const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);

        let random = Math.random() * totalWeight;

        for (const [item, weight] of entries) {
            random -= weight;
            if (random < 0) {
                return item;
            }
        }

        // Fallback to first item if something goes wrong
        return entries[0][0];
    }
}