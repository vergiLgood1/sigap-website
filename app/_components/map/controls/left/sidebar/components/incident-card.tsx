import React from 'react'
import { Info, Clock, MapPin, AlertTriangle, ChevronRight, AlertCircle, Shield } from 'lucide-react'
import { Card, CardContent, CardHeader, CardFooter } from "@/app/_components/ui/card"
import { Badge } from "@/app/_components/ui/badge"
import { cn } from "@/app/_lib/utils"
import { useRouter } from "next/navigation"
import { getSeverityGradient, getStatusInfo, normalizeSeverity } from '@/app/_utils/map/common'

interface IIncidentCardProps {
    title: string
    location: string
    time: string
    severity?: number | "Low" | "Medium" | "High" | "Critical"
    onClick?: () => void
    className?: string
    showTimeAgo?: boolean
    status?: string | true
    isUserReport?: boolean
    incidentId?: string // Added incident ID for navigation
}

// export function IncidentCard({
//     title,
//     location,
//     time,
//     severity = 1,
//     onClick,
//     className,
//     showTimeAgo = true,
//     status,
//     isUserReport = false,
//     incidentId
// }: IIncidentCardProps) {
//     const router = useRouter()

//     // Helper to normalize severity to a number
//     const normalizeSeverity = (sev: number | "Low" | "Medium" | "High" | "Critical"): number => {
//         if (typeof sev === "number") return sev;
//         switch (sev) {
//             case "Critical":
//                 return 4;
//             case "High":
//                 return 3;
//             case "Medium":
//                 return 2;
//             case "Low":
//             default:
//                 return 1;
//         }
//     };

//     const getSeverityColor = (severity: number) => {
//         switch (severity) {
//             case 4:
//                 return "border-purple-600 bg-purple-50 dark:bg-purple-950/30"
//             case 3:
//                 return "border-red-500 bg-red-50 dark:bg-red-950/30"
//             case 2:
//                 return "border-yellow-400 bg-yellow-50 dark:bg-yellow-950/30"
//             case 1:
//             default:
//                 return "border-blue-500 bg-blue-50 dark:bg-blue-950/30"
//         }
//     }

//     const getSeverityText = (severity: number) => {
//         switch (severity) {
//             case 4:
//                 return "text-purple-600 dark:text-purple-400"
//             case 3:
//                 return "text-red-500 dark:text-red-400"
//             case 2:
//                 return "text-yellow-600 dark:text-yellow-400"
//             case 1:
//             default:
//                 return "text-blue-500 dark:text-blue-400"
//         }
//     }

//     const getSeverityLabel = (severity: number) => {
//         switch (severity) {
//             case 4:
//                 return "Critical"
//             case 3:
//                 return "High"
//             case 2:
//                 return "Medium"
//             case 1:
//             default:
//                 return "Low"
//         }
//     }

//     const getStatusColor = (status: string) => {
//         switch (status?.toLowerCase()) {
//             case "resolved":
//                 return "bg-green-100 text-green-700 border-green-300 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800"
//             case "pending":
//             default:
//                 return "bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800"
//         }
//     }

//     const normalizedSeverity = normalizeSeverity(severity);

//     // Handle card click - either use provided onClick or navigate to incident detail page
//     const handleClick = (e: React.MouseEvent) => {
//         if (onClick) {
//             onClick()
//         } else if (incidentId) {
//             // Open incident detail in new tab
//             window.open(`/incidents/detail/${incidentId}`, '_blank')
//         }
//     }

//     return (
//         <Card
//             className={cn(
//                 "overflow-hidden transition-all duration-200 border-l-4",
//                 getSeverityColor(normalizedSeverity),
//                 "hover:shadow-md hover:translate-y-[-2px]",
//                 "group cursor-pointer",
//                 className
//             )}
//             onClick={handleClick}
//         >
//             <CardContent className="p-4 relative">
//                 <div className="flex items-start justify-between gap-3">
//                     <div className="flex-1">
//                         <div className="flex items-center gap-2 mb-2">
//                             <Badge className={`${getSeverityText(normalizedSeverity)} bg-white dark:bg-transparent border`}>
//                                 {getSeverityLabel(normalizedSeverity)}
//                             </Badge>
//                             {isUserReport && (
//                                 <Badge variant="outline" className="text-xs">
//                                     User Report
//                                 </Badge>
//                             )}
//                         </div>

//                         <h3 className="font-semibold text-base mb-2 line-clamp-1">{title}</h3>

//                         <div className="flex flex-wrap gap-y-2 gap-x-3 text-sm text-muted-foreground">
//                             <div className="flex items-center gap-1.5">
//                                 <Clock className="h-4 w-4 shrink-0" />
//                                 <span>{time}</span>
//                             </div>

//                             <div className="flex items-center gap-1.5">
//                                 <MapPin className="h-4 w-4 shrink-0" />
//                                 <span className="truncate max-w-[180px]">{location}</span>
//                             </div>
//                         </div>

//                         {/* Add status badges for user reports */}
//                         {isUserReport && typeof status === "string" && (
//                             <Badge variant="outline" className={`mt-3 ${getStatusColor(status)}`}>
//                                 {status.charAt(0).toUpperCase() + status.slice(1)}
//                             </Badge>
//                         )}
//                     </div>

//                     <div className="opacity-0 group-hover:opacity-100 transition-opacity">
//                         <ChevronRight className="h-5 w-5 text-muted-foreground" />
//                     </div>
//                 </div>
//             </CardContent>
//         </Card>
//     )
// }

export function IncidentCardV2({
    title,
    location,
    time,
    severity = 1,
    onClick,
    className,
    showTimeAgo = true,
    status,
    isUserReport = false,
    incidentId
}: IIncidentCardProps) {
    const router = useRouter()

    const normalizedSeverity = normalizeSeverity(severity)

    // Handle card click - either use provided onClick or navigate to incident detail page
    const handleClick = (e: React.MouseEvent) => {
        if (onClick) {
            onClick()
        } else if (incidentId) {
            // Open incident detail in new tab
            window.open(`/incidents/detail/${incidentId}`, '_blank')
        }
    }

    return (
        <Card
            className={cn(
                "overflow-hidden transition-all duration-300 border",
                getSeverityGradient(normalizedSeverity),
                "hover:shadow-md hover:translate-y-[-2px]",
                "group cursor-pointer",
                className,
            )}
            onClick={handleClick}
        >
            <CardContent className="p-0">
                <div className="flex items-stretch">
                    {/* <div className="p-4 flex items-center justify-center">{getSeverityIcon(normalizedSeverity)}</div> */}

                    <div className="flex-1 p-4 pr-10 relative">
                        <h3 className="font-medium text-base mb-2 line-clamp-1">{title}</h3>

                        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                                <Clock className="h-4 w-4 shrink-0" />
                                <span>{time}</span>
                            </div>

                            <div className="flex items-center gap-1.5">
                                <MapPin className="h-4 w-4 shrink-0" />
                                <span className="truncate max-w-[180px]">{location}</span>
                            </div>
                        </div>

                        {/* Status badges */}
                        <div className="mt-3 flex gap-2">
                            {isUserReport && (
                                <Badge variant="secondary" className="text-xs">
                                    User Report
                                </Badge>
                            )}

                            {isUserReport && typeof status === "string" && (
                                <Badge variant="outline" className={`${getStatusInfo(status)}`}>
                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                </Badge>
                            )}
                        </div>

                        <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
