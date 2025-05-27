import { officers, PrismaClient } from '@prisma/client';
import { createClient } from '../../app/_utils/supabase/client';
import { faker } from '@faker-js/faker';
import * as crypto from 'crypto';
import { CRegex } from '../../app/_utils/const/regex';
import { generateIdWithDbCounter } from '../../app/_utils/common';

const RANKS = [
    'IPDA', 'IPTU', 'AKP', 'KOMPOL', 'AKBP', 'KOMBES', // Officers
    'AIPDA', 'AIPTU', 'BRIGADIR', 'BRIGADIR KEPALA', // Non-commissioned officers
    'BRIPTU', 'BRIPKA', 'BRIPDA', // Lower ranks
];

const POSITIONS = [
    'Kapolsek', 'Wakapolsek', 'Kanit Reskrim', 'Kanit Intel', 'Kanit Sabhara',
    'Kanit Binmas', 'Kanit Provost', 'Anggota', 'Penyidik', 'Pengemban Fungsi',
    'Kepala Unit Patroli', 'Komandan Sektor', 'Staf Operasional'
];

/**
 * Generates a QR code value based on officer's NRP and unit ID
 * The generated string can be used as input for QR code generation
 * 
 * @param nrp Officer NRP (ID number)
 * @param unitId Unit identifier
 * @returns Encoded string to be used as QR code content
 */
function generateOfficerQRCode(nrp: string, unitId: string): string {
    // Create a unique string by combining NRP and unit ID
    const baseString = `SIGAP-OFFICER:${nrp}:${unitId}:${Date.now()}`;

    // Create a hash of this string for security
    const hash = crypto.createHash('sha256')
        .update(baseString)
        .digest('hex')
        .substring(0, 12);

    // Create a URL-friendly encoded string that includes officer info and validation hash
    const qrData = Buffer.from(`${nrp}:${unitId}:${hash}`).toString('base64');

    return qrData;
}

export class OfficersSeeder {
    constructor(
        private prisma: PrismaClient,
        private supabase = createClient()
    ) { }

    async run(): Promise<void> {
        console.log('👮 Seeding officers...');

        // First, let's clear existing officers
        try {
            await this.prisma.officers.deleteMany({});
            console.log('✅ Removed existing officers');
        } catch (error) {
            console.error('❌ Error removing existing officers:', error);
        }

        // Get all police units
        const policeUnits = await this.prisma.units.findMany({
            select: {
                code_unit: true,
                name: true,
                type: true,
                patrol_units: {
                    select: {
                        id: true,
                        unit_id: true,
                        name: true,
                    },
                }
            },
        });

        // Get all patrol units
        const patrolUnits = await this.prisma.patrol_units.findMany({
            select: {
                id: true,
                unit_id: true,
                name: true,
                unit: {
                    select: {
                        code_unit: true,
                        name: true,
                        type: true,
                    },
                }
            },
        });

        if (!policeUnits.length) {
            console.error('❌ No police units found. Please seed units first.');
            return;
        }

        if (!patrolUnits.length) {
            console.error('❌ No patrol units found. Please seed patrol units first.');
            return;
        }

        // Create a mapping of unit_id to a list of patrol_unit_ids
        const unitToPatrolUnits: Record<string, string[]> = {};
        for (const patrol of patrolUnits) {
            if (!unitToPatrolUnits[patrol.unit_id]) {
                unitToPatrolUnits[patrol.unit_id] = [];
            }
            unitToPatrolUnits[patrol.unit_id].push(patrol.id);
        }

        // Check if each police unit has at least one patrol unit
        for (const unit of policeUnits) {
            if (!unitToPatrolUnits[unit.code_unit] || unitToPatrolUnits[unit.code_unit].length === 0) {
                console.warn(`⚠️ Unit ${unit.name} (${unit.code_unit}) has no patrol units. Creating one...`);

                // // Create a default patrol unit for this police unit
                // try {

                //     // Mapping type to code
                //     const typeCodeMap: Record<string, string> = {
                //         car: "C",
                //         motorcycle: "M",
                //         foot: "F",
                //         mixed: "X",
                //         drone: "D",
                //     };

                //     const typeCode = typeCodeMap[patrolType] || "P";
                //     const codeUnitLast2 = unit.code_unit.slice(-2);

                //     const newId = await generateIdWithDbCounter(
                //         "patrol_units",
                //         {
                //             prefix: "PU",
                //             segments: {
                //                 codes: [typeCode + codeUnitLast2],
                //                 sequentialDigits: 2,
                //             },
                //             format: "{prefix}-{codes}{sequence}",
                //         },
                //         CRegex.PATROL_UNIT_ID_REGEX
                //     );

                //     const newPatrolUnit = await this.prisma.patrol_units.create({
                //         data: {

                //             unit_id: unit.code_unit,
                //             name: `Default Patrol Unit - ${unit.name}`,
                //             created_at: new Date(),
                //         }
                //     });

                //     if (!unitToPatrolUnits[unit.code_unit]) {
                //         unitToPatrolUnits[unit.code_unit] = [];
                //     }
                //     unitToPatrolUnits[unit.code_unit].push(newPatrolUnit.id);

                //     console.log(`✅ Created default patrol unit for ${unit.name}`);
                // } catch (err) {
                //     console.error(`❌ Failed to create default patrol unit for ${unit.name}:`, err);
                //     // Skip this unit if we can't create a patrol unit
                //     continue;
                // }
            }
        }

        // Get officer role ID
        const officerRole = await this.prisma.roles.findFirst({
            where: { name: 'officer' },
            select: { id: true },
        });

        if (!officerRole) {
            console.error('❌ Officer role not found. Please seed roles first.');
            return;
        }

        const roleId = officerRole.id;
        const officers: Partial<officers>[] = [];

        // Generate officers for each police unit
        for (const unit of policeUnits) {
            const patrolUnitIds = unitToPatrolUnits[unit.code_unit];

            // Skip unit if there are no patrol units available
            if (!patrolUnitIds || patrolUnitIds.length === 0) {
                console.warn(`⚠️ Skipping unit ${unit.name} because it has no patrol units`);
                continue;
            }

            // Number of officers varies by unit type
            const officerCount = unit.type === 'polres' ?
                faker.number.int({ min: 20, max: 30 }) :
                faker.number.int({ min: 10, max: 20 });

            // Keep track of assigned positions to avoid duplicates
            const assignedPositions = new Set();

            for (let i = 1; i <= officerCount; i++) {
                // Generate a unique NRP (ID number)
                const nrpYear = faker.number.int({ min: 80, max: 99 }).toString();
                const nrpSeq = faker.number.int({ min: 10000, max: 99999 }).toString();
                const nrp = `${nrpYear}${nrpSeq}`;

                // Choose rank based on position
                let position, rank;

                // For important positions, assign specific ranks
                if (i <= 5 && !assignedPositions.has('Kapolsek')) {
                    position = 'Kapolsek';
                    rank = faker.helpers.arrayElement(['IPTU', 'AKP', 'KOMPOL']);
                    assignedPositions.add(position);
                } else if (i <= 5 && !assignedPositions.has('Wakapolsek')) {
                    position = 'Wakapolsek';
                    rank = faker.helpers.arrayElement(['IPDA', 'IPTU', 'AKP']);
                    assignedPositions.add(position);
                } else if (i <= 5 && !assignedPositions.has('Kanit Reskrim')) {
                    position = 'Kanit Reskrim';
                    rank = faker.helpers.arrayElement(['IPDA', 'IPTU']);
                    assignedPositions.add(position);
                } else {
                    // For other officers, assign random positions and ranks
                    position = faker.helpers.arrayElement(POSITIONS.filter(p =>
                        p !== 'Kapolsek' && p !== 'Wakapolsek' && p !== 'Kanit Reskrim' || !assignedPositions.has(p)
                    ));
                    rank = faker.helpers.arrayElement(RANKS);
                }

                // Generate QR code
                const qrCode = generateOfficerQRCode(nrp, unit.code_unit);

                // Assign a default patrol unit (will be potentially reassigned later)
                // IMPORTANT: Set a default patrol_unit_id to ensure all officers have one
                const defaultPatrolUnitId = faker.helpers.arrayElement(patrolUnitIds);

                // Create a new officer with a required patrol_unit_id
                const officer = {
                    unit_id: unit.code_unit,
                    role_id: roleId,
                    nrp: nrp,
                    name: faker.person.fullName(),
                    rank: rank,
                    position: position,
                    phone: faker.helpers.fromRegExp(/08[0-9]{8,12}/), // Keep original format
                    email: faker.internet.email().toLowerCase(),
                    valid_until: faker.date.future(),
                    created_at: faker.date.past(),
                    updated_at: new Date(),
                    avatar: faker.image.personPortrait(), // Keep original format
                    qr_code: qrCode,
                    patrol_unit_id: defaultPatrolUnitId, // Default assignment
                };

                officers.push(officer);
            }
        }

        // Insert officers in smaller batches
        if (officers.length > 0) {
            const batchSize = 100;
            for (let i = 0; i < officers.length; i += batchSize) {
                const batch = officers.slice(i, i + batchSize);
                try {
                    // Ensure all officers in the batch have patrol_unit_id
                    const validBatch = batch.filter(officer => officer.patrol_unit_id);

                    if (validBatch.length !== batch.length) {
                        console.warn(`⚠️ Filtered out ${batch.length - validBatch.length} officers without patrol_unit_id`);
                    }

                    if (validBatch.length === 0) {
                        console.warn(`⚠️ Skipping empty batch ${i / batchSize + 1}`);
                        continue;
                    }

                    const { error } = await this.supabase
                        .from('officers')
                        .insert(validBatch)
                        .select();

                    if (error) {
                        console.error(`Error inserting officers batch ${i / batchSize + 1}:`, error);
                    } else {
                        console.log(`✅ Inserted batch ${i / batchSize + 1} (${validBatch.length} officers)`);
                    }

                    // Small delay between batches
                    await new Promise(resolve => setTimeout(resolve, 300));
                } catch (err) {
                    console.error(`Exception when inserting officers batch ${i / batchSize + 1}:`, err);
                }
            }

            console.log(`👮 Created ${officers.length} officers for ${policeUnits.length} police units`);
        } else {
            console.warn('⚠️ No officer data to insert');
        }
    }
}