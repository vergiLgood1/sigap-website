import { Phone, Building, Heart, Shield } from "lucide-react"

export default function ResourceDirectory() {
  const resources = [
    {
      name: "Police Non-Emergency",
      category: "Law Enforcement",
      contact: "555-123-4567",
      icon: Shield,
    },
    {
      name: "Victim Services",
      category: "Support",
      contact: "555-234-5678",
      icon: Heart,
    },
    {
      name: "City Hall",
      category: "Government",
      contact: "555-345-6789",
      icon: Building,
    },
    {
      name: "Mental Health Hotline",
      category: "Support",
      contact: "555-456-7890",
      icon: Heart,
    },
  ]

  return (
    <div className="mt-4 space-y-3">
      {resources.map((resource, index) => (
        <div key={index} className="border rounded-lg p-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
              <resource.icon className="h-4 w-4" />
            </div>
            <div>
              <h4 className="font-medium text-sm">{resource.name}</h4>
              <div className="text-xs text-muted-foreground">{resource.category}</div>
            </div>
          </div>

          <div className="mt-2 flex justify-between items-center">
            <div className="flex items-center text-xs">
              <Phone className="h-3 w-3 mr-1" />
              {resource.contact}
            </div>
            <button className="text-xs text-primary">Call</button>
          </div>
        </div>
      ))}

      <button className="w-full text-sm text-primary mt-2 py-1">View Full Directory</button>
    </div>
  )
}
