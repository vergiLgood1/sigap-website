"use client"

import { Popup } from "react-map-gl/mapbox"
import { Badge } from "@/app/_components/ui/badge"
import { Card } from "@/app/_components/ui/card"
import { Separator } from "@/app/_components/ui/separator"
import { Button } from "@/app/_components/ui/button"
import { Phone, Building, MapPin, Navigation, X, Shield, Compass, Map, Building2 } from "lucide-react"
import { IDistanceResult } from "@/app/_utils/types/crimes"
import { ScrollArea } from "@/app/_components/ui/scroll-area"
import { Skeleton } from "@/app/_components/ui/skeleton"

interface UnitPopupProps {
    longitude: number
    latitude: number
    onClose: () => void
    unit: {
        id: string
        name: string
        type?: string
        address?: string
        phone?: string
        district?: string
        district_id?: string
    }
    incidents?: IDistrictIncidents[]
    isLoadingIncidents?: boolean
}

interface IDistrictIncidents {
    incident_id: string
    category_name: string
    incident_description: string
    distance_meters: number
    timestamp: Date
}


export default function UnitPopup({
    longitude,
    latitude,
    onClose,
    unit,
    incidents = [],
    isLoadingIncidents = false
}: UnitPopupProps) {

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
            className="unit-popup z-50"
        >
            <div className="relative">
                <Card
                    className="bg-background p-0 w-full max-w-[320px] shadow-xl border-0 overflow-hidden border-l-4 border-l-blue-700"
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
                                <Shield className="h-4 w-4 text-blue-700" />
                                {unit.name || "Police Unit"}
                            </h3>
                            <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                                {unit.type || "Unit"}
                            </Badge>
                        </div>

                        <div className="grid grid-cols-1 gap-2 text-sm">
                            {unit.address && (
                                <div>
                                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Address</p>
                                    <p className="flex items-center">
                                        <MapPin className="inline-block h-3.5 w-3.5 mr-1.5 shrink-0 text-red-500" />
                                        <span className="font-medium">{unit.address}</span>
                                    </p>
                                </div>
                            )}

                            {unit.phone && (
                                <div>
                                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Contact</p>
                                    <p className="flex items-center">
                                        <Phone className="inline-block h-3.5 w-3.5 mr-1.5 shrink-0 text-green-500" />
                                        <span className="font-medium">{unit.phone}</span>
                                    </p>
                                </div>
                            )}

                            {unit.district && (
                                <div>
                                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">District</p>
                                    <p className="flex items-center">
                                        <Building2 className="inline-block h-3.5 w-3.5 mr-1.5 shrink-0 text-purple-500" />
                                        <span className="font-medium">{unit.district}</span>
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Incidents to incidents section */}
                        <Separator className="my-3" />

                        <div>
                            <h4 className="text-sm font-medium mb-2 flex items-center">
                                <Compass className="h-4 w-4 mr-1.5 text-blue-600" />
                                Nearby Incidents
                            </h4>

                            {isLoadingIncidents ? (
                                <div className="space-y-2">
                                    <Skeleton className="h-6 w-full" />
                                    <Skeleton className="h-6 w-full" />
                                    <Skeleton className="h-6 w-full" />
                                </div>
                            ) : incidents.length > 0 ? (
                                <ScrollArea className="h-[120px] rounded-md border p-2">
                                    <div className="space-y-2">
                                            {incidents.map((item) => (
                                            <div key={item.incident_id} className="flex justify-between items-center text-xs border-b pb-1">
                                                <div>
                                                    <p className="font-medium">{item.category_name || "Unknown"}</p>
                                                    <p className="text-muted-foreground text-[10px] truncate" style={{ maxWidth: "160px" }}>
                                                        {item.incident_description || "No description"}
                                                    </p>
                                                </div>
                                                    <Badge variant="outline" className="ml-2 whitespace-nowrap text-blue-600">
                                                    {formatDistance(item.distance_meters)}
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                </ScrollArea>
                            ) : (
                                <p className="text-xs text-muted-foreground text-center p-2">
                                    No incident data available
                                </p>
                            )}
                        </div>

                        <div className="mt-3 pt-3 border-t border-border">
                            <p className="text-xs text-muted-foreground flex items-center">
                                <Navigation className="inline-block h-3 w-3 mr-1 shrink-0" />
                                Coordinates: {latitude.toFixed(6)}, {longitude.toFixed(6)}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">ID: {unit.id}</p>
                        </div>
                    </div>
                </Card>
                {/* Connection line */}
                <div
                    className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full"
                    style={{
                        width: '2px',
                        height: '20px',
                        backgroundColor: 'red',
                        boxShadow: '0 0 4px rgba(0, 0, 0, 0.3)'
                    }}
                />
                {/* Connection dot */}
                <div
                    className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full"
                    style={{
                        width: '6px',
                        height: '6px',
                        backgroundColor: 'red',
                        borderRadius: '50%',
                        marginTop: '20px',
                        boxShadow: '0 0 4px rgba(0, 0, 0, 0.3)'
                    }}
                />
            </div>
        </Popup>
    )
}
