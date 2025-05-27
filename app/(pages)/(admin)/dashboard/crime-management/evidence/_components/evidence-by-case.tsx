import { Badge } from "@/app/_components/ui/badge"
import { FileText } from "lucide-react"

export default function EvidenceByCase() {
  const cases = [
    {
      id: "CR-7823",
      title: "Homicide Investigation",
      evidenceCount: 12,
      recentItems: [
        { id: "EV-4523", type: "Weapon" },
        { id: "EV-4524", type: "Photograph" },
        { id: "EV-4525", type: "Document" },
      ],
    },
    {
      id: "CR-7825",
      title: "Armed Robbery",
      evidenceCount: 8,
      recentItems: [
        { id: "EV-4527", type: "Fingerprint" },
        { id: "EV-4528", type: "Clothing" },
      ],
    },
    {
      id: "CR-7830",
      title: "Kidnapping",
      evidenceCount: 15,
      recentItems: [
        { id: "EV-4535", type: "Vehicle" },
        { id: "EV-4536", type: "DNA Sample" },
      ],
    },
  ]

  return (
    <div className="mt-4 space-y-3">
      {cases.map((case_) => (
        <div key={case_.id} className="border rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded bg-muted flex items-center justify-center shrink-0">
              <FileText className="h-4 w-4" />
            </div>

            <div>
              <h4 className="font-medium text-sm">Case #{case_.id}</h4>
              <div className="text-xs text-muted-foreground truncate">{case_.title}</div>
            </div>

            <Badge variant="outline" className="ml-auto">
              {case_.evidenceCount} items
            </Badge>
          </div>

          <div className="flex flex-wrap gap-2 mt-3">
            {case_.recentItems.map((item) => (
              <div key={item.id} className="text-xs px-2 py-1 bg-muted rounded-md">
                {item.id} ({item.type})
              </div>
            ))}

            {case_.evidenceCount > case_.recentItems.length && (
              <div className="text-xs px-2 py-1 bg-muted rounded-md">
                +{case_.evidenceCount - case_.recentItems.length} more
              </div>
            )}
          </div>
        </div>
      ))}

      <button className="w-full text-sm text-primary mt-2 py-1">View All Cases</button>
    </div>
  )
}
