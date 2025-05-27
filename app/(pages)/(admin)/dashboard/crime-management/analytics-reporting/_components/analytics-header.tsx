import { Badge } from "@/app/_components/ui/badge"
import { Button } from "@/app/_components/ui/button"
import { Download, Calendar } from "lucide-react"

export default function AnalyticsHeader() {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Analytics & Reporting</h2>
        <p className="text-muted-foreground">Crime statistics, trends, and performance metrics</p>
      </div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100 flex items-center">
            <Calendar className="h-3 w-3 mr-1" />
            Apr 1 - Apr 30, 2023
          </Badge>
        </div>
        <Button className="flex items-center">
          <Download className="h-4 w-4 mr-2" />
          Export Reports
        </Button>
      </div>
    </div>
  )
}
