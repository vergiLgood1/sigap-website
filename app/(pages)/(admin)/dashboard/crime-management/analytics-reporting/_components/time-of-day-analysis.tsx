"use client"

import { Badge } from "@/app/_components/ui/badge"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/app/_components/ui/chart"
import { BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"

export default function TimeOfDayAnalysis() {
  // Sample data for the chart
  const data = [
    { name: "Morning (6AM-12PM)", value: 15, color: "#3b82f6" },
    { name: "Afternoon (12PM-6PM)", value: 25, color: "#f59e0b" },
    { name: "Evening (6PM-12AM)", value: 40, color: "#8b5cf6" },
    { name: "Night (12AM-6AM)", value: 20, color: "#1e293b" },
  ]

  const highRiskTimes = [
    { day: "Friday", time: "10PM - 2AM", risk: "High" },
    { day: "Saturday", time: "11PM - 3AM", risk: "High" },
    { day: "Sunday", time: "12AM - 4AM", risk: "Medium" },
  ]

  return (
    <div className="mt-4 space-y-4">
      <ChartContainer className="h-[150px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={30} outerRadius={50} paddingAngle={2} dataKey="value">
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </ChartContainer>

      <div className="text-xs text-center">
        <div className="font-medium">Crime Distribution by Time of Day</div>
        <div className="text-muted-foreground mt-1">Evening hours show highest incident rates</div>
      </div>

      <div className="border rounded-lg p-3">
        <h4 className="text-sm font-medium mb-2">High-Risk Time Periods</h4>
        <div className="space-y-2">
          {highRiskTimes.map((item, index) => (
            <div key={index} className="flex justify-between items-center">
              <div className="text-xs">
                <span className="font-medium">{item.day}:</span> {item.time}
              </div>
              <Badge
                variant="outline"
                className={item.risk === "High" ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"}
              >
                {item.risk} Risk
              </Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function CustomTooltip({ active, payload }: any) {
  if (active && payload && payload.length) {
    return (
      <ChartTooltip content={
        <ChartTooltipContent>
          <div className="font-medium">{payload[0].name}</div>
          <div className="flex items-center gap-2 text-sm">
            <span>{payload[0].value}% of incidents</span>
          </div>
        </ChartTooltipContent>
      }>
      </ChartTooltip>
    )
  }

  return null
}
