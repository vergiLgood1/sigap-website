import { Badge } from "@/app/_components/ui/badge"
import { Button } from "@/app/_components/ui/button"

export default function EvidenceHeader() {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Evidence Management</h2>
        <p className="text-muted-foreground">Track, analyze, and manage physical and digital evidence</p>
      </div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            Items: 1,245
          </Badge>
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            Processing: 32
          </Badge>
        </div>
        <Button>Log New Evidence</Button>
      </div>
    </div>
  )
}
