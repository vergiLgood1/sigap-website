import { Badge } from "@/app/_components/ui/badge"
import { FileText, ImageIcon, Package, Search } from "lucide-react"

export default function EvidenceCatalog() {
  const evidenceItems = [
    {
      id: "EV-4523",
      type: "Weapon",
      description: "Kitchen knife, 8-inch blade with wooden handle",
      case: "CR-7823",
      dateCollected: "Apr 18, 2023",
      status: "Processing",
      location: "Evidence Locker B-12",
      icon: Package,
    },
    {
      id: "EV-4524",
      type: "Photograph",
      description: "Crime scene photos - living room area",
      case: "CR-7823",
      dateCollected: "Apr 15, 2023",
      status: "Analyzed",
      location: "Digital Storage",
      icon: ImageIcon,
    },
    {
      id: "EV-4525",
      type: "Document",
      description: "Victim's personal diary",
      case: "CR-7823",
      dateCollected: "Apr 15, 2023",
      status: "Analyzed",
      location: "Evidence Locker A-7",
      icon: FileText,
    },
    {
      id: "EV-4526",
      type: "DNA Sample",
      description: "Blood sample from kitchen floor",
      case: "CR-7823",
      dateCollected: "Apr 15, 2023",
      status: "Lab Analysis",
      location: "Forensic Lab",
      icon: Package,
    },
    {
      id: "EV-4527",
      type: "Fingerprint",
      description: "Prints lifted from doorknob",
      case: "CR-7825",
      dateCollected: "Apr 20, 2023",
      status: "Processing",
      location: "Forensic Lab",
      icon: FileText,
    },
    {
      id: "EV-4528",
      type: "Clothing",
      description: "Victim's jacket with possible blood stains",
      case: "CR-7825",
      dateCollected: "Apr 20, 2023",
      status: "Lab Analysis",
      location: "Evidence Locker C-5",
      icon: Package,
    },
  ]

  return (
    <div className="mt-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2">
          <button className="text-sm font-medium">All</button>
          <button className="text-sm text-muted-foreground">Physical</button>
          <button className="text-sm text-muted-foreground">Digital</button>
        </div>
        <div className="relative">
          <input
            type="search"
            placeholder="Search evidence..."
            className="w-full rounded-md border border-input bg-background px-9 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        </div>
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
                <span>Case: {item.case}</span>
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
