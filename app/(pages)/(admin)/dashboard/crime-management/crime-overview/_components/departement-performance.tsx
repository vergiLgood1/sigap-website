'use client';

import { Progress } from "@/app/_components/ui/progress"
import { Skeleton } from "@/app/_components/ui/skeleton"
import { useGetDepartmentPerformance } from "../_queries/queries"

export default function DepartmentPerformance() {
  const { data: performanceData, isLoading, error } = useGetDepartmentPerformance()

  if (isLoading) {
    return (
      <div className="space-y-4 mt-4">
        {[1, 2, 3].map((i) => (
          <div key={i}>
            <div className="flex justify-between mb-1 text-sm">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-12" />
            </div>
            <Skeleton className="h-2 w-full" />
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return <div className="mt-4 text-red-500">Error loading performance data</div>
  }

  const { caseClearanceRate = 0, avgResponseTime = 0, evidenceProcessingRate = 0 } = performanceData || {}

  const metrics = [
    { name: "Case Clearance Rate", value: caseClearanceRate, display: `${caseClearanceRate}%` },
    { name: "Response Time", value: Math.min((avgResponseTime / 10) * 100, 100), display: `${avgResponseTime} min avg` },
    { name: "Evidence Processing", value: evidenceProcessingRate, display: `${evidenceProcessingRate}%` },
  ]

  return (
    <div className="space-y-4 mt-4">
      {metrics.map((metric) => (
        <div key={metric.name}>
          <div className="flex justify-between mb-1 text-sm">
            <span>{metric.name}</span>
            <span>{metric.display}</span>
          </div>
          <Progress value={metric.value} className="h-2" />
        </div>
      ))}
    </div>
  )
}
