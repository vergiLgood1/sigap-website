import { Progress } from "@/app/_components/ui/progress"
import { Award, TrendingUp } from "lucide-react"

export default function OfficerPerformance() {
  const topPerformers = [
    { name: "Emily Parker", metric: "Case Clearance", value: 92 },
    { name: "Michael Chen", metric: "Response Time", value: 88 },
    { name: "Sarah Johnson", metric: "Evidence Processing", value: 95 },
  ]

  return (
    <div className="mt-4 space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="border rounded-lg p-3">
          <div className="text-sm text-muted-foreground mb-1">Avg. Case Clearance</div>
          <div className="text-2xl font-bold">68%</div>
          <div className="text-xs text-green-600 flex items-center mt-1">
            <TrendingUp className="h-3 w-3 mr-1" />
            +5% from last month
          </div>
        </div>

        <div className="border rounded-lg p-3">
          <div className="text-sm text-muted-foreground mb-1">Avg. Response Time</div>
          <div className="text-2xl font-bold">4.2m</div>
          <div className="text-xs text-green-600 flex items-center mt-1">
            <TrendingUp className="h-3 w-3 mr-1" />
            -0.3m from last month
          </div>
        </div>
      </div>

      <div className="border rounded-lg p-3">
        <h4 className="font-medium text-sm mb-3 flex items-center">
          <Award className="h-4 w-4 mr-1" />
          Top Performers
        </h4>

        <div className="space-y-3">
          {topPerformers.map((performer, index) => (
            <div key={index}>
              <div className="flex justify-between text-sm mb-1">
                <span>{performer.name}</span>
                <span>
                  {performer.metric}: {performer.value}%
                </span>
              </div>
              <Progress value={performer.value} className="h-2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
