import { NextRequest, NextResponse } from 'next/server';
import { ClusterMigrationService } from '@/app/_lib/cluster-migration-service';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * This API route handles scheduled migration of finalized cluster data to historical tables
 * 
 * It can be triggered by a cron job or manually through an API call
 */
export async function GET(req: NextRequest) {
    try {
        // Validate authorization (optional: implement proper authorization for your use case)
        const authHeader = req.headers.get('authorization');
        if (!process.env.SKIP_API_AUTH && !authHeader?.includes(process.env.CRON_SECRET || '')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Instantiate migration service
        const migrationService = new ClusterMigrationService();

        // Check for migration candidates
        const candidates = await migrationService.checkForMigrationCandidates();

        if (candidates.readyClusters === 0) {
            return NextResponse.json({
                status: 'success',
                message: 'No clusters ready for migration',
                data: candidates
            });
        }

        // Process each year/month combination
        const migrationResults = [];

        for (const period of candidates.months) {
            const result = await migrationService.runFullMigration(period.year, period.month ?? undefined);
            migrationResults.push({
                year: period.year,
                month: period.month,
                ...result
            });
        }

        return NextResponse.json({
            status: 'success',
            message: `Migration completed for ${migrationResults.length} periods`,
            data: migrationResults
        });

    } catch (error) {
        console.error('Error in cluster migration API:', error);
        return NextResponse.json(
            { error: 'Failed to process cluster migration', message: (error as Error).message },
            { status: 500 }
        );
    }
}
