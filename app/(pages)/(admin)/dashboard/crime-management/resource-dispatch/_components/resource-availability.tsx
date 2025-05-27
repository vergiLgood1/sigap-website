import { Badge } from "@/app/_components/ui/badge"
import { Progress } from "@/app/_components/ui/progress"
import { Car, Truck, Ambulance, Shield } from "lucide-react"

export default function ResourceAvailability() {
  const resources = [
    {
      type: "Patrol Cars",
      total: 24,
      available: 12,
      icon: Car,
    },
    {
      type: "K-9 Units",
      total: 4,
      available: 2,
      icon: Shield,
    },
    {
      type: "Ambulances",
      total: 8,
      available: 5,
      icon: Ambulance,
    },
    {
      type: "SWAT Team",
      total: 1,
      available: 1,
      icon: Truck,
    },
  ]

  return (
    <div className="mt-4 space-y-3">
      {resources.map((resource) => (
        <div key={resource.type} className="border rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded bg-muted flex items-center justify-center shrink-0">
              <resource.icon className="h-4 w-4" />
            </div>

            <div>
              <h4 className="font-medium text-sm">{resource.type}</h4>
            </div>

            <Badge
              variant="outline"
              className={
                resource.available / resource.total > 0.5
                  ? "bg-green-100 text-green-800 ml-auto"
                  : resource.available / resource.total > 0.25
                    ? "bg-yellow-100 text-yellow-800 ml-auto"
                    : "bg-red-100 text-red-800 ml-auto"
              }
            >
              {resource.available}/{resource.total} Available
            </Badge>
          </div>

          <Progress
            value={(resource.available / resource.total) * 100}
            className="h-2"
            indicatorClassName={
              resource.available / resource.total > 0.5
                ? "bg-green-500"
                : resource.available / resource.total > 0.25
                  ? "bg-yellow-500"
                  : "bg-red-500"
            }
          />
        </div>
      ))}
    </div>
  )
}
