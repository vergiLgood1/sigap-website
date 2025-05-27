import { AlertTriangle, Calendar, Clock } from "lucide-react"
import { Badge } from "@/app/_components/ui/badge"
import { Button } from "@/app/_components/ui/button"

interface CaseHeaderProps {
  caseId: string
  title: string
  status: string
  priority: string
  dateOpened: string
  lastUpdated: string
}

export default function CaseHeader({ caseId, title, status, priority, dateOpened, lastUpdated }: CaseHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row justify-between gap-4">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">Case #{caseId}</h1>
          <Badge variant="outline" className="bg-blue-100 text-blue-800">
            {status}
          </Badge>
          <Badge variant="outline" className="bg-red-100 text-red-800">
            <AlertTriangle className="h-3 w-3 mr-1" />
            {priority}
          </Badge>
        </div>
        <h2 className="text-xl mt-1">{title}</h2>
        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-1" />
            Opened: {dateOpened}
          </div>
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            Last updated: {lastUpdated}
          </div>
        </div>
      </div>

      <div className="flex items-start gap-2">
        <Button>Update Status</Button>
        <Button variant="outline">Export Case</Button>
      </div>
    </div>
  )
}
