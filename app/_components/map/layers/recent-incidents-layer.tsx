"use client"

import { useEffect, useCallback, useRef, useState } from "react"
import type { IIncidentLogs } from "@/app/_utils/types/crimes"
import { BASE_BEARING, BASE_DURATION, BASE_PITCH, BASE_ZOOM, PITCH_3D, ZOOM_3D } from "@/app/_utils/const/map"
import IncidentLogsPopup from "../pop-up/incident-logs-popup"
import type mapboxgl from "mapbox-gl"
import type { MapGeoJSONFeature, MapMouseEvent } from "react-map-gl/mapbox"
import { manageLayerVisibility } from "@/app/_utils/map/layer-visibility"

interface IRecentIncidentsLayerProps {
    visible?: boolean
    map: mapboxgl.Map
    incidents?: IIncidentLogs[]
}

// Define a proper structure for GeoJSON feature properties
interface IIncidentFeatureProperties {
    id: string
    role_id?: string
    user_id?: string
    name?: string
    email?: string
    telephone?: string
    avatar?: string
    role?: string
    address?: string
    description?: string
    timestamp: string
    category?: string
    district?: string
    severity?: string
    status?: boolean | string
    source?: string
    isVeryRecent: boolean
    timeDiff: number
}

// Define a proper incident object type that will be set in state
interface IIncidentDetails extends Omit<IIncidentLogs, 'timestamp'> {
    timestamp: Date
    isVeryRecent?: boolean
}

export default function RecentIncidentsLayer({ visible = false, map, incidents = [] }: IRecentIncidentsLayerProps) {
    const isInteractingWithMarker = useRef(false)
    const animationFrameRef = useRef<number | null>(null)
    const [selectedIncident, setSelectedIncident] = useState<IIncidentDetails | null>(null)

    // Define layer IDs once to be consistent
    const LAYER_IDS = [
        "very-recent-incidents-pulse",
        "recent-incidents-glow",
        "recent-incidents"
    ];

    // Filter incidents from the last 24 hours
    const recentIncidents = incidents.filter((incident) => {
        if (!incident.timestamp) return false
        const incidentDate = new Date(incident.timestamp)
        const now = new Date()
        const timeDiff = now.getTime() - incidentDate.getTime()
        // 86400000 = 24 hours in milliseconds
        return timeDiff <= 86400000
    })

    // Split incidents into very recent (2 hours) and regular recent
    const twoHoursInMs = 2 * 60 * 60 * 1000 // 2 hours in milliseconds

    const handleIncidentClick = useCallback(
        (e: MapMouseEvent & { features?: MapGeoJSONFeature[] }) => {
            if (!map) return

            const features = map.queryRenderedFeatures(e.point, { layers: ["recent-incidents"] })
            if (!features || features.length === 0) return

            // Stop event propagation
            e.originalEvent.stopPropagation()
            e.preventDefault()

            isInteractingWithMarker.current = true

            const incident = features[0]
            if (!incident.properties) return

            e.originalEvent.stopPropagation()
            e.preventDefault()

            const props = incident.properties as IIncidentFeatureProperties

            const IincidentDetails: IIncidentDetails = {
                id: props.id,
                description: props.description || "",
                verified: Boolean(props.status),
                longitude: (incident.geometry as any).coordinates[0],
                latitude: (incident.geometry as any).coordinates[1],
                timestamp: new Date(props.timestamp || Date.now()),
                category: props.category || "Unknown",
                address: props.address || "Unknown",
                district: props.district || "Unknown",
                severity: (props.severity === "Low" || props.severity === "Medium" || props.severity === "High") ? props.severity : "Unknown",
                source: props.source || "Unknown",
                user_id: props.user_id || "Unknown",
                name: props.name || "Unknown",
                email: props.email || "Unknown",
                phone: props.telephone || "Unknown",
                avatar: props.avatar || "Unknown",
                role_id: props.role_id || "Unknown",
                role: props.role || "Unknown",
                isVeryRecent: props.isVeryRecent,

            }

            // Fly to the incident location
            map.flyTo({
                center: [IincidentDetails.longitude, IincidentDetails.latitude],
                zoom: ZOOM_3D,
                bearing: BASE_BEARING,
                pitch: PITCH_3D,
                duration: BASE_DURATION,
            })

            // Set selected incident for the popup
            setSelectedIncident(IincidentDetails)

            // Reset the flag after a delay
            setTimeout(() => {
                isInteractingWithMarker.current = false
            }, 5000)
        },
        [map],
    )

    // Handle popup close
    const handleClosePopup = useCallback(() => {
        if (!map) return

        map.easeTo({
            zoom: BASE_ZOOM,
            bearing: BASE_BEARING,
            pitch: BASE_PITCH,
            duration: BASE_DURATION,
        });

        setSelectedIncident(null)
    }, [map])

    // Effect to manage layer visibility consistently
    useEffect(() => {
        const cleanup = manageLayerVisibility(map, LAYER_IDS, visible, () => {
            // When layers become invisible, close any open popup
            if (!visible) setSelectedIncident(null);

            // Cancel animation frame when hiding the layer
            if (!visible && animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
                animationFrameRef.current = null;
            }
        });

        return cleanup;
    }, [visible, map]);

    useEffect(() => {
        if (!map || !visible) return

        // Convert incidents to GeoJSON with an additional property for recency
        const now = new Date().getTime()

        // Define our GeoJSON structure with proper typing
        interface IncidentGeoJSON {
            type: 'FeatureCollection'
            features: Array<{
                type: 'Feature'
                geometry: {
                    type: 'Point'
                    coordinates: [number, number]
                }
                properties: IIncidentFeatureProperties
            }>
        }

        const recentData: IncidentGeoJSON = {
            type: "FeatureCollection",
            features: recentIncidents.map((incident) => {
                const timestamp = incident.timestamp ? new Date(incident.timestamp).getTime() : now
                const timeDiff = now - timestamp
                const isVeryRecent = timeDiff <= twoHoursInMs

                return {
                    type: "Feature",
                    geometry: {
                        type: "Point",
                        coordinates: [incident.longitude, incident.latitude],
                    },
                    properties: {
                        id: incident.id,
                        role_id: incident.role_id,
                        user_id: incident.user_id,
                        name: incident.name,
                        email: incident.email,
                        telephone: incident.phone,
                        avatar: incident.avatar,
                        role: incident.role,
                        address: incident.address,
                        description: incident.description,
                        timestamp: incident.timestamp ? incident.timestamp.toString() : new Date().toString(),
                        category: incident.category,
                        district: incident.district,
                        severity: incident.severity,
                        status: incident.verified,
                        source: incident.source,
                        isVeryRecent,
                        timeDiff,
                    },
                }
            }),
        }

        const setupLayerAndSource = () => {
            try {
                // Check if source exists and update it
                if (map.getSource("recent-incidents-source")) {
                    const source = map.getSource("recent-incidents-source") as mapboxgl.GeoJSONSource
                    source.setData(recentData)
                } else {
                    // If not, add source
                    map.addSource("recent-incidents-source", {
                        type: "geojson",
                        data: recentData,
                    })
                }

                // Find first symbol layer for proper layering
                const layers = map.getStyle().layers
                let firstSymbolId: string | undefined
                for (const layer of layers) {
                    if (layer.type === "symbol") {
                        firstSymbolId = layer.id
                        break
                    }
                }

                // Add the pulsing glow layer for very recent incidents (2 hours or less)
                if (!map.getLayer("very-recent-incidents-pulse")) {
                    map.addLayer(
                        {
                            id: "very-recent-incidents-pulse",
                            type: "circle",
                            source: "recent-incidents-source",
                            filter: ["==", ["get", "isVeryRecent"], true],
                            paint: {
                                "circle-color": "#FF0000",
                                "circle-radius": [
                                    "interpolate",
                                    ["linear"],
                                    ["zoom"],
                                    7,
                                    8,
                                    12,
                                    16,
                                    15,
                                    24,
                                ],
                                "circle-opacity": 0.3,
                                "circle-stroke-width": 2,
                                "circle-stroke-color": "#FF0000",
                                "circle-stroke-opacity": 0.5,
                            },
                            layout: {
                                visibility: visible ? "visible" : "none",
                            },
                        },
                        firstSymbolId,
                    )
                } else {
                    map.setLayoutProperty("very-recent-incidents-pulse", "visibility", visible ? "visible" : "none")
                }

                // Add regular recent incidents glow
                if (!map.getLayer("recent-incidents-glow")) {
                    map.addLayer(
                        {
                            id: "recent-incidents-glow",
                            type: "circle",
                            source: "recent-incidents-source",
                            paint: {
                                "circle-color": "#FF5252",
                                "circle-radius": ["interpolate", ["linear"], ["zoom"], 7, 6, 12, 12, 15, 18],
                                "circle-opacity": 0.2,
                                "circle-blur": 1,
                            },
                            layout: {
                                visibility: visible ? "visible" : "none",
                            },
                        },
                        "very-recent-incidents-pulse",
                    )
                } else {
                    map.setLayoutProperty("recent-incidents-glow", "visibility", visible ? "visible" : "none")
                }

                // Check if layer exists already for the main marker dots
                if (!map.getLayer("recent-incidents")) {
                    map.addLayer(
                        {
                            id: "recent-incidents",
                            type: "circle",
                            source: "recent-incidents-source",
                            paint: {
                                "circle-color": [
                                    "case",
                                    ["==", ["get", "isVeryRecent"], true],
                                    "#FF0000", // Bright red for very recent
                                    "#FF5252", // Standard red for older incidents
                                ],
                                "circle-radius": [
                                    "interpolate",
                                    ["linear"],
                                    ["zoom"],
                                    7,
                                    4,
                                    12,
                                    8,
                                    15,
                                    12,
                                ],
                                "circle-stroke-width": 2,
                                "circle-stroke-color": "#FFFFFF",
                                "circle-opacity": 0.8,
                            },
                            layout: {
                                visibility: visible ? "visible" : "none",
                            },
                        },
                        "recent-incidents-glow",
                    )

                    // Add mouse events
                    map.on("mouseenter", "recent-incidents", () => {
                        map.getCanvas().style.cursor = "pointer"
                    })

                    map.on("mouseleave", "recent-incidents", () => {
                        map.getCanvas().style.cursor = ""
                    })
                } else {
                    // Update existing layer visibility
                    map.setLayoutProperty("recent-incidents", "visibility", visible ? "visible" : "none")
                }

                // Create animation for very recent incidents
                const animatePing = () => {
                    if (!map || !map.getLayer("very-recent-incidents-pulse")) {
                        return
                    }

                    // Create a pulsing effect by changing the size and opacity
                    const pulseSize = (Date.now() % 2000) / 2000 // Values from 0 to 1 every 2 seconds
                    const pulseOpacity = 0.7 - pulseSize * 0.5 // Opacity oscillates between 0.2 and 0.7
                    const scaleFactor = 1 + pulseSize * 0.5 // Size oscillates between 1x and 1.5x

                    map.setPaintProperty("very-recent-incidents-pulse", "circle-opacity", pulseOpacity)
                    map.setPaintProperty("very-recent-incidents-pulse", "circle-radius", [
                        "interpolate",
                        ["linear"],
                        ["zoom"],
                        7,
                        8 * scaleFactor,
                        12,
                        16 * scaleFactor,
                        15,
                        24 * scaleFactor,
                    ])

                    // Continue animation
                    animationFrameRef.current = requestAnimationFrame(animatePing)
                }

                // Start animation if visible
                if (visible) {
                    if (animationFrameRef.current) {
                        cancelAnimationFrame(animationFrameRef.current)
                    }
                    animationFrameRef.current = requestAnimationFrame(animatePing)
                }

                // Ensure click handler is properly registered
                map.off("click", "recent-incidents", handleIncidentClick)
                map.on("click", "recent-incidents", handleIncidentClick)
            } catch (error) {
                console.error("Error setting up recent incidents layer:", error)
            }
        }

        // Check if style is loaded and set up layer accordingly
        if (map.isStyleLoaded()) {
            setupLayerAndSource()
        } else {
            map.once("style.load", setupLayerAndSource)

            // Fallback
            setTimeout(() => {
                if (map.isStyleLoaded()) {
                    setupLayerAndSource()
                } else {
                    console.warn("Map style still not loaded after timeout")
                }
            }, 1000)
        }

        return () => {
            if (map) {
                map.off("click", "recent-incidents", handleIncidentClick)
            }
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current)
            }
        }
    }, [map, visible, recentIncidents, handleIncidentClick, twoHoursInMs])

    return (
        <>
            {selectedIncident && (
                <IncidentLogsPopup
                    longitude={selectedIncident.longitude}
                    latitude={selectedIncident.latitude}
                    onClose={handleClosePopup}
                    incident={selectedIncident}
                />
            )}
        </>
    )
}
