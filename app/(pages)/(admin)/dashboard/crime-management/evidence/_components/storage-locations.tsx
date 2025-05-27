import { Badge } from "@/app/_components/ui/badge"
import { Progress } from "@/app/_components/ui/progress"
import { Package } from "lucide-react"

export default function StorageLocations() {
  const locations = [
    {
      id: "A",
      name: "Evidence Locker A",
      capacity: 85,
      items: 42,
      securityLevel: "High",
    },
    {
      id: "B",
      name: "Evidence Locker B",
      capacity: 90,
      items: 81,
      securityLevel: "High",
    },
    {
      id: "C",
      name: "Evidence Locker C",
      capacity: 75,
      items: 45,
      securityLevel: "Medium",
    },
    {
      id: "D",
      name: "Digital Storage",
      capacity: 40,
      items: 32,
      securityLevel: "High",
    },
  ]

  return (
    <div className="mt-4 space-y-3">
      {locations.map((location) => (
        <div key={location.id} className="border rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded bg-muted flex items-center justify-center shrink-0">
              <Package className="h-4 w-4" />
            </div>

            <div>
              <h4 className="font-medium text-sm">{location.name}</h4>
              <div className="text-xs text-muted-foreground">Security: {location.securityLevel}</div>
            </div>

            <Badge
              variant="outline"
              className={
                location.items / location.capacity > 0.9
                  ? "bg-red-100 text-red-800 ml-auto"
                  : location.items / location.capacity > 0.7
                    ? "bg-yellow-100 text-yellow-800 ml-auto"
                    : "bg-green-100 text-green-800 ml-auto"
              }
            >
              {location.items}/{location.capacity} items
            </Badge>
          </div>

          <Progress
            value={(location.items / location.capacity) * 100}
            className="h-2"
            indicatorClassName={
              location.items / location.capacity > 0.9
                ? "bg-red-500"
                : location.items / location.capacity > 0.7
                  ? "bg-yellow-500"
                  : "bg-green-500"
            }
          />
        </div>
      ))}

      <button className="w-full text-sm text-primary mt-2 py-1">Manage Locations</button>
    </div>
  )
}
