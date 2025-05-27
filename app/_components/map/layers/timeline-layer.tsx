"use client"

import { useEffect, useMemo, useState, useCallback } from "react"
import { Layer, Source } from "react-map-gl/mapbox"
import type { ICrimes } from "@/app/_utils/types/crimes"
import type mapboxgl from "mapbox-gl"
import { format, getMonth, getYear, parseISO } from "date-fns"
import { calculateAverageTimeOfDay } from "@/app/_utils/time"
import TimelinePopup from "../pop-up/timeline-popup"
import { BASE_BEARING, BASE_DURATION, BASE_LATITUDE, BASE_LONGITUDE, BASE_PITCH, BASE_ZOOM, ZOOM_3D } from "@/app/_utils/const/map"

interface TimelineLayerProps {
    crimes: ICrimes[]
    year: string
    month: string
    filterCategory: string | "all"
    visible?: boolean
    map?: mapboxgl.Map | null
    useAllData?: boolean
}

export default function TimelineLayer({
    crimes,
    year,
    month,
    filterCategory,
    visible = false,
    map,
    useAllData = false,
}: TimelineLayerProps) {
    // State for selected district and popup
    const [selectedDistrict, setSelectedDistrict] = useState<any | null>(null)
    const [showTimeZones, setShowTimeZones] = useState<boolean>(true)

    // Process district data to extract average incident times
    const districtTimeData = useMemo(() => {
        // Convert year and month to numbers for comparison
        const selectedYear = parseInt(year);
        const selectedMonth = parseInt(month) - 1; // JS months are 0-indexed
        const isMonthFiltered = month !== "all" && !isNaN(selectedMonth);
        const isYearFiltered = !isNaN(selectedYear);

        // Group incidents by district
        const districtGroups = new Map<
            string,
            {
                districtId: string
                districtName: string
                incidents: Array<{
                    timestamp: Date;
                    category: string;
                    id?: string;
                    title?: string;
                }>
                center: [number, number]
                filteredIncidents: Array<{
                    timestamp: Date;
                    category: string;
                    id?: string;
                    title?: string;
                }>
            }
        >()

        crimes.forEach((crime) => {
            if (!crime.districts || !crime.district_id) return

            // Initialize district group if not exists
            if (!districtGroups.has(crime.district_id)) {
                // Find a central location for the district
                const centerIncident = crime.crime_incidents.find((inc) => inc.locations?.latitude && inc.locations?.longitude)

                const center: [number, number] = centerIncident
                    ? [centerIncident.locations.longitude, centerIncident.locations.latitude]
                    : [0, 0]

                districtGroups.set(crime.district_id, {
                    districtId: crime.district_id,
                    districtName: crime.districts.name,
                    incidents: [],
                    filteredIncidents: [],
                    center,
                })
            }

            // Add all incidents first (for all-time stats)
            crime.crime_incidents.forEach((incident) => {
                // Skip invalid incidents
                if (!incident.timestamp) return

                const incidentDate = new Date(incident.timestamp);
                const group = districtGroups.get(crime.district_id)

                if (group) {
                    // Add to all incidents regardless of filters
                    group.incidents.push({
                        timestamp: incidentDate,
                        category: incident.crime_categories.name,
                        id: incident.id,
                        title: incident.description || incident.crime_categories.name
                    })

                    // Apply filters for filtered incidents
                    const incidentYear = getYear(incidentDate);
                    const incidentMonth = getMonth(incidentDate);

                    // Apply category filter
                    if (filterCategory !== "all" && incident.crime_categories.name !== filterCategory) return;

                    // Apply year filter
                    if (isYearFiltered && incidentYear !== selectedYear) return;

                    // Apply month filter
                    if (isMonthFiltered && incidentMonth !== selectedMonth) return;

                    // Add to filtered incidents
                    group.filteredIncidents.push({
                        timestamp: incidentDate,
                        category: incident.crime_categories.name,
                        id: incident.id,
                        title: incident.description || incident.crime_categories.name
                    })
                }
            })
        })

        // Calculate average time for each district
        const result = Array.from(districtGroups.values())
            .filter((group) => {
                // Only include districts that have incidents after filtering
                const incidentsToUse = useAllData ? group.incidents : group.filteredIncidents;
                return incidentsToUse.length > 0 && group.center[0] !== 0;
            })
            .map((group) => {
                // Choose which set of incidents to use
                const incidentsToUse = useAllData ? group.incidents : group.filteredIncidents;

                // Calculate average times based on filtered or all incidents
                const avgTimeInfo = calculateAverageTimeOfDay(incidentsToUse.map((inc) => inc.timestamp))

                // Format incident data for display in timeline
                const formattedIncidents = incidentsToUse
                    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()) // Sort by most recent first
                    .map(incident => ({
                        id: incident.id || Math.random().toString(36).substring(2),
                        title: incident.title || 'Incident',
                        time: format(incident.timestamp, 'MMM d, yyyy HH:mm'),
                        category: incident.category
                    }))

                return {
                    id: group.districtId,
                    name: group.districtName,
                    center: group.center,
                    avgHour: avgTimeInfo.hour,
                    avgMinute: avgTimeInfo.minute,
                    formattedTime: avgTimeInfo.formattedTime,
                    timeDescription: avgTimeInfo.description,
                    totalIncidents: incidentsToUse.length,
                    timeOfDay: avgTimeInfo.timeOfDay,
                    earliestTime: format(avgTimeInfo.earliest, "p"),
                    latestTime: format(avgTimeInfo.latest, "p"),
                    mostFrequentHour: avgTimeInfo.mostFrequentHour,
                    categoryCounts: incidentsToUse.reduce(
                        (acc, inc) => {
                            acc[inc.category] = (acc[inc.category] || 0) + 1
                            return acc
                        },
                        {} as Record<string, number>,
                    ),
                    incidents: formattedIncidents,
                    selectedFilters: {
                        year: isYearFiltered ? selectedYear.toString() : "all",
                        month: isMonthFiltered ? (selectedMonth + 1).toString().padStart(2, '0') : "all",
                        category: filterCategory,
                        label: `${isYearFiltered ? selectedYear : "All years"}${isMonthFiltered ? ', ' + format(new Date(0, selectedMonth), 'MMMM') : ''}`
                    },
                    allTimeCount: group.incidents.length,
                    useAllData: useAllData
                }
            })

        return result
    }, [crimes, filterCategory, year, month, useAllData])

    // Convert processed data to GeoJSON for display
    const timelineGeoJSON = useMemo(() => {
        return {
            type: "FeatureCollection" as const,
            features: districtTimeData.map((district) => ({
                type: "Feature" as const,
                properties: {
                    id: district.id,
                    name: district.name,
                    avgTime: district.formattedTime,
                    timeDescription: district.timeDescription,
                    totalIncidents: district.totalIncidents,
                    timeOfDay: district.timeOfDay,
                    hour: district.avgHour,
                    minute: district.avgMinute,
                },
                geometry: {
                    type: "Point" as const,
                    coordinates: district.center,
                },
            })),
        }
    }, [districtTimeData])

    // Handle marker click
    const handleMarkerClick = useCallback(
        (e: mapboxgl.MapMouseEvent & { features?: mapboxgl.MapboxGeoJSONFeature[] }) => {
            if (!e.features || e.features.length === 0) return

            // Stop event propagation
            e.originalEvent.stopPropagation()
            e.preventDefault()

            const feature = e.features[0]
            const props = feature.properties
            if (!props) return

            // Get the corresponding district data for detailed info
            const districtData = districtTimeData.find((d) => d.id === props.id)
            if (!districtData) return

            // Fly to the location
            if (map) {
                map.flyTo({
                    center: districtData.center,
                    zoom: ZOOM_3D,
                    duration: BASE_DURATION,
                    pitch: BASE_PITCH,
                    bearing: BASE_BEARING,
                })
            }

            // Set the selected district for popup
            setSelectedDistrict(districtData)
        },
        [map, districtTimeData],
    )

    // Handle popup close
    const handleClosePopup = useCallback(() => {
        if (map) {
            map.easeTo({
                zoom: BASE_ZOOM,
                duration: BASE_DURATION,
                pitch: BASE_PITCH,
                bearing: BASE_BEARING,
            })
        }
        setSelectedDistrict(null)
    }, [])

    // Add an effect to hide other layers when timeline is active
    useEffect(() => {
        if (!map || !visible) return

        // Hide incident markers when timeline mode is activated
        if (map.getLayer("unclustered-point")) {
            map.setLayoutProperty("unclustered-point", "visibility", "none")
        }

        // Hide clusters when timeline mode is activated
        if (map.getLayer("clusters")) {
            map.setLayoutProperty("clusters", "visibility", "none")
        }

        if (map.getLayer("cluster-count")) {
            map.setLayoutProperty("cluster-count", "visibility", "none")
        }

        // Set up event handlers
        const handleMouseEnter = () => {
            if (map) map.getCanvas().style.cursor = "pointer"
        }

        const handleMouseLeave = () => {
            if (map) map.getCanvas().style.cursor = ""
        }

        // Add event listeners
        if (map.getLayer("timeline-markers")) {
            map.on("click", "timeline-markers", handleMarkerClick)
            map.on("mouseenter", "timeline-markers", handleMouseEnter)
            map.on("mouseleave", "timeline-markers", handleMouseLeave)
        }

        return () => {
            // Clean up event listeners
            if (map) {
                map.off("click", "timeline-markers", handleMarkerClick)
                map.off("mouseenter", "timeline-markers", handleMouseEnter)
                map.off("mouseleave", "timeline-markers", handleMouseLeave)
            }
        }
    }, [map, visible, handleMarkerClick])

    // Clean up on unmount or when visibility changes
    useEffect(() => {
        if (!visible) {
            setSelectedDistrict(null)
        }
    }, [visible])

    if (!visible) return null

    return (
        <>
            <Source id="timeline-data" type="geojson" data={timelineGeoJSON}>
                {/* Digital clock background */}
                <Layer
                    id="timeline-markers-bg"
                    type="circle"
                    paint={{
                        "circle-color": [
                            "match",
                            ["get", "timeOfDay"],
                            "morning",
                            "#FFEB3B",
                            "afternoon",
                            "#FF9800",
                            "evening",
                            "#3F51B5",
                            "night",
                            "#263238",
                            "#4CAF50", // Default color
                        ],
                        "circle-radius": [
                            "interpolate",
                            ["linear"],
                            ["get", "totalIncidents"],
                            1, 15,  // Min size
                            100, 25  // Max size
                        ],
                        "circle-stroke-width": 2,
                        "circle-stroke-color": "#000000",
                        "circle-opacity": 0.9,
                    }}
                />

                {/* Digital clock display */}
                <Layer
                    id="timeline-markers"
                    type="symbol"
                    layout={{
                        "text-field": "{avgTime}",
                        "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
                        "text-size": 12,
                        "text-anchor": "center",
                        "text-allow-overlap": true,
                    }}
                    paint={{
                        "text-color": [
                            "match",
                            ["get", "timeOfDay"],
                            "night",
                            "#FFFFFF",
                            "evening",
                            "#FFFFFF",
                            "#000000", // Default text color
                        ],
                        "text-halo-color": "#000000",
                        "text-halo-width": 0.5,
                    }}
                />
            </Source>

            {/* Custom Popup Component */}
            {selectedDistrict && (
                <TimelinePopup
                    longitude={selectedDistrict.center[0]}
                    latitude={selectedDistrict.center[1]}
                    onClose={handleClosePopup}
                    district={selectedDistrict}
                />
            )}
        </>
    )
}
