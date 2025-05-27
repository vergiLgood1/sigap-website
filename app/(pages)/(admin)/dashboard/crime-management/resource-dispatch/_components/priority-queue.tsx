import { Badge } from "@/app/_components/ui/badge"
import { Button } from "@/app/_components/ui/button"
import { MapPin, Clock, ArrowRight } from "lucide-react"

export default function PriorityQueue() {
  const queuedCalls = [
    {
      id: "INC-4527",
      type: "Noise Complaint",
      location: "567 Elm St, Apt 12",
      priority: "Low",
      timeReceived: "10:28 AM",
      waitTime: "5m 12s",
    },
    {
      id: "INC-4528",
      type: "Suspicious Person",
      location: "Main Street Park",
      priority: "Medium",
      timeReceived: "10:25 AM",
      waitTime: "8m 35s",
    },
    {
      id: "INC-4529",
      type: "Shoplifting",
      location: "Downtown Mall, Store #5",
      priority: "Medium",
      timeReceived: "10:20 AM",
      waitTime: "13m 40s",
    },
  ]

  return (
    <div className="mt-4 space-y-3">
      <div className="flex justify-between items-center">
        <div className="text-sm font-medium">Pending Calls: {queuedCalls.length}</div>
        <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
          Avg Wait: 9m 15s
        </Badge>
      </div>

      {queuedCalls.map((call) => (
        <div key={call.id} className="border rounded-lg p-3">
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                call.priority === "Low" ? "bg-blue-500" : call.priority === "Medium" ? "bg-yellow-500" : "bg-red-500"
              }`}
            ></div>
            <h4 className="font-medium text-sm">{call.type}</h4>
            <Badge
              variant="outline"
              className={
                call.priority === "Low"
                  ? "bg-blue-100 text-blue-800 ml-auto"
                  : call.priority === "Medium"
                    ? "bg-yellow-100 text-yellow-800 ml-auto"
                    : "bg-red-100 text-red-800 ml-auto"
              }
            >
              {call.priority}
            </Badge>
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground">
            <div className="flex items-center">
              <MapPin className="h-3 w-3 mr-1" />
              {call.location}
            </div>
            <div className="flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              Waiting: {call.waitTime}
            </div>
          </div>

          <div className="flex justify-end mt-2">
            <Button size="sm" className="flex items-center">
              Dispatch
              <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
