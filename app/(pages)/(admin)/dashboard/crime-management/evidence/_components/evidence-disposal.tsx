import { Badge } from "@/app/_components/ui/badge"
import { AlertTriangle, Calendar } from "lucide-react"

export default function EvidenceDisposal() {
  const disposalItems = [
    {
      id: "EV-3245",
      type: "Clothing",
      case: "CR-6578",
      scheduledDate: "May 15, 2023",
      disposalType: "Return to Owner",
      status: "Scheduled",
    },
    {
      id: "EV-3246",
      type: "Drug Sample",
      case: "CR-6580",
      scheduledDate: "May 20, 2023",
      disposalType: "Destruction",
      status: "Pending Approval",
    },
    {
      id: "EV-3250",
      type: "Electronics",
      case: "CR-6590",
      scheduledDate: "May 25, 2023",
      disposalType: "Return to Owner",
      status: "Scheduled",
    },
  ]

  return (
    <div className="mt-4 space-y-3">
      {disposalItems.map((item) => (
        <div key={item.id} className="flex items-center gap-3 p-2 border rounded-lg">
          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
            <AlertTriangle className="h-4 w-4" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-medium text-sm">{item.id}</h4>
              <Badge variant="outline">{item.type}</Badge>
            </div>

            <div className="flex gap-2 text-xs text-muted-foreground mt-1">
              <span>Case: {item.case}</span>
              <span>Method: {item.disposalType}</span>
            </div>

            <div className="flex items-center gap-1 text-xs mt-1">
              <Calendar className="h-3 w-3" />
              <span>Scheduled: {item.scheduledDate}</span>
              <Badge
                variant="outline"
                className={
                  item.status === "Scheduled"
                    ? "bg-green-100 text-green-800 ml-2"
                    : "bg-yellow-100 text-yellow-800 ml-2"
                }
              >
                {item.status}
              </Badge>
            </div>
          </div>

          <button className="text-xs text-primary shrink-0">Review</button>
        </div>
      ))}

      <button className="w-full text-sm text-primary mt-2 py-1">Schedule Disposal</button>
    </div>
  )
}
