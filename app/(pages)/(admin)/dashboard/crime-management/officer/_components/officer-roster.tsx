import { User, Shield, Phone } from "lucide-react"
import { Badge } from "@/app/_components/ui/badge"
import { Button } from "@/app/_components/ui/button"

export default function OfficerRoster() {
  const officers = [
    {
      id: "OFF-1234",
      name: "Michael Chen",
      badge: "ID-5678",
      rank: "Detective",
      unit: "Homicide",
      status: "On Duty",
      contact: "555-123-4567",
      shift: "Day",
    },
    {
      id: "OFF-2345",
      name: "Sarah Johnson",
      badge: "ID-6789",
      rank: "Specialist",
      unit: "Forensics",
      status: "On Duty",
      contact: "555-234-5678",
      shift: "Day",
    },
    {
      id: "OFF-3456",
      name: "Robert Wilson",
      badge: "ID-7890",
      rank: "Technician",
      unit: "Evidence",
      status: "On Duty",
      contact: "555-345-6789",
      shift: "Day",
    },
    {
      id: "OFF-4567",
      name: "James Rodriguez",
      badge: "ID-8901",
      rank: "Officer",
      unit: "Patrol",
      status: "Off Duty",
      contact: "555-456-7890",
      shift: "Night",
    },
    {
      id: "OFF-5678",
      name: "Emily Parker",
      badge: "ID-9012",
      rank: "Sergeant",
      unit: "Patrol",
      status: "On Duty",
      contact: "555-567-8901",
      shift: "Day",
    },
    {
      id: "OFF-6789",
      name: "David Thompson",
      badge: "ID-0123",
      rank: "Officer",
      unit: "Traffic",
      status: "On Duty",
      contact: "555-678-9012",
      shift: "Day",
    },
  ]

  return (
    <div className="mt-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            All
          </Button>
          <Button variant="outline" size="sm">
            On Duty
          </Button>
          <Button variant="outline" size="sm">
            Off Duty
          </Button>
        </div>
        <div className="relative">
          <input
            type="search"
            placeholder="Search officers..."
            className="w-full rounded-md border border-input bg-background px-9 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <User className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {officers.map((officer) => (
          <div
            key={officer.id}
            className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0">
              <User className="h-5 w-5" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="font-medium">{officer.name}</h4>
                <Badge
                  variant="outline"
                  className={
                    officer.status === "On Duty" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                  }
                >
                  {officer.status}
                </Badge>
              </div>

              <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-xs text-muted-foreground">
                <div className="flex items-center">
                  <Shield className="h-3 w-3 mr-1" />
                  {officer.rank} • {officer.unit}
                </div>
                <div className="flex items-center">
                  <Phone className="h-3 w-3 mr-1" />
                  {officer.contact}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
