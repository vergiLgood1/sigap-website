import { Badge } from "@/app/_components/ui/badge"

export default function DashboardHeader() {
    return (
        <div className="flex items-center justify-between mb-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Crime Management Dashboard</h2>
                <p className="text-muted-foreground">Overview of current cases, incidents, and department status</p>
            </div>
            <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
                    System: Online
                </Badge>
                <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                    Alert Level: Normal
                </Badge>
            </div>
        </div>
    )
}
