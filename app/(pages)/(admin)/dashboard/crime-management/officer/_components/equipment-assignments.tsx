import { Badge } from "@/app/_components/ui/badge"
import { Car, Radio, Shield } from "lucide-react"

export default function EquipmentAssignments() {
  const equipment = [
    {
      type: "Vehicle",
      id: "VEH-1234",
      assignedTo: "Emily Parker",
      status: "In Service",
      icon: Car,
    },
    {
      type: "Radio",
      id: "RAD-5678",
      assignedTo: "Michael Chen",
      status: "In Service",
      icon: Radio,
    },
    {
      type: "Body Camera",
      id: "CAM-9012",
      assignedTo: "Robert Wilson",
      status: "Maintenance",
      icon: Shield,
    },
    {
      type: "Vehicle",
      id: "VEH-3456",
      assignedTo: "David Thompson",
      status: "In Service",
      icon: Car,
    },
  ]

  return (
    <div className="mt-4 space-y-2">
      {equipment.map((item, index) => (
        <div key={index} className="flex items-center gap-3 p-2 border rounded-lg">
          <div className="w-8 h-8 rounded bg-muted flex items-center justify-center shrink-0">
            <item.icon className="h-4 w-4" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-medium text-sm">{item.type}</h4>
              <span className="text-xs text-muted-foreground">#{item.id}</span>
            </div>

            <div className="text-xs text-muted-foreground">Assigned to: {item.assignedTo}</div>
          </div>

          <Badge
            variant="outline"
            className={item.status === "In Service" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}
          >
            {item.status}
          </Badge>
        </div>
      ))}

      <button className="w-full text-sm text-primary mt-2 py-1">Manage Equipment</button>
    </div>
  )
}
