import { Progress } from "@/app/_components/ui/progress"

export default function DepartmentPerformance() {
  const metrics = [
    { name: "Case Clearance Rate", value: 68, display: "68%" },
    { name: "Response Time", value: 85, display: "4.2 min avg" },
    { name: "Evidence Processing", value: 72, display: "72%" },
  ]

  return (
    <div className="space-y-4 mt-4">
      {metrics.map((metric) => (
        <div key={metric.name}>
          <div className="flex justify-between mb-1 text-sm">
            <span>{metric.name}</span>
            <span>{metric.display}</span>
          </div>
          <Progress value={metric.value} className="h-2" />
        </div>
      ))}
    </div>
  )
}
