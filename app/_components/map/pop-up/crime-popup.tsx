"use client"

import { Popup } from "react-map-gl/mapbox"
import { Badge } from "@/app/_components/ui/badge"
import { Card } from "@/app/_components/ui/card"
import { Separator } from "@/app/_components/ui/separator"
import { Button } from "@/app/_components/ui/button"
import { MapPin, AlertTriangle, Calendar, Clock, Tag, Bookmark, FileText, Navigation, X } from "lucide-react"

interface IncidentPopupProps {
    longitude: number
    latitude: number
    onClose: () => void
    incident: {
        id: string
        district?: string
        category?: string
        type_category?: string | null
        description?: string
        status?: string
        address?: string | null
        timestamp?: Date
        latitude?: number
        longitude?: number
    }
}

export default function CrimePopup({ longitude, latitude, onClose, incident }: IncidentPopupProps) {
    const formatDate = (date?: Date) => {
        if (!date) return "Unknown date"
        return new Date(date).toLocaleDateString()
    }

    const formatTime = (date?: Date) => {
        if (!date) return "Unknown time"
        return new Date(date).toLocaleTimeString()
    }

    const getStatusBadge = (status?: string) => {
        if (!status) return <Badge variant="outline">Unknown</Badge>

        const statusLower = status.toLowerCase()
        if (statusLower.includes("resolv") || statusLower.includes("closed")) {
            return <Badge className="bg-emerald-600 text-white">Resolved</Badge>
        }
        if (statusLower.includes("progress") || statusLower.includes("invest")) {
            return <Badge className="bg-amber-500 text-white">In Progress</Badge>
        }
        if (statusLower.includes("open") || statusLower.includes("new")) {
            return <Badge className="bg-blue-600 text-white">Open</Badge>
        }

        return <Badge variant="outline">{status}</Badge>
    }

    // Determine border color based on status
    const getBorderColor = (status?: string) => {
        if (!status) return "border-l-gray-400"

        const statusLower = status.toLowerCase()
        if (statusLower.includes("resolv") || statusLower.includes("closed")) {
            return "border-l-emerald-600"
        }
        if (statusLower.includes("progress") || statusLower.includes("invest")) {
            return "border-l-amber-500"
        }
        if (statusLower.includes("open") || statusLower.includes("new")) {
            return "border-l-blue-600"
        }

        return "border-l-gray-400"
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
                    className={`bg-background p-0 w-full max-w-[320px] shadow-xl border-0 overflow-hidden border-l-4 ${getBorderColor(incident.status)}`}
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
                            {getStatusBadge(incident.status)}
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

                        {/* Improved section headers */}
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

                            {incident.address && (
                                <div className="col-span-2">
                                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Location</p>
                                    <p className="flex items-center">
                                        <MapPin className="inline-block h-3.5 w-3.5 mr-1.5 shrink-0 text-red-500" />
                                        <span className="font-medium">{incident.address}</span>
                                    </p>
                                </div>
                            )}

                            {incident.timestamp && (
                                <>
                                    <div>
                                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Date</p>
                                        <p className="flex items-center">
                                            <Calendar className="inline-block h-3.5 w-3.5 mr-1.5 shrink-0 text-blue-500" />
                                            <span className="font-medium">{formatDate(incident.timestamp)}</span>
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Time</p>
                                        <p className="flex items-center">
                                            <Clock className="inline-block h-3.5 w-3.5 mr-1.5 shrink-0 text-amber-500" />
                                            <span className="font-medium">{formatTime(incident.timestamp)}</span>
                                        </p>
                                    </div>
                                </>
                            )}

                            {incident.type_category && (
                                <div className="col-span-2">
                                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Type</p>
                                    <p className="flex items-center">
                                        <Tag className="inline-block h-3.5 w-3.5 mr-1.5 shrink-0 text-green-500" />
                                        <span className="font-medium">{incident.type_category}</span>
                                    </p>
                                </div>
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
