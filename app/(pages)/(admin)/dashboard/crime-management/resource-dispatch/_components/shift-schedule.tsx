import { Badge } from "@/app/_components/ui/badge"
import { Calendar, Clock } from "lucide-react"

export default function ShiftSchedule() {
  const currentShift = {
    name: "Day Shift",
    hours: "7:00 AM - 3:00 PM",
    supervisor: "Sgt. Parker",
    officers: 18,
    status: "Active",
  }

  const upcomingShift = {
    name: "Evening Shift",
    hours: "3:00 PM - 11:00 PM",
    supervisor: "Sgt. Rodriguez",
    officers: 16,
    status: "Upcoming",
  }

  return (
    <div className="mt-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Calendar className="h-4 w-4 mr-2" />
          <span className="font-medium text-sm">Current Schedule</span>
        </div>
        <div className="text-xs text-muted-foreground">April 24, 2023</div>
      </div>

      <div className="border rounded-lg p-3">
        <div className="flex justify-between items-center">
          <h4 className="font-medium">{currentShift.name}</h4>
          <Badge variant="outline" className="bg-green-100 text-green-800">
            {currentShift.status}
          </Badge>
        </div>

        <div className="mt-2 space-y-1 text-sm">
          <div className="flex items-center">
            <Clock className="h-3 w-3 mr-1 text-muted-foreground" />
            <span>{currentShift.hours}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Supervisor:</span>
            <span>{currentShift.supervisor}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Officers on duty:</span>
            <span>{currentShift.officers}</span>
          </div>
        </div>
      </div>

      <div className="border rounded-lg p-3">
        <div className="flex justify-between items-center">
          <h4 className="font-medium">{upcomingShift.name}</h4>
          <Badge variant="outline" className="bg-blue-100 text-blue-800">
            {upcomingShift.status}
          </Badge>
        </div>

        <div className="mt-2 space-y-1 text-sm">
          <div className="flex items-center">
            <Clock className="h-3 w-3 mr-1 text-muted-foreground" />
            <span>{upcomingShift.hours}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Supervisor:</span>
            <span>{upcomingShift.supervisor}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Officers scheduled:</span>
            <span>{upcomingShift.officers}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
