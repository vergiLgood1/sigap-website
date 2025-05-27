"use client"

import { Progress } from "@/app/_components/ui/progress"
import { Clock } from "lucide-react"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/app/_components/ui/chart"
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts"

export default function ResponseTimes() {
  // Sample data for the chart
  const data = [
    { name: "Critical", time: 3.2 },
    { name: "High", time: 5.8 },
    { name: "Medium", time: 8.5 },
    { name: "Low", time: 12.3 },
  ]

  return (
    <div className="mt-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-2xl font-bold">4.2m</div>
          <div className="text-xs text-muted-foreground">Average Response Time</div>
        </div>
        <div className="text-xs text-green-600 flex items-center">
          <Clock className="h-3 w-3 mr-1" />
          Target: 5.0m
        </div>
      </div>

      <div className="space-y-2">
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span>Priority 1 (Critical)</span>
            <div className="flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              <span>3.2 min avg</span>
            </div>
          </div>
          <Progress value={80} className="h-2" indicatorClassName="bg-red-500" />
        </div>
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span>Priority 2 (High)</span>
            <div className="flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              <span>5.8 min avg</span>
            </div>
          </div>
          <Progress value={70} className="h-2" indicatorClassName="bg-orange-500" />
        </div>
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span>Priority 3 (Medium)</span>
            <div className="flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              <span>8.5 min avg</span>
            </div>
          </div>
          <Progress value={60} className="h-2" indicatorClassName="bg-blue-500" />
        </div>
      </div>

      <div className="h-[100px]">
        <ChartContainer>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="name" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="time" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
    </div>
  )
}

function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <ChartTooltip content={
        <ChartTooltipContent>
          <div className="font-medium">{label} Priority</div>
          <div className="flex items-center gap-2 text-sm">
            <span>Avg. Response Time:</span>
            <span className="font-medium">{payload[0].value} minutes</span>
          </div>
        </ChartTooltipContent>
      }>
      </ChartTooltip>
    )
  }

  return null
}
