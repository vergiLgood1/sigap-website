"use client"

import { Progress } from "@/app/_components/ui/progress"
import { Badge } from "@/app/_components/ui/badge"
import { TrendingUp, TrendingDown } from "lucide-react"

export default function CaseResolutionRates() {
  const resolutionData = [
    {
      type: "Homicide",
      rate: 72,
      trend: "+5%",
      direction: "up",
    },
    {
      type: "Assault",
      rate: 65,
      trend: "+3%",
      direction: "up",
    },
    {
      type: "Robbery",
      rate: 48,
      trend: "-2%",
      direction: "down",
    },
    {
      type: "Theft",
      rate: 35,
      trend: "+1%",
      direction: "up",
    },
    {
      type: "Cybercrime",
      rate: 28,
      trend: "-4%",
      direction: "down",
    },
  ]

  return (
    <div className="mt-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-2xl font-bold">52%</div>
          <div className="text-xs text-muted-foreground">Overall Case Clearance</div>
        </div>
        <Badge variant="outline" className="bg-green-100 text-green-800">
          +2% from last month
        </Badge>
      </div>

      <div className="space-y-3">
        {resolutionData.map((item) => (
          <div key={item.type}>
            <div className="flex justify-between text-xs mb-1">
              <span>{item.type}</span>
              <div className="flex items-center">
                <span>{item.rate}%</span>
                <span className={`ml-1 ${item.direction === "up" ? "text-green-600" : "text-red-600"}`}>
                  {item.direction === "up" ? (
                    <TrendingUp className="h-3 w-3 ml-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 ml-1" />
                  )}
                </span>
              </div>
            </div>
            <Progress
              value={item.rate}
              className="h-2"
              indicatorClassName={item.rate > 60 ? "bg-green-500" : item.rate > 40 ? "bg-yellow-500" : "bg-red-500"}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
