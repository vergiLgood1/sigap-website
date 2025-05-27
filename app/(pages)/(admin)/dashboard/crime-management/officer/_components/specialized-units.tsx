import { Badge } from "@/app/_components/ui/badge"
import { Shield, Users } from "lucide-react"

export default function SpecializedUnits() {
  const units = [
    {
      name: "SWAT",
      members: 8,
      status: "Available",
      lead: "Capt. Anderson",
    },
    {
      name: "K-9 Unit",
      members: 5,
      status: "On Call",
      lead: "Lt. Martinez",
    },
    {
      name: "Narcotics",
      members: 6,
      status: "Deployed",
      lead: "Sgt. Williams",
    },
  ]

  return (
    <div className="mt-4 space-y-3">
      {units.map((unit, index) => (
        <div key={index} className="flex items-start gap-3 p-2 border rounded-lg">
          <div className="w-8 h-8 rounded bg-muted flex items-center justify-center shrink-0">
            <Shield className="h-4 w-4" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-medium text-sm">{unit.name}</h4>
              <Badge
                variant="outline"
                className={
                  unit.status === "Available"
                    ? "bg-green-100 text-green-800"
                    : unit.status === "On Call"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-yellow-100 text-yellow-800"
                }
              >
                {unit.status}
              </Badge>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="flex items-center">
                <Users className="h-3 w-3 mr-1" />
                {unit.members} members
              </div>
              <div>Lead: {unit.lead}</div>
            </div>
          </div>

          <button className="text-xs text-primary shrink-0">Details</button>
        </div>
      ))}

      <button className="w-full text-sm text-primary mt-2 py-1">View All Units</button>
    </div>
  )
}
