import { Badge } from "@/app/_components/ui/badge"
import { Button } from "@/app/_components/ui/button"
import { AlertTriangle, MapPin, Clock, Bell } from "lucide-react"

export default function CrimeAlerts() {
  const alerts = [
    {
      id: "ALT-1234",
      type: "Theft",
      description:
        "Multiple vehicle break-ins reported in the Downtown area. Please secure valuables and lock vehicles.",
      location: "Downtown District",
      date: "Apr 23, 2023",
      time: "Posted 2 hours ago",
      severity: "Medium",
    },
    {
      id: "ALT-1235",
      type: "Suspicious Activity",
      description:
        "Residents report unknown individuals going door-to-door claiming to represent utility companies. Always ask for proper identification.",
      location: "North Residential Area",
      date: "Apr 22, 2023",
      time: "Posted 1 day ago",
      severity: "Low",
    },
    {
      id: "ALT-1236",
      type: "Scam Alert",
      description:
        "Phone scammers impersonating police officers requesting payment for 'outstanding warrants'. Police will never request payment over the phone.",
      location: "Citywide",
      date: "Apr 21, 2023",
      time: "Posted 2 days ago",
      severity: "High",
    },
  ]

  return (
    <div className="mt-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            All Alerts
          </Button>
          <Button variant="outline" size="sm">
            My Neighborhood
          </Button>
        </div>
        <Button variant="outline" size="sm" className="flex items-center">
          <Bell className="h-4 w-4 mr-2" />
          Subscribe to Alerts
        </Button>
      </div>

      <div className="space-y-4">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className="flex items-start gap-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                alert.severity === "High" ? "bg-red-100" : alert.severity === "Medium" ? "bg-yellow-100" : "bg-blue-100"
              }`}
            >
              <AlertTriangle
                className={`h-5 w-5 ${
                  alert.severity === "High"
                    ? "text-red-600"
                    : alert.severity === "Medium"
                      ? "text-yellow-600"
                      : "text-blue-600"
                }`}
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="font-medium">{alert.type}</h4>
                <Badge
                  variant="outline"
                  className={
                    alert.severity === "High"
                      ? "bg-red-100 text-red-800"
                      : alert.severity === "Medium"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-blue-100 text-blue-800"
                  }
                >
                  {alert.severity} Priority
                </Badge>
              </div>

              <p className="text-sm mt-2">{alert.description}</p>

              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-xs text-muted-foreground">
                <div className="flex items-center">
                  <MapPin className="h-3 w-3 mr-1" />
                  {alert.location}
                </div>
                <div className="flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {alert.time}
                </div>
              </div>
            </div>

            <Button size="sm" variant="outline">
              Details
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
