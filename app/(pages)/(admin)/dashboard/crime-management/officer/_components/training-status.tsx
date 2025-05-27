import { Badge } from "@/app/_components/ui/badge"
import { Progress } from "@/app/_components/ui/progress"

export default function TrainingStatus() {
  const trainings = [
    {
      name: "Firearms Qualification",
      dueDate: "May 15, 2023",
      status: "Completed",
      completion: 100,
    },
    {
      name: "De-escalation Techniques",
      dueDate: "June 10, 2023",
      status: "In Progress",
      completion: 60,
    },
    {
      name: "Emergency Response",
      dueDate: "July 22, 2023",
      status: "Not Started",
      completion: 0,
    },
    {
      name: "Evidence Handling",
      dueDate: "May 30, 2023",
      status: "In Progress",
      completion: 75,
    },
  ]

  return (
    <div className="mt-4 space-y-3">
      {trainings.map((training, index) => (
        <div key={index} className="border rounded-lg p-3">
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-medium text-sm">{training.name}</h4>
            <Badge
              variant="outline"
              className={
                training.status === "Completed"
                  ? "bg-green-100 text-green-800"
                  : training.status === "In Progress"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-red-100 text-red-800"
              }
            >
              {training.status}
            </Badge>
          </div>

          <Progress value={training.completion} className="h-2 mb-2" />

          <div className="text-xs text-muted-foreground">Due: {training.dueDate}</div>
        </div>
      ))}

      <button className="w-full text-sm text-primary mt-2 py-1">View All Trainings</button>
    </div>
  )
}
