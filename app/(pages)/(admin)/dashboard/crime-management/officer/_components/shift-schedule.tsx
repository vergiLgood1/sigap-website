import { Calendar, Clock } from "lucide-react"

export default function ShiftSchedule() {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  const shifts = [
    { time: "Day (7AM-3PM)", color: "bg-blue-100" },
    { time: "Evening (3PM-11PM)", color: "bg-purple-100" },
    { time: "Night (11PM-7AM)", color: "bg-indigo-100" },
  ]

  // Sample schedule data
  const schedule = {
    "OFF-1234": [0, 0, 0, 0, 0, null, null], // Day shift Mon-Fri
    "OFF-2345": [0, 0, 0, 0, 0, null, null], // Day shift Mon-Fri
    "OFF-3456": [0, 0, 0, 0, 0, null, null], // Day shift Mon-Fri
    "OFF-4567": [null, null, 2, 2, 2, 2, 2], // Night shift Wed-Sun
    "OFF-5678": [0, 0, 0, 0, 0, null, null], // Day shift Mon-Fri
    "OFF-6789": [1, 1, 1, 1, 1, null, null], // Evening shift Mon-Fri
  }

  const officers = [
    { id: "OFF-1234", name: "Michael Chen" },
    { id: "OFF-2345", name: "Sarah Johnson" },
    { id: "OFF-3456", name: "Robert Wilson" },
    { id: "OFF-4567", name: "James Rodriguez" },
    { id: "OFF-5678", name: "Emily Parker" },
    { id: "OFF-6789", name: "David Thompson" },
  ]

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Calendar className="h-4 w-4 mr-2" />
          <span className="font-medium">Week of April 24-30, 2023</span>
        </div>
        <div className="flex gap-1">
          <button className="p-1 rounded hover:bg-muted">
            <Clock className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <div className="grid grid-cols-8 border-b bg-muted/50">
          <div className="p-2 font-medium text-sm border-r">Officer</div>
          {days.map((day, i) => (
            <div key={day} className="p-2 font-medium text-sm text-center">
              {day}
            </div>
          ))}
        </div>

        {officers.map((officer) => (
          <div key={officer.id} className="grid grid-cols-8 border-b last:border-b-0">
            <div className="p-2 text-sm border-r truncate">{officer.name}</div>
            {days.map((day, dayIndex) => {
              const shiftIndex = schedule[officer.id]?.[dayIndex]
              const shift = shifts[shiftIndex]

              return (
                <div key={`${officer.id}-${day}`} className="p-2 text-xs text-center">
                  {shift ? (
                    <div className={`${shift.color} rounded-md py-1 px-2`}>{shift.time.split(" ")[0]}</div>
                  ) : (
                    <div className="text-muted-foreground">Off</div>
                  )}
                </div>
              )
            })}
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {shifts.map((shift) => (
          <div key={shift.time} className="flex items-center text-xs">
            <div className={`w-3 h-3 rounded-full ${shift.color} mr-1`}></div>
            {shift.time}
          </div>
        ))}
      </div>
    </div>
  )
}
