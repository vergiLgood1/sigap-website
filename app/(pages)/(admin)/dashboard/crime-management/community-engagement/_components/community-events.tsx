import { Badge } from "@/app/_components/ui/badge"
import { Calendar, MapPin } from "lucide-react"

export default function CommunityEvents() {
  const events = [
    {
      title: "Community Safety Workshop",
      date: "Apr 28, 2023",
      time: "6:00 PM - 8:00 PM",
      location: "Community Center",
      type: "Workshop",
    },
    {
      title: "Coffee with a Cop",
      date: "May 5, 2023",
      time: "9:00 AM - 11:00 AM",
      location: "Downtown Café",
      type: "Meet & Greet",
    },
    {
      title: "Neighborhood Watch Meeting",
      date: "May 12, 2023",
      time: "7:00 PM - 8:30 PM",
      location: "Public Library",
      type: "Meeting",
    },
  ]

  return (
    <div className="mt-4 space-y-3">
      {events.map((event, index) => (
        <div key={index} className="border rounded-lg p-3">
          <div className="flex justify-between items-start">
            <h4 className="font-medium text-sm">{event.title}</h4>
            <Badge variant="outline" className="bg-blue-100 text-blue-800">
              {event.type}
            </Badge>
          </div>

          <div className="mt-2 space-y-1 text-xs text-muted-foreground">
            <div className="flex items-center">
              <Calendar className="h-3 w-3 mr-1" />
              {event.date}, {event.time}
            </div>
            <div className="flex items-center">
              <MapPin className="h-3 w-3 mr-1" />
              {event.location}
            </div>
          </div>

          <div className="mt-2 flex justify-between items-center">
            <div className="flex -space-x-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-5 h-5 rounded-full border border-background bg-muted"></div>
              ))}
              <div className="w-5 h-5 rounded-full border border-background bg-muted flex items-center justify-center text-[10px]">
                +8
              </div>
            </div>
            <button className="text-xs text-primary">RSVP</button>
          </div>
        </div>
      ))}

      <button className="w-full text-sm text-primary mt-2 py-1">View All Events</button>
    </div>
  )
}
