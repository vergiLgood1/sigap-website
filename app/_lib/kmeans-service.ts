// lib/services/kmeans-service.ts

import { PrismaClient, crime_rates, Prisma } from '@prisma/client';
import { kmeans, Options } from 'ml-kmeans';


const prisma = new PrismaClient();

interface FeatureVector {
    crime_rate: number;
    population_density: number;
    unemployment_rate: number;
}

interface RawValues {
    crime_count: number;
    population: number;
    population_density: number;
    unemployed: number;
}

interface DistrictFeature {
    district_id: string;
    features: [number, number, number]; // Normalized feature vector
    raw_values: RawValues;
}

interface ClusterResult {
    clusters: number[];
    centroids: number[][];
    iterations: number;
    converged: boolean;
}

interface ClusterStats {
    risk_level: crime_rates;
    _count: {
        district_id: number;
    };
    _avg: {
        cluster_score: number;
        crime_score: number;
        density_score: number;
        unemployment_score: number;
    };
}

type WeightedFeatures = {
    [K in keyof FeatureVector]: number;
};

type CrimeGroupResult = {
    district_id: string;
    _sum: {
        number_of_crime: number | null;
    };
};


export class KMeansService {
    private readonly NUM_CLUSTERS = 3;
    private readonly WEIGHTS: WeightedFeatures = {
        crime_rate: 0.4,
        population_density: 0.3,
        unemployment_rate: 0.3
    };

    async getDistrictFeatures(year: number, month?: number): Promise<DistrictFeature[]> {
        const crimes = await prisma.crimes.groupBy({
            by: ['district_id'],
            where: {
                year,
                ...(month ? { month } : {})
            },
            _sum: {
                number_of_crime: true
            }
        });

        const demographics = await prisma.demographics.findMany({
            where: { year },
            select: {
                district_id: true,
                population_density: true,
                number_of_unemployed: true,
                population: true
            }
        });

        return this.prepareFeatures(crimes as CrimeGroupResult[], demographics);
    }

    private prepareFeatures(
        crimes: {
            district_id: string;
            _sum: {
                number_of_crime: number | null;
            };
        }[],
        demographics: Prisma.demographicsGetPayload<{
            select: {
                district_id: true;
                population_density: true;
                number_of_unemployed: true;
                population: true;
            };
        }>[]
    ): DistrictFeature[] {
        const features: DistrictFeature[] = demographics.map(demo => {
            const crime = crimes.find(c => c.district_id === demo.district_id);
            const crimeCount = crime?._sum?.number_of_crime || 0;

            return {
                district_id: demo.district_id,
                features: [
                    crimeCount / demo.population,
                    demo.population_density,
                    demo.number_of_unemployed / demo.population
                ] as [number, number, number],
                raw_values: {
                    crime_count: crimeCount,
                    population: demo.population,
                    population_density: demo.population_density,
                    unemployed: demo.number_of_unemployed
                }
            };
        });

        return this.normalizeFeatures(features);
    }

    private normalizeFeatures(data: DistrictFeature[]): DistrictFeature[] {
        const features = data.map(d => d.features);
        const mins: number[] = new Array(3).fill(Infinity);
        const maxs: number[] = new Array(3).fill(-Infinity);

        features.forEach(feat => {
            feat.forEach((f, i) => {
                mins[i] = Math.min(mins[i], f);
                maxs[i] = Math.max(maxs[i], f);
            });
        });

        return data.map(d => ({
            ...d,
            features: d.features.map((f, i) =>
                (f - mins[i]) / (maxs[i] - mins[i] || 1)
            ) as [number, number, number]
        }));
    }

    async performClustering(year: number, month?: number): Promise<ClusterResult> {
        const data = await this.getDistrictFeatures(year, month);
        const features = data.map(d => d.features);

        const result = kmeans(features, this.NUM_CLUSTERS, {});
        await this.saveClusterResults(data, result, year, month);

        return {
            clusters: result.clusters,
            centroids: result.centroids,
            iterations: result.iterations,
            converged: result.converged
        };
    }

    async saveClusterResults(
        data: DistrictFeature[],
        result: ClusterResult,
        year: number,
        month?: number
    ): Promise<void> {
        const updates = data.map((d, i) => {
            const cluster = result.clusters[i];
            const centroid = result.centroids[cluster];
            const riskLevel = this.getRiskLevel(cluster, result.centroids);

            return {
                district_id: d.district_id,
                year,
                month: month || null,
                risk_level: riskLevel,
                total_crimes: d.raw_values.crime_count,
                population_density: d.raw_values.population_density,
                unemployment_rate: d.raw_values.unemployed / d.raw_values.population,
                crime_score: d.features[0],
                density_score: d.features[1],
                unemployment_score: d.features[2],
                cluster_score: this.calculateClusterScore(d.features),
                centroid_features: centroid as Prisma.InputJsonValue,
                member_count: 1,
                last_update_type: 'batch',
                update_count: 0,
                needs_recompute: false
            };
        });

        const updateLogs = updates.map(update => ({
            district_id: update.district_id,
            update_type: 'batch',
            old_value: {} as Prisma.InputJsonValue,
            new_value: {
                risk_level: update.risk_level,
                scores: {
                    crime: update.crime_score,
                    density: update.density_score,
                    unemployment: update.unemployment_score
                }
            } as Prisma.InputJsonValue
        }));

        await prisma.$transaction(async (tx) => {
            await tx.district_clusters.deleteMany({
                where: { year, month: month || null }
            });

            await tx.district_clusters.createMany({ data: updates });
            await tx.cluster_updates.createMany({ data: updateLogs });
        });
    }

    private getRiskLevel(cluster: number, centroids: number[][]): crime_rates {
        const weights = Object.values(this.WEIGHTS);
        const centroidScore = centroids[cluster].reduce(
            (score, value, index) => score + value * weights[index],
            0
        );

        if (centroidScore > 0.75) return 'critical';
        if (centroidScore > 0.5) return 'high';
        if (centroidScore > 0.25) return 'medium';
        return 'low';
    }

    private calculateClusterScore(features: [number, number, number]): number {
        const weights = Object.values(this.WEIGHTS);
        return features.reduce((score, value, index) =>
            score + value * weights[index],
            0
        );
    }

    async getClusterStats(year: number, month?: number): Promise<ClusterStats[]> {
        const result = await prisma.district_clusters.groupBy({
            by: ['risk_level'],
            where: {
                year,
                month: month || null
            },
            _count: {
                district_id: true
            },
            _avg: {
                cluster_score: true,
                crime_score: true,
                density_score: true,
                unemployment_score: true
            }
        });

        return result as unknown as ClusterStats[];
    }

    async needsRecompute(threshold: number = 10): Promise<boolean> {
        const outdatedClusters = await prisma.district_clusters.count({
            where: {
                OR: [
                    { needs_recompute: true },
                    { update_count: { gte: threshold } }
                ]
            }
        });

        return outdatedClusters > 0;
    }

    async cleanupOldClusters(retentionMonths: number = 12): Promise<Prisma.BatchPayload> {
        const cutoffDate = new Date();
        cutoffDate.setMonth(cutoffDate.getMonth() - retentionMonths);

        return prisma.district_clusters.deleteMany({
            where: {
                created_at: {
                    lt: cutoffDate
                }
            }
        });
    }
}