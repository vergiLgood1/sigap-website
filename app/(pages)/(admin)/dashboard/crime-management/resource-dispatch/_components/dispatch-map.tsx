import { Badge } from "@/app/_components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/_components/ui/select"

export default function DispatchMap() {
  return (
    <div className="mt-4 h-full">
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2">
          <Badge variant="outline" className="bg-blue-100 text-blue-800">
            Available Units
          </Badge>
          <Badge variant="outline" className="bg-green-100 text-green-800">
            On Scene
          </Badge>
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
            Responding
          </Badge>
          <Badge variant="outline" className="bg-red-100 text-red-800">
            Incidents
          </Badge>
        </div>

        <Select defaultValue="all">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter Units" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Units</SelectItem>
            <SelectItem value="patrol">Patrol Units</SelectItem>
            <SelectItem value="traffic">Traffic Units</SelectItem>
            <SelectItem value="k9">K-9 Units</SelectItem>
            <SelectItem value="medical">Medical Units</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="h-[400px] rounded-md bg-slate-100 border flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-50 bg-[url('/placeholder.svg?height=400&width=600')] bg-center bg-cover"></div>

        <div className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm p-2 rounded-md text-xs font-medium">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span> Available Units: 12
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-yellow-500"></span> Responding: 6
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500"></span> On Scene: 6
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-500"></span> Active Incidents: 4
          </div>
        </div>

        <div className="z-10 bg-background/80 backdrop-blur-sm p-3 rounded-lg">
          <span className="font-medium">Real-Time Dispatch Map</span>
          <div className="text-xs text-muted-foreground mt-1">Last updated: Just now</div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="border rounded-lg p-3">
          <h4 className="text-sm font-medium">Coverage Analysis</h4>
          <div className="mt-2 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs">Downtown District</span>
              <Badge variant="outline" className="bg-green-100 text-green-800">
                Good
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs">West Side</span>
              <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                Limited
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs">North Area</span>
              <Badge variant="outline" className="bg-red-100 text-red-800">
                Understaffed
              </Badge>
            </div>
          </div>
        </div>

        <div className="border rounded-lg p-3">
          <h4 className="text-sm font-medium">Response Zones</h4>
          <div className="mt-2 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs">Zone 1 (Downtown)</span>
              <span className="text-xs">4 units</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs">Zone 2 (West)</span>
              <span className="text-xs">2 units</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs">Zone 3 (North)</span>
              <span className="text-xs">1 unit</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs">Zone 4 (East)</span>
              <span className="text-xs">3 units</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
