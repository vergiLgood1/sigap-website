import { Button } from "@/app/_components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/_components/ui/select"
import { FileText, MapPin, Camera } from "lucide-react"

export default function ReportIncident() {
  return (
    <div className="mt-4 space-y-4">
      <div className="text-xs text-muted-foreground">
        Use this form to report non-emergency incidents. For emergencies, please call 911.
      </div>

      <div className="space-y-3">
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Incident Type</label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select incident type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="theft">Theft/Burglary</SelectItem>
              <SelectItem value="vandalism">Vandalism</SelectItem>
              <SelectItem value="suspicious">Suspicious Activity</SelectItem>
              <SelectItem value="noise">Noise Complaint</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Location</label>
          <div className="relative">
            <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Enter address or location"
              className="w-full rounded-md border border-input bg-background px-9 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
        </div>

        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Description</label>
          <textarea
            placeholder="Describe what happened..."
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px] ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          ></textarea>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" className="flex-1 flex items-center justify-center">
            <Camera className="h-4 w-4 mr-2" />
            Add Photo
          </Button>
          <Button className="flex-1 flex items-center justify-center">
            <FileText className="h-4 w-4 mr-2" />
            Submit Report
          </Button>
        </div>
      </div>
    </div>
  )
}
