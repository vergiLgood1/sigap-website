import { AlertTriangle } from "lucide-react"
import { Badge } from "@/app/_components/ui/badge"

export default function HighPriorityCases() {
  const cases = [
    { id: "CR-7823", type: "Homicide", location: "Downtown", priority: "Critical", time: "2h ago" },
    { id: "CR-7825", type: "Armed Robbery", location: "North District", priority: "High", time: "4h ago" },
    { id: "CR-7830", type: "Kidnapping", location: "West Side", priority: "Critical", time: "6h ago" },
    { id: "CR-7832", type: "Assault", location: "East District", priority: "Medium", time: "8h ago" },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
      {cases.map((case_) => (
        <div key={case_.id} className="flex items-center gap-3 rounded-lg p-3 bg-red-50 border border-red-100">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
            <AlertTriangle className="h-5 w-5 text-red-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between">
              <p className="text-sm font-medium">Case #{case_.id}</p>
              <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">
                {case_.priority}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              {case_.type} • {case_.location} • {case_.time}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
