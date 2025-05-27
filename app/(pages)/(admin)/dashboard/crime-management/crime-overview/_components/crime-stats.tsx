import { Progress } from "@/app/_components/ui/progress"

export default function CrimeStatistics() {
    const statistics = [
        { name: "Violent Crime", value: 65, change: "+12%", color: "bg-red-500", textColor: "text-red-600" },
        { name: "Property Crime", value: 42, change: "-8%", color: "bg-yellow-500", textColor: "text-green-600" },
        { name: "Cybercrime", value: 78, change: "+23%", color: "bg-blue-500", textColor: "text-red-600" },
    ]

    return (
        <div className="space-y-4 mt-4">
            {statistics.map((stat) => (
                <div key={stat.name}>
                    <div className="flex justify-between mb-1 text-sm">
                        <span>{stat.name}</span>
                        <span className={stat.textColor}>{stat.change}</span>
                    </div>
                    <Progress value={stat.value} className="h-2 bg-slate-200" indicatorClassName={stat.color} />
                </div>
            ))}
        </div>
    )
}
