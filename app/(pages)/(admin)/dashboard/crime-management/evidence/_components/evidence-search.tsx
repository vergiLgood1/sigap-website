import { Search } from "lucide-react"
import { Button } from "@/app/_components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/_components/ui/select"

export default function EvidenceSearch() {
  return (
    <div className="mt-4 space-y-4">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <input
          type="search"
          placeholder="Search by ID, description, or case..."
          className="w-full rounded-md border border-input bg-background px-9 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Evidence Type</label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="weapon">Weapon</SelectItem>
              <SelectItem value="dna">DNA Sample</SelectItem>
              <SelectItem value="document">Document</SelectItem>
              <SelectItem value="photo">Photograph</SelectItem>
              <SelectItem value="clothing">Clothing</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Status</label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Any Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any Status</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="analyzed">Analyzed</SelectItem>
              <SelectItem value="stored">Stored</SelectItem>
              <SelectItem value="disposal">Scheduled for Disposal</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button className="w-full">Search Evidence</Button>

      <div className="text-xs text-muted-foreground">Recent searches: EV-4523, CR-7823, "knife", "blood sample"</div>
    </div>
  )
}
