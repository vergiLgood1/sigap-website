import { Download, FileText, FilePlus, FileImage, FileSpreadsheet } from "lucide-react"
import { Badge } from "@/app/_components/ui/badge"

export default function CaseDocuments() {
  const documents = [
    {
      id: "DOC-3421",
      name: "Initial Police Report",
      type: "PDF",
      size: "1.2 MB",
      uploadedBy: "James Rodriguez",
      uploadDate: "Apr 15, 2023",
      icon: FileText,
    },
    {
      id: "DOC-3422",
      name: "Autopsy Report",
      type: "PDF",
      size: "3.5 MB",
      uploadedBy: "Dr. Lisa Wong",
      uploadDate: "Apr 17, 2023",
      icon: FileText,
    },
    {
      id: "DOC-3423",
      name: "Crime Scene Photos",
      type: "ZIP",
      size: "24.7 MB",
      uploadedBy: "Robert Wilson",
      uploadDate: "Apr 15, 2023",
      icon: FileImage,
    },
    {
      id: "DOC-3424",
      name: "Witness Statement - Emily Parker",
      type: "DOCX",
      size: "285 KB",
      uploadedBy: "Michael Chen",
      uploadDate: "Apr 20, 2023",
      icon: FilePlus,
    },
    {
      id: "DOC-3425",
      name: "Evidence Log",
      type: "XLSX",
      size: "420 KB",
      uploadedBy: "Sarah Johnson",
      uploadDate: "Apr 22, 2023",
      icon: FileSpreadsheet,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Case Documents ({documents.length})</h3>
        <button className="text-sm text-primary">Upload Document</button>
      </div>

      <div className="space-y-2">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
          >
            <div className="w-10 h-10 rounded bg-muted flex items-center justify-center shrink-0">
              <doc.icon className="h-5 w-5" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="font-medium truncate">{doc.name}</h4>
                <Badge variant="outline">{doc.type}</Badge>
              </div>

              <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
                <span>{doc.size}</span>
                <span>Uploaded: {doc.uploadDate}</span>
                <span>By: {doc.uploadedBy}</span>
              </div>
            </div>

            <button className="flex items-center text-sm text-primary shrink-0">
              <Download className="h-4 w-4 mr-1" />
              Download
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
