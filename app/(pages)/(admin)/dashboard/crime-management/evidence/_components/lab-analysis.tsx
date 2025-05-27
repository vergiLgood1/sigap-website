import { Badge } from "@/app/_components/ui/badge"
import { Progress } from "@/app/_components/ui/progress"
import { FlaskRoundIcon as Flask } from "lucide-react"

export default function LabAnalysis() {
  const labItems = [
    {
      id: "EV-4526",
      type: "DNA Sample",
      description: "Blood sample from kitchen floor",
      case: "CR-7823",
      submittedDate: "Apr 15, 2023",
      status: "Processing",
      progress: 65,
      estimatedCompletion: "Apr 25, 2023",
      priority: "High",
    },
    {
      id: "EV-4528",
      type: "Clothing",
      description: "Victim's jacket with possible blood stains",
      case: "CR-7825",
      submittedDate: "Apr 20, 2023",
      status: "Queue",
      progress: 10,
      estimatedCompletion: "Apr 30, 2023",
      priority: "Medium",
    },
    {
      id: "EV-4527",
      type: "Fingerprint",
      description: "Prints lifted from doorknob",
      case: "CR-7825",
      submittedDate: "Apr 20, 2023",
      status: "Processing",
      progress: 40,
      estimatedCompletion: "Apr 27, 2023",
      priority: "High",
    },
  ]

  return (
    <div className="mt-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2">
          <button className="text-sm font-medium">All</button>
          <button className="text-sm text-muted-foreground">Processing</button>
          <button className="text-sm text-muted-foreground">Completed</button>
        </div>
        <button className="text-sm text-primary">Submit to Lab</button>
      </div>

      <div className="space-y-3">
        {labItems.map((item) => (
          <div
            key={item.id}
            className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0">
              <Flask className="h-5 w-5" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="font-medium">{item.id}</h4>
                <Badge variant="outline">{item.type}</Badge>
                <Badge
                  variant="outline"
                  className={item.priority === "High" ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"}
                >
                  {item.priority}
                </Badge>
              </div>

              <p className="text-sm mt-1">{item.description}</p>

              <div className="mt-2">
                <div className="flex justify-between text-xs mb-1">
                  <span>Analysis Progress</span>
                  <span>{item.progress}%</span>
                </div>
                <Progress value={item.progress} className="h-2" />
              </div>

              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground">
                <span>Case: {item.case}</span>
                <span>Submitted: {item.submittedDate}</span>
                <span>Est. Completion: {item.estimatedCompletion}</span>
              </div>
            </div>

            <button className="text-sm text-primary shrink-0">View Results</button>
          </div>
        ))}
      </div>
    </div>
  )
}
