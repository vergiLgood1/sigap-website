import { Badge } from "@/app/_components/ui/badge"
import { Car, User } from "lucide-react"

export default function UnitStatus() {
  const units = [
    { id: "Unit 5", officer: "Parker", status: "On Scene", location: "789 Pine St" },
    { id: "Unit 8", officer: "Rodriguez", status: "On Scene", location: "I-95, Mile 42" },
    { id: "Unit 9", officer: "Johnson", status: "On Scene", location: "789 Pine St" },
    { id: "Unit 12", officer: "Chen", status: "Responding", location: "123 Main St" },
    { id: "Unit 15", officer: "Wilson", status: "Responding", location: "123 Main St" },
    { id: "Unit 17", officer: "Thompson", status: "Responding", location: "456 Oak Ave" },
  ]

  return (
    <div className="mt-4 space-y-3">
      <div className="grid grid-cols-2 gap-2 text-center">
        <div className="border rounded-lg p-2">
          <div className="text-2xl font-bold">12</div>
          <div className="text-xs text-muted-foreground">Available</div>
        </div>
        <div className="border rounded-lg p-2">
          <div className="text-2xl font-bold">12</div>
          <div className="text-xs text-muted-foreground">Assigned</div>
        </div>
      </div>

      <div className="space-y-2">
        {units.map((unit) => (
          <div key={unit.id} className="flex items-center gap-2 p-2 border rounded-lg">
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
              <Car className="h-4 w-4" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="font-medium text-sm">{unit.id}</h4>
                <div className="text-xs text-muted-foreground flex items-center">
                  <User className="h-3 w-3 mr-1" />
                  {unit.officer}
                </div>
              </div>

              <div className="text-xs text-muted-foreground truncate">{unit.location}</div>
            </div>

            <Badge
              variant="outline"
              className={
                unit.status === "On Scene"
                  ? "bg-green-100 text-green-800"
                  : unit.status === "Responding"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-blue-100 text-blue-800"
              }
            >
              {unit.status}
            </Badge>
          </div>
        ))}
      </div>

      <button className="w-full text-sm text-primary mt-2 py-1">View All Units</button>
    </div>
  )
}
