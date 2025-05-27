"use client"

import { Progress } from "@/app/_components/ui/progress"
import { Clock, TrendingDown } from "lucide-react"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/app/_components/ui/chart"
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts"

export default function ResponseTimeMetrics() {
  // Sample data for the chart
  const data = [
    { name: "Violent", time: 4.2 },
    { name: "Theft", time: 8.5 },
    { name: "Domestic", time: 5.1 },
    { name: "Traffic", time: 9.8 },
    { name: "Noise", time: 12.3 },
  ]

  return (
    <div className="mt-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-2xl font-bold">4.2m</div>
          <div className="text-xs text-muted-foreground">Average Response Time</div>
        </div>
        <div className="text-xs text-green-600 flex items-center">
          <TrendingDown className="h-3 w-3 mr-1" />
          -0.3m from last month
        </div>
      </div>

      <div className="space-y-2">
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span>Priority 1 (Emergency)</span>
            <div className="flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              <span>3.2 min avg</span>
            </div>
          </div>
          <Progress value={80} className="h-2" indicatorClassName="bg-red-500" />
        </div>
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span>Priority 2 (Urgent)</span>
            <div className="flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              <span>5.8 min avg</span>
            </div>
          </div>
          <Progress value={70} className="h-2" indicatorClassName="bg-orange-500" />
        </div>
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span>Priority 3 (Standard)</span>
            <div className="flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              <span>12.5 min avg</span>
            </div>
          </div>
          <Progress value={60} className="h-2" indicatorClassName="bg-blue-500" />
        </div>
      </div>

      <div className="h-[120px]">
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

      <div className="text-xs text-center text-muted-foreground">Response time by incident type (minutes)</div>
    </div>
  )
}

function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <ChartTooltip content={
        <ChartTooltipContent>
          <div className="font-medium">{label} Incidents</div>
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
