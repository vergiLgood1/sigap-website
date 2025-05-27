import { User } from "lucide-react"
import { Badge } from "@/app/_components/ui/badge"

export default function PersonsOfInterest() {
  const persons = [
    { id: "POI-3421", name: "John Doe", case: "CR-7823", status: "Wanted" },
    { id: "POI-3422", name: "Jane Smith", case: "CR-7825", status: "In Custody" },
    { id: "POI-3423", name: "Robert Johnson", case: "CR-7830", status: "Under Surveillance" },
  ]

  const getStatusClass = (status: string) => {
    switch (status) {
      case "Wanted":
        return "bg-red-100 text-red-800"
      case "In Custody":
        return "bg-green-100 text-green-800"
      default:
        return "bg-yellow-100 text-yellow-800"
    }
  }

  return (
    <div className="space-y-2 mt-4">
      {persons.map((person) => (
        <div key={person.id} className="flex items-center gap-2 rounded-lg p-2">
          <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
            <User className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{person.name}</p>
            <p className="text-xs text-muted-foreground">
              {person.id} • Case #{person.case}
            </p>
          </div>
          <Badge variant="outline" className={getStatusClass(person.status)}>
            {person.status}
          </Badge>
        </div>
      ))}
    </div>
  )
}
