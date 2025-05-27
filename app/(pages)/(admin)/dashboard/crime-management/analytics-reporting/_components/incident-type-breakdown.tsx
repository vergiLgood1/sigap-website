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
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"
import { BarChart } from "lucide-react"

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

export default function IncidentTypeBreakdown() {
  // Sample data for the chart
  const data = [
    { name: "Theft", value: 35, color: "#3b82f6" },
    { name: "Assault", value: 20, color: "#ef4444" },
    { name: "Vandalism", value: 15, color: "#f59e0b" },
    { name: "Fraud", value: 10, color: "#10b981" },
    { name: "Drugs", value: 8, color: "#8b5cf6" },
    { name: "Other", value: 12, color: "#6b7280" },
  ]

  return (
    <div className="mt-4">
      <div className="flex justify-between items-center mb-4">
        <Tabs defaultValue="pie">
          <TabsList>
            <TabsTrigger value="pie">Pie Chart</TabsTrigger>
            <TabsTrigger value="bar">Bar Chart</TabsTrigger>
          </TabsList>
        </Tabs>

        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All Time</TabsTrigger>
            <TabsTrigger value="month">This Month</TabsTrigger>
            <TabsTrigger value="week">This Week</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ChartContainer config={chartConfig} className="h-[250px]">
          <>

            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={2} dataKey="value">
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>

            <ChartLegend className="justify-center mt-2">
              {data.map((item) => (
                <ChartLegendContent key={item.name}>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></span>
                    <span>{item.name}</span>
                  </div>
                </ChartLegendContent>
              ))}
            </ChartLegend>
          </>
        </ChartContainer>

        <div className="space-y-3">
          <div className="border rounded-lg p-3">
            <h4 className="text-sm font-medium mb-2">Key Insights</h4>
            <ul className="text-xs space-y-2">
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500 mt-1"></span>
                <span>
                  Theft accounts for the largest portion of incidents (35%), with a 5% increase from the previous month.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 mt-1"></span>
                <span>Assault incidents have decreased by 3% compared to the previous month.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 mt-1"></span>
                <span>Fraud reports have increased by 8%, indicating a growing trend in financial crimes.</span>
              </li>
            </ul>
          </div>

          <div className="border rounded-lg p-3">
            <h4 className="text-sm font-medium mb-2">Recommendations</h4>
            <ul className="text-xs space-y-2">
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-500 mt-1"></span>
                <span>Increase patrols in high-theft areas, particularly in commercial districts.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-500 mt-1"></span>
                <span>Launch a public awareness campaign about fraud prevention.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-500 mt-1"></span>
                <span>Continue community engagement programs that have helped reduce assault incidents.</span>
              </li>
            </ul>
          </div>
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
            <span>{payload[0].value}% of total incidents</span>
          </div>
        </ChartTooltipContent>
      }>

      </ChartTooltip>
    )
  }

  return null
}
