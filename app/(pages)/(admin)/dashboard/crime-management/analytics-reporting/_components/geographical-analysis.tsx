import { Badge } from "@/app/_components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/_components/ui/select"

export default function GeographicalAnalysis() {
  return (
    <div className="mt-4 h-full">
      <div className="flex justify-between items-center mb-4">
        <Select defaultValue="all">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Crime Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Crimes</SelectItem>
            <SelectItem value="violent">Violent Crimes</SelectItem>
            <SelectItem value="property">Property Crimes</SelectItem>
            <SelectItem value="cyber">Cybercrimes</SelectItem>
          </SelectContent>
        </Select>

        <Select defaultValue="heat">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Map Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="heat">Heat Map</SelectItem>
            <SelectItem value="pin">Pin Map</SelectItem>
            <SelectItem value="district">District Map</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="h-[400px] rounded-md bg-slate-100 border flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-50 bg-[url('/placeholder.svg?height=400&width=600')] bg-center bg-cover"></div>

        <div className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm p-2 rounded-md text-xs font-medium">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-500"></span> High Density
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-yellow-500"></span> Medium Density
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500"></span> Low Density
          </div>
        </div>

        <div className="z-10 bg-background/80 backdrop-blur-sm p-3 rounded-lg">
          <span className="font-medium">Crime Hotspot Map</span>
          <div className="text-xs text-muted-foreground mt-1">Showing data for April 2023</div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="border rounded-lg p-3">
          <h4 className="text-sm font-medium">Highest Crime Areas</h4>
          <div className="mt-2 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs">Downtown District</span>
              <Badge variant="outline" className="bg-red-100 text-red-800">
                High
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs">West Side Commercial</span>
              <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                Medium
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs">North Transit Hub</span>
              <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                Medium
              </Badge>
            </div>
          </div>
        </div>

        <div className="border rounded-lg p-3">
          <h4 className="text-sm font-medium">Crime Reduction</h4>
          <div className="mt-2 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs">East Residential</span>
              <span className="text-xs text-green-600">-15% MoM</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs">South Park Area</span>
              <span className="text-xs text-green-600">-8% MoM</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs">Central Business</span>
              <span className="text-xs text-red-600">+5% MoM</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
