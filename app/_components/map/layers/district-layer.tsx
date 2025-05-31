"use client"

import { BASE_BEARING, BASE_DURATION, BASE_PITCH, BASE_ZOOM, MAPBOX_SOURCE_LAYER, MAPBOX_SOURCE_NAME } from "@/app/_utils/const/map"
import { createFillColorExpression, getFillOpacity, processDistrictFeature } from "@/app/_utils/map/common"
import type { IDistrictLayerProps } from "@/app/_utils/types/map"
import { useEffect } from "react"
import { useRealtimeKMeans } from "@/app/_hooks/use-realtime-kmeans"

export default function DistrictFillLineLayer({
    visible = true,
    map,
    onClick,
    onDistrictClick,
    year,
    month,
    filterCategory = "all",
    crimes = [],
    tilesetId,
    focusedDistrictId,
    setFocusedDistrictId,
    crimeDataByDistrict,
    showFill = true,
    activeControl,
}: IDistrictLayerProps & { onDistrictClick?: (district: any) => void }) {

    // Add real-time cluster data for current year
    const {
        clusterData: realtimeClusterData,
        isRealTimeEnabled
    } = useRealtimeKMeans({
        enabled: Number(year) === new Date().getFullYear() && activeControl === "cbt" as any,
        year: Number(year),
    });

    // Use real-time data for district coloring if available, otherwise fall back to historical data
    const effectiveCrimeData = (() => {
        const currentYear = new Date().getFullYear();
        const isCurrentYear = Number(year) === currentYear;

        if (isCurrentYear && isRealTimeEnabled && realtimeClusterData.length > 0) {
            // Use real-time district_clusters data for current year
            console.log("District Layer - Using real-time district_clusters data for coloring");
            return realtimeClusterData.reduce((acc, cluster) => {
                acc[cluster.district_id] = {
                    risk_level: cluster.risk_level,
                    total_crimes: cluster.total_crimes,
                    cluster_score: cluster.cluster_score,
                    last_update_type: cluster.last_update_type,
                    isRealTime: true
                };
                return acc;
            }, {} as Record<string, any>)
        } else {
            // Use historical crimes data for past years
            console.log("District Layer - Using historical crimes data for coloring");
            return crimeDataByDistrict;
        }
    })();

    useEffect(() => {
        if (!map || !visible) return

        const handleDistrictClick = (e: any) => {
            const possibleLayers = [
                "unclustered-point",
                "clusters",
                "crime-points",
                "units-points",
                "incidents-points",
                "timeline-markers",
                "recent-incidents",
            ]
            const availableLayers = possibleLayers.filter(layer => map.getLayer(layer))
            const incidentFeatures = map.queryRenderedFeatures(e.point, {
                layers: availableLayers,
            })

            if (incidentFeatures && incidentFeatures.length > 0) {
                return
            }

            if (!map || !e.features || e.features.length === 0) return

            const feature = e.features[0]
            const districtId = feature.properties.kode_kec

            if (focusedDistrictId === districtId) {
                if (setFocusedDistrictId) {
                    setFocusedDistrictId(null)
                }

                map.easeTo({
                    zoom: BASE_ZOOM,
                    pitch: BASE_PITCH,
                    bearing: BASE_BEARING,
                    duration: BASE_DURATION,
                    easing: (t) => t * (2 - t),
                })

                const fillColorExpression = createFillColorExpression(null, crimeDataByDistrict)
                map.setPaintProperty("district-fill", "fill-color", fillColorExpression as any)

                if (map.getLayer("clusters")) {
                    map.setLayoutProperty("clusters", "visibility", "visible")
                }
                if (map.getLayer("unclustered-point")) {
                    map.setLayoutProperty("unclustered-point", "visibility", "visible")
                }

                return
            } else if (focusedDistrictId) {
                if (setFocusedDistrictId) {
                    setFocusedDistrictId(null)
                }

                return
            }

            const district = processDistrictFeature(feature, e, districtId, crimeDataByDistrict, crimes, year, month)

            if (!district) return

            const focusedFillColorExpression = createFillColorExpression(district.id, crimeDataByDistrict)
            map.setPaintProperty("district-fill", "fill-color", focusedFillColorExpression as any)

            if (setFocusedDistrictId) {
                setFocusedDistrictId(district.id)
            }

            if (map.getLayer("clusters")) {
                map.setLayoutProperty("clusters", "visibility", "none")
            }
            if (map.getLayer("unclustered-point")) {
                map.setLayoutProperty("unclustered-point", "visibility", "none")
            }

            if (onDistrictClick) {
                onDistrictClick(district)
            } else if (onClick) {
                onClick(district)
            }
        }

        const onStyleLoad = () => {
            if (!map) return

            try {
                if (!map.getSource("districts")) {
                    const layers = map.getStyle().layers
                    let firstSymbolId: string | undefined
                    for (const layer of layers) {
                        if (layer.type === "symbol") {
                            firstSymbolId = layer.id
                            break
                        }
                    }

                    map.addSource("districts", {
                        type: "vector",
                        url: `mapbox://${tilesetId}`,
                    })

                    let fillColorExpression = createFillColorExpression(focusedDistrictId, effectiveCrimeData)
                    if (
                        Array.isArray(fillColorExpression) &&
                        fillColorExpression[0] === "match" &&
                        fillColorExpression.length < 4
                    ) {
                        fillColorExpression = [
                            "match",
                            ["get", "kode_kec"],
                            "",
                            "#90a4ae",
                            "#90a4ae"
                        ]
                    }

                    const fillOpacity = getFillOpacity(activeControl, showFill)

                    if (!map.getLayer("district-fill")) {
                        map.addLayer(
                            {
                                id: "district-fill",
                                type: "fill",
                                source: MAPBOX_SOURCE_NAME,
                                "source-layer": MAPBOX_SOURCE_LAYER,
                                paint: {
                                    "fill-color": fillColorExpression as any,
                                    "fill-opacity": fillOpacity,
                                },
                            },
                            firstSymbolId,
                        )
                    }

                    if (!map.getLayer("district-line")) {
                        map.addLayer(
                            {
                                id: "district-line",
                                type: "line",
                                source: MAPBOX_SOURCE_NAME,
                                "source-layer": MAPBOX_SOURCE_LAYER,
                                paint: {
                                    "line-color": "#ffffff",
                                    "line-width": 1,
                                    "line-opacity": 0.5,
                                },
                            },
                            firstSymbolId,
                        )
                    }

                    map.on("mouseenter", "district-fill", () => {
                        map.getCanvas().style.cursor = "pointer"
                    })

                    map.on("mouseleave", "district-fill", () => {
                        map.getCanvas().style.cursor = ""
                    })

                    map.off("click", "district-fill", handleDistrictClick)
                    map.on("click", "district-fill", handleDistrictClick)
                } else {
                    if (map.getLayer("district-fill")) {
                        let fillColorExpression = createFillColorExpression(focusedDistrictId, effectiveCrimeData)
                        if (
                            Array.isArray(fillColorExpression) &&
                            fillColorExpression[0] === "match" &&
                            fillColorExpression.length < 4
                        ) {
                            fillColorExpression = [
                                "match",
                                ["get", "kode_kec"],
                                "",
                                "#90a4ae",
                                "#90a4ae"
                            ]
                        }
                        map.setPaintProperty("district-fill", "fill-color", fillColorExpression as any)

                        const fillOpacity = getFillOpacity(activeControl, showFill)
                        map.setPaintProperty("district-fill", "fill-opacity", fillOpacity)
                    }
                }
            } catch (error) {
                console.error("Error adding district layers:", error)
            }
        }

        if (map.isStyleLoaded()) {
            onStyleLoad()
        } else {
            map.once("style.load", onStyleLoad)
        }

        return () => {
            if (map) {
                map.off("click", "district-fill", handleDistrictClick)
            }
        }
    }, [
        map,
        visible,
        tilesetId,
        crimes,
        filterCategory,
        year,
        month,
        focusedDistrictId,
        effectiveCrimeData, // Use effective data instead of crimeDataByDistrict
        onClick,
        onDistrictClick,
        setFocusedDistrictId,
        showFill,
        activeControl,
    ])

    useEffect(() => {
        if (!map || !map.getLayer("district-fill")) return

        try {
            let fillColorExpression = createFillColorExpression(focusedDistrictId, effectiveCrimeData)
            if (
                Array.isArray(fillColorExpression) &&
                fillColorExpression[0] === "match" &&
                fillColorExpression.length < 4
            ) {
                fillColorExpression = [
                    "match",
                    ["get", "kode_kec"],
                    "",
                    "#90a4ae",
                    "#90a4ae"
                ]
            }
            map.setPaintProperty("district-fill", "fill-color", fillColorExpression as any)

            const fillOpacity = getFillOpacity(activeControl, showFill)
            map.setPaintProperty("district-fill", "fill-opacity", fillOpacity)
        } catch (error) {
            console.error("Error updating district fill colors or opacity:", error)
        }
    }, [map, focusedDistrictId, effectiveCrimeData, activeControl, showFill]) // Use effective data

    return null
}

