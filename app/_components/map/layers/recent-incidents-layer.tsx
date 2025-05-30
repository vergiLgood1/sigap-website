"use client"

import { useEffect, useCallback } from "react"
import type { Map, MapMouseEvent, ExpressionSpecification } from "mapbox-gl"
import type { IIncidentLayerProps } from "@/app/_utils/types/map"
import { extractIncidentFeatures } from "@/app/_utils/map/features"


const DEFAULT_CIRCLE_COLOR = "#888888"
const DEFAULT_CIRCLE_RADIUS = 6

type MapboxPaintProperty = {
    "circle-radius": ExpressionSpecification | number;
    "circle-color": ExpressionSpecification;
    "circle-opacity": number;
    "circle-stroke-width": number;
    "circle-stroke-color": string;
}

export default function RecentIncidentsLayer({
    visible = true,
    map,
    incidents = [],
    filterCategory = "all",
    onClick,
}: IIncidentLayerProps) {
    // Helper function to safely check if a layer exists
    const layerExists = useCallback((layerId: string) => {
        if (!map) return false
        try {
            return !!map.getLayer(layerId)
        } catch {
            return false
        }
    }, [map])

    // Helper function to safely set layer visibility
    const setLayerVisibility = useCallback((layerId: string, visible: boolean) => {
        if (!map || !layerExists(layerId)) return
        try {
            map.setLayoutProperty(layerId, "visibility", visible ? "visible" : "none")
        } catch (error) {
            console.warn(`Failed to set visibility for layer ${layerId}:`, error)
        }
    }, [map, layerExists])

    // Helper function to safely set paint property
    const setPaintProperty = useCallback((
        layerId: string,
        property: keyof MapboxPaintProperty,
        value: MapboxPaintProperty[keyof MapboxPaintProperty]
    ) => {
        if (!map || !layerExists(layerId)) return
        try {
            map.setPaintProperty(layerId, property, value)
        } catch (error) {
            console.warn(`Failed to set paint property ${String(property)} for layer ${layerId}:`, error)
        }
    }, [map, layerExists])

    // Helper function to validate circle color expression
    const validateCircleColorExpression = useCallback((expression: any): ExpressionSpecification => {
        const defaultExpression: ExpressionSpecification = [
            "match",
            ["get", "severity"],
            "high",
            "#EC6B56",
            "medium",
            "#FFC154",
            "low",
            "#47B39C",
            DEFAULT_CIRCLE_COLOR
        ]

        if (!Array.isArray(expression)) {
            return defaultExpression
        }

        if (expression[0] === "match" && expression.length < 4) {
            return defaultExpression
        }

        return expression as ExpressionSpecification
    }, [])

    // Helper function to validate circle radius expression
    const validateCircleRadiusExpression = useCallback((expression: any): ExpressionSpecification | number => {
        const defaultExpression: ExpressionSpecification = [
            "interpolate",
            ["linear"],
            ["zoom"],
            10, DEFAULT_CIRCLE_RADIUS,
            15, DEFAULT_CIRCLE_RADIUS * 2
        ]

        if (!expression) {
            return defaultExpression
        }

        if (typeof expression === "number") {
            return expression
        }

        if (!Array.isArray(expression) || expression.length < 4) {
            return defaultExpression
        }

        return expression as ExpressionSpecification
    }, [])

    const handleIncidentClick = useCallback((e: MapMouseEvent) => {
        if (!map || !e.features || e.features.length === 0) return

        const feature = e.features[0]
        const incident = extractIncidentFeatures(feature)

        if (!incident) return

        if (onClick) {
            onClick(incident)
        }
    }, [map, onClick])

    useEffect(() => {
        if (!map || !visible) return

        const onStyleLoad = () => {
            if (!map) return

            try {
                if (!map.getSource("recent-incidents")) {
                    const features = incidents
                        .filter(incident => filterCategory === "all" || incident.category === filterCategory)
                        .map(incident => ({
                            type: "Feature" as const,
                            properties: {
                                id: incident.id,
                                severity: incident.severity?.toLowerCase() || "unknown",
                                category: incident.category,
                                description: incident.description,
                                timestamp: incident.timestamp?.toISOString(),
                            },
                            geometry: {
                                type: "Point" as const,
                                coordinates: [incident.longitude || 0, incident.latitude || 0],
                            },
                        }))

                    map.addSource("recent-incidents", {
                        type: "geojson",
                        data: {
                            type: "FeatureCollection",
                            features,
                        },
                    })

                    const circleColor = validateCircleColorExpression([
                        "match",
                        ["get", "severity"],
                        "high",
                        "#EC6B56",
                        "medium",
                        "#FFC154",
                        "low",
                        "#47B39C",
                        DEFAULT_CIRCLE_COLOR
                    ])

                    const circleRadius = validateCircleRadiusExpression([
                        "interpolate",
                        ["linear"],
                        ["zoom"],
                        10, DEFAULT_CIRCLE_RADIUS,
                        15, DEFAULT_CIRCLE_RADIUS * 2
                    ])

                    if (!layerExists("recent-incidents-points")) {
                        map.addLayer({
                            id: "recent-incidents-points",
                            type: "circle",
                            source: "recent-incidents",
                            paint: {
                                "circle-radius": circleRadius,
                                "circle-color": circleColor,
                                "circle-opacity": 0.7,
                                "circle-stroke-width": 1,
                                "circle-stroke-color": "#ffffff",
                            },
                        })

                        map.on("mouseenter", "recent-incidents-points", () => {
                            if (map) map.getCanvas().style.cursor = "pointer"
                        })

                        map.on("mouseleave", "recent-incidents-points", () => {
                            if (map) map.getCanvas().style.cursor = ""
                        })

                        map.off("click", "recent-incidents-points", handleIncidentClick)
                        map.on("click", "recent-incidents-points", handleIncidentClick)
                    }
                } else {
                    // Update existing source data
                    const source = map.getSource("recent-incidents") as mapboxgl.GeoJSONSource
                    if (source) {
                        const features = incidents
                            .filter(incident => filterCategory === "all" || incident.category === filterCategory)
                            .map(incident => ({
                                type: "Feature" as const,
                                properties: {
                                    id: incident.id,
                                    severity: incident.severity?.toLowerCase() || "unknown",
                                    category: incident.category,
                                    description: incident.description,
                                    timestamp: incident.timestamp?.toISOString(),
                                },
                                geometry: {
                                    type: "Point" as const,
                                    coordinates: [incident.longitude || 0, incident.latitude || 0],
                                },
                            }))

                        source.setData({
                            type: "FeatureCollection",
                            features,
                        })
                    }
                }

                // Update layer visibility
                if (layerExists("recent-incidents-points")) {
                    setLayerVisibility("recent-incidents-points", visible)
                }
            } catch (error) {
                console.error("Error setting up recent incidents layer:", error)
            }
        }

        if (map.isStyleLoaded()) {
            onStyleLoad()
        } else {
            map.once("style.load", onStyleLoad)
        }

        return () => {
            if (map) {
                map.off("click", "recent-incidents-points", handleIncidentClick)
            }
        }
    }, [
        map,
        visible,
        incidents,
        filterCategory,
        handleIncidentClick,
        layerExists,
        setLayerVisibility,
        validateCircleColorExpression,
        validateCircleRadiusExpression
    ])

    return null
}
