'use client';

import { Badge } from "@/app/_components/ui/badge";
import { Skeleton } from "@/app/_components/ui/skeleton";
import { useGetRecentArrests } from "../_queries/queries";

export default function TopCrimeCategories() {
  const { data: categoriesData, isLoading, error } = useGetRecentArrests();

  if (isLoading) {
    return (
      <div className="mt-4">
        <div className="text-center mb-4">
          <Skeleton className="h-8 w-16 mx-auto mb-2" />
          <Skeleton className="h-3 w-32 mx-auto" />
        </div>
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-6 w-20" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="mt-4 text-red-500">Error loading categories data</div>;
  }

  const { totalIncidents = 0, topCategories = [] } = categoriesData || {};

  const getBadgeColor = (index: number) => {
    if (index === 0) return "bg-red-100 text-red-800 hover:bg-red-100"; // Top 1
    if (index <= 2) return "bg-orange-100 text-orange-800 hover:bg-orange-100"; // Top 2-3
    if (index <= 4) return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"; // Top 5-6
    return "bg-slate-100 text-slate-800 hover:bg-slate-100"; // Rest
  };

  return (
    <div className="mt-4">


      <div className="flex flex-wrap gap-2">
        {topCategories.map((category: any, index: number) => (
          <Badge
            key={category.name}
            variant="outline"
            className={`${getBadgeColor(index)} text-xs`}
          >
            <span className="font-medium mr-1">#{index + 1}</span>
            {category.name}
            <span className="ml-1 text-muted-foreground">({category.count})</span>
          </Badge>
        ))}
      </div>

      {topCategories.length === 0 && (
        <div className="text-center text-muted-foreground mt-4 text-sm">
          No crime categories found for last month
        </div>
      )}
    </div>
  );
}
