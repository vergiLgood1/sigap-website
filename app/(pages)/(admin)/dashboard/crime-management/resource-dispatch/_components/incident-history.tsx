import { Badge } from "@/app/_components/ui/badge"
import { Clock, FileText } from "lucide-react"

export default function IncidentHistory() {
  const closedIncidents = [
    {
      id: "INC-4520",
      type: "Traffic Stop",
      location: "Highway 101, Mile 35",
      resolution: "Citation Issued",
      timeReceived: "9:15 AM",
      timeClosed: "9:45 AM",
      units: ["Unit 22"],
    },
    {
      id: "INC-4521",
      type: "Alarm Activation",
      location: "First National Bank",
      resolution: "False Alarm",
      timeReceived: "9:22 AM",
      timeClosed: "9:40 AM",
      units: ["Unit 7", "Unit 10"],
    },
    {
      id: "INC-4522",
      type: "Welfare Check",
      location: "234 Cedar Lane",
      resolution: "Assistance Provided",
      timeReceived: "9:30 AM",
      timeClosed: "9:55 AM",
      units: ["Unit 15"],
    },
  ]

  return (
    <div className="mt-4 space-y-3">
      <div className="flex justify-between items-center">
        <div className="text-sm font-medium">Recently Closed</div>
        <button className="text-xs text-primary">View All</button>
      </div>

      {closedIncidents.map((incident) => (
        <div key={incident.id} className="border rounded-lg p-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-muted flex items-center justify-center shrink-0">
              <FileText className="h-3 w-3" />
            </div>

            <div>
              <div className="flex items-center gap-1">
                <span className="font-medium text-xs">{incident.type}</span>
                <span className="text-xs text-muted-foreground">#{incident.id}</span>
              </div>
              <div className="text-xs text-muted-foreground">{incident.location}</div>
            </div>

            <Badge variant="outline" className="bg-green-100 text-green-800 ml-auto">
              {incident.resolution}
            </Badge>
          </div>

          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <div className="flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              {incident.timeReceived} - {incident.timeClosed}
            </div>
            <div>Units: {incident.units.join(", ")}</div>
          </div>
        </div>
      ))}
    </div>
  )
}
