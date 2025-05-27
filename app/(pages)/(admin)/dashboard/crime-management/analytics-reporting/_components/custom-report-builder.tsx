import { Button } from "@/app/_components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/_components/ui/select"
import { Checkbox } from "@/app/_components/ui/checkbox"
import { Download, FileText } from "lucide-react"

export default function CustomReportBuilder() {
  const reportTypes = [
    { id: "crime-stats", label: "Crime Statistics" },
    { id: "officer-perf", label: "Officer Performance" },
    { id: "response-time", label: "Response Times" },
    { id: "case-resolution", label: "Case Resolution" },
    { id: "geographic", label: "Geographic Analysis" },
  ]

  const savedReports = [
    { name: "Monthly Crime Summary", date: "Apr 30, 2023", type: "PDF" },
    { name: "Q1 Performance Review", date: "Mar 31, 2023", type: "XLSX" },
  ]

  return (
    <div className="mt-4 space-y-4">
      <div className="space-y-3">
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Report Type</label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select report type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="comprehensive">Comprehensive Report</SelectItem>
              <SelectItem value="summary">Summary Report</SelectItem>
              <SelectItem value="comparative">Comparative Analysis</SelectItem>
              <SelectItem value="trend">Trend Analysis</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Time Period</label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select time period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current-month">Current Month</SelectItem>
              <SelectItem value="previous-month">Previous Month</SelectItem>
              <SelectItem value="quarter">Last Quarter</SelectItem>
              <SelectItem value="year">Year to Date</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Include Sections</label>
          <div className="grid grid-cols-2 gap-2 mt-1">
            {reportTypes.map((type) => (
              <div key={type.id} className="flex items-center space-x-2">
                <Checkbox id={type.id} />
                <label htmlFor={type.id} className="text-xs">
                  {type.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        <Button className="w-full mt-2">
          <FileText className="h-4 w-4 mr-2" />
          Generate Report
        </Button>
      </div>

      <div className="border-t pt-3">
        <h4 className="text-sm font-medium mb-2">Saved Reports</h4>
        <div className="space-y-2">
          {savedReports.map((report, index) => (
            <div key={index} className="flex items-center justify-between p-2 border rounded-lg">
              <div>
                <div className="text-sm font-medium">{report.name}</div>
                <div className="text-xs text-muted-foreground">{report.date}</div>
              </div>
              <Button variant="ghost" size="sm">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
