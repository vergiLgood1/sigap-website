import { Badge } from "@/app/_components/ui/badge"
import { Calendar } from "lucide-react"

export default function LeaveManagement() {
  const leaveRequests = [
    {
      officer: "Sarah Johnson",
      type: "Vacation",
      dates: "May 10-15, 2023",
      status: "Approved",
      requestDate: "Apr 15, 2023",
    },
    {
      officer: "James Rodriguez",
      type: "Sick Leave",
      dates: "Apr 25, 2023",
      status: "Pending",
      requestDate: "Apr 24, 2023",
    },
    {
      officer: "Michael Chen",
      type: "Personal",
      dates: "May 5, 2023",
      status: "Pending",
      requestDate: "Apr 20, 2023",
    },
  ]

  return (
    <div className="mt-4 space-y-3">
      {leaveRequests.map((request, index) => (
        <div key={index} className="flex items-start gap-3 p-2 border rounded-lg">
          <div className="w-8 h-8 rounded bg-muted flex items-center justify-center shrink-0">
            <Calendar className="h-4 w-4" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-medium text-sm">{request.officer}</h4>
              <Badge
                variant="outline"
                className={
                  request.status === "Approved" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                }
              >
                {request.status}
              </Badge>
            </div>

            <div className="text-xs text-muted-foreground">
              {request.type} • {request.dates}
            </div>

            <div className="text-xs text-muted-foreground mt-1">Requested: {request.requestDate}</div>
          </div>
        </div>
      ))}

      <button className="w-full text-sm text-primary mt-2 py-1">Request Leave</button>
    </div>
  )
}
