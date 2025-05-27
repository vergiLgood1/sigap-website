"use client"

import { Marker } from "react-map-gl/mapbox"
import { AlertCircle, AlertTriangle } from "lucide-react"

export type CrimeIncident = {
    id: string
    latitude: number
    longitude: number
    description: string
    category?: string
    timestamp?: Date
    status?: string | null
    type?: string | null
    address?: string | null
}

type CrimeMarkerProps = {
    incident: CrimeIncident
    onClick?: (incident: CrimeIncident) => void
}


export default function CrimeMarker({ incident, onClick }: CrimeMarkerProps) {

    return (
        <Marker
            longitude={incident.longitude}
            latitude={incident.latitude}
            anchor="bottom"
            onClick={() => onClick && onClick(incident)}

        >
            <div className="cursor-pointer text-red-500 hover:text-red-700 transition-colors">
                <AlertCircle size={24} />
            </div>
        </Marker>
    )
}
