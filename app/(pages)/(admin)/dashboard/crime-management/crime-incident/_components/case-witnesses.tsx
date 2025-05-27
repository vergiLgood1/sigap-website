import { User } from "lucide-react"
import { Badge } from "@/app/_components/ui/badge"

export default function CaseWitnesses() {
  const witnesses = [
    {
      id: "W-1201",
      name: "Emily Parker",
      type: "Eyewitness",
      contactInfo: "555-123-4567",
      interviewDate: "Apr 20, 2023",
      status: "Interviewed",
      reliability: "High",
      notes: "Neighbor who heard argument and saw suspect leaving the scene.",
    },
    {
      id: "W-1202",
      name: "Thomas Grant",
      type: "Character Witness",
      contactInfo: "555-987-6543",
      interviewDate: "Apr 19, 2023",
      status: "Interviewed",
      reliability: "Medium",
      notes: "Victim's coworker who provided information about recent conflicts.",
    },
    {
      id: "W-1203",
      name: "Maria Sanchez",
      type: "Eyewitness",
      contactInfo: "555-456-7890",
      interviewDate: "Pending",
      status: "Scheduled",
      reliability: "Unknown",
      notes: "Passerby who may have seen suspect in the area before the incident.",
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Witnesses & Interviews ({witnesses.length})</h3>
        <button className="text-sm text-primary">Add Witness</button>
      </div>

      <div className="space-y-3">
        {witnesses.map((witness) => (
          <div
            key={witness.id}
            className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0">
              <User className="h-5 w-5" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="font-medium">{witness.name}</h4>
                <Badge variant="outline">{witness.type}</Badge>
                <Badge
                  variant="outline"
                  className={
                    witness.status === "Interviewed" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                  }
                >
                  {witness.status}
                </Badge>
              </div>

              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-muted-foreground">
                <span>ID: {witness.id}</span>
                <span>Contact: {witness.contactInfo}</span>
                <span>Reliability: {witness.reliability}</span>
                {witness.interviewDate !== "Pending" && <span>Interviewed: {witness.interviewDate}</span>}
              </div>

              <p className="text-sm mt-2">{witness.notes}</p>
            </div>

            <button className="text-sm text-primary shrink-0">
              {witness.status === "Interviewed" ? "View Statement" : "Schedule Interview"}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
