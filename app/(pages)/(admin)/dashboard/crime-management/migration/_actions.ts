"use server";

import { ClusterMigrationService } from "@/app/_lib/cluster-migration-service";

/**
 * Server action to run cluster migration
 */
export async function runClusterMigration(year: number, month?: number) {
    try {
        const migrationService = new ClusterMigrationService();
        const result = await migrationService.runFullMigration(year, month);
        return result;
    } catch (error) {
        console.error("Migration error:", error);
        throw new Error("Failed to run cluster migration: " + (error as Error).message);
    }
}

/**
 * Server action to run cleanup of old cluster data
 */
export async function runCleanup() {
    try {
        const migrationService = new ClusterMigrationService();
        const result = await migrationService.cleanupOldClusterData();
        return result;
    } catch (error) {
        console.error("Cleanup error:", error);
        throw new Error("Failed to run cleanup: " + (error as Error).message);
    }
}

/**
 * Server action to check migration candidates
 */
export async function checkMigrationCandidates() {
    try {
        const migrationService = new ClusterMigrationService();
        return await migrationService.checkForMigrationCandidates();
    } catch (error) {
        console.error("Check candidates error:", error);
        throw new Error("Failed to check migration candidates: " + (error as Error).message);
    }
}
