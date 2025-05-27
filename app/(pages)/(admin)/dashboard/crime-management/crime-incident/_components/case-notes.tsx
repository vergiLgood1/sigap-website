import { User } from "lucide-react"
import { Button } from "@/app/_components/ui/button"
import { Textarea } from "@/app/_components/ui/textarea"

export default function CaseNotes() {
  const notes = [
    {
      id: "N-5621",
      content:
        "Forensic analysis suggests the murder weapon was wiped clean before being discarded. No fingerprints were recovered, but DNA traces were found on the handle.",
      author: "Sarah Johnson",
      role: "Forensic Specialist",
      timestamp: "Apr 22, 2023 • 15:10",
    },
    {
      id: "N-5620",
      content:
        "Witness Emily Parker's statement corroborates the timeline established by the medical examiner. Victim was likely killed between 9:00 PM and 11:00 PM on April 14.",
      author: "Michael Chen",
      role: "Detective",
      timestamp: "Apr 20, 2023 • 14:35",
    },
    {
      id: "N-5619",
      content:
        "Background check on suspect John Doe shows prior assault charges that were dropped in 2021. Need to follow up with previous complainant.",
      author: "Michael Chen",
      role: "Detective",
      timestamp: "Apr 19, 2023 • 10:22",
    },
    {
      id: "N-5618",
      content:
        "Initial canvas of the neighborhood complete. Three potential witnesses identified and scheduled for interviews.",
      author: "James Rodriguez",
      role: "Patrol Officer",
      timestamp: "Apr 16, 2023 • 08:45",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Case Notes</h3>

        <div className="mb-6">
          <Textarea placeholder="Add a note about this case..." className="min-h-[100px] mb-2" />
          <div className="flex justify-end">
            <Button>Add Note</Button>
          </div>
        </div>

        <div className="space-y-4">
          {notes.map((note) => (
            <div key={note.id} className="p-3 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center shrink-0">
                  <User className="h-3 w-3" />
                </div>
                <span className="font-medium">{note.author}</span>
                <span className="text-xs text-muted-foreground">({note.role})</span>
                <span className="text-xs text-muted-foreground ml-auto">{note.timestamp}</span>
              </div>

              <p className="text-sm">{note.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
