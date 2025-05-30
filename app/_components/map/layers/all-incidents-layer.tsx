"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ICrimes } from "@/app/_utils/types/crimes";
import {
    BASE_BEARING,
    BASE_DURATION,
    BASE_PITCH,
    BASE_ZOOM,
    PITCH_3D,
    ZOOM_3D,
} from "@/app/_utils/const/map";
import IncidentPopup from "../pop-up/incident-popup";
import type mapboxgl from "mapbox-gl";
import type { MapGeoJSONFeature, MapMouseEvent } from "react-map-gl/mapbox";
import { manageLayerVisibility } from "@/app/_utils/map/layer-visibility";
import { getCategoryColor } from "@/app/_utils/colors";
import type { Map, ExpressionSpecification } from "mapbox-gl";


interface IAllIncidentsLayerProps {
    visible?: boolean;
    map: mapboxgl.Map | null;
    crimes: ICrimes[];
    filterCategory: string | "all";
}

interface IIncidentFeatureProperties {
    id: string;
    category: string;
    description: string;
    timestamp: string;
    district: string;
    district_id: string;
    year: number;
    month: number;
    address: string | null;
    latitude: number;
    longitude: number;
}

interface IIncidentDetails {
    id: string;
    category: string;
    description: string;
    timestamp: Date;
    district: string;
    district_id: string;
    year: number;
    month: number;
    address: string | null;
    latitude: number;
    longitude: number;
}

const DEFAULT_CIRCLE_COLOR = "#888888";
const DEFAULT_CIRCLE_RADIUS = 6;

type MapboxPaintProperty = {
    "circle-radius": ExpressionSpecification | number;
    "circle-color": ExpressionSpecification;
    "circle-opacity": number;
    "circle-stroke-width": number;
    "circle-stroke-color": string;
};

export default function AllIncidentsLayer(
    { visible = false, map, crimes = [], filterCategory = "all" }:
        IAllIncidentsLayerProps,
) {
    const isInteractingWithMarker = useRef(false);
    const animationFrameRef = useRef<number | null>(null);
    const [selectedIncident, setSelectedIncident] = useState<
        IIncidentDetails | null
    >(null);

    // Define layer IDs for consistent management
    const LAYER_IDS = [
        "all-incidents-pulse",
        "all-incidents-circles",
        "all-incidents",
    ];

    // Helper function to safely check if a layer exists
    const layerExists = useCallback((layerId: string) => {
        if (!map) return false;
        try {
            return !!map.getLayer(layerId);
        } catch {
            return false;
        }
    }, [map]);

    // Helper function to safely set layer visibility
    const setLayerVisibility = useCallback((layerId: string, visible: boolean) => {
        if (!map || !layerExists(layerId)) return;
        try {
            map.setLayoutProperty(layerId, "visibility", visible ? "visible" : "none");
        } catch (error) {
            console.warn(`Failed to set visibility for layer ${layerId}:`, error);
        }
    }, [map, layerExists]);

    // Helper function to safely set paint property
    const setPaintProperty = useCallback((
        layerId: string,
        property: keyof MapboxPaintProperty,
        value: MapboxPaintProperty[keyof MapboxPaintProperty]
    ) => {
        if (!map || !layerExists(layerId)) return;
        try {
            map.setPaintProperty(layerId, property, value);
        } catch (error) {
            console.warn(`Failed to set paint property ${String(property)} for layer ${layerId}:`, error);
        }
    }, [map, layerExists]);

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
        ];

        if (!Array.isArray(expression)) {
            return defaultExpression;
        }

        if (expression[0] === "match" && expression.length < 4) {
            return defaultExpression;
        }

        return expression as ExpressionSpecification;
    }, []);

    // Helper function to validate circle radius expression
    const validateCircleRadiusExpression = useCallback((expression: any): ExpressionSpecification | number => {
        const defaultExpression: ExpressionSpecification = [
            "interpolate",
            ["linear"],
            ["zoom"],
            10, DEFAULT_CIRCLE_RADIUS,
            15, DEFAULT_CIRCLE_RADIUS * 2
        ];

        if (!expression) {
            return defaultExpression;
        }

        if (typeof expression === "number") {
            return expression;
        }

        if (!Array.isArray(expression) || expression.length < 4) {
            return defaultExpression;
        }

        return expression as ExpressionSpecification;
    }, []);

    const handleIncidentClick = useCallback(
        (e: MapMouseEvent & { features?: MapGeoJSONFeature[] }) => {
            if (!map) return;

            const features = map.queryRenderedFeatures(e.point, {
                layers: ["all-incidents"],
            });
            if (!features || features.length === 0) return;

            // Stop event propagation
            e.originalEvent.stopPropagation();
            e.preventDefault();

            isInteractingWithMarker.current = true;

            const incident = features[0];
            if (!incident.properties) return;

            const props = incident
                .properties as unknown as IIncidentFeatureProperties;

            const IincidentDetails: IIncidentDetails = {
                id: props.id,
                description: props.description,
                category: props.category,
                district: props.district,
                district_id: props.district_id,
                year: props.year,
                month: props.month,
                address: props.address,
                latitude: props.latitude,
                longitude: props.longitude,
                timestamp: new Date(props.timestamp || Date.now()),
            };

            // Fly to the incident location
            map.flyTo({
                center: [IincidentDetails.longitude, IincidentDetails.latitude],
                zoom: ZOOM_3D,
                bearing: BASE_BEARING,
                pitch: PITCH_3D,
                duration: BASE_DURATION,
            });

            // Set selected incident for the popup
            setSelectedIncident(IincidentDetails);

            // Reset the flag after a delay
            setTimeout(() => {
                isInteractingWithMarker.current = false;
            }, 1000);
        },
        [map],
    );

    // Handle popup close
    const handleClosePopup = useCallback(() => {
        if (!map) return;

        map.easeTo({
            zoom: BASE_ZOOM,
            bearing: BASE_BEARING,
            pitch: BASE_PITCH,
            duration: BASE_DURATION,
        });

        setSelectedIncident(null);
    }, [map]);

    // Effect to manage layer visibility consistently
    useEffect(() => {
        if (!map) return;

        // Handle visibility changes
        const setLayersVisibility = (isVisible: boolean) => {
            LAYER_IDS.forEach(layerId => {
                if (map.getLayer(layerId)) {
                    map.setLayoutProperty(
                        layerId,
                        'visibility',
                        isVisible ? 'visible' : 'none'
                    );
                }
            });

            // When layers become invisible, close any open popup
            if (!isVisible) {
                setSelectedIncident(null);

                // Cancel animation frame when hiding the layer
                if (animationFrameRef.current) {
                    cancelAnimationFrame(animationFrameRef.current);
                    animationFrameRef.current = null;
                }
            }
        };

        // Apply visibility immediately when it changes
        setLayersVisibility(visible);

        return () => {
            // Ensure layers are hidden when component unmounts
            setLayersVisibility(false);

            // Cancel any pending animation frames
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
                animationFrameRef.current = null;
            }
        };
    }, [visible, map]);

    useEffect(() => {
        if (!map || !visible) return;

        // Get unique categories from crime data for more accurate color mapping
        const uniqueCategories = new Set<string>();
        crimes.forEach(crime => {
            crime.crime_incidents.forEach(incident => {
                if (incident.crime_categories?.name) {
                    uniqueCategories.add(incident.crime_categories.name);
                }
            });
        });

        // Pre-compute category colors for better performance
        const categoryColorMap: Record<string, string> = {};
        uniqueCategories.forEach(category => {
            categoryColorMap[category] = getCategoryColor(category);
        });

        // Convert incidents to GeoJSON format
        const allIncidents = crimes.flatMap((crime) => {
            return crime.crime_incidents
                .filter((incident) =>
                    // Apply category filter if specified
                    (filterCategory === "all" ||
                        incident.crime_categories?.name === filterCategory) &&
                    // Make sure we have valid location data
                    incident.locations?.latitude &&
                    incident.locations?.longitude
                )
                .map((incident) => ({
                    type: "Feature" as const,
                    geometry: {
                        type: "Point" as const,
                        coordinates: [
                            incident.locations!.longitude,
                            incident.locations!.latitude,
                        ],
                    },
                    properties: {
                        id: incident.id,
                        description: incident.description || "No description",
                        timestamp: incident.timestamp?.toString() ||
                            new Date().toString(),
                        category: incident.crime_categories?.name || "Unknown",
                        district: crime.districts?.name || "Unknown",
                        district_id: crime.district_id,
                        year: crime.year,
                        month: crime.month,
                        address: incident.locations?.address || null,
                        latitude: incident.locations!.latitude,
                        longitude: incident.locations!.longitude,
                    },
                }));
        });

        const incidentsGeoJSON = {
            type: "FeatureCollection" as const,
            features: allIncidents,
        };

        const setupLayersAndSources = () => {
            try {
                // Check if source already exists and update it
                if (map.getSource("all-incidents-source")) {
                    const source = map.getSource(
                        "all-incidents-source",
                    ) as mapboxgl.GeoJSONSource;
                    source.setData(incidentsGeoJSON);
                } else {
                    // Add source if it doesn't exist
                    map.addSource("all-incidents-source", {
                        type: "geojson",
                        data: incidentsGeoJSON,
                    });

                    // Get first symbol layer for insertion order
                    const layers = map.getStyle().layers;
                    let firstSymbolId: string | undefined;
                    for (const layer of layers) {
                        if (layer.type === "symbol") {
                            firstSymbolId = layer.id;
                            break;
                        }
                    }

                    // Pulsing circle effect for very recent incidents
                    map.addLayer({
                        id: "all-incidents-pulse",
                        type: "circle",
                        source: "all-incidents-source",
                        paint: {
                            "circle-radius": [
                                "interpolate",
                                ["linear"],
                                ["zoom"],
                                10,
                                10,
                                15,
                                20,
                            ],
                            "circle-color": [
                                "match",
                                ["get", "category"],
                                // Use dynamic mapping from pre-computed category colors
                                ...Object.entries(categoryColorMap).flatMap(
                                    ([category, color]) => [category, color]
                                ),
                                // Default color for other categories
                                getCategoryColor("Unknown")
                            ],
                            "circle-opacity": 0.4,
                            "circle-blur": 0.6,
                        },
                    }, firstSymbolId);

                    // Background circle for all incidents
                    map.addLayer({
                        id: "all-incidents-circles",
                        type: "circle",
                        source: "all-incidents-source",
                        paint: {
                            "circle-radius": [
                                "interpolate",
                                ["linear"],
                                ["zoom"],
                                10,
                                5,
                                15,
                                10,
                            ],
                            "circle-color": [
                                "match",
                                ["get", "category"],
                                // Use dynamic mapping from pre-computed category colors
                                ...Object.entries(categoryColorMap).flatMap(
                                    ([category, color]) => [category, color]
                                ),
                                // Default color for other categories
                                getCategoryColor("Unknown")
                            ],
                            "circle-stroke-width": 1,
                            "circle-stroke-color": "#FFFFFF",
                            "circle-opacity": 0.6,
                        },
                    }, firstSymbolId);

                    // Main incident point
                    map.addLayer({
                        id: "all-incidents",
                        type: "circle",
                        source: "all-incidents-source",
                        paint: {
                            "circle-radius": [
                                "interpolate",
                                ["linear"],
                                ["zoom"],
                                10,
                                3,
                                15,
                                6,
                            ],
                            "circle-color": [
                                "match",
                                ["get", "category"],
                                // Use dynamic mapping from pre-computed category colors
                                ...Object.entries(categoryColorMap).flatMap(
                                    ([category, color]) => [category, color]
                                ),
                                // Default color for other categories
                                getCategoryColor("Unknown")
                            ],
                            "circle-stroke-width": 1,
                            "circle-stroke-color": "#FFFFFF",
                            "circle-opacity": 1,
                        },
                    }, firstSymbolId);
                }

                // Add mouse events
                map.on("mouseenter", "all-incidents", () => {
                    map.getCanvas().style.cursor = "pointer";
                });

                map.on("mouseleave", "all-incidents", () => {
                    map.getCanvas().style.cursor = "";
                });

                map.on("click", "all-incidents", handleIncidentClick);
            } catch (error) {
                console.error("Error setting up all incidents layer:", error);
            }
        };

        // Set up layers when the map is ready
        if (map.isStyleLoaded()) {
            setupLayersAndSources();
        } else {
            map.once("load", setupLayersAndSources);
        }

        // Start the pulse animation effect
        const animatePulse = () => {
            if (!map || !visible || !map.getLayer("all-incidents-pulse")) {
                if (animationFrameRef.current) {
                    cancelAnimationFrame(animationFrameRef.current);
                    animationFrameRef.current = null;
                }
                return;
            }

            const pulseSize = 10 + 5 * Math.sin(Date.now() / 500);

            try {
                map.setPaintProperty("all-incidents-pulse", "circle-radius", [
                    "interpolate",
                    ["linear"],
                    ["zoom"],
                    10,
                    pulseSize,
                    15,
                    pulseSize * 2,
                ]);

                animationFrameRef.current = requestAnimationFrame(animatePulse);
            } catch (error) {
                if (animationFrameRef.current) {
                    cancelAnimationFrame(animationFrameRef.current);
                    animationFrameRef.current = null;
                }
            }
        };

        animationFrameRef.current = requestAnimationFrame(animatePulse);

        // Clean up event listeners and animation
        return () => {
            if (map) {
                map.off("click", "all-incidents", handleIncidentClick);
                map.off("mouseenter", "all-incidents", () => {
                    map.getCanvas().style.cursor = "pointer";
                });
                map.off("mouseleave", "all-incidents", () => {
                    map.getCanvas().style.cursor = "";
                });
            }

            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
                animationFrameRef.current = null;
            }
        };
    }, [map, visible, crimes, filterCategory, handleIncidentClick]);

    // Custom event listener for showing incident popup
    useEffect(() => {
        if (!map || !visible) return;

        // Handler for the custom "show-incident-popup" event
        const handleShowIncidentPopup = (event: Event) => {
            const customEvent = event as CustomEvent;
            if (!customEvent.detail) return;

            const {
                id,
                longitude,
                latitude,
                description,
                category,
                status,
                timestamp,
                address,
            } = customEvent.detail;

            // Create an incident details object to show in the popup
            const incidentDetails: IIncidentDetails = {
                id,
                description,
                category,
                district: "", // This might be populated from other data if available
                district_id: "",
                year: 0,
                month: 0,
                address,
                latitude,
                longitude,
                timestamp: new Date(timestamp || Date.now()),
            };

            // Set the selected incident to display the popup
            setSelectedIncident(incidentDetails);
        };

        // Add event listener
        document.addEventListener("show-incident-popup", handleShowIncidentPopup);

        // Remove event listener on cleanup
        return () => {
            document.removeEventListener("show-incident-popup", handleShowIncidentPopup);
        };
    }, [map, visible]);

    return (
        <>
            {selectedIncident && (
                <IncidentPopup
                    longitude={selectedIncident.longitude}
                    latitude={selectedIncident.latitude}
                    onClose={handleClosePopup}
                    incident={selectedIncident}
                />
            )}
        </>
    );
}
