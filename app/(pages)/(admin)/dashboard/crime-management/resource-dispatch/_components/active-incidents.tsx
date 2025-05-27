import { Badge } from "@/app/_components/ui/badge"
import { Button } from "@/app/_components/ui/button"
import { AlertTriangle, MapPin, Clock, Users } from "lucide-react"

export default function ActiveIncidents() {
  const incidents = [
    {
      id: "INC-4523",
      type: "Domestic Disturbance",
      location: "123 Main St, Apt 4B",
      priority: "High",
      status: "Units Responding",
      timeReceived: "10:23 AM",
      responseTime: "2m 15s",
      assignedUnits: ["Unit 12", "Unit 15"],
    },
    {
      id: "INC-4524",
      type: "Traffic Accident",
      location: "Interstate 95, Mile 42",
      priority: "Medium",
      status: "On Scene",
      timeReceived: "10:15 AM",
      responseTime: "5m 30s",
      assignedUnits: ["Unit 8", "Unit 22"],
    },
    {
      id: "INC-4525",
      type: "Burglary",
      location: "456 Oak Ave",
      priority: "Medium",
      status: "Units Responding",
      timeReceived: "10:05 AM",
      responseTime: "4m 45s",
      assignedUnits: ["Unit 17"],
    },
    {
      id: "INC-4526",
      type: "Medical Emergency",
      location: "789 Pine St",
      priority: "Critical",
      status: "On Scene",
      timeReceived: "9:58 AM",
      responseTime: "3m 10s",
      assignedUnits: ["Unit 5", "Unit 9", "Ambulance 3"],
    },
  ]

  return (
    <div className="mt-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            All
          </Button>
          <Button variant="outline" size="sm">
            Critical
          </Button>
          <Button variant="outline" size="sm">
            High
          </Button>
          <Button variant="outline" size="sm">
            Medium
          </Button>
        </div>
        <div className="text-sm text-muted-foreground">Showing {incidents.length} active incidents</div>
      </div>

      <div className="space-y-3">
        {incidents.map((incident) => (
          <div
            key={incident.id}
            className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                incident.priority === "Critical"
                  ? "bg-red-100"
                  : incident.priority === "High"
                    ? "bg-orange-100"
                    : "bg-yellow-100"
              }`}
            >
              <AlertTriangle
                className={`h-5 w-5 ${
                  incident.priority === "Critical"
                    ? "text-red-600"
                    : incident.priority === "High"
                      ? "text-orange-600"
                      : "text-yellow-600"
                }`}
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="font-medium">{incident.type}</h4>
                <span className="text-sm text-muted-foreground">#{incident.id}</span>
                <Badge
                  variant="outline"
                  className={
                    incident.priority === "Critical"
                      ? "bg-red-100 text-red-800"
                      : incident.priority === "High"
                        ? "bg-orange-100 text-orange-800"
                        : "bg-yellow-100 text-yellow-800"
                  }
                >
                  {incident.priority}
                </Badge>
                <Badge variant="outline" className="bg-blue-100 text-blue-800">
                  {incident.status}
                </Badge>
              </div>

              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground">
                <div className="flex items-center">
                  <MapPin className="h-3 w-3 mr-1" />
                  {incident.location}
                </div>
                <div className="flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  Received: {incident.timeReceived} (Response: {incident.responseTime})
                </div>
                <div className="flex items-center">
                  <Users className="h-3 w-3 mr-1" />
                  Units: {incident.assignedUnits.join(", ")}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Button size="sm">Update</Button>
              <Button size="sm" variant="outline">
                Details
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
