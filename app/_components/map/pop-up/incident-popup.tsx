"use client"

import { Popup } from "react-map-gl/mapbox"
import { Badge } from "@/app/_components/ui/badge"
import { Card } from "@/app/_components/ui/card"
import { Separator } from "@/app/_components/ui/separator"
import { Button } from "@/app/_components/ui/button"
import { MapPin, AlertTriangle, Calendar, Clock, Bookmark, Navigation, X, FileText, Shield } from "lucide-react"
import { IDistanceResult } from "@/app/_utils/types/crimes"
import { ScrollArea } from "@/app/_components/ui/scroll-area"
import { Skeleton } from "@/app/_components/ui/skeleton"
import { INearestUnits } from "@/app/(pages)/(admin)/dashboard/crime-management/units/action"

interface IncidentPopupProps {
    longitude: number
    latitude: number
    onClose: () => void
    incident: {
        id: string
        category?: string
        description?: string
        date?: Date | string
        district?: string
        district_id?: string
    }
    nearestUnit?: INearestUnits[]
    isLoadingNearestUnit?: boolean
}

export default function IncidentPopup({
    longitude,
    latitude,
    onClose,
    incident,
    nearestUnit = [],
    isLoadingNearestUnit = false
}: IncidentPopupProps) {

    const formatDate = (date?: Date | string) => {
        if (!date) return "Unknown date"
        return new Date(date).toLocaleDateString()
    }

    const formatTime = (date?: Date | string) => {
        if (!date) return "Unknown time"
        return new Date(date).toLocaleTimeString()
    }

    // Format distance to be more readable
    const formatDistance = (meters: number) => {
        if (meters < 1000) {
            return `${meters.toFixed(0)} m`;
        } else {
            return `${(meters / 1000).toFixed(2)} km`;
        }
    }

    return (
        <Popup
            longitude={longitude}
            latitude={latitude}
            closeButton={false}
            closeOnClick={false}
            onClose={onClose}
            anchor="bottom"
            maxWidth="320px"
            className="incident-popup z-50"
        >
            <div className="relative">
                <Card
                    className="bg-background p-0 w-full max-w-[320px] shadow-xl border-0 overflow-hidden border-l-4 border-l-red-600"
                >
                    <div className="p-4 relative">
                        {/* Custom close button */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-2 right-2 h-6 w-6 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700"
                            onClick={onClose}
                        >
                            <X className="h-4 w-4" />
                            <span className="sr-only">Close</span>
                        </Button>

                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-bold text-base flex items-center gap-1.5">
                                <AlertTriangle className="h-4 w-4 text-red-500" />
                                {incident.category || "Unknown Incident"}
                            </h3>
                        </div>

                        {incident.description && (
                            <div className="mb-3 bg-slate-50 dark:bg-slate-900/40 p-3 rounded-lg">
                                <p className="text-sm">
                                    <FileText className="inline-block h-3.5 w-3.5 mr-1.5 align-text-top text-slate-500" />
                                    {incident.description}
                                </p>
                            </div>
                        )}

                        <Separator className="my-3" />

                        <div className="grid grid-cols-2 gap-2 text-sm">
                            {incident.district && (
                                <div className="col-span-2">
                                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">District</p>
                                    <p className="flex items-center">
                                        <Bookmark className="inline-block h-3.5 w-3.5 mr-1.5 shrink-0 text-purple-500" />
                                        <span className="font-medium">{incident.district}</span>
                                    </p>
                                </div>
                            )}

                            {incident.date && (
                                <>
                                    <div>
                                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Date</p>
                                        <p className="flex items-center">
                                            <Calendar className="inline-block h-3.5 w-3.5 mr-1.5 shrink-0 text-blue-500" />
                                            <span className="font-medium">{formatDate(incident.date)}</span>
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Time</p>
                                        <p className="flex items-center">
                                            <Clock className="inline-block h-3.5 w-3.5 mr-1.5 shrink-0 text-amber-500" />
                                            <span className="font-medium">{formatTime(incident.date)}</span>
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* NearestUnit to police nearestUnits section */}
                        <Separator className="my-3" />

                        <div>
                            <h4 className="text-sm font-medium mb-2 flex items-center">
                                <Shield className="h-4 w-4 mr-1.5 text-blue-600" />
                                Nearby Units
                            </h4>

                            {isLoadingNearestUnit ? (
                                <div className="space-y-2">
                                    <Skeleton className="h-6 w-full" />
                                    <Skeleton className="h-6 w-full" />
                                    <Skeleton className="h-6 w-full" />
                                </div>
                            ) : nearestUnit.length > 0 ? (
                                <ScrollArea className="h-[100px] rounded-md border p-2">
                                    <div className="space-y-2">
                                            {nearestUnit.map((unit) => (
                                                <div key={unit.code_unit} className="flex justify-between items-center text-xs border-b pb-1">
                                                <div>
                                                        <p className="font-medium">
                                                            {unit.name || "Unknown"}
                                                            <span className="ml-2 text-[10px] text-slate-500 font-normal">
                                                                ({unit.type || "Unknown type"})
                                                            </span>
                                                        </p>
                                                        <p className="text-muted-foreground text-[10px] truncate" style={{ maxWidth: "160px" }}>
                                                            {unit.address || "No address"}
                                                    </p>
                                                </div>
                                                    <Badge variant="outline" className="ml-2 whitespace-nowrap text-blue-600">
                                                        {formatDistance(unit.distance_meters)}
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                </ScrollArea>
                            ) : (
                                <p className="text-xs text-muted-foreground text-center p-2">
                                            No nearby units found
                                </p>
                            )}
                        </div>

                        <div className="mt-3 pt-3 border-t border-border">
                            <p className="text-xs text-muted-foreground flex items-center">
                                <Navigation className="inline-block h-3 w-3 mr-1 shrink-0" />
                                Coordinates: {latitude.toFixed(6)}, {longitude.toFixed(6)}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">ID: {incident.id}</p>
                        </div>
                    </div>
                </Card>
            </div>
        </Popup>
    )
}
