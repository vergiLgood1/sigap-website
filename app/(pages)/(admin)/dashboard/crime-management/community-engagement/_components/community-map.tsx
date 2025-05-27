import { Badge } from "@/app/_components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/_components/ui/select"

export default function CommunityMap() {
  return (
    <div className="mt-4 h-full">
      <div className="flex justify-between items-center mb-4">
        <Select defaultValue="all">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Map View" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Incidents</SelectItem>
            <SelectItem value="theft">Theft</SelectItem>
            <SelectItem value="vandalism">Vandalism</SelectItem>
            <SelectItem value="traffic">Traffic</SelectItem>
            <SelectItem value="resources">Community Resources</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex gap-2">
          <Badge variant="outline" className="bg-blue-100 text-blue-800">
            Last 7 Days
          </Badge>
        </div>
      </div>

      <div className="h-[350px] rounded-md bg-slate-100 border flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-50 bg-[url('/placeholder.svg?height=400&width=600')] bg-center bg-cover"></div>

        <div className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm p-2 rounded-md text-xs font-medium">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-500"></span> Theft
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-yellow-500"></span> Vandalism
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span> Traffic
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500"></span> Resources
          </div>
        </div>

        <div className="z-10 bg-background/80 backdrop-blur-sm p-3 rounded-lg">
          <span className="font-medium">Community Safety Map</span>
          <div className="text-xs text-muted-foreground mt-1">Showing incidents from Apr 17-24, 2023</div>
        </div>
      </div>

      <div className="mt-4 border rounded-lg p-3">
        <h4 className="text-sm font-medium mb-2">Your Neighborhood</h4>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs">Downtown District</span>
            <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
              Medium Risk
            </Badge>
          </div>
          <div className="text-xs text-muted-foreground">Recent incidents: 5 thefts, 2 vandalism reports</div>
          <div className="text-xs text-muted-foreground">
            Trend: <span className="text-red-600">+12% from last month</span>
          </div>
          <div className="mt-2">
            <button className="text-xs text-primary">View Safety Recommendations</button>
          </div>
        </div>
      </div>
    </div>
  )
}
