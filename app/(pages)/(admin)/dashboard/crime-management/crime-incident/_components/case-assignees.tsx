import { User } from "lucide-react"
import { Badge } from "@/app/_components/ui/badge"

export default function CaseAssignees() {
  const assignees = [
    {
      id: "OFF-1234",
      name: "Michael Chen",
      role: "Lead Detective",
      badge: "ID-5678",
      contact: "555-123-4567",
      status: "Active",
    },
    {
      id: "OFF-2345",
      name: "Sarah Johnson",
      role: "Forensic Specialist",
      badge: "ID-6789",
      contact: "555-234-5678",
      status: "Active",
    },
    {
      id: "OFF-3456",
      name: "Robert Wilson",
      role: "Evidence Technician",
      badge: "ID-7890",
      contact: "555-345-6789",
      status: "Active",
    },
    {
      id: "OFF-4567",
      name: "James Rodriguez",
      role: "Patrol Officer",
      badge: "ID-8901",
      contact: "555-456-7890",
      status: "Standby",
    },
  ]

  return (
    <div className="space-y-3">
      {assignees.map((officer) => (
        <div key={officer.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
            <User className="h-4 w-4" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-medium text-sm">{officer.name}</h4>
              <Badge
                variant="outline"
                className={officer.status === "Active" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"}
              >
                {officer.status}
              </Badge>
            </div>

            <div className="text-xs text-muted-foreground">
              {officer.role} • Badge #{officer.badge}
            </div>
          </div>
        </div>
      ))}

      <button className="w-full text-sm text-primary mt-2 py-1">+ Assign Personnel</button>
    </div>
  )
}
