import { Badge } from "@/app/_components/ui/badge"
import { Button } from "@/app/_components/ui/button"

export default function DepartmentHeader() {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Officer Management</h2>
        <p className="text-muted-foreground">Personnel, scheduling, and department resources</p>
      </div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
            On Duty: 18
          </Badge>
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            Off Duty: 12
          </Badge>
        </div>
        <Button>Add Officer</Button>
      </div>
    </div>
  )
}
