import { Badge } from "@/app/_components/ui/badge"
import { Download, FileText, ImageIcon, Video } from "lucide-react"

export default function DigitalEvidence() {
  const digitalItems = [
    {
      id: "EV-4524",
      type: "Images",
      description: "Crime scene photos (24 files)",
      case: "CR-7823",
      size: "156 MB",
      format: "JPG",
      icon: ImageIcon,
    },
    {
      id: "EV-4530",
      type: "Video",
      description: "Security camera footage",
      case: "CR-7825",
      size: "1.2 GB",
      format: "MP4",
      icon: Video,
    },
    {
      id: "EV-4532",
      type: "Document",
      description: "Forensic report",
      case: "CR-7823",
      size: "2.4 MB",
      format: "PDF",
      icon: FileText,
    },
  ]

  return (
    <div className="mt-4 space-y-3">
      {digitalItems.map((item) => (
        <div key={item.id} className="flex items-center gap-3 p-2 border rounded-lg">
          <div className="w-8 h-8 rounded bg-muted flex items-center justify-center shrink-0">
            <item.icon className="h-4 w-4" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-medium text-sm">{item.id}</h4>
              <Badge variant="outline">{item.format}</Badge>
            </div>

            <p className="text-xs truncate">{item.description}</p>

            <div className="flex gap-2 text-xs text-muted-foreground mt-1">
              <span>Case: {item.case}</span>
              <span>{item.size}</span>
            </div>
          </div>

          <button className="text-primary p-1 rounded-full hover:bg-muted">
            <Download className="h-4 w-4" />
          </button>
        </div>
      ))}

      <button className="w-full text-sm text-primary mt-2 py-1">Upload Digital Evidence</button>
    </div>
  )
}
