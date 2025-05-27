import { Badge } from "@/app/_components/ui/badge"
import { ArrowRight, Clock, User } from "lucide-react"

export default function ChainOfCustody() {
  const custodyEvents = [
    {
      evidenceId: "EV-4523",
      events: [
        {
          action: "Collected",
          by: "Officer Wilson",
          date: "Apr 18, 2023",
          time: "16:45",
        },
        {
          action: "Transferred",
          by: "Officer Wilson",
          to: "Evidence Room",
          date: "Apr 18, 2023",
          time: "18:30",
        },
        {
          action: "Checked Out",
          by: "Sarah Johnson",
          date: "Apr 20, 2023",
          time: "09:15",
        },
        {
          action: "Returned",
          by: "Sarah Johnson",
          date: "Apr 22, 2023",
          time: "14:30",
        },
      ],
    },
  ]

  return (
    <div className="mt-4 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium">Recent Activity</h3>
        <button className="text-xs text-primary">View All</button>
      </div>

      {custodyEvents.map((item) => (
        <div key={item.evidenceId} className="border rounded-lg p-3">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-medium text-sm">Evidence #{item.evidenceId}</h4>
            <Badge variant="outline" className="bg-blue-100 text-blue-800">
              {item.events.length} transfers
            </Badge>
          </div>

          <div className="space-y-3">
            {item.events.map((event, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center shrink-0">
                  {event.action === "Collected" || event.action === "Checked Out" ? (
                    <User className="h-3 w-3" />
                  ) : (
                    <ArrowRight className="h-3 w-3" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="font-medium">{event.action}</span>
                    <span>by {event.by}</span>
                    {event.to && <span>to {event.to}</span>}
                  </div>
                </div>

                <div className="text-xs text-muted-foreground flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {event.date}, {event.time}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
