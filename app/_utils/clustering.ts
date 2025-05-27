// // utils/clustering.ts
// import * as math from 'mathjs';

// interface ClusteringData {
//     districtId: string;
//     populationDensity: number;
//     unemploymentRate: number;
//     crimeCount: number;
// }

// export function normalizeData(data: ClusteringData[]): ClusteringData[] {
//     // Ekstrak nilai untuk setiap dimensi
//     const densities = data.map(item => item.populationDensity);
//     const unemploymentRates = data.map(item => item.unemploymentRate);
//     const crimeCounts = data.map(item => item.crimeCount);

//     // Hitung min dan max untuk normalisasi
//     const minDensity = Math.min(...densities);
//     const maxDensity = Math.max(...densities);
//     const minUnemployment = Math.min(...unemploymentRates);
//     const maxUnemployment = Math.max(...unemploymentRates);
//     const minCrimeCount = Math.min(...crimeCounts);
//     const maxCrimeCount = Math.max(...crimeCounts);

//     // Normalisasi data antara 0 dan 1
//     return data.map(item => ({
//         ...item,
//         populationDensity: (item.populationDensity - minDensity) / (maxDensity - minDensity || 1),
//         unemploymentRate: (item.unemploymentRate - minUnemployment) / (maxUnemployment - minUnemployment || 1),
//         crimeCount: (item.crimeCount - minCrimeCount) / (maxCrimeCount - minCrimeCount || 1)
//     }));
// }

// export function kMeansClustering(data: ClusteringData[], k = 3, maxIterations = 100): { clusters: number[], centroids: number[][] } {
//     const normalizedData = normalizeData(data);

//     // Mengubah data ke format yang sesuai untuk algoritma k-means
//     const points = normalizedData.map(item => [
//         item.populationDensity,
//         item.unemploymentRate,
//         item.crimeCount
//     ]);

//     // Inisialisasi centroid secara acak
//     let centroids = Array(k).fill(0).map(() => {
//         return [
//             Math.random(),
//             Math.random(),
//             Math.random()
//         ];
//     });

//     let clusters: number[] = [];
//     let iterations = 0;
//     let oldCentroids: number[][] = [];

//     // Algoritma K-means
//     while (iterations < maxIterations) {
//         // Tetapkan setiap titik ke centroid terdekat
//         clusters = points.map(point => {
//             const distances = centroids.map(centroid =>
//                 Math.sqrt(
//                     Math.pow(point[0] - centroid[0], 2) +
//                     Math.pow(point[1] - centroid[1], 2) +
//                     Math.pow(point[2] - centroid[2], 2)
//                 )
//             );
//             return distances.indexOf(Math.min(...distances));
//         });

//         // Simpan centroid lama untuk mengetahui konvergensi
//         oldCentroids = [...centroids];

//         // Hitung centroid baru berdasarkan pengelompokan saat ini
//         for (let i = 0; i < k; i++) {
//             const clusterPoints = points.filter((_, index) => clusters[index] === i);

//             if (clusterPoints.length > 0) {
//                 centroids[i] = [
//                     clusterPoints.reduce((sum, point) => sum + point[0], 0) / clusterPoints.length,
//                     clusterPoints.reduce((sum, point) => sum + point[1], 0) / clusterPoints.length,
//                     clusterPoints.reduce((sum, point) => sum + point[2], 0) / clusterPoints.length
//                 ];
//             }
//         }

//         // Cek konvergensi
//         const centroidChange = centroids.reduce((acc, curr, i) => {
//             return acc + Math.sqrt(
//                 Math.pow(curr[0] - oldCentroids[i][0], 2) +
//                 Math.pow(curr[1] - oldCentroids[i][1], 2) +
//                 Math.pow(curr[2] - oldCentroids[i][2], 2)
//             );
//         }, 0);

//         if (centroidChange < 0.001) {
//             break;
//         }

//         iterations++;
//     }

//     // Urutkan cluster berdasarkan tingkat bahaya (tingkat kejahatan)
//     // Semakin tinggi nilai pada centroid ketiga (crime count), semakin tinggi risikonya
//     const orderedClusters = [...Array(k).keys()].sort((a, b) =>
//         centroids[a][2] - centroids[b][2]
//     );

//     // Petakan cluster asli ke cluster terurut (low, medium, high)
//     const mappedClusters = clusters.map(cluster =>
//         orderedClusters.indexOf(cluster)
//     );

//     return { clusters: mappedClusters, centroids };
// }

// // Fungsi untuk mengubah hasil clustering ke format Prisma untuk disimpan
// export function mapClustersToCrimeRates(clusters: number[]): ('low' | 'medium' | 'high')[] {
//     const rateMap = ['low', 'medium', 'high'] as const;
//     return clusters.map(cluster => rateMap[cluster]);
// }