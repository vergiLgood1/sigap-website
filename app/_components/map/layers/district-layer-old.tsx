// "use client"

// import { useEffect, useState, useRef, useCallback } from "react"
// import { useMap } from "react-map-gl/mapbox"
// import { BASE_BEARING, BASE_PITCH, BASE_ZOOM, CRIME_RATE_COLORS, MAPBOX_TILESET_ID } from "@/app/_utils/const/map"

// import { $Enums } from "@prisma/client"
// import DistrictPopup from "../pop-up/district-popup"
// import type { ICrimes } from "@/app/_utils/types/crimes"

// // Types for district properties
// export interface DistrictFeature {
//     id: string
//     name: string
//     longitude: number
//     latitude: number
//     number_of_crime: number
//     level: $Enums.crime_rates
//     demographics: {
//         number_of_unemployed: number
//         population: number
//         population_density: number
//         year: number
//     }
//     geographics: {
//         address: string
//         land_area: number
//         year: number
//         latitude: number
//         longitude: number
//     }
//     crime_incidents: Array<{
//         id: string
//         timestamp: Date
//         description: string
//         status: string
//         category: string
//         type: string
//         address: string
//         latitude: number
//         longitude: number
//     }>
//     selectedYear?: string
//     selectedMonth?: string
//     isFocused?: boolean // Add a property to track if district is focused
// }

// // District layer props
// export interface DistrictLayerProps {
//     visible?: boolean // New prop to control visibility
//     onClick?: (feature: DistrictFeature) => void
//     year: string
//     month: string
//     filterCategory: string | "all"
//     crimes: ICrimes[]
//     tilesetId?: string
// }

// export default function DistrictLayer({
//     visible = true,
//     onClick,
//     year,
//     month,
//     filterCategory = "all",
//     crimes = [],
//     tilesetId = MAPBOX_TILESET_ID,
// }: DistrictLayerProps) {
//     const { current: map } = useMap()

//     const [hoverInfo, setHoverInfo] = useState<{
//         x: number
//         y: number
//         feature: any
//     } | null>(null)

//     const selectedDistrictRef = useRef<DistrictFeature | null>(null)
//     const [selectedDistrict, setSelectedDistrict] = useState<DistrictFeature | null>(null)
//     const [focusedDistrictId, setFocusedDistrictId] = useState<string | null>(null)
//     const rotationAnimationRef = useRef<number | null>(null)
//     const bearingRef = useRef(0)
//     const layersAdded = useRef(false)

//     const crimeDataByDistrict = crimes.reduce(
//         (acc, crime) => {
//             const districtId = crime.district_id

//             acc[districtId] = {
//                 number_of_crime: crime.number_of_crime,
//                 level: crime.level,
//             }
//             return acc
//         },
//         {} as Record<string, { number_of_crime?: number; level?: $Enums.crime_rates }>,
//     )

//     const handleDistrictClick = (e: any) => {
//         const incidentFeatures = map?.queryRenderedFeatures(e.point, { layers: ["unclustered-point", "clusters"] })

//         if (incidentFeatures && incidentFeatures.length > 0) {
//             return
//         }

//         if (!map || !e.features || e.features.length === 0) return

//         const feature = e.features[0]
//         const districtId = feature.properties.kode_kec

//         // If clicking the same district, deselect it
//         if (focusedDistrictId === districtId) {
//             setFocusedDistrictId(null)
//             selectedDistrictRef.current = null
//             setSelectedDistrict(null)

//             // Reset animation and map view when deselecting
//             if (rotationAnimationRef.current) {
//                 cancelAnimationFrame(rotationAnimationRef.current)
//                 rotationAnimationRef.current = null
//             }

//             bearingRef.current = 0

//             // Reset pitch and bearing with animation
//             map.easeTo({
//                 pitch: BASE_PITCH,
//                 bearing: 0,
//                 duration: 1500,
//                 easing: (t) => t * (2 - t), // easeOutQuad
//             })

//             // Show all clusters again when unfocusing
//             if (map.getMap().getLayer("clusters")) {
//                 map.getMap().setLayoutProperty("clusters", "visibility", "visible")
//             }
//             if (map.getMap().getLayer("unclustered-point")) {
//                 map.getMap().setLayoutProperty("unclustered-point", "visibility", "visible")
//             }

//             return
//         }

//         const crimeData = crimeDataByDistrict[districtId] || {}

//         let crime_incidents: Array<{
//             id: string
//             timestamp: Date
//             description: string
//             status: string
//             category: string
//             type: string
//             address: string
//             latitude: number
//             longitude: number
//         }> = []

//         const districtCrimes = crimes.filter((crime) => crime.district_id === districtId)

//         districtCrimes.forEach((crimeRecord) => {
//             if (crimeRecord && crimeRecord.crime_incidents) {
//                 const incidents = crimeRecord.crime_incidents.map((incident) => ({
//                     id: incident.id,
//                     timestamp: incident.timestamp,
//                     description: incident.description || "",
//                     status: incident.status || "",
//                     category: incident.crime_categories?.name || "",
//                     type: incident.crime_categories?.type || "",
//                     address: incident.locations?.address || "",
//                     latitude: incident.locations?.latitude || 0,
//                     longitude: incident.locations?.longitude || 0,
//                 }))

//                 crime_incidents = [...crime_incidents, ...incidents]
//             }
//         })

//         const firstDistrictCrime = districtCrimes.length > 0 ? districtCrimes[0] : null

//         const selectedYearNum = year ? Number.parseInt(year) : new Date().getFullYear()

//         let demographics = firstDistrictCrime?.districts.demographics?.find((d) => d.year === selectedYearNum)

//         if (!demographics && firstDistrictCrime?.districts.demographics?.length) {
//             demographics = firstDistrictCrime.districts.demographics.sort((a, b) => b.year - a.year)[0]
//             console.log(
//                 `Tidak ada data demografis untuk tahun ${selectedYearNum}, menggunakan data tahun ${demographics.year}`,
//             )
//         }

//         let geographics = firstDistrictCrime?.districts.geographics?.find((g) => g.year === selectedYearNum)

//         if (!geographics && firstDistrictCrime?.districts.geographics?.length) {
//             const validGeographics = firstDistrictCrime.districts.geographics
//                 .filter((g) => g.year !== null)
//                 .sort((a, b) => (b.year || 0) - (a.year || 0))

//             geographics = validGeographics.length > 0 ? validGeographics[0] : firstDistrictCrime.districts.geographics[0]

//             console.log(
//                 `Tidak ada data geografis untuk tahun ${selectedYearNum}, menggunakan data ${geographics.year ? `tahun ${geographics.year}` : "tanpa tahun"}`,
//             )
//         }

//         const clickLng = e.lngLat ? e.lngLat.lng : null
//         const clickLat = e.lngLat ? e.lngLat.lat : null

//         if (!geographics) {
//             console.error("Missing geographics data for district:", districtId)
//             return
//         }

//         if (!demographics) {
//             console.error("Missing demographics data for district:", districtId)
//             return
//         }

//         const district: DistrictFeature = {
//             id: districtId,
//             name: feature.properties.nama || feature.properties.kecamatan || "Unknown District",
//             longitude: geographics.longitude || clickLng || 0,
//             latitude: geographics.latitude || clickLat || 0,
//             number_of_crime: crimeData.number_of_crime || 0,
//             level: crimeData.level || $Enums.crime_rates.low,
//             demographics: {
//                 number_of_unemployed: demographics.number_of_unemployed,
//                 population: demographics.population,
//                 population_density: demographics.population_density,
//                 year: demographics.year,
//             },
//             geographics: {
//                 address: geographics.address || "",
//                 land_area: geographics.land_area || 0,
//                 year: geographics.year || 0,
//                 latitude: geographics.latitude,
//                 longitude: geographics.longitude,
//             },
//             crime_incidents: crime_incidents || [],
//             selectedYear: year,
//             selectedMonth: month,
//             isFocused: true, // Mark this district as focused
//         }

//         if (!district.longitude || !district.latitude) {
//             console.error("Invalid district coordinates:", district)
//             return
//         }

//         selectedDistrictRef.current = district
//         setFocusedDistrictId(district.id)
//         console.log("District clicked, selectedDistrictRef set to:", selectedDistrictRef.current)

//         // Hide clusters when focusing on a district
//         if (map.getMap().getLayer("clusters")) {
//             map.getMap().setLayoutProperty("clusters", "visibility", "none")
//         }
//         if (map.getMap().getLayer("unclustered-point")) {
//             map.getMap().setLayoutProperty("unclustered-point", "visibility", "none")
//         }

//         // Reset bearing before animation
//         bearingRef.current = 0

//         // Animate to a pitched view focused on the district
//         map.flyTo({
//             center: [district.longitude, district.latitude],
//             zoom: 12.5,
//             pitch: 75,
//             bearing: 0,
//             duration: 1500,
//             easing: (t) => t * (2 - t), // easeOutQuad
//         })

//         // Stop any existing rotation animation
//         if (rotationAnimationRef.current) {
//             cancelAnimationFrame(rotationAnimationRef.current)
//             rotationAnimationRef.current = null
//         }

//         // Improved continuous bearing rotation function
//         const startRotation = () => {
//             if (!map || !focusedDistrictId) return

//             const rotationSpeed = 0.05 // degrees per frame

//             const animate = () => {
//                 if (!map || !focusedDistrictId) {
//                     if (rotationAnimationRef.current) {
//                         cancelAnimationFrame(rotationAnimationRef.current)
//                         rotationAnimationRef.current = null
//                     }
//                     return
//                 }

//                 // Update bearing with smooth increment
//                 bearingRef.current = (bearingRef.current + rotationSpeed) % 360
//                 map.setBearing(bearingRef.current)

//                 // Continue the animation
//                 rotationAnimationRef.current = requestAnimationFrame(animate)
//             }

//             // Start the animation loop
//             if (rotationAnimationRef.current) {
//                 cancelAnimationFrame(rotationAnimationRef.current)
//             }
//             rotationAnimationRef.current = requestAnimationFrame(animate)
//         }

//         // Start rotation after the initial flyTo completes
//         setTimeout(startRotation, 1600)

//         if (onClick) {
//             onClick(district)
//         } else {
//             setSelectedDistrict(district)
//         }
//     }

//     const handleIncidentClick = useCallback(
//         (e: any) => {
//             if (!map) return

//             const features = map.queryRenderedFeatures(e.point, { layers: ["unclustered-point"] })
//             if (!features || features.length === 0) return

//             const incident = features[0]
//             if (!incident.properties) return

//             e.originalEvent.stopPropagation()
//             e.preventDefault()

//             const incidentDetails = {
//                 id: incident.properties.id,
//                 district: incident.properties.district,
//                 category: incident.properties.category,
//                 type: incident.properties.incidentType,
//                 description: incident.properties.description,
//                 status: incident.properties?.status || "Unknown",
//                 longitude: (incident.geometry as any).coordinates[0],
//                 latitude: (incident.geometry as any).coordinates[1],
//                 timestamp: new Date(),
//             }

//             // console.log("Incident clicked:", incidentDetails)

//             // Dispatch mapbox_fly_to event instead of direct flyTo
//             // const flyToEvent = new CustomEvent("mapbox_fly_to", {
//             //     detail: {
//             //         longitude: incidentDetails.longitude,
//             //         latitude: incidentDetails.latitude,
//             //         zoom: 15,
//             //         bearing: 0,
//             //         pitch: 45,
//             //         duration: 2000,
//             //     },
//             //     bubbles: true,
//             // })

//             // if (map.getMap().getCanvas()) {
//             //     map.getMap().getCanvas().dispatchEvent(flyToEvent)
//             // } else {
//             //     document.dispatchEvent(flyToEvent)
//             // }

//             // Dispatch incident_click event after a short delay to allow fly animation
//             // const customEvent = new CustomEvent("incident_click", {
//             //     detail: incidentDetails,
//             //     bubbles: true,
//             // })
//             // if (map.getMap().getCanvas()) {
//             //     map.getMap().getCanvas().dispatchEvent(customEvent)
//             // } else {
//             //     document.dispatchEvent(customEvent)
//             // }

//         },
//         [map],
//     )

//     const handleClusterClick = useCallback(
//         (e: any) => {
//             if (!map) return

//             e.originalEvent.stopPropagation()
//             e.preventDefault()

//             const features = map.queryRenderedFeatures(e.point, { layers: ["clusters"] })

//             if (!features || features.length === 0) return

//             const clusterId: number = features[0].properties?.cluster_id as number
//                 ; (map.getSource("crime-incidents") as mapboxgl.GeoJSONSource).getClusterExpansionZoom(clusterId, (err, zoom) => {
//                     if (err) return

//                     map.easeTo({
//                         center: (features[0].geometry as any).coordinates,
//                         zoom: zoom ?? undefined,
//                     })
//                 })
//         },
//         [map],
//     )

//     const handleCloseDistrictPopup = useCallback(() => {
//         console.log("Closing district popup")
//         selectedDistrictRef.current = null
//         setSelectedDistrict(null)
//         setFocusedDistrictId(null) // Clear the focus when popup is closed

//         // Cancel rotation animation when closing popup
//         if (rotationAnimationRef.current) {
//             cancelAnimationFrame(rotationAnimationRef.current)
//             rotationAnimationRef.current = null
//         }

//         bearingRef.current = 0

//         // Reset pitch and bearing
//         if (map) {
//             map.easeTo({
//                 zoom: BASE_ZOOM,
//                 pitch: BASE_PITCH,
//                 bearing: BASE_BEARING,
//                 duration: 1500,
//                 easing: (t) => t * (2 - t), // easeOutQuad
//             })

//             // Show all clusters again when closing popup
//             if (map.getMap().getLayer("clusters")) {
//                 map.getMap().setLayoutProperty("clusters", "visibility", "visible")
//             }
//             if (map.getMap().getLayer("unclustered-point")) {
//                 map.getMap().setLayoutProperty("unclustered-point", "visibility", "visible")
//             }
//         }
//     }, [map])

//     // Add handler for fly-to events
//     useEffect(() => {
//         if (!map) return;
        
//         const handleFlyToEvent = (e: Event) => {
//             const customEvent = e as CustomEvent;
//             if (!map || !customEvent.detail) return;
            
//             const { longitude, latitude, zoom, bearing, pitch, duration } = customEvent.detail;
            
//             map.flyTo({
//                 center: [longitude, latitude],
//                 zoom: zoom || 15,
//                 bearing: bearing || 0,
//                 pitch: pitch || 45,
//                 duration: duration || 2000
//             });
            
//             // Add a highlight or pulse effect to the target incident
//             // This could be implemented by adding a temporary marker or animation
//             // at the target coordinates
//             if (map.getMap().getLayer('target-incident-highlight')) {
//                 map.getMap().removeLayer('target-incident-highlight');
//             }
            
//             if (map.getMap().getSource('target-incident-highlight')) {
//                 map.getMap().removeSource('target-incident-highlight');
//             }
            
//             map.getMap().addSource('target-incident-highlight', {
//                 type: 'geojson',
//                 data: {
//                     type: 'Feature',
//                     geometry: {
//                         type: 'Point',
//                         coordinates: [longitude, latitude]
//                     },
//                     properties: {}
//                 }
//             });
            
//             map.getMap().addLayer({
//                 id: 'target-incident-highlight',
//                 source: 'target-incident-highlight',
//                 type: 'circle',
//                 paint: {
//                     'circle-radius': [
//                         'interpolate', ['linear'], ['zoom'],
//                         10, 10,
//                         15, 15,
//                         20, 20
//                     ],
//                     'circle-color': '#ff0000',
//                     'circle-opacity': 0.7,
//                     'circle-stroke-width': 2,
//                     'circle-stroke-color': '#ffffff'
//                 }
//             });
            
//             // Add a pulsing effect using animations
//             let size = 10;
//             const animatePulse = () => {
//                 if (!map || !map.getMap().getLayer('target-incident-highlight')) return;
                
//                 size = (size % 20) + 1;
                
//                 map.getMap().setPaintProperty('target-incident-highlight', 'circle-radius', [
//                     'interpolate', ['linear'], ['zoom'],
//                     10, size,
//                     15, size * 1.5,
//                     20, size * 2
//                 ]);
                
//                 requestAnimationFrame(animatePulse);
//             };
            
//             requestAnimationFrame(animatePulse);
//         };
        
//         map.getMap().getCanvas().addEventListener('mapbox_fly_to', handleFlyToEvent as EventListener);
        
//         return () => {
//             if (map && map.getMap() && map.getMap().getCanvas()) {
//                 map.getMap().getCanvas().removeEventListener('mapbox_fly_to', handleFlyToEvent as EventListener);
//             }
//         };
//     }, [map]);

//     useEffect(() => {
//         if (!map || !visible) return

//         const onStyleLoad = () => {
//             if (!map) return

//             try {
//                 if (!map.getMap().getSource("districts")) {
//                     const layers = map.getStyle().layers
//                     let firstSymbolId: string | undefined
//                     for (const layer of layers) {
//                         if (layer.type === "symbol") {
//                             firstSymbolId = layer.id
//                             break
//                         }
//                     }

//                     map.getMap().addSource("districts", {
//                         type: "vector",
//                         url: `mapbox://${tilesetId}`,
//                     })

//                     const fillColorExpression: any = [
//                         "case",
//                         ["has", "kode_kec"],
//                         [
//                             "match",
//                             ["get", "kode_kec"],
//                             ...(focusedDistrictId
//                                 ? [
//                                     [
//                                         focusedDistrictId,
//                                         crimeDataByDistrict[focusedDistrictId]?.level === "low"
//                                             ? CRIME_RATE_COLORS.low
//                                             : crimeDataByDistrict[focusedDistrictId]?.level === "medium"
//                                                 ? CRIME_RATE_COLORS.medium
//                                                 : crimeDataByDistrict[focusedDistrictId]?.level === "high"
//                                                     ? CRIME_RATE_COLORS.high
//                                                     : CRIME_RATE_COLORS.default,
//                                     ],
//                                     "rgba(0,0,0,0.05)",
//                                 ]
//                                 : Object.entries(crimeDataByDistrict).flatMap(([districtId, data]) => {
//                                     return [
//                                         districtId,
//                                         data.level === "low"
//                                             ? CRIME_RATE_COLORS.low
//                                             : data.level === "medium"
//                                                 ? CRIME_RATE_COLORS.medium
//                                                 : data.level === "high"
//                                                     ? CRIME_RATE_COLORS.high
//                                                     : CRIME_RATE_COLORS.default,
//                                     ]
//                                 })),
//                             focusedDistrictId ? "rgba(0,0,0,0.05)" : CRIME_RATE_COLORS.default,
//                         ],
//                         CRIME_RATE_COLORS.default,
//                     ]

//                     if (!map.getMap().getLayer("district-fill")) {
//                         map.getMap().addLayer(
//                             {
//                                 id: "district-fill",
//                                 type: "fill",
//                                 source: "districts",
//                                 "source-layer": "Districts",
//                                 paint: {
//                                     "fill-color": fillColorExpression,
//                                     "fill-opacity": 0.6,
//                                 },
//                             },
//                             firstSymbolId,
//                         )
//                     }

//                     if (!map.getMap().getLayer("district-line")) {
//                         map.getMap().addLayer(
//                             {
//                                 id: "district-line",
//                                 type: "line",
//                                 source: "districts",
//                                 "source-layer": "Districts",
//                                 paint: {
//                                     "line-color": "#ffffff",
//                                     "line-width": 1,
//                                     "line-opacity": 0.5,
//                                 },
//                             },
//                             firstSymbolId,
//                         )
//                     }

//                     if (!map.getMap().getLayer("district-extrusion")) {
//                         map.getMap().addLayer(
//                             {
//                                 id: "district-extrusion",
//                                 type: "fill-extrusion",
//                                 source: "districts",
//                                 "source-layer": "Districts",
//                                 paint: {
//                                     "fill-extrusion-color": [
//                                         "case",
//                                         ["has", "kode_kec"],
//                                         [
//                                             "match",
//                                             ["get", "kode_kec"],
//                                             focusedDistrictId || "",
//                                             crimeDataByDistrict[focusedDistrictId || ""]?.level === "low"
//                                                 ? CRIME_RATE_COLORS.low
//                                                 : crimeDataByDistrict[focusedDistrictId || ""]?.level === "medium"
//                                                     ? CRIME_RATE_COLORS.medium
//                                                     : crimeDataByDistrict[focusedDistrictId || ""]?.level === "high"
//                                                         ? CRIME_RATE_COLORS.high
//                                                         : CRIME_RATE_COLORS.default,
//                                             "transparent",
//                                         ],
//                                         "transparent",
//                                     ],
//                                     "fill-extrusion-height": [
//                                         "case",
//                                         ["has", "kode_kec"],
//                                         ["match", ["get", "kode_kec"], focusedDistrictId || "", 500, 0],
//                                         0,
//                                     ],
//                                     "fill-extrusion-base": 0,
//                                     "fill-extrusion-opacity": 0.8,
//                                 },
//                                 filter: ["==", ["get", "kode_kec"], focusedDistrictId || ""],
//                             },
//                             firstSymbolId,
//                         )
//                     }

//                     if (crimes.length > 0 && !map.getMap().getSource("crime-incidents")) {
//                         const allIncidents = crimes.flatMap((crime) => {
//                             let filteredIncidents = crime.crime_incidents

//                             if (filterCategory !== "all") {
//                                 filteredIncidents = crime.crime_incidents.filter(
//                                     (incident) => incident.crime_categories.name === filterCategory,
//                                 )
//                             }

//                             return filteredIncidents.map((incident) => ({
//                                 type: "Feature" as const,
//                                 properties: {
//                                     id: incident.id,
//                                     district: crime.districts.name,
//                                     category: incident.crime_categories.name,
//                                     incidentType: incident.crime_categories.type,
//                                     level: crime.level,
//                                     description: incident.description,
//                                 },
//                                 geometry: {
//                                     type: "Point" as const,
//                                     coordinates: [incident.locations.longitude, incident.locations.latitude],
//                                 },
//                             }))
//                         })

//                         map.getMap().addSource("crime-incidents", {
//                             type: "geojson",
//                             data: {
//                                 type: "FeatureCollection",
//                                 features: allIncidents,
//                             },
//                             cluster: true,
//                             clusterMaxZoom: 14,
//                             clusterRadius: 50,
//                         })

//                         if (!map.getMap().getLayer("clusters")) {
//                             map.getMap().addLayer(
//                                 {
//                                     id: "clusters",
//                                     type: "circle",
//                                     source: "crime-incidents",
//                                     filter: ["has", "point_count"],
//                                     paint: {
//                                         "circle-color": ["step", ["get", "point_count"], "#51bbd6", 5, "#f1f075", 15, "#f28cb1"],
//                                         "circle-radius": ["step", ["get", "point_count"], 20, 5, 30, 15, 40],
//                                         "circle-opacity": 0.75,
//                                     },
//                                     layout: {
//                                         visibility: "visible",
//                                     },
//                                 },
//                                 firstSymbolId,
//                             )
//                         }

//                         if (!map.getMap().getLayer("cluster-count")) {
//                             map.getMap().addLayer({
//                                 id: "cluster-count",
//                                 type: "symbol",
//                                 source: "crime-incidents",
//                                 filter: ["has", "point_count"],
//                                 layout: {
//                                     "text-field": "{point_count_abbreviated}",
//                                     "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
//                                     "text-size": 12,
//                                 },
//                                 paint: {
//                                     "text-color": "#ffffff",
//                                 },
//                             })
//                         }

//                         if (!map.getMap().getLayer("unclustered-point")) {
//                             map.getMap().addLayer(
//                                 {
//                                     id: "unclustered-point",
//                                     type: "circle",
//                                     source: "crime-incidents",
//                                     filter: ["!", ["has", "point_count"]],
//                                     paint: {
//                                         "circle-color": "#11b4da",
//                                         "circle-radius": 8,
//                                         "circle-stroke-width": 1,
//                                         "circle-stroke-color": "#fff",
//                                     },
//                                     layout: {
//                                         visibility: "visible",
//                                     },
//                                 },
//                                 firstSymbolId,
//                             )
//                         }

//                         map.on("mouseenter", "clusters", () => {
//                             map.getCanvas().style.cursor = "pointer"
//                         })

//                         map.on("mouseleave", "clusters", () => {
//                             map.getCanvas().style.cursor = ""
//                         })

//                         map.on("mouseenter", "unclustered-point", () => {
//                             map.getCanvas().style.cursor = "pointer"
//                         })

//                         map.on("mouseleave", "unclustered-point", () => {
//                             map.getCanvas().style.cursor = ""
//                         })

//                         map.on("mouseenter", "district-fill", () => {
//                             map.getCanvas().style.cursor = "pointer"
//                         })

//                         map.on("mouseleave", "district-fill", () => {
//                             map.getCanvas().style.cursor = ""
//                         })

//                         map.off("click", "clusters", handleClusterClick)
//                         map.off("click", "unclustered-point", handleIncidentClick)

//                         map.on("click", "clusters", handleClusterClick)
//                         map.on("click", "unclustered-point", handleIncidentClick)

//                         map.off("click", "district-fill", handleDistrictClick)
//                         map.on("click", "district-fill", handleDistrictClick)

//                         map.on("mouseleave", "district-fill", () => setHoverInfo(null))

//                         layersAdded.current = true
//                     }
//                 } else {
//                     if (map.getMap().getLayer("district-fill")) {
//                         map.getMap().setPaintProperty("district-fill", "fill-color", [
//                             "case",
//                             ["has", "kode_kec"],
//                             [
//                                 "match",
//                                 ["get", "kode_kec"],
//                                 ...(focusedDistrictId
//                                     ? [
//                                         [
//                                             focusedDistrictId,
//                                             crimeDataByDistrict[focusedDistrictId]?.level === "low"
//                                                 ? CRIME_RATE_COLORS.low
//                                                 : crimeDataByDistrict[focusedDistrictId]?.level === "medium"
//                                                     ? CRIME_RATE_COLORS.medium
//                                                     : crimeDataByDistrict[focusedDistrictId]?.level === "high"
//                                                         ? CRIME_RATE_COLORS.high
//                                                         : CRIME_RATE_COLORS.default,
//                                         ],
//                                         "rgba(0,0,0,0.05)",
//                                     ]
//                                     : Object.entries(crimeDataByDistrict).flatMap(([districtId, data]) => {
//                                         return [
//                                             districtId,
//                                             data.level === "low"
//                                                 ? CRIME_RATE_COLORS.low
//                                                 : data.level === "medium"
//                                                     ? CRIME_RATE_COLORS.medium
//                                                     : data.level === "high"
//                                                         ? CRIME_RATE_COLORS.high
//                                                         : CRIME_RATE_COLORS.default,
//                                         ]
//                                     })),
//                                 focusedDistrictId ? "rgba(0,0,0,0.05)" : CRIME_RATE_COLORS.default,
//                             ],
//                             CRIME_RATE_COLORS.default,
//                         ] as any)
//                     }

//                     // Re-add click handler to ensure it works after timelapse
//                     map.off("click", "district-fill", handleDistrictClick)
//                     map.on("click", "district-fill", handleDistrictClick)
//                 }
//             } catch (error) {
//                 console.error("Error adding district layers:", error)
//             }
//         }

//         if (map.isStyleLoaded()) {
//             onStyleLoad()
//         } else {
//             map.once("style.load", onStyleLoad)
//         }

//         return () => {
//             if (map) {
//                 map.off("click", "district-fill", handleDistrictClick)
//             }
//         }
//     }, [map, visible, tilesetId, crimes, filterCategory, year, month, handleIncidentClick, handleClusterClick])

//     // Add an additional effect to ensure click handlers are properly maintained
//     useEffect(() => {
//         if (!map || !layersAdded.current) return

//         // Re-attach the click handler after any data changes
//         if (map.getMap().getLayer("district-fill")) {
//             map.off("click", "district-fill", handleDistrictClick)
//             map.on("click", "district-fill", handleDistrictClick)
//         }

//         // Ensure district-extrusion settings are maintained after timelapse
//         if (map.getMap().getLayer("district-extrusion")) {
//             map.getMap().setFilter("district-extrusion", ["==", ["get", "kode_kec"], focusedDistrictId || ""]);

//             // Re-apply the extrusion color based on the focused district
//             map.getMap().setPaintProperty("district-extrusion", "fill-extrusion-color", [
//                 "case",
//                 ["has", "kode_kec"],
//                 [
//                     "match",
//                     ["get", "kode_kec"],
//                     focusedDistrictId || "",
//                     crimeDataByDistrict[focusedDistrictId || ""]?.level === "low"
//                         ? CRIME_RATE_COLORS.low
//                         : crimeDataByDistrict[focusedDistrictId || ""]?.level === "medium"
//                             ? CRIME_RATE_COLORS.medium
//                             : crimeDataByDistrict[focusedDistrictId || ""]?.level === "high"
//                                 ? CRIME_RATE_COLORS.high
//                                 : CRIME_RATE_COLORS.default,
//                     "transparent",
//                 ],
//                 "transparent",
//             ]);

//             // Ensure extrusion height is restored if needed
//             if (focusedDistrictId) {
//                 map.getMap().setPaintProperty("district-extrusion", "fill-extrusion-height", [
//                     "case",
//                     ["has", "kode_kec"],
//                     ["match", ["get", "kode_kec"], focusedDistrictId, 800, 0],
//                     0,
//                 ]);
//             }
//         }

//         return () => {
//             if (map) {
//                 map.off("click", "district-fill", handleDistrictClick)
//             }
//         }
//     }, [map, year, month, crimeDataByDistrict, focusedDistrictId])

//     useEffect(() => {
//         if (!map || !layersAdded.current) return

//         try {
//             if (map.getMap().getLayer("district-fill")) {
//                 const colorEntries = focusedDistrictId
//                     ? [
//                         [
//                             focusedDistrictId,
//                             crimeDataByDistrict[focusedDistrictId]?.level === "low"
//                                 ? CRIME_RATE_COLORS.low
//                                 : crimeDataByDistrict[focusedDistrictId]?.level === "medium"
//                                     ? CRIME_RATE_COLORS.medium
//                                     : crimeDataByDistrict[focusedDistrictId]?.level === "high"
//                                         ? CRIME_RATE_COLORS.high
//                                         : CRIME_RATE_COLORS.default,
//                         ],
//                         "rgba(0,0,0,0.05)",
//                     ]
//                     : Object.entries(crimeDataByDistrict).flatMap(([districtId, data]) => {
//                         if (!data || !data.level) {
//                             return [districtId, CRIME_RATE_COLORS.default]
//                         }

//                         return [
//                             districtId,
//                             data.level === "low"
//                                 ? CRIME_RATE_COLORS.low
//                                 : data.level === "medium"
//                                     ? CRIME_RATE_COLORS.medium
//                                     : data.level === "high"
//                                         ? CRIME_RATE_COLORS.high
//                                         : CRIME_RATE_COLORS.default,
//                         ]
//                     })

//                 const fillColorExpression = [
//                     "case",
//                     ["has", "kode_kec"],
//                     [
//                         "match",
//                         ["get", "kode_kec"],
//                         ...colorEntries,
//                         focusedDistrictId ? "rgba(0,0,0,0.05)" : CRIME_RATE_COLORS.default,
//                     ],
//                     CRIME_RATE_COLORS.default,
//                 ] as any

//                 map.getMap().setPaintProperty("district-fill", "fill-color", fillColorExpression)
//             }

//             if (map.getMap().getLayer("district-extrusion")) {
//                 map.getMap().setFilter("district-extrusion", ["==", ["get", "kode_kec"], focusedDistrictId || ""])

//                 map
//                     .getMap()
//                     .setPaintProperty("district-extrusion", "fill-extrusion-color", [
//                         "case",
//                         ["has", "kode_kec"],
//                         [
//                             "match",
//                             ["get", "kode_kec"],
//                             focusedDistrictId || "",
//                             crimeDataByDistrict[focusedDistrictId || ""]?.level === "low"
//                                 ? CRIME_RATE_COLORS.low
//                                 : crimeDataByDistrict[focusedDistrictId || ""]?.level === "medium"
//                                     ? CRIME_RATE_COLORS.medium
//                                     : crimeDataByDistrict[focusedDistrictId || ""]?.level === "high"
//                                         ? CRIME_RATE_COLORS.high
//                                         : CRIME_RATE_COLORS.default,
//                             "transparent",
//                         ],
//                         "transparent",
//                     ])

//                 if (focusedDistrictId) {
//                     const startHeight = 0
//                     const targetHeight = 800
//                     const duration = 700
//                     const startTime = performance.now()

//                     const animateHeight = (currentTime: number) => {
//                         const elapsed = currentTime - startTime
//                         const progress = Math.min(elapsed / duration, 1)
//                         const easedProgress = progress * (2 - progress)
//                         const currentHeight = startHeight + (targetHeight - startHeight) * easedProgress

//                         map
//                             .getMap()
//                             .setPaintProperty("district-extrusion", "fill-extrusion-height", [
//                                 "case",
//                                 ["has", "kode_kec"],
//                                 ["match", ["get", "kode_kec"], focusedDistrictId, currentHeight, 0],
//                                 0,
//                             ])

//                         if (progress < 1) {
//                             requestAnimationFrame(animateHeight)
//                         }
//                     }

//                     requestAnimationFrame(animateHeight)
//                 } else {
//                     const startHeight = 800
//                     const targetHeight = 0
//                     const duration = 500
//                     const startTime = performance.now()

//                     const animateHeightDown = (currentTime: number) => {
//                         const elapsed = currentTime - startTime
//                         const progress = Math.min(elapsed / duration, 1)
//                         const easedProgress = progress * (2 - progress)
//                         const currentHeight = startHeight + (targetHeight - startHeight) * easedProgress

//                         map
//                             .getMap()
//                             .setPaintProperty("district-extrusion", "fill-extrusion-height", [
//                                 "case",
//                                 ["has", "kode_kec"],
//                                 ["match", ["get", "kode_kec"], "", currentHeight, 0],
//                                 0,
//                             ])

//                         if (progress < 1) {
//                             requestAnimationFrame(animateHeightDown)
//                         }
//                     }

//                     requestAnimationFrame(animateHeightDown)
//                 }
//             }
//         } catch (error) {
//             console.error("Error updating district layer:", error)
//         }
//     }, [map, crimes, crimeDataByDistrict, focusedDistrictId])

//     useEffect(() => {
//         if (!map || !map.getMap().getSource("crime-incidents")) return

//         try {
//             const allIncidents = crimes.flatMap((crime) => {
//                 if (!crime.crime_incidents) return []

//                 let filteredIncidents = crime.crime_incidents

//                 if (filterCategory !== "all") {
//                     filteredIncidents = crime.crime_incidents.filter(
//                         (incident) => incident.crime_categories && incident.crime_categories.name === filterCategory,
//                     )
//                 }

//                 return filteredIncidents
//                     .map((incident) => {
//                         if (!incident.locations) {
//                             console.warn("Missing location for incident:", incident.id)
//                             return null
//                         }

//                         return {
//                             type: "Feature" as const,
//                             properties: {
//                                 id: incident.id,
//                                 district: crime.districts?.name || "Unknown",
//                                 category: incident.crime_categories?.name || "Unknown",
//                                 incidentType: incident.crime_categories?.type || "Unknown",
//                                 level: crime.level || "low",
//                                 description: incident.description || "",
//                             },
//                             geometry: {
//                                 type: "Point" as const,
//                                 coordinates: [incident.locations.longitude || 0, incident.locations.latitude || 0],
//                             },
//                         }
//                     })
//                     .filter(Boolean)
//             })
//                 ; (map.getMap().getSource("crime-incidents") as mapboxgl.GeoJSONSource).setData({
//                     type: "FeatureCollection",
//                     features: allIncidents as GeoJSON.Feature[],
//                 })
//         } catch (error) {
//             console.error("Error updating incident data:", error)
//         }
//     }, [map, crimes, filterCategory])

//     useEffect(() => {
//         if (selectedDistrictRef.current) {
//             const districtId = selectedDistrictRef.current.id
//             const crimeData = crimeDataByDistrict[districtId] || {}

//             const districtCrime = crimes.find((crime) => crime.district_id === districtId)

//             if (districtCrime) {
//                 const selectedYearNum = year ? Number.parseInt(year) : new Date().getFullYear()

//                 let demographics = districtCrime.districts.demographics?.find((d) => d.year === selectedYearNum)

//                 if (!demographics && districtCrime.districts.demographics?.length) {
//                     demographics = districtCrime.districts.demographics.sort((a, b) => b.year - a.year)[0]
//                 }

//                 let geographics = districtCrime.districts.geographics?.find((g) => g.year === selectedYearNum)

//                 if (!geographics && districtCrime.districts.geographics?.length) {
//                     const validGeographics = districtCrime.districts.geographics
//                         .filter((g) => g.year !== null)
//                         .sort((a, b) => (b.year || 0) - (a.year || 0))

//                     geographics = validGeographics.length > 0 ? validGeographics[0] : districtCrime.districts.geographics[0]
//                 }

//                 if (!demographics || !geographics) {
//                     console.error("Missing district data:", { demographics, geographics })
//                     return
//                 }

//                 const crime_incidents = districtCrime.crime_incidents
//                     .filter((incident) => filterCategory === "all" || incident.crime_categories.name === filterCategory)
//                     .map((incident) => ({
//                         id: incident.id,
//                         timestamp: incident.timestamp,
//                         description: incident.description,
//                         status: incident.status || "",
//                         category: incident.crime_categories.name,
//                         type: incident.crime_categories.type || "",
//                         address: incident.locations.address || "",
//                         latitude: incident.locations.latitude,
//                         longitude: incident.locations.longitude,
//                     }))

//                 const updatedDistrict: DistrictFeature = {
//                     ...selectedDistrictRef.current,
//                     number_of_crime: crimeData.number_of_crime || 0,
//                     level: crimeData.level || selectedDistrictRef.current.level,
//                     demographics: {
//                         number_of_unemployed: demographics.number_of_unemployed,
//                         population: demographics.population,
//                         population_density: demographics.population_density,
//                         year: demographics.year,
//                     },
//                     geographics: {
//                         address: geographics.address || "",
//                         land_area: geographics.land_area || 0,
//                         year: geographics.year || 0,
//                         latitude: geographics.latitude,
//                         longitude: geographics.longitude,
//                     },
//                     crime_incidents,
//                     selectedYear: year,
//                     selectedMonth: month,
//                 }

//                 selectedDistrictRef.current = updatedDistrict

//                 setSelectedDistrict((prevDistrict) => {
//                     if (
//                         prevDistrict?.id === updatedDistrict.id &&
//                         prevDistrict?.selectedYear === updatedDistrict.selectedYear &&
//                         prevDistrict?.selectedMonth === updatedDistrict.selectedMonth
//                     ) {
//                         return prevDistrict
//                     }
//                     return updatedDistrict
//                 })
//             }
//         }
//     }, [crimes, filterCategory, year, month])

//     useEffect(() => {
//         return () => {
//             if (rotationAnimationRef.current) {
//                 cancelAnimationFrame(rotationAnimationRef.current)
//                 rotationAnimationRef.current = null
//             }
//         }
//     }, [])

//     if (!visible) return null

//     return (
//         <>
//             {selectedDistrict && (
//                 <DistrictPopup
//                     longitude={selectedDistrict.longitude || 0}
//                     latitude={selectedDistrict.latitude || 0}
//                     onClose={handleCloseDistrictPopup}
//                     district={selectedDistrict}
//                     year={year}
//                     month={month}
//                     filterCategory={filterCategory}
//                 />
//             )}
//         </>
//     )
// }
