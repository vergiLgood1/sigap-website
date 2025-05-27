"use client"

import { Tabs, TabsList, TabsTrigger } from "@/app/_components/ui/tabs"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartConfig,
} from "@/app/_components/ui/chart"
import { Bar, BarChart, Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts"

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

export default function CrimeStatistics() {
  // Sample data for the chart
  const monthlyData = [
    { month: "Jan", violent: 12, property: 45, other: 20 },
    { month: "Feb", violent: 10, property: 42, other: 18 },
    { month: "Mar", violent: 15, property: 48, other: 22 },
    { month: "Apr", violent: 8, property: 40, other: 15 },
    { month: "May", violent: 12, property: 38, other: 20 },
    { month: "Jun", violent: 10, property: 35, other: 18 },
  ]

  const neighborhoodData = [
    { name: "Downtown", incidents: 45 },
    { name: "Westside", incidents: 32 },
    { name: "North", incidents: 28 },
    { name: "East", incidents: 22 },
    { name: "South", incidents: 18 },
  ]

  return (
    <div className="mt-4">
      <div className="flex justify-between items-center mb-4">
        <Tabs defaultValue="trends">
          <TabsList>
            <TabsTrigger value="trends">Crime Trends</TabsTrigger>
            <TabsTrigger value="neighborhood">By Neighborhood</TabsTrigger>
          </TabsList>
        </Tabs>

        <Tabs defaultValue="6m">
          <TabsList>
            <TabsTrigger value="3m">3 Months</TabsTrigger>
            <TabsTrigger value="6m">6 Months</TabsTrigger>
            <TabsTrigger value="1y">1 Year</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ChartContainer config={chartConfig} className="h-[250px]">
          <>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip content={<CustomLineTooltip />} />
                <Line type="monotone" dataKey="violent" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="property" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="other" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>

            <ChartLegend className="justify-center mt-2">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: "#ef4444" }}></div>
                <span>Violent Crime</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: "#3b82f6" }}></div>
                <span>Property Crime</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: "#10b981" }}></div>
                <span>Other</span>
              </div>
            </ChartLegend>

          </>
        </ChartContainer>

        <ChartContainer className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={neighborhoodData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="name" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip content={<CustomBarTooltip />} />
              <Bar dataKey="incidents" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>

      <div className="mt-4 text-xs text-center text-muted-foreground">
        Data source: City Police Department. Last updated: April 24, 2023
      </div>
    </div>
  )
}

function CustomLineTooltip({ active, payload, label }: any) {
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
      }>
      </ChartTooltip>
    )
  }

  return null
}

function CustomBarTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <ChartTooltip content={
        <ChartTooltipContent>
          <div className="font-medium">{label} Neighborhood</div>
          <div className="flex items-center gap-2 text-sm">
            <span>Total Incidents:</span>
            <span className="font-medium">{payload[0].value}</span>
          </div>
        </ChartTooltipContent>
      }>
      </ChartTooltip>
    )
  }

  return null
}
