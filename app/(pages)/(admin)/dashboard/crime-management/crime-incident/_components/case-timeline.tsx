import { Circle } from "lucide-react"

export default function CaseTimeline() {
  const timelineEvents = [
    {
      date: "Apr 22, 2023",
      time: "14:30",
      title: "Forensic Report Received",
      description: "DNA analysis results from the lab confirm suspect's presence at the crime scene.",
      user: "Sarah Johnson",
      role: "Forensic Specialist",
    },
    {
      date: "Apr 20, 2023",
      time: "09:15",
      title: "Witness Interview Conducted",
      description: "Key witness provided detailed description of events and potential suspect.",
      user: "Michael Chen",
      role: "Detective",
    },
    {
      date: "Apr 18, 2023",
      time: "16:45",
      title: "Evidence Collected",
      description: "Weapon recovered from dumpster 2 blocks from crime scene. Sent for fingerprint analysis.",
      user: "Robert Wilson",
      role: "Evidence Technician",
    },
    {
      date: "Apr 15, 2023",
      time: "23:10",
      title: "Case Opened",
      description: "Officers responded to 911 call. Victim found deceased at the scene.",
      user: "James Rodriguez",
      role: "Patrol Officer",
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Case Timeline</h3>
        <button className="text-sm text-primary">Add Event</button>
      </div>

      <div className="relative">
        {timelineEvents.map((event, index) => (
          <div key={index} className="mb-8 relative pl-6">
            {/* Timeline connector */}
            {index < timelineEvents.length - 1 && (
              <div className="absolute left-[0.4375rem] top-3 bottom-0 w-0.5 bg-muted" />
            )}

            {/* Timeline dot */}
            <div className="absolute left-0 top-1">
              <Circle className="h-3.5 w-3.5 fill-primary text-primary" />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-start gap-2">
              <div className="min-w-[140px] text-sm text-muted-foreground">
                <div>{event.date}</div>
                <div>{event.time}</div>
              </div>

              <div className="bg-muted/50 rounded-lg p-3 flex-1">
                <h4 className="font-medium">{event.title}</h4>
                <p className="text-sm mt-1">{event.description}</p>
                <div className="text-xs text-muted-foreground mt-2">
                  Added by {event.user} ({event.role})
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
