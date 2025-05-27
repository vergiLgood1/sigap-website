import { FileText, ImageIcon, Package } from "lucide-react"
import { Badge } from "@/app/_components/ui/badge"

export default function CaseEvidence() {
  const evidenceItems = [
    {
      id: "EV-4523",
      type: "Weapon",
      description: "Kitchen knife, 8-inch blade with wooden handle",
      dateCollected: "Apr 18, 2023",
      status: "Processing",
      location: "Evidence Locker B-12",
      icon: Package,
    },
    {
      id: "EV-4524",
      type: "Photograph",
      description: "Crime scene photos - living room area",
      dateCollected: "Apr 15, 2023",
      status: "Analyzed",
      location: "Digital Storage",
      icon: ImageIcon,
    },
    {
      id: "EV-4525",
      type: "Document",
      description: "Victim's personal diary",
      dateCollected: "Apr 15, 2023",
      status: "Analyzed",
      location: "Evidence Locker A-7",
      icon: FileText,
    },
    {
      id: "EV-4526",
      type: "DNA Sample",
      description: "Blood sample from kitchen floor",
      dateCollected: "Apr 15, 2023",
      status: "Lab Analysis",
      location: "Forensic Lab",
      icon: Package,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Evidence Items ({evidenceItems.length})</h3>
        <button className="text-sm text-primary">Add Evidence</button>
      </div>

      <div className="space-y-3">
        {evidenceItems.map((item) => (
          <div
            key={item.id}
            className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0">
              <item.icon className="h-5 w-5" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="font-medium">{item.id}</h4>
                <Badge variant="outline">{item.type}</Badge>
                <Badge
                  variant="outline"
                  className={
                    item.status === "Analyzed"
                      ? "bg-green-100 text-green-800"
                      : item.status === "Processing"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-blue-100 text-blue-800"
                  }
                >
                  {item.status}
                </Badge>
              </div>

              <p className="text-sm mt-1">{item.description}</p>

              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground">
                <span>Collected: {item.dateCollected}</span>
                <span>Location: {item.location}</span>
              </div>
            </div>

            <button className="text-sm text-primary shrink-0">View Details</button>
          </div>
        ))}
      </div>
    </div>
  )
}
