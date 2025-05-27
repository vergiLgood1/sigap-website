import { FileText } from "lucide-react"
import { Badge } from "@/app/_components/ui/badge"

export default function EvidenceTracking() {
  const evidenceItems = [
    { id: "EV-4523", type: "Weapon", case: "CR-7823", status: "Processing" },
    { id: "EV-4525", type: "Digital Media", case: "CR-7825", status: "Secured" },
    { id: "EV-4527", type: "DNA Sample", case: "CR-7830", status: "Lab Analysis" },
  ]

  return (
    <div className="space-y-2 mt-4">
      {evidenceItems.map((evidence) => (
        <div key={evidence.id} className="flex items-center gap-2 rounded-lg p-2">
          <div className="w-8 h-8 rounded bg-slate-200 flex items-center justify-center">
            <FileText className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{evidence.id}</p>
            <p className="text-xs text-muted-foreground">
              {evidence.type} • Case #{evidence.case}
            </p>
          </div>
          <Badge variant="outline" className="text-xs">
            {evidence.status}
          </Badge>
        </div>
      ))}
    </div>
  )
}
