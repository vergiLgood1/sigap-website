import { ArrowRight } from "lucide-react"
import { Badge } from "@/app/_components/ui/badge"

export default function CaseRelated() {
  const relatedCases = [
    {
      id: "CR-7456",
      title: "Assault - Downtown District",
      date: "Mar 12, 2023",
      status: "Closed",
      relationship: "Same suspect",
    },
    {
      id: "CR-7689",
      title: "Breaking & Entering - Westside",
      date: "Apr 02, 2023",
      status: "Active",
      relationship: "Similar MO",
    },
    {
      id: "CR-7712",
      title: "Theft - Downtown District",
      date: "Apr 10, 2023",
      status: "Active",
      relationship: "Same location",
    },
  ]

  return (
    <div className="space-y-3">
      {relatedCases.map((case_) => (
        <div key={case_.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-medium text-sm">Case #{case_.id}</h4>
              <Badge
                variant="outline"
                className={case_.status === "Active" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"}
              >
                {case_.status}
              </Badge>
            </div>

            <p className="text-xs truncate">{case_.title}</p>

            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>{case_.date}</span>
              <span>{case_.relationship}</span>
            </div>
          </div>

          <ArrowRight className="h-4 w-4 text-muted-foreground" />
        </div>
      ))}

      <button className="w-full text-sm text-primary mt-2 py-1">+ Link Related Case</button>
    </div>
  )
}
