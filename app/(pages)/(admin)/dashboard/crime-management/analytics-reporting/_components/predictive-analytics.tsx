import { Badge } from "@/app/_components/ui/badge"
import { AlertTriangle, TrendingUp } from "lucide-react"

export default function PredictiveAnalytics() {
  const predictions = [
    {
      area: "Downtown District",
      crimeType: "Theft",
      riskLevel: "High",
      confidence: "85%",
      trend: "Increasing",
    },
    {
      area: "West Side Commercial",
      crimeType: "Vandalism",
      riskLevel: "Medium",
      confidence: "72%",
      trend: "Stable",
    },
    {
      area: "North Transit Hub",
      crimeType: "Assault",
      riskLevel: "Medium",
      confidence: "68%",
      trend: "Increasing",
    },
  ]

  return (
    <div className="mt-4 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">7-Day Forecast</h4>
        <Badge variant="outline" className="bg-blue-100 text-blue-800">
          AI-Powered
        </Badge>
      </div>

      {predictions.map((prediction, index) => (
        <div key={index} className="border rounded-lg p-3">
          <div className="flex items-center gap-2">
            <AlertTriangle
              className={`h-4 w-4 ${prediction.riskLevel === "High" ? "text-red-500" : "text-yellow-500"}`}
            />
            <h4 className="font-medium text-sm">{prediction.area}</h4>
            <Badge
              variant="outline"
              className={
                prediction.riskLevel === "High"
                  ? "bg-red-100 text-red-800 ml-auto"
                  : "bg-yellow-100 text-yellow-800 ml-auto"
              }
            >
              {prediction.riskLevel} Risk
            </Badge>
          </div>

          <div className="mt-2 text-xs">
            <div className="flex justify-between">
              <span>Predicted Crime:</span>
              <span className="font-medium">{prediction.crimeType}</span>
            </div>
            <div className="flex justify-between mt-1">
              <span>Confidence:</span>
              <span className="font-medium">{prediction.confidence}</span>
            </div>
            <div className="flex justify-between mt-1">
              <span>Trend:</span>
              <span
                className={`font-medium flex items-center ${prediction.trend === "Increasing" ? "text-red-600" : "text-blue-600"}`}
              >
                {prediction.trend}
                {prediction.trend === "Increasing" && <TrendingUp className="h-3 w-3 ml-1" />}
              </span>
            </div>
          </div>
        </div>
      ))}

      <div className="text-xs text-center text-muted-foreground mt-2">
        Predictions based on historical data, weather patterns, and local events
      </div>
    </div>
  )
}
