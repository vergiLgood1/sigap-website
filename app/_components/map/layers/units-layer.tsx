"use client"

import { useEffect, useMemo, useRef, useState, useCallback } from "react"
import { Layer, Source } from "react-map-gl/mapbox"
import type { ICrimes } from "@/app/_utils/types/crimes"
import type { IUnits } from "@/app/_utils/types/units"
import type mapboxgl from "mapbox-gl"

import { generateCategoryColorMap } from "@/app/_utils/colors"
import UnitPopup from "../pop-up/unit-popup"

import { BASE_BEARING, BASE_DURATION, BASE_PITCH, BASE_ZOOM } from "@/app/_utils/const/map"
import { INearestUnits } from "@/app/(pages)/(admin)/dashboard/crime-management/units/action"
import { useGetNearestUnitsQuery } from "@/app/(pages)/(admin)/dashboard/crime-management/units/_queries/queries"
import IncidentPopup from "../pop-up/incident-popup"
import { manageLayerVisibility } from "@/app/_utils/map/layer-visibility"

interface UnitsLayerProps {
    crimes: ICrimes[]
    units?: IUnits[]
    filterCategory: string | "all"
    visible?: boolean
    map?: mapboxgl.Map | null
}

interface IDistrictIncidents {
    incident_id: string
    category_name: string
    incident_description: string
    distance_meters: number
    timestamp: Date
}

// New interface to better type the incident properties
interface IncidentProperties {
    id: string
    description: string
    category: string
    date: string
    district: string
    district_id: string
    categoryColor: string
    distance_to_unit: number | "Unknown"
    longitude: number
    latitude: number
}

const DEFAULT_CIRCLE_COLOR = "#888888"
const DEFAULT_CIRCLE_RADIUS = 6

type MapboxPaintProperty = {
    "circle-radius": mapboxgl.ExpressionSpecification | number;
    "circle-color": mapboxgl.ExpressionSpecification;
    "circle-opacity": number;
    "circle-stroke-width": number;
    "circle-stroke-color": string;
}

export default function UnitsLayer({ crimes, units = [], filterCategory, visible = false, map }: UnitsLayerProps) {
    const [loadedUnits, setLoadedUnits] = useState<IUnits[]>([])
    const loadedUnitsRef = useRef<IUnits[]>([])

    // For popups
    const [selectedUnit, setSelectedUnit] = useState<IUnits | null>(null)
    const [selectedIncident, setSelectedIncident] = useState<any | null>(null)
    const [selectedEntityId, setSelectedEntityId] = useState<string | undefined>()
    const [isUnitSelected, setIsUnitSelected] = useState<boolean>(false)
    const [selectedDistrictId, setSelectedDistrictId] = useState<string | undefined>()
    const [unitIncident, setUnitIncident] = useState<IDistrictIncidents[]>([])
    const [isLoading, setIsLoading] = useState<boolean>(false)

    const [incidentCoords, setIncidentCoords] = useState<{ lat: number, lon: number } | null>(null)
    const { data: nearestUnits, isLoading: isLoadingNearestUnits } = useGetNearestUnitsQuery(
        incidentCoords?.lat ?? 0,
        incidentCoords?.lon ?? 0,
        5
    )

    // Add a ref to store pre-processed incidents by district for optimization
    const districtIncidentsCache = useRef<Map<string, IDistrictIncidents[]>>(new Map());

    // Define layer IDs for consistent management
    const LAYER_IDS = [
        'units-points',
        'units-symbols',
        'incidents-points',
        'units-connection-lines'
    ];

    // Use either provided units or loaded units
    const unitsData = useMemo(() => {
        return units.length > 0 ? units : loadedUnits || []
    }, [units, loadedUnits])

    // Extract all unique crime categories for color generation
    const uniqueCategories = useMemo(() => {
        const categories = new Set<string>()
        crimes.forEach((crime) => {
            crime.crime_incidents.forEach((incident) => {
                if (incident.crime_categories?.name) {
                    categories.add(incident.crime_categories.name)
                }
            })
        })
        return Array.from(categories)
    }, [crimes])

    // Generate color map for all categories
    const categoryColorMap = useMemo(() => {
        return generateCategoryColorMap(uniqueCategories)
    }, [uniqueCategories])

    // Process units data to GeoJSON format
    const unitsGeoJSON = useMemo(() => {
        return {
            type: "FeatureCollection" as const,
            features: unitsData.map((unit) => {
                return {
                    type: "Feature" as const,
                    properties: {
                        id: unit.code_unit,
                        name: unit.name,
                        address: unit.address,
                        phone: unit.phone,
                        type: unit.type,
                        district: unit.district_name || "",
                        district_id: unit.district_id,
                    },
                    geometry: {
                        type: "Point" as const,
                        coordinates: [
                            Number.parseFloat(String(unit.longitude)) || 0,
                            Number.parseFloat(String(unit.latitude)) || 0,
                        ],
                    },
                }
            }),
        }
    }, [unitsData])

    // Process incident data to GeoJSON format
    const incidentsGeoJSON = useMemo(() => {
        const features: any[] = []

        // Also build the district incidents cache while processing crime data
        const newDistrictIncidentsCache = new Map<string, IDistrictIncidents[]>();

        crimes.forEach((crime) => {
            // Initialize the array for this district if it doesn't exist yet
            if (!newDistrictIncidentsCache.has(crime.district_id)) {
                newDistrictIncidentsCache.set(crime.district_id, []);
            }

            crime.crime_incidents.forEach((incident) => {
                // Skip incidents without location data or filtered by category
                if (
                    !incident.locations?.latitude ||
                    !incident.locations?.longitude ||
                    (filterCategory !== "all" && incident.crime_categories.name !== filterCategory)
                )
                    return

                // Ensure distance_to_unit is properly initialized
                const distance = incident.locations.distance_to_unit !== undefined
                    ? incident.locations.distance_to_unit
                    : "Unknown";

                // Add to district incidents cache for quicker lookup
                if (incident.locations.distance_to_unit !== undefined) {
                    newDistrictIncidentsCache.get(crime.district_id)?.push({
                        incident_id: incident.id,
                        category_name: incident.crime_categories.name,
                        incident_description: incident.description || "No description",
                        distance_meters: incident.locations.distance_to_unit!,
                        timestamp: incident.timestamp,
                    });
                }

                features.push({
                    type: "Feature" as const,
                    properties: {
                        id: incident.id,
                        description: incident.description || "No description",
                        category: incident.crime_categories.name,
                        date: incident.timestamp,
                        district: crime.districts.name,
                        district_id: crime.district_id,
                        categoryColor: categoryColorMap[incident.crime_categories.name] || "#22c55e",
                        distance_to_unit: distance,
                    },
                    geometry: {
                        type: "Point" as const,
                        coordinates: [incident.locations.longitude, incident.locations.latitude],
                    },
                })
            })
        })

        // Update the cache ref with our new data
        districtIncidentsCache.current = newDistrictIncidentsCache;

        return {
            type: "FeatureCollection" as const,
            features,
        }
    }, [crimes, filterCategory, categoryColorMap])

    // Create lines between units and incidents within their districts
    const connectionLinesGeoJSON = useMemo(() => {
        if (!unitsData.length || !crimes.length)
            return {
                type: "FeatureCollection" as const,
                features: [],
            }

        // Map district IDs to their units
        const districtUnitsMap = new Map<string, IUnits[]>()

        unitsData.forEach((unit) => {
            if (!unit.district_id || !unit.longitude || !unit.latitude) return

            if (!districtUnitsMap.has(unit.district_id)) {
                districtUnitsMap.set(unit.district_id, [])
            }
            districtUnitsMap.get(unit.district_id)!.push(unit)
        })

        // Create lines from units to incidents in their district
        const lineFeatures: any[] = []

        crimes.forEach((crime) => {
            // Get all units in this district
            const districtUnits = districtUnitsMap.get(crime.district_id) || []
            if (!districtUnits.length) return

            // For each incident in this district
            crime.crime_incidents.forEach((incident) => {
                // Skip incidents without location data or filtered by category
                if (
                    !incident.locations?.latitude ||
                    !incident.locations?.longitude ||
                    (filterCategory !== "all" && incident.crime_categories.name !== filterCategory)
                )
                    return

                // Create a line from each unit in this district to this incident
                districtUnits.forEach((unit) => {
                    if (!unit.longitude || !unit.latitude) return

                    lineFeatures.push({
                        type: "Feature" as const,
                        properties: {
                            unit_id: unit.code_unit,
                            unit_name: unit.name,
                            incident_id: incident.id,
                            district_id: crime.district_id,
                            district_name: crime.districts.name,
                            category: incident.crime_categories.name,
                            lineColor: categoryColorMap[incident.crime_categories.name] || "#22c55e",
                        },
                        geometry: {
                            type: "LineString" as const,
                            coordinates: [
                                [unit.longitude, unit.latitude],
                                [incident.locations.longitude, incident.locations.latitude],
                            ],
                        },
                    })
                })
            })
        })

        return {
            type: "FeatureCollection" as const,
            features: lineFeatures,
        }
    }, [unitsData, crimes, filterCategory, categoryColorMap])

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
    const validateCircleColorExpression = useCallback((expression: any): mapboxgl.ExpressionSpecification => {
        const defaultExpression: mapboxgl.ExpressionSpecification = [
            "match",
            ["get", "status"],
            "on duty",
            "#4CAF50",
            "off duty",
            "#FF5252",
            "on break",
            "#FFC107",
            DEFAULT_CIRCLE_COLOR
        ]

        if (!Array.isArray(expression)) {
            return defaultExpression
        }

        if (expression[0] === "match" && expression.length < 4) {
            return defaultExpression
        }

        return expression as mapboxgl.ExpressionSpecification
    }, [])

    // Helper function to validate circle radius expression
    const validateCircleRadiusExpression = useCallback((expression: any): mapboxgl.ExpressionSpecification | number => {
        const defaultExpression: mapboxgl.ExpressionSpecification = [
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

        return expression as mapboxgl.ExpressionSpecification
    }, [])

    // Handle unit click
    const handleUnitClick = useCallback(
        (
            map: mapboxgl.Map,
            unitsData: IUnits[],
            setSelectedUnit: (unit: IUnits | null) => void,
            setSelectedIncident: (incident: any | null) => void,
            setSelectedEntityId: (id: string | undefined) => void,
            setIsUnitSelected: (isSelected: boolean) => void,
            setSelectedDistrictId: (id: string | undefined) => void,
        ) =>
            (e: mapboxgl.MapMouseEvent & { features?: mapboxgl.MapboxGeoJSONFeature[] }) => {
                if (!e.features || e.features.length === 0) return

                // Stop event propagation to prevent district layer from handling this click
                e.originalEvent.stopPropagation()
                e.preventDefault()

                const feature = e.features[0]
                const properties = feature.properties

                if (!properties) return

                // Find the unit in our data
                const unit = unitsData.find((u) => u.code_unit === properties.id)

                if (!unit) {
                    console.log("Unit not found in data:", properties.id)
                    return
                }

                setIsLoading(true)

                // Early exit if district_id is not available
                if (!unit.district_id) {
                    console.log("Unit has no district ID")
                    setUnitIncident([])
                    setIsLoading(false)
                    return
                }

                // Use the pre-processed district incidents from cache
                let districtIncidents = districtIncidentsCache.current.get(unit.district_id) || [];

                // If we don't have them in cache for some reason, compute them now
                if (districtIncidents.length === 0) {
                    const tempIncidents: IDistrictIncidents[] = [];

                    // Only process crimes for this specific district
                    crimes
                        .filter(crime => crime.district_id === unit.district_id)
                        .forEach(crime => {
                            crime.crime_incidents.forEach(incident => {
                                if (incident.locations && typeof incident.locations.distance_to_unit !== "undefined") {
                                    tempIncidents.push({
                                        incident_id: incident.id,
                                        category_name: incident.crime_categories.name,
                                        incident_description: incident.description || "No description",
                                        distance_meters: incident.locations.distance_to_unit!,
                                        timestamp: incident.timestamp,
                                    });
                                }
                            });
                        });

                    districtIncidents = tempIncidents;
                }

                // Sort by distance (closest first)
                districtIncidents.sort((a, b) => a.distance_meters - b.distance_meters);

                // Update the state with the distance results
                setUnitIncident(districtIncidents)
                setIsLoading(false)

                // Fly to the unit location
                map.flyTo({
                    center: [unit.longitude || 0, unit.latitude || 0],
                    zoom: 12.5,
                    pitch: 45,
                    bearing: BASE_BEARING,
                    duration: BASE_DURATION,
                })  

                // Set the selected unit and query parameters
                setSelectedUnit(unit)
                setSelectedIncident(null) // Clear any selected incident
                setSelectedEntityId(properties.id)
                setIsUnitSelected(true)
                setSelectedDistrictId(properties.district_id)

                // Highlight the connected lines for this unit
                if (map.getLayer("units-connection-lines")) {
                    map.setFilter("units-connection-lines", ["==", ["get", "unit_id"], properties.id])
                }

                // Dispatch a custom event for other components to react to
                const customEvent = new CustomEvent("unit_click", {
                    detail: {
                        unitId: properties.id,
                        districtId: properties.district_id,
                        name: properties.name,
                        longitude: feature.geometry.type === "Point" ? (feature.geometry as any).coordinates[0] : 0,
                        latitude: feature.geometry.type === "Point" ? (feature.geometry as any).coordinates[1] : 0,
                    },
                    bubbles: true,
                })

                map.getCanvas().dispatchEvent(customEvent)
                document.dispatchEvent(customEvent)
            },
        [crimes], // Add crimes as a dependency
    )

    // Handle incident click
    const handleIncidentClick = useCallback(
        (
            map: mapboxgl.Map,
            setSelectedIncident: (incident: any | null) => void,
            setSelectedUnit: (unit: IUnits | null) => void,
            setSelectedEntityId: (id: string | undefined) => void,
            setIsUnitSelected: (isSelected: boolean) => void,
            setSelectedDistrictId: (id: string | undefined) => void,
        ) =>
            (e: mapboxgl.MapMouseEvent & { features?: mapboxgl.MapboxGeoJSONFeature[] }) => {
                if (!e.features || e.features.length === 0) return

                // Stop event propagation
                e.originalEvent.stopPropagation()
                e.preventDefault()

                const feature = e.features[0]
                const properties = feature.properties

                if (!properties) return

                // Get coordinates
                const longitude = feature.geometry.type === "Point" ? (feature.geometry as any).coordinates[0] : 0
                const latitude = feature.geometry.type === "Point" ? (feature.geometry as any).coordinates[1] : 0

                // Fly to the incident location
                map.flyTo({
                    center: [longitude, latitude],
                    zoom: 16,
                    pitch: 45,
                    bearing: BASE_BEARING,
                    duration: BASE_DURATION,
                })

                // Ensure distance_to_unit has a value - use the value from GeoJSON properties directly
                // This ensures we use the same data that was calculated for the GeoJSON
                let distanceToUnit = properties.distance_to_unit;

                // Create incident object from properties
                const incident = {
                    id: properties.id,
                    category: properties.category,
                    description: properties.description,
                    date: properties.date,
                    district: properties.district,
                    district_id: properties.district_id,
                    distance_to_unit: distanceToUnit,
                    longitude,
                    latitude,
                }

                // Set the selected incident and query parameters
                setSelectedIncident(incident)
                setSelectedUnit(null) // Clear any selected unit
                setSelectedEntityId(properties.id)
                setIsUnitSelected(false)
                setSelectedDistrictId(properties.district_id)
                setIncidentCoords({ lat: latitude, lon: longitude })

                // Highlight the connected lines for this incident
                if (map.getLayer("units-connection-lines")) {
                    map.setFilter("units-connection-lines", ["==", ["get", "incident_id"], properties.id])
                }

                //  Dispatch a custom event for other components to react to
                const customEvent = new CustomEvent("incident_click", {
                    detail: {
                        id: properties.id,
                        district: properties.district,
                        category: properties.category,
                        description: properties.description,
                        distance_to_unit: distanceToUnit,
                        longitude,
                        latitude,
                    },
                    bubbles: true,
                })

                map.getCanvas().dispatchEvent(customEvent)
                document.dispatchEvent(customEvent)
            },
        [],
    )

    const unitClickHandler = useMemo(
        () =>
            handleUnitClick(
                map as mapboxgl.Map,
                unitsData,
                setSelectedUnit,
                setSelectedIncident,
                setSelectedEntityId,
                setIsUnitSelected,
                setSelectedDistrictId,
            ),
        [
            map,
            unitsData,
            setSelectedUnit,
            setSelectedIncident,
            setSelectedEntityId,
            setIsUnitSelected,
            setSelectedDistrictId,
        ],
    )

    const incidentClickHandler = useMemo(
        () =>
            handleIncidentClick(
                map as mapboxgl.Map,
                setSelectedIncident,
                setSelectedUnit,
                setSelectedEntityId,
                setIsUnitSelected,
                setSelectedDistrictId,
            ),
        [map, setSelectedIncident, setSelectedUnit, setSelectedEntityId, setIsUnitSelected, setSelectedDistrictId],
    )

    // Set up event handlers
    useEffect(() => {
        if (!map || !visible) return

        // Debug log untuk memeriksa keberadaan layer
        // console.log("Setting up event handlers, map layers:",
        //     map.getStyle().layers?.filter(l =>
        //         l.id === "units-points" || l.id === "incidents-points"
        //     ).map(l => l.id)
        // )

        // Define event handlers that can be referenced for both adding and removing
        const handleMouseEnter = () => {
            map.getCanvas().style.cursor = "pointer"
        }

        const handleMouseLeave = () => {
            map.getCanvas().style.cursor = ""
        }

        // Fungsi untuk setup event handler
        const setupHandlers = () => {
            // Add click event for units-points layer
            if (map.getLayer("units-points")) {
                map.off("click", "units-points", unitClickHandler)
                map.on("click", "units-points", unitClickHandler)
                map.on("mouseenter", "units-points", handleMouseEnter)
                map.on("mouseleave", "units-points", handleMouseLeave)
                // console.log("✅ Unit points handler attached")
            } else {
                console.log("❌ units-points layer not found")
            }

            // Add click event for incidents-points layer
            if (map.getLayer("incidents-points")) {
                map.off("click", "incidents-points", incidentClickHandler)
                map.on("click", "incidents-points", incidentClickHandler)
                map.on("mouseenter", "incidents-points", handleMouseEnter)
                map.on("mouseleave", "incidents-points", handleMouseLeave)
                // console.log("✅ Incident points handler attached")
            } else {
                console.log("❌ incidents-points layer not found")
            }
        }

        // Setup handlers langsung
        setupHandlers()

        // Safety check: pastikan handler terpasang setelah layer mungkin dimuat
        const checkLayersTimeout = setTimeout(() => {
            setupHandlers()
        }, 1000)

        // Listen for style.load event to reattach handlers setelah perubahan style
        map.on('style.load', setupHandlers)
        map.on('sourcedata', (e) => {
            if (e.sourceId === 'incidents-source' && e.isSourceLoaded && map.getLayer('incidents-points')) {
                setupHandlers()
            }
        })

        return () => {
            clearTimeout(checkLayersTimeout)
            map.off('style.load', setupHandlers)

            if (map) {
                if (map.getLayer("units-points")) {
                    map.off("click", "units-points", unitClickHandler)
                    map.off("mouseenter", "units-points", handleMouseEnter)
                    map.off("mouseleave", "units-points", handleMouseLeave)
                }

                if (map.getLayer("incidents-points")) {
                    map.off("click", "incidents-points", incidentClickHandler)
                    map.off("mouseenter", "incidents-points", handleMouseEnter)
                    map.off("mouseleave", "incidents-points", handleMouseLeave)
                }
            }
        }
    }, [map, visible, unitClickHandler, incidentClickHandler])

    // Reset map filters when popup is closed
    const handleClosePopup = useCallback(() => {
        // console.log("Closing popup, clearing selected states")
        setSelectedUnit(null)
        setSelectedIncident(null)
        setSelectedEntityId(undefined)
        setSelectedDistrictId(undefined)
        setUnitIncident([])
        setIsLoading(false)

        if (map && map.getLayer("units-connection-lines")) {
            map.easeTo({
                zoom: BASE_ZOOM,
                pitch: BASE_PITCH,
                bearing: BASE_BEARING,
                duration: BASE_DURATION,
                easing: (t) => t * (2 - t),
            })

            map.setFilter("units-connection-lines", ["has", "unit_id"])
        }
    }, [map])

    // Use centralized layer visibility management
    useEffect(() => {
        if (!map) return;

        const cleanup = manageLayerVisibility(map, LAYER_IDS, visible, () => {
            if (!visible) {
                handleClosePopup();
            }
        });

        return cleanup;
    }, [map, visible, handleClosePopup]);

    // Clean up on unmount or when visibility changes
    useEffect(() => {
        if (!visible) {
            handleClosePopup()
        }
    }, [visible, handleClosePopup])

    if (!visible) return null

    return (
        <>
            {/* Units Points */}
            <Source id="units-source" type="geojson" data={unitsGeoJSON}>
                <Layer
                    id="units-points"
                    type="circle"
                    paint={{
                        "circle-radius": 8,
                        "circle-color": "#1e40af", // Deep blue for police units
                        "circle-stroke-width": 2,
                        "circle-stroke-color": "#ffffff",
                        "circle-opacity": 0.8,
                    }}
                />

                {/* Units Symbols */}
                <Layer
                    id="units-symbols"
                    type="symbol"
                    layout={{
                        "text-field": ["get", "name"],
                        "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
                        "text-size": 12,
                        "text-offset": [0, -2],
                        "text-anchor": "bottom",
                        "text-allow-overlap": false,
                        "text-ignore-placement": false,
                    }}
                    paint={{
                        "text-color": "#ffffff",
                        "text-halo-color": "#000000",
                        "text-halo-width": 1,
                    }}
                />
            </Source>

            {/* Incidents Points */}
            <Source id="incidents-source" type="geojson" data={incidentsGeoJSON}>
                <Layer
                    id="incidents-points"
                    type="circle"
                    paint={{
                        "circle-radius": 6,
                        // Use the pre-computed color stored in the properties
                        "circle-color": ["get", "categoryColor"],
                        "circle-stroke-width": 1,
                        "circle-stroke-color": "#ffffff",
                        "circle-opacity": 0.8,
                    }}
                />
            </Source>

            {/* Connection Lines */}
            <Source id="units-lines-source" type="geojson" data={connectionLinesGeoJSON}>
                <Layer
                    id="units-connection-lines"
                    type="line"
                    paint={{
                        // Use the pre-computed color stored in the properties
                        "line-color": ["get", "lineColor"],
                        "line-width": 3,
                        "line-opacity": 0.9,
                        "line-blur": 0.5,
                        "line-dasharray": [3, 1],
                    }}
                />
            </Source>

            {/* Custom Unit Popup */}
            {selectedUnit && (
                <UnitPopup
                    longitude={selectedUnit.longitude || 0}
                    latitude={selectedUnit.latitude || 0}
                    onClose={handleClosePopup}
                    unit={{
                        id: selectedUnit.code_unit,
                        name: selectedUnit.name,
                        type: selectedUnit.type,
                        address: selectedUnit.address || "No address",
                        phone: selectedUnit.phone || "No phone",
                        district: selectedUnit.district_name || "No district",
                        district_id: selectedUnit.district_id,
                    }}
                    incidents={unitIncident}
                    isLoadingIncidents={isLoading}
                />
            )}

            {/* Custom Incident Popup */}
            {selectedIncident && (
                <IncidentPopup
                    longitude={selectedIncident.longitude}
                    latitude={selectedIncident.latitude}
                    onClose={handleClosePopup}
                    incident={selectedIncident}
                    nearestUnit={nearestUnits}
                    isLoadingNearestUnit={isLoadingNearestUnits}
                />
            )}
        </> 
    )
}
