'use client';

import { Progress } from "@/app/_components/ui/progress"
import { Skeleton } from "@/app/_components/ui/skeleton"
import { useGetCrimeStatistics } from "../_queries/queries";
import { CrimeCategoryStatistic, CrimeStatisticsResponse } from "../_types";
import { Badge } from "@/app/_components/ui/badge";

export default function CrimeStatistics() {
    const { data: statisticsData, isLoading, error } = useGetCrimeStatistics<CrimeStatisticsResponse>();

    if (isLoading) {
        return (
            <div className="space-y-4 mt-4">
                {[1, 2, 3].map((i) => (
                    <div key={i}>
                        <div className="flex justify-between mb-1 text-sm">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-4 w-8" />
                        </div>
                        <Skeleton className="h-2 w-full" />
                    </div>
                ))}
            </div>
        );
    }

    if (error) {
        return <div className="mt-4 text-red-500">Error loading crime statistics</div>;
    }

    const { totalCrimes = 0, categories = [], timeRange = "Last 30 days" } = statisticsData || { categories: [] };

    // Top 3 categories are already sorted by the backend query
    const topCategories = categories.slice(0, 3);

    // Calculate percentages for each category based on totalCrimes
    const categoriesWithPercentage = topCategories.map(category => {
        if (!category) return category;
        return {
            ...category,
            // Use the actual percentage from the category if available, otherwise calculate it
            calculatedPercentage: category.percentage || (totalCrimes > 0 ? (category.count / totalCrimes) * 100 : 0)
        };
    }).filter(Boolean) as (CrimeCategoryStatistic & { calculatedPercentage: number })[];

    // Get category color based on position in the list
    const getCategoryColor = (index: number) => {
        if (index === 0) return "bg-red-500"; // Highest crime rate
        if (index === 1) return "bg-orange-500";
        if (index === 2) return "bg-yellow-500";
        return "bg-blue-500";
    };

    return (
        <div className="space-y-4 mt-4">
            <div className="mb-2 text-sm font-medium flex justify-between items-center">
                <span>Top 3 Crime Categories</span>
                <span className="text-xs text-muted-foreground">
                    {timeRange} • Total: {totalCrimes}
                </span>
            </div>

            {categoriesWithPercentage.map((category, index) => (
                <div key={category?.id}>
                    <div className="flex justify-between mb-1 text-sm">
                        <div className="flex items-center">

                            <span>{category?.name}</span>
                        </div>
                        <div className="flex items-center">
                            <span className="mr-2 font-medium">{category?.count}</span>
                            <span className={category?.isIncrease ? "text-red-600" : "text-green-600"}>
                                {category?.change}
                            </span>
                        </div>
                    </div>
                    <Progress
                        // Display the percentage of total crimes this category represents
                        value={category.calculatedPercentage}
                        className="h-2 bg-slate-100"
                        indicatorClassName={getCategoryColor(index)}
                    />
                </div>
            ))}

            {categories.length === 0 && (
                <div className="text-center text-muted-foreground py-2">
                    No crime data available
                </div>
            )}
        </div>
    );
}
