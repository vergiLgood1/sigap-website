import { Card, CardContent, CardHeader, CardTitle } from "@/app/_components/ui/card";
import { Skeleton } from "@/app/_components/ui/skeleton";

export function StatCardSkeleton() {
    return (
        <Card className="shadow-sm">
            <CardHeader className="pb-2">
                <Skeleton className="h-5 w-24 mb-1" />
                <Skeleton className="h-8 w-32" />
            </CardHeader>
            <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-4/5" />
            </CardContent>
        </Card>
    );
}

export function StatsGroupSkeleton({ count = 3 }) {
    return (
        <div className="grid gap-4 md:grid-cols-3">
            {Array(count).fill(0).map((_, i) => (
                <StatCardSkeleton key={i} />
            ))}
        </div>
    );
}

export function ChartCardSkeleton({ height = "200px" }) {
    return (
        <Card className="shadow-sm">
            <CardHeader className="pb-2">
                <Skeleton className="h-5 w-36 mb-1" />
            </CardHeader>
            <CardContent>
                <Skeleton className="w-full" style={{ height }} />
            </CardContent>
        </Card>
    );
}

export function DashboardSkeleton() {
    return (
        <div className="space-y-6">
            <StatsGroupSkeleton />
            <div className="grid gap-4 md:grid-cols-2">
                <ChartCardSkeleton />
                <ChartCardSkeleton />
            </div>
            <ChartCardSkeleton height="300px" />
        </div>
    );
}
