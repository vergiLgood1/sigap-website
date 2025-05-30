import { PrismaClient, crime_rates, Prisma } from '@prisma/client';
import { CNumbers } from '../_utils/const/numbers';
import { createClient } from '../_utils/supabase/client';

const prisma = new PrismaClient();
const supabase = createClient();

/**
 * Service for migrating finalized cluster data to historical tables
 * and cleaning up old cluster data
 */
export class ClusterMigrationService {
    /**
     * Migrate finalized cluster data to crimes table for historical storage
     * @param year Year to migrate
     * @param month Optional month to migrate (if null, migrates entire year)
     * @param forceOverwrite Whether to overwrite existing crime data
     */
    async migrateClustersToCrimes(year: number, month?: number, forceOverwrite = false): Promise<{
        migrated: number;
        skipped: number;
        errors: number;
    }> {
        try {
            console.log(`Starting migration of clusters to crimes for ${year}${month ? `/${month}` : ''}`);

            // Find clusters to migrate (finalized clusters are those that haven't been updated recently)
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - CNumbers.CLUSTER_FINALIZATION_DAYS);

            const clusters = await prisma.district_clusters.findMany({
                where: {
                    year,
                    month: month || null,
                    updated_at: {
                        lt: cutoffDate // Only migrate clusters that haven't been updated recently
                    }
                },
                include: {
                    district: {
                        select: {
                            id: true,
                            name: true,
                            geographics: {
                                where: { year },
                                select: { latitude: true, longitude: true }
                            },
                        }
                    }
                }
            });

            if (clusters.length === 0) {
                console.log(`No finalized clusters found for ${year}${month ? `/${month}` : ''}`);
                return { migrated: 0, skipped: 0, errors: 0 };
            }

            console.log(`Found ${clusters.length} clusters to migrate`);

            let migrated = 0;
            let skipped = 0;
            let errors = 0;

            // Process each cluster
            for (const cluster of clusters) {
                try {
                    // Check if a crime entry already exists
                    const existingCrime = await prisma.crimes.findFirst({
                        where: {
                            district_id: cluster.district_id,
                            year,
                            month: month || undefined,
                        }
                    });

                    if (existingCrime && !forceOverwrite) {
                        console.log(`Skipping existing crime entry for district ${cluster.district_id} in ${year}${month ? `/${month}` : ''}`);
                        skipped++;
                        continue;
                    }

                    // Convert risk level to scoring system
                    let score = 0;
                    switch (cluster.risk_level) {
                        case 'critical':
                            score = 1.0;
                            break;
                        case 'high':
                            score = 0.75;
                            break;
                        case 'medium':
                            score = 0.5;
                            break;
                        case 'low':
                            score = 0.25;
                            break;
                    }

                    // Create or update crime entry
                    if (existingCrime) {
                        await prisma.crimes.update({
                            where: { id: existingCrime.id },
                            data: {
                                number_of_crime: cluster.total_crimes,
                                level: cluster.risk_level,
                                score,
                                source_type: 'cluster-migration',
                                updated_at: new Date(),
                            }
                        });
                    } else {
                        // Generate a unique ID for the new crime record
                        const crimeId = `CM${year}${month || '00'}${cluster.district_id}`;

                        await prisma.crimes.create({
                            data: {
                                id: crimeId,
                                district_id: cluster.district_id,
                                year,
                                month: month || undefined,
                                number_of_crime: cluster.total_crimes,
                                level: cluster.risk_level,
                                score,
                                method: 'machine-learning',
                                source_type: 'cluster-migration',
                                crime_cleared: 0, // Default to 0, can be updated later
                                avg_crime: cluster.cluster_score,
                                created_at: new Date(),
                                updated_at: new Date(),
                            }
                        });
                    }

                    // Mark cluster as migrated
                    await prisma.district_clusters.update({
                        where: { id: cluster.id },
                        data: {
                            migrated_to_crimes: true,
                            migration_date: new Date()
                        }
                    });

                    migrated++;
                } catch (error) {
                    console.error(`Error migrating cluster for district ${cluster.district_id}:`, error);
                    errors++;
                }
            }

            console.log(`Migration complete: ${migrated} migrated, ${skipped} skipped, ${errors} errors`);
            return { migrated, skipped, errors };

        } catch (error) {
            console.error('Error in migrateClustersToCrimes:', error);
            throw new Error('Failed to migrate clusters to crimes');
        }
    }

    /**
     * Generate sample crime incidents from cluster data
     * @param year Year to generate incidents for
     * @param month Optional month to generate incidents for
     */
    async generateCrimeIncidents(year: number, month?: number): Promise<{
        generated: number;
        errors: number;
    }> {
        try {
            console.log(`Generating crime incidents for ${year}${month ? `/${month}` : ''}`);

            // Get crimes that were migrated from clusters and don't have associated incidents yet
            const crimes = await prisma.crimes.findMany({
                where: {
                    year,
                    month: month || undefined,
                    source_type: 'cluster-migration',
                    crime_incidents: {
                        none: {}
                    }
                },
                include: {
                    districts: {
                        include: {
                            geographics: {
                                where: { year },
                                select: { latitude: true, longitude: true }
                            }
                        }
                    }
                }
            });

            if (crimes.length === 0) {
                console.log(`No eligible crimes found for generating incidents`);
                return { generated: 0, errors: 0 };
            }

            console.log(`Found ${crimes.length} crimes to generate incidents for`);

            // Get crime categories for distribution
            const categories = await prisma.crime_categories.findMany();

            if (categories.length === 0) {
                throw new Error('No crime categories found');
            }

            let generated = 0;
            let errors = 0;

            // Process each crime
            for (const crime of crimes) {
                try {
                    // Skip if no geographic data is available
                    if (!crime.districts.geographics || crime.districts.geographics.length === 0) {
                        console.log(`Skipping crime ${crime.id} due to missing geographic data`);
                        continue;
                    }

                    const geo = crime.districts.geographics[0];

                    // Calculate number of incidents to generate based on total crimes
                    // We generate fewer incidents than the actual crime count for performance
                    const incidentsToGenerate = Math.min(
                        10,
                        Math.max(1, Math.floor(crime.number_of_crime / 10))
                    );

                    // Create an event for the incidents
                    const eventId = await this.getOrCreateClusterEvent(year, month);

                    // Generate sample incidents
                    for (let i = 0; i < incidentsToGenerate; i++) {
                        // Select a random crime category
                        const category = categories[Math.floor(Math.random() * categories.length)];

                        // Create location with slight variation around district center
                        // Create location with slight variation around district center
                        const { data: location, error: locationError } = await supabase
                            .from('locations')
                            .insert({
                                district_id: crime.district_id,
                                event_id: eventId,
                                latitude: geo.latitude + (Math.random() * 0.01 - 0.005),
                                longitude: geo.longitude + (Math.random() * 0.01 - 0.005),
                                address: `Generated from cluster data for ${crime.districts.name}`,
                                type: 'cluster-generated',
                                location: `POINT(${geo.longitude} ${geo.latitude})`, // GeoJSON format
                                created_at: new Date(),
                                updated_at: new Date()
                            })
                            .select()
                            .single();

                        if (locationError) throw new Error(`Location creation failed: ${locationError.message}`);
                        if (!location) throw new Error('Failed to create location');

                        // Create incident
                        const incidentId = `CI${year}${month || '00'}${crime.district_id}${i}`;

                        await prisma.crime_incidents.create({
                            data: {
                                id: incidentId,
                                crime_id: crime.id,
                                crime_category_id: category.id,
                                location_id: location.id,
                                description: `Incident generated from cluster data analysis`,
                                victim_count: Math.floor(Math.random() * 3) + 1,
                                status: 'closed',
                                timestamp: this.getRandomDateInPeriod(year, month),
                                created_at: new Date(),
                                updated_at: new Date(),
                            }
                        });

                        generated++;
                    }

                } catch (error) {
                    console.error(`Error generating incidents for crime ${crime.id}:`, error);
                    errors++;
                }
            }

            console.log(`Incident generation complete: ${generated} generated, ${errors} errors`);
            return { generated, errors };

        } catch (error) {
            console.error('Error in generateCrimeIncidents:', error);
            throw new Error('Failed to generate crime incidents');
        }
    }

    /**
     * Clean up old cluster data that has been migrated
     * @param retentionMonths How many months of data to keep
     */
    async cleanupOldClusterData(retentionMonths = CNumbers.KMEANS_RETENTION_MONTHS): Promise<{
        deletedClusters: number;
        deletedUpdates: number;
    }> {
        try {
            console.log(`Cleaning up old cluster data (retention: ${retentionMonths} months)`);

            const cutoffDate = new Date();
            cutoffDate.setMonth(cutoffDate.getMonth() - retentionMonths);

            // Find cluster IDs that have been migrated and are older than retention period
            const oldClusters = await prisma.district_clusters.findMany({
                where: {
                    migrated_to_crimes: true,
                    migration_date: {
                        lt: cutoffDate
                    }
                },
                select: {
                    id: true,
                    district_id: true,
                    year: true,
                    month: true,
                }
            });

            if (oldClusters.length === 0) {
                console.log('No old clusters found for deletion');
                return { deletedClusters: 0, deletedUpdates: 0 };
            }

            console.log(`Found ${oldClusters.length} old clusters to delete`);

            // Get district IDs for update cleanup
            const districtIds = Array.from(new Set(oldClusters.map(c => c.district_id)));
            const clusterIds = oldClusters.map(c => c.id);

            // Delete cluster updates first
            const { count: deletedUpdates } = await prisma.cluster_updates.deleteMany({
                where: {
                    district_id: {
                        in: districtIds
                    },
                    timestamp: {
                        lt: cutoffDate
                    }
                }
            });

            // Delete clusters
            const { count: deletedClusters } = await prisma.district_clusters.deleteMany({
                where: {
                    id: {
                        in: clusterIds
                    }
                }
            });

            console.log(`Cleanup complete: ${deletedClusters} clusters and ${deletedUpdates} updates deleted`);
            return { deletedClusters, deletedUpdates };

        } catch (error) {
            console.error('Error in cleanupOldClusterData:', error);
            throw new Error('Failed to clean up old cluster data');
        }
    }

    /**
     * Run the full migration process for a given period
     * @param year Year to migrate
     * @param month Optional month to migrate
     */
    async runFullMigration(year: number, month?: number): Promise<{
        migrated: number;
        incidents: number;
        deletedClusters: number;
        deletedUpdates: number;
    }> {
        try {
            // Step 1: Migrate clusters to crimes
            const { migrated } = await this.migrateClustersToCrimes(year, month);

            // Step 2: Generate crime incidents
            const { generated: incidents } = await this.generateCrimeIncidents(year, month);

            // Step 3: Clean up old data
            const { deletedClusters, deletedUpdates } = await this.cleanupOldClusterData();

            return {
                migrated,
                incidents,
                deletedClusters,
                deletedUpdates
            };

        } catch (error) {
            console.error('Error in runFullMigration:', error);
            throw new Error('Failed to run full migration');
        }
    }

    /**
     * Check if there are any clusters ready for migration
     */
    async checkForMigrationCandidates(): Promise<{
        readyClusters: number;
        months: { year: number; month: number | null }[];
    }> {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - CNumbers.CLUSTER_FINALIZATION_DAYS);

        // Find clusters ready for migration
        const readyClusters = await prisma.district_clusters.count({
            where: {
                migrated_to_crimes: false,
                updated_at: {
                    lt: cutoffDate
                }
            }
        });

        // Get distinct year/month combinations
        const periods = await prisma.district_clusters.findMany({
            where: {
                migrated_to_crimes: false,
                updated_at: {
                    lt: cutoffDate
                }
            },
            select: {
                year: true,
                month: true
            },
            distinct: ['year', 'month']
        });

        return {
            readyClusters,
            months: periods.map(p => ({ year: p.year, month: p.month }))
        };
    }

    // Helper methods

    /**
     * Get or create an event for cluster-generated incidents
     */
    private async getOrCreateClusterEvent(year: number, month?: number): Promise<string> {
        const eventName = `Cluster Data ${year}${month ? `-${month}` : ''}`;

        // Check if event already exists
        const existingEvent = await prisma.events.findFirst({
            where: {
                name: eventName
            }
        });

        if (existingEvent) {
            return existingEvent.id;
        }

        // Create a system user if it doesn't exist
        const systemUser = await this.getOrCreateSystemUser();

        // Create new event
        const event = await prisma.events.create({
            data: {
                name: eventName,
                description: `Auto-generated event for cluster data migration (${year}${month ? `-${month}` : ''})`,
                user_id: systemUser,
                code: `CM${year}${month || '00'}`
            }
        });

        return event.id;
    }

    /**
     * Get or create a system user for data migration
     */
    private async getOrCreateSystemUser(): Promise<string> {
        // First, find the system role
        const adminRole = await prisma.roles.findFirst({
            where: {
                name: 'admin'
            }
        });

        if (!adminRole) {
            throw new Error('Admin role not found');
        }

        // Check if system user already exists
        const existingUser = await prisma.users.findFirst({
            where: {
                email: 'system@sigap.id'
            }
        });

        if (existingUser) {
            return existingUser.id;
        }

        // Create system user
        const user = await prisma.users.create({
            data: {
                email: 'system@sigap.id',
                roles_id: adminRole.id,
                is_anonymous: false,
                app_metadata: {
                    provider: 'system'
                },
                user_metadata: {
                    name: 'System User'
                }
            }
        });

        return user.id;
    }

    /**
     * Get a random date within the specified period
     */
    private getRandomDateInPeriod(year: number, month?: number): Date {
        const startDate = new Date(year, month ? month - 1 : 0, 1);
        const endDate = month
            ? new Date(year, month, 0)  // Last day of month
            : new Date(year, 11, 31);   // Last day of year

        const randomTime = startDate.getTime() +
            Math.random() * (endDate.getTime() - startDate.getTime());

        return new Date(randomTime);
    }
}
