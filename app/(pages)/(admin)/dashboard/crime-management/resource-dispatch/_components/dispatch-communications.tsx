import { Badge } from "@/app/_components/ui/badge"
import { Radio, MessageSquare, User } from "lucide-react"

export default function DispatchCommunications() {
  const communications = [
    {
      id: 1,
      type: "Radio",
      from: "Unit 12",
      message: "Arriving on scene at 123 Main St.",
      time: "10:32 AM",
      priority: "Normal",
    },
    {
      id: 2,
      type: "Radio",
      from: "Unit 8",
      message: "Requesting additional unit for traffic control at accident scene.",
      time: "10:28 AM",
      priority: "High",
    },
    {
      id: 3,
      type: "Message",
      from: "Dispatch",
      message: "Be advised, suspect description updated for INC-4525.",
      time: "10:25 AM",
      priority: "Normal",
    },
    {
      id: 4,
      type: "Radio",
      from: "Unit 5",
      message: "Medical assistance required at 789 Pine St.",
      time: "10:20 AM",
      priority: "High",
    },
  ]

  return (
    <div className="mt-4 space-y-3">
      <div className="flex justify-between items-center">
        <div className="text-sm font-medium">Recent Communications</div>
        <Badge variant="outline" className="bg-blue-100 text-blue-800">
          Channel: Main Dispatch
        </Badge>
      </div>

      {communications.map((comm) => (
        <div key={comm.id} className="border rounded-lg p-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center shrink-0">
              {comm.type === "Radio" ? <Radio className="h-3 w-3" /> : <MessageSquare className="h-3 w-3" />}
            </div>

            <div className="flex items-center gap-1">
              <span className="font-medium text-xs">{comm.from}</span>
              <span className="text-xs text-muted-foreground">• {comm.time}</span>
            </div>

            <Badge
              variant="outline"
              className={
                comm.priority === "High" ? "bg-red-100 text-red-800 ml-auto" : "bg-blue-100 text-blue-800 ml-auto"
              }
            >
              {comm.priority}
            </Badge>
          </div>

          <p className="text-xs mt-1 ml-8">{comm.message}</p>
        </div>
      ))}

      <div className="flex items-center gap-2 mt-2">
        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
          <User className="h-4 w-4" />
        </div>
        <input
          type="text"
          placeholder="Send message to all units..."
          className="flex-1 text-sm rounded-md border border-input bg-background px-3 py-1 ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>
    </div>
  )
}
