"use client"

import { Progress } from "@/app/_components/ui/progress"
import { Award } from "lucide-react"

export default function OfficerPerformanceMetrics() {
  const officers = [
    {
      name: "Emily Parker",
      metric: "Case Clearance",
      value: 92,
      rank: 1,
    },
    {
      name: "Michael Chen",
      metric: "Response Time",
      value: 88,
      rank: 2,
    },
    {
      name: "Sarah Johnson",
      metric: "Evidence Processing",
      value: 95,
      rank: 3,
    },
  ]

  const departmentMetrics = [
    {
      name: "Cases Assigned",
      value: 245,
      change: "+12",
      period: "this month",
    },
    {
      name: "Cases Closed",
      value: 182,
      change: "+8",
      period: "this month",
    },
    {
      name: "Avg. Case Duration",
      value: "18.5 days",
      change: "-2.3",
      period: "from last month",
    },
  ]

  return (
    <div className="mt-4 space-y-4">
      <div className="border rounded-lg p-3">
        <h4 className="font-medium text-sm mb-3 flex items-center">
          <Award className="h-4 w-4 mr-1" />
          Top Performers
        </h4>

        <div className="space-y-3">
          {officers.map((officer) => (
            <div key={officer.name}>
              <div className="flex justify-between text-sm mb-1">
                <span>{officer.name}</span>
                <span>
                  {officer.metric}: {officer.value}%
                </span>
              </div>
              <Progress value={officer.value} className="h-2" />
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {departmentMetrics.map((metric) => (
          <div key={metric.name} className="border rounded-lg p-3">
            <div className="text-sm text-muted-foreground">{metric.name}</div>
            <div className="text-xl font-bold mt-1">{metric.value}</div>
            <div className="text-xs text-green-600 mt-1">
              {metric.change} {metric.period}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
