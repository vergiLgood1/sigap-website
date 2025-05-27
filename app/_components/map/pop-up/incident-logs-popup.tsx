"use client"

import { Popup } from "react-map-gl/mapbox"
import { Badge } from "@/app/_components/ui/badge"
import { Card } from "@/app/_components/ui/card"
import { Separator } from "@/app/_components/ui/separator"
import { Button } from "@/app/_components/ui/button"
import {
    Clock,
    MapPin,
    Navigation,
    X,
    AlertCircle,
    Calendar,
    User,
    Tag,
    Building2
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { IconBrandGmail, IconPhone } from "@tabler/icons-react"

interface IncidentLogsPopupProps {
    longitude: number
    latitude: number
    onClose: () => void
    incident: {
        id: string
        description?: string
        category?: string
        address?: string
        timestamp: Date
        district?: string
        severity?: string
        source?: string
        status?: string
        verified?: boolean | string
        user_id?: string
        name?: string
        email?: string
        phone?: string
        avatar?: string
        role_id?: string
        role?: string
        isVeryRecent?: boolean
    }
}

export default function IncidentLogsPopup({
    longitude,
    latitude,
    onClose,
    incident,
}: IncidentLogsPopupProps) {
    // Format timestamp in a human-readable way
    const timeAgo = formatDistanceToNow(new Date(incident.timestamp), { addSuffix: true })

    // Get severity badge color
    const getSeverityColor = (severity?: string) => {
        switch (severity?.toLowerCase()) {
            case 'high':
                return 'bg-red-500 text-white'
            case 'medium':
                return 'bg-orange-500 text-white'
            case 'low':
                return 'bg-yellow-500 text-black'
            default:
                return 'bg-gray-500 text-white'
        }
    }

    // Format verification status
    const verificationStatus = typeof incident.verified === 'boolean'
        ? incident.verified
        : incident.verified === 'true' || incident.verified === '1'

    return (
        <Popup
            longitude={longitude}
            latitude={latitude}
            closeButton={false}
            closeOnClick={false}
            onClose={onClose}
            anchor="bottom"
            maxWidth="320px"
            className="incident-logs-popup z-50"
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
                                <AlertCircle className="h-4 w-4 text-red-600" />
                                {incident.category || "Incident Report"}
                            </h3>
                            <Badge variant="outline" className={`${getSeverityColor(incident.severity)}`}>
                                {incident.severity || "Unknown"} Priority
                            </Badge>
                        </div>

                        <div className="grid grid-cols-1 gap-2 text-sm">
                            {incident.description && (
                                <div>
                                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Description</p>
                                    <p className="font-medium">{incident.description}</p>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-2 mt-1">
                                <div>
                                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Time</p>
                                    <p className="flex items-center">
                                        <Clock className="inline-block h-3.5 w-3.5 mr-1.5 shrink-0 text-blue-500" />
                                        <span className="font-medium">{timeAgo}</span>
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Status</p>
                                    <p className="flex items-center">
                                        <Badge variant={verificationStatus ? "default" : "secondary"} className="h-5">
                                            {verificationStatus ? "Verified" : "Unverified"}
                                        </Badge>
                                    </p>
                                </div>
                            </div>

                            {incident.address && (
                                <div>
                                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Location</p>
                                    <p className="flex items-center">
                                        <MapPin className="inline-block h-3.5 w-3.5 mr-1.5 shrink-0 text-red-500" />
                                        <span className="font-medium">{incident.address}</span>
                                    </p>
                                </div>
                            )}

                            {incident.district && (
                                <div>
                                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">District</p>
                                    <p className="flex items-center">
                                        <Building2 className="inline-block h-3.5 w-3.5 mr-1.5 shrink-0 text-purple-500" />
                                        <span className="font-medium">{incident.district}</span>
                                    </p>
                                </div>
                            )}

                            {incident.source && (
                                <div>
                                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Source</p>
                                    <p className="flex items-center">
                                        <Tag className="inline-block h-3.5 w-3.5 mr-1.5 shrink-0 text-green-500" />
                                        <span className="font-medium">{incident.source}</span>
                                    </p>
                                </div>
                            )}

                            {/* Reporter information section */}
                            {(incident.name || incident.user_id || incident.email || incident.phone) && (
                                <div>
                                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Reporter Details</p>
                                    <div className="rounded-md border border-border p-2 space-y-1">
                                        {incident.name && (
                                            <p className="flex items-center text-xs">
                                                <User className="inline-block h-3.5 w-3.5 mr-1.5 shrink-0 text-amber-500" />
                                                <span className="font-medium">{incident.name}</span>
                                                {incident.role && (
                                                    <Badge variant="outline" className="ml-1.5 text-[10px] h-4 px-1">
                                                        {incident.role}
                                                    </Badge>
                                                )}
                                            </p>
                                        )}

                                        {incident.email && (
                                            <p className="text-xs text-muted-foreground truncate">
                                                <IconBrandGmail className="inline-block h-3.5 w-3.5 mr-1.5 shrink-0 text-blue-500" />
                                                {incident.email}
                                            </p>
                                        )}

                                        {incident.phone && (
                                            <p className="text-xs text-muted-foreground">
                                                <IconPhone className="inline-block h-3.5 w-3.5 mr-1.5 shrink-0 text-green-500" />
                                                {incident.phone}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <Separator className="my-3" />

                        <div className="mt-3 pt-0">
                            <p className="text-xs text-muted-foreground flex items-center">
                                <Navigation className="inline-block h-3 w-3 mr-1 shrink-0" />
                                Coordinates: {latitude.toFixed(6)}, {longitude.toFixed(6)}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">Incident ID: {incident.id}</p>
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

                {/* Pulsing effect for very recent incidents */}
                {incident.isVeryRecent && (
                    <div
                        className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full animate-ping"
                        style={{
                            width: '12px',
                            height: '12px',
                            backgroundColor: 'rgba(255, 0, 0, 0.3)',
                            borderRadius: '50%',
                            marginTop: '20px',
                        }}
                    />
                )}
            </div>
        </Popup>
    )
}
