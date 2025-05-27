import { kmeans } from 'ml-kmeans';

interface NormalizationParams {
  year: number;
  crimes: { min: number; max: number; range: number };
  density: { min: number; max: number; range: number };
  unemployment: { min: number; max: number; range: number };
}

interface KMeansModel {
  centroids: number[][];
  clusters: Record<string, 'low' | 'medium' | 'high'>;
  normalization?: NormalizationParams;
}

interface DistrictData {
  numberOfCrimes: number;
  populationDensity: number;
  unemploymentRate: number;
}

export class CrimeScoreCalculator {
  private kmeansModels: Record<number, KMeansModel> = {};

  /**
   * Runs K-means clustering on district crime data for a specific year
   * @param districtData Object mapping district IDs to their crime statistics
   * @param year The year for which to run clustering
   * @returns True if clustering was successful, false otherwise
   */
  public async runKMeansClustering(
    districtData: Record<string, DistrictData>,
    year: number
  ): Promise<boolean> {
    // Convert to array format needed by kmeans library
    const data: number[][] = [];
    const districtIds: string[] = [];

    // Extract all values for each feature to calculate statistics
    const allCrimes: number[] = [];
    const allDensities: number[] = [];
    const allUnemployment: number[] = [];

    // First pass: collect all values
    for (const [districtId, values] of Object.entries(districtData)) {
      allCrimes.push(values.numberOfCrimes);
      allDensities.push(values.populationDensity);
      allUnemployment.push(values.unemploymentRate);
      districtIds.push(districtId);
    }

    // Calculate statistics for normalization
    // Find min and max for each feature
    const crimeStats = {
      min: Math.min(...allCrimes),
      max: Math.max(...allCrimes),
      range: 0,
    };
    crimeStats.range = crimeStats.max - crimeStats.min || 1; // Avoid division by zero

    const densityStats = {
      min: Math.min(...allDensities),
      max: Math.max(...allDensities),
      range: 0,
    };
    densityStats.range = densityStats.max - densityStats.min || 1;

    const unemploymentStats = {
      min: Math.min(...allUnemployment),
      max: Math.max(...allUnemployment),
      range: 0,
    };
    unemploymentStats.range =
      unemploymentStats.max - unemploymentStats.min || 1;

    // Store normalization params for later prediction
    const normalizationParams: NormalizationParams = {
      year,
      crimes: crimeStats,
      density: densityStats,
      unemployment: unemploymentStats,
    };

    // Second pass: normalize using min-max scaling
    for (const [districtId, values] of Object.entries(districtData)) {
      // Min-max scaling: (value - min) / range -> scales to [0,1]
      const normalizedCrimes =
        (values.numberOfCrimes - crimeStats.min) / crimeStats.range;
      const normalizedDensity =
        (values.populationDensity - densityStats.min) / densityStats.range;
      const normalizedUnemployment =
        (values.unemploymentRate - unemploymentStats.min) /
        unemploymentStats.range;

      data.push([normalizedCrimes, normalizedDensity, normalizedUnemployment]);
    }

    if (data.length === 0) {
      console.error(`❌ No data for K-means clustering for year ${year}`);
      return false;
    }

    try {
      // Run K-means with 3 clusters (low, medium, high)
      const result = kmeans(data, 3, {
        initialization: 'kmeans++',
        maxIterations: 100,
      });

      // Determine which cluster corresponds to which label (low, medium, high)
      const clusterCentroids = result.centroids;

      // Sort clusters by the sum of their centroids (higher sum = higher crime rate)
      const clusterSums = clusterCentroids.map((centroid) =>
        centroid.reduce((sum, val) => sum + val, 0)
      );

      const sortedIndices = clusterSums
        .map((sum, index) => ({ sum, index }))
        .sort((a, b) => a.sum - b.sum)
        .map((item) => item.index);

      // Map sorted indices to labels
      const labelMap: Record<number, 'low' | 'medium' | 'high'> = {
        [sortedIndices[0]]: 'low', // Lowest crime rate cluster
        [sortedIndices[1]]: 'medium', // Middle crime rate cluster
        [sortedIndices[2]]: 'high', // Highest crime rate cluster
      };

      console.log(
        `🏙️ Year ${year} cluster levels: Low=${sortedIndices[0]}, Medium=${sortedIndices[1]}, High=${sortedIndices[2]}`
      );

      // Create mapping from district ID to cluster label
      const clusters: Record<string, 'low' | 'medium' | 'high'> = {};
      for (let i = 0; i < districtIds.length; i++) {
        const clusterId = result.clusters[i];
        clusters[districtIds[i]] = labelMap[clusterId];
      }

      // Verify that all districts have a cluster assigned
      const clusterCount = Object.keys(clusters).length;
      const districtCount = Object.keys(districtData).length;

      if (clusterCount !== districtCount) {
        console.error(
          `❌ K-means clustering failed to assign clusters to all districts. Expected ${districtCount}, got ${clusterCount}`
        );
        return false;
      }

      // Store the K-means model and normalization params for this year
      this.kmeansModels[year] = {
        centroids: clusterCentroids,
        clusters: clusters,
        normalization: normalizationParams,
      };

      return true;
    } catch (error) {
      console.error(
        `❌ Error running K-means clustering for year ${year}:`,
        error
      );
      return false;
    }
  }

  /**
   * Calculate security score based on crime count, population density, and unemployment
   * Score ranges from 0-100, where higher score means SAFER area (more security)
   * This is the opposite of the crime severity - high security = low crime severity
   */
  public calculateSecurityScore(
    crimeCount: number,
    populationDensity: number,
    unemploymentRate: number,
    year: number
  ): number {
    // Ensure inputs are valid numbers with no fallbacks
    if (
      isNaN(crimeCount) ||
      isNaN(populationDensity) ||
      isNaN(unemploymentRate)
    ) {
      console.error(
        `❌ Invalid inputs for security score calculation: crimeCount=${crimeCount}, populationDensity=${populationDensity}, unemploymentRate=${unemploymentRate}`
      );
      // Instead of throwing an error, use default values
      crimeCount = crimeCount || 0;
      populationDensity = populationDensity || 0;
      unemploymentRate = unemploymentRate || 0;

      console.log(
        `⚠️ Using fallback values: crimeCount=${crimeCount}, populationDensity=${populationDensity}, unemploymentRate=${unemploymentRate}`
      );
    }

    // Get the normalization params for the year
    const normParams = this.kmeansModels[year]?.normalization;
    if (!normParams) {
      console.error(`❌ No normalization parameters found for year ${year}`);
      // Return a default score instead of throwing an error
      return 0; // Middle score as fallback
    }

    // Ensure the normalization parameters have valid ranges
    if (
      !normParams.crimes.range ||
      !normParams.density.range ||
      !normParams.unemployment.range
    ) {
      console.error(`❌ Invalid normalization ranges for year ${year}`);
      // Return a default score instead of throwing an error
      return 0; // Middle score as fallback
    }

    // Normalize the features using min-max scaling (ensuring we don't divide by zero)
    const normalizedCrimes =
      (crimeCount - normParams.crimes.min) / normParams.crimes.range;
    const normalizedDensity =
      (populationDensity - normParams.density.min) / normParams.density.range;
    const normalizedUnemployment =
      (unemploymentRate - normParams.unemployment.min) /
      normParams.unemployment.range;

    // Custom weighting for security score (0-100):
    // - Crime count has the highest impact (60%)
    // - Population density has moderate impact (25%)
    // - Unemployment has some impact (15%)
    const crimeWeight = 0.6;
    const densityWeight = 0.25;
    const unemploymentWeight = 0.15;

    // Calculate crime severity first
    const crimeFactor = Math.pow(normalizedCrimes, 1.2); // Slightly exponential

    // Calculate weighted crime severity score (higher means more severe crime situation)
    const crimeSeverityScore =
      crimeFactor * crimeWeight +
      normalizedDensity * densityWeight +
      normalizedUnemployment * unemploymentWeight;

    // INVERT the score to get security score (higher means safer)
    // Subtract from 1 to reverse the scale (1 = safest, 0 = least safe)
    const securityScore = 1 - crimeSeverityScore;

    // Scale to 0-100 range and ensure the result is always a valid integer
    const finalScore = Math.min(
      Math.max(Math.round(securityScore * 100), 0),
      100
    );

    return finalScore;
  }

  /**
   * Get the cluster level for a district in a specific year
   */
  public getDistrictClusterLevel(
    districtId: string,
    year: number
  ): 'low' | 'medium' | 'high' | null {
    return this.kmeansModels[year]?.clusters[districtId] || null;
  }

  /**
   * Get all the cluster levels for a year
   */
  public getYearClusters(
    year: number
  ): Record<string, 'low' | 'medium' | 'high'> | null {
    return this.kmeansModels[year]?.clusters || null;
  }

  /**
   * Get the normalization parameters for a year
   */
  public getNormalizationParams(year: number): NormalizationParams | null {
    return this.kmeansModels[year]?.normalization || null;
  }
}
