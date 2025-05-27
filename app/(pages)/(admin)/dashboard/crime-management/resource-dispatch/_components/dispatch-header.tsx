import { Badge } from "@/app/_components/ui/badge"
import { Button } from "@/app/_components/ui/button"
import { AlertTriangle, Phone } from "lucide-react"

export default function DispatchHeader() {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Resource Dispatch Center</h2>
        <p className="text-muted-foreground">Emergency response coordination and unit management</p>
      </div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
            Active Units: 18/24
          </Badge>
          <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100 flex items-center">
            <AlertTriangle className="h-3 w-3 mr-1" />
            High Call Volume
          </Badge>
        </div>
        <Button className="flex items-center">
          <Phone className="h-4 w-4 mr-2" />
          New Dispatch
        </Button>
      </div>
    </div>
  )
}
