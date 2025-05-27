'use client';

import { AlertTriangle } from "lucide-react"
import { Badge } from "@/app/_components/ui/badge"
import { Skeleton } from "@/app/_components/ui/skeleton"
import { useGetHighPriorityCases } from "../_queries/queries"
import { PlaceholderImage } from "@/app/_components/ui/placeholder-image"
import { faker } from "@faker-js/faker";

export default function HighPriorityCases() {
  const { data: casesData, isLoading, error } = useGetHighPriorityCases()

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-3 rounded-lg p-3  ">
            <Skeleton className="w-10 h-10 rounded-full" />
            <div className="flex-1 min-w-0">
              <div className="flex justify-between mb-1">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-6 w-12" />
              </div>
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return <div className="mt-4 text-red-500">Error loading cases data</div>
  }

  const cases = casesData || []

  // Add location images to cases
  const casesWithImages = cases.map((case_: any, index: number) => {
    // Use consistent seed for same case
    faker.seed(parseInt(case_.id.replace(/\D/g, '')) || index);

    return {
      ...case_,
      image: faker.image.url({ width: 128, height: 128 }),
      source: case_.source || (case_.id.startsWith('CR') ? 'crime_incidents' : 'incident_logs')
    };
  });

  const getPriorityClass = (priority: string) => {
    switch (priority) {
      case "Critical":
        return "bg-red-100 text-red-800 hover:bg-red-100"
      case "High":
        return "bg-orange-100 text-orange-800 hover:bg-orange-100"
      default:
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
    }
  }

  const getSourceBadge = (source: string) => {
    if (source === 'crime_incidents') {
      return <span className="text-xs px-1 rounded">Police Report</span>
    }
    return <span className="text-xs bg-blue-500/50 px-1 rounded">Public Report</span>
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
      {casesWithImages.map((case_: any) => (
        <div key={case_.id} className="flex items-center gap-3 rounded-lg p-3   border border-muted">
          <div className="w-10 h-10 rounded-full overflow-hidden shrink-0">
            <PlaceholderImage
              src={case_.image}
              alt={`Case ${case_.id} location`}
              className="w-full h-full"
              fallbackClassName="rounded-full bg-red-100"
              icon={<AlertTriangle className="h-5 w-5 text-red-600" />}
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between">
              <p className="text-sm font-medium">Case #{case_.id.slice(0, 6)}</p>
              <Badge variant="outline" className={getPriorityClass(case_.priority)}>
                {case_.priority}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              {case_.type} • {case_.location} • {case_.time}
            </p>
            <div className="mt-1">
              {getSourceBadge(case_.source)}
            </div>
          </div>
        </div>
      ))}

      {cases.length === 0 && (
        <div className="col-span-2 text-center py-6 text-muted-foreground">
          No high priority cases found
        </div>
      )}
    </div>
  )
}
