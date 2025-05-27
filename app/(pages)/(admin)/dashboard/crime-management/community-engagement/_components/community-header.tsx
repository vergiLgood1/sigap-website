import { Button } from "@/app/_components/ui/button"
import { Search, Phone } from "lucide-react"

export default function CommunityHeader() {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Community Engagement Portal</h2>
        <p className="text-muted-foreground">Stay informed, connected, and engaged with your local law enforcement</p>
      </div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search resources..."
            className="w-full rounded-md border border-input bg-background px-9 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <Button className="flex items-center">
          <Phone className="h-4 w-4 mr-2" />
          Emergency: 911
        </Button>
      </div>
    </div>
  )
}
