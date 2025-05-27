import { Button } from "@/app/_components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/_components/ui/select"
import { MessageSquare } from "lucide-react"

export default function CommunityFeedback() {
  return (
    <div className="mt-4 space-y-4">
      <div className="text-xs text-muted-foreground">
        We value your input! Share your thoughts, concerns, or suggestions to help us better serve the community.
      </div>

      <div className="space-y-3">
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Feedback Type</label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select feedback type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="suggestion">Suggestion</SelectItem>
              <SelectItem value="concern">Concern</SelectItem>
              <SelectItem value="compliment">Compliment</SelectItem>
              <SelectItem value="question">Question</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Your Message</label>
          <textarea
            placeholder="Share your feedback..."
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px] ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          ></textarea>
        </div>

        <div className="flex items-center gap-2">
          <input type="checkbox" id="contact-me" className="rounded border-input" />
          <label htmlFor="contact-me" className="text-xs">
            I would like to be contacted about my feedback
          </label>
        </div>

        <Button className="w-full flex items-center justify-center">
          <MessageSquare className="h-4 w-4 mr-2" />
          Submit Feedback
        </Button>
      </div>
    </div>
  )
}
