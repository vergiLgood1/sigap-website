import { Badge } from "@/app/_components/ui/badge"
import { Users, MapPin, Phone } from "lucide-react"

export default function NeighborhoodWatch() {
  const groups = [
    {
      name: "Downtown Watch Group",
      coordinator: "Sarah Johnson",
      members: 24,
      area: "Downtown District",
      contact: "555-123-4567",
    },
    {
      name: "Westside Neighbors",
      coordinator: "Michael Chen",
      members: 18,
      area: "West Residential Area",
      contact: "555-234-5678",
    },
    {
      name: "Parkview Safety",
      coordinator: "Emily Parker",
      members: 15,
      area: "Park District",
      contact: "555-345-6789",
    },
  ]

  return (
    <div className="mt-4 space-y-3">
      {groups.map((group, index) => (
        <div key={index} className="border rounded-lg p-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
              <Users className="h-4 w-4" />
            </div>
            <div>
              <h4 className="font-medium text-sm">{group.name}</h4>
              <div className="text-xs text-muted-foreground">Coordinator: {group.coordinator}</div>
            </div>
            <Badge variant="outline" className="ml-auto">
              {group.members} members
            </Badge>
          </div>

          <div className="mt-2 space-y-1 text-xs text-muted-foreground pl-10">
            <div className="flex items-center">
              <MapPin className="h-3 w-3 mr-1" />
              {group.area}
            </div>
            <div className="flex items-center">
              <Phone className="h-3 w-3 mr-1" />
              {group.contact}
            </div>
          </div>
        </div>
      ))}

      <button className="w-full text-sm text-primary mt-2 py-1">Start or Join a Group</button>
    </div>
  )
}
