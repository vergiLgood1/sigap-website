"use client"

import { useState } from "react"
import { Button } from "@/app/_components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/app/_components/ui/tabs"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartConfig,
  ChartLegendContent,
} from "@/app/_components/ui/chart"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, BarChart } from "recharts"

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "#2563eb",
  },
  mobile: {
    label: "Mobile",
    color: "#60a5fa",
  },
} satisfies ChartConfig

export default function CrimeTrends() {
  const [timeRange, setTimeRange] = useState("6m")
  const [chartType, setChartType] = useState("all")

  // Sample data for the chart
  const data = [
    { month: "Jan", violent: 42, property: 85, cyber: 18, other: 30 },
    { month: "Feb", violent: 38, property: 78, cyber: 22, other: 28 },
    { month: "Mar", violent: 45, property: 82, cyber: 25, other: 32 },
    { month: "Apr", violent: 40, property: 75, cyber: 30, other: 35 },
    { month: "May", violent: 35, property: 72, cyber: 28, other: 30 },
    { month: "Jun", violent: 32, property: 68, cyber: 32, other: 28 },
  ]

  return (
    <div className="mt-4 h-[300px]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <Tabs defaultValue={chartType} onValueChange={setChartType} className="w-full sm:w-auto">
          <TabsList className="grid grid-cols-4 w-full sm:w-auto">
            <TabsTrigger value="all">All Crimes</TabsTrigger>
            <TabsTrigger value="violent">Violent</TabsTrigger>
            <TabsTrigger value="property">Property</TabsTrigger>
            <TabsTrigger value="cyber">Cyber</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setTimeRange("3m")}
            className={timeRange === "3m" ? "bg-muted" : ""}
          >
            3M
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setTimeRange("6m")}
            className={timeRange === "6m" ? "bg-muted" : ""}
          >
            6M
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setTimeRange("1y")}
            className={timeRange === "1y" ? "bg-muted" : ""}
          >
            1Y
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setTimeRange("all")}
            className={timeRange === "all" ? "bg-muted" : ""}
          >
            All
          </Button>
        </div>
      </div>

      <ChartContainer className="h-[250px]" config={chartConfig}>
        <>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="month" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip content={<CustomTooltip />} />
              {chartType === "all" || chartType === "violent" ? (
                <Line
                  type="monotone"
                  dataKey="violent"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              ) : null}
              {chartType === "all" || chartType === "property" ? (
                <Line
                  type="monotone"
                  dataKey="property"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              ) : null}
              {chartType === "all" || chartType === "cyber" ? (
                <Line
                  type="monotone"
                  dataKey="cyber"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              ) : null}
              {chartType === "all" ? (
                <Line
                  type="monotone"
                  dataKey="other"
                  stroke="#a855f7"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              ) : null}
            </LineChart>
          </ResponsiveContainer>
          <ChartLegend className="justify-center mt-2">
            {chartType === "all" || chartType === "violent" ? (
              <ChartLegendContent>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full" style={{ backgroundColor: "#ef4444" }}></div>
                  <span>Violent Crime</span>
                </div>
              </ChartLegendContent>
            ) : null}
            {chartType === "all" || chartType === "property" ? (
              <ChartLegendContent>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full" style={{ backgroundColor: "#3b82f6" }}></div>
                  <span>Property Crime</span>
                </div>
              </ChartLegendContent>
            ) : null}
            {chartType === "all" || chartType === "cyber" ? (
              <ChartLegendContent>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full" style={{ backgroundColor: "#10b981" }}></div>
                  <span>Cybercrime</span>
                </div>
              </ChartLegendContent>
            ) : null}
            {chartType === "all" ? (
              <ChartLegendContent>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full" style={{ backgroundColor: "#a855f7" }}></div>
                  <span>Other</span>
                </div>
              </ChartLegendContent>
            ) : null}
          </ChartLegend>
        </>
      </ChartContainer>
    </div>
  )
}

function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <ChartTooltip content={
        <ChartTooltipContent>
          <div className="font-medium">{label}</div>
          {payload.map((entry: any, index: number) => (
            <div key={`item-${index}`} className="flex items-center gap-2 text-sm">
              <div className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }}></div>
              <span className="font-medium">{entry.name}:</span>
              <span>{entry.value} incidents</span>
            </div>
          ))}
        </ChartTooltipContent>
      } />
    )
  }

  return null
}
