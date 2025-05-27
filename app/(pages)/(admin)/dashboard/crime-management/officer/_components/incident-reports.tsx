import { Badge } from "@/app/_components/ui/badge"
import { FileText } from "lucide-react"

export default function IncidentReports() {
  const reports = [
    {
      id: "IR-7823",
      title: "Traffic Stop - Speeding",
      officer: "David Thompson",
      date: "Apr 22, 2023",
      status: "Submitted",
      location: "Highway 101, Mile 23",
    },
    {
      id: "IR-7824",
      title: "Domestic Disturbance",
      officer: "Emily Parker",
      date: "Apr 22, 2023",
      status: "Pending Review",
      location: "123 Main St, Apt 4B",
    },
    {
      id: "IR-7825",
      title: "Shoplifting",
      officer: "James Rodriguez",
      date: "Apr 21, 2023",
      status: "Approved",
      location: "Downtown Mall, Store #12",
    },
    {
      id: "IR-7826",
      title: "Noise Complaint",
      officer: "Emily Parker",
      date: "Apr 21, 2023",
      status: "Approved",
      location: "456 Oak Ave",
    },
  ]

  return (
    <div className="mt-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2">
          <button className="text-sm font-medium">All</button>
          <button className="text-sm text-muted-foreground">Pending</button>
          <button className="text-sm text-muted-foreground">Approved</button>
        </div>
        <button className="text-sm text-primary">New Report</button>
      </div>

      <div className="space-y-3">
        {reports.map((report) => (
          <div
            key={report.id}
            className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
          >
            <div className="w-10 h-10 rounded bg-muted flex items-center justify-center shrink-0">
              <FileText className="h-5 w-5" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="font-medium">{report.title}</h4>
                <span className="text-sm text-muted-foreground">#{report.id}</span>
                <Badge
                  variant="outline"
                  className={
                    report.status === "Approved"
                      ? "bg-green-100 text-green-800"
                      : report.status === "Pending Review"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-blue-100 text-blue-800"
                  }
                >
                  {report.status}
                </Badge>
              </div>

              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-muted-foreground">
                <span>Officer: {report.officer}</span>
                <span>Date: {report.date}</span>
                <span>Location: {report.location}</span>
              </div>
            </div>

            <button className="text-sm text-primary shrink-0">View</button>
          </div>
        ))}
      </div>
    </div>
  )
}
