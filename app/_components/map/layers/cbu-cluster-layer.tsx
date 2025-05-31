"use client"

import { useEffect, useCallback } from "react"
import mapboxgl from "mapbox-gl"
import type { GeoJSON } from "geojson"
import type { IClusterLayerProps } from "@/app/_utils/types/map"
import { manageLayerVisibility } from "@/app/_utils/map/layer-visibility"

interface ExtendedClusterLayerProps extends IClusterLayerProps {
    clusteringEnabled?: boolean
    showClusters?: boolean
    sourceType?: string
    year?: number | string
    month?: number | string
}

export default function CBUClusterLayer({
    visible = true,
    map,
    crimes = [],
    filterCategory = "all",
    focusedDistrictId,
    clusteringEnabled = false,
    showClusters = false,
    sourceType = "cbu",
    year,
    month,
}: ExtendedClusterLayerProps) {
    // Define layer IDs for consistent management - CBU specific
    const LAYER_IDS = ['cbu-clusters', 'cbu-cluster-count', 'cbu-crime-points', 'cbu-crime-count-labels'];

    // Log data source for debugging
    useEffect(() => {
        console.log(`CBU Cluster Layer - Using district data for year: ${year}, month: ${month}, category: ${filterCategory}`);
        console.log(`CBU Source Type: ${sourceType}, Visible: ${visible && sourceType === "cbu"}, Show Clusters: ${showClusters}`);
    }, [year, month, filterCategory, sourceType, visible, showClusters, crimes.length]);

    const handleClusterClick = useCallback(
        (e: any) => {
            if (!map) return

            // Stop event propagation to prevent district layer from handling this click
            e.originalEvent.stopPropagation()
            e.preventDefault()

            const features = map.queryRenderedFeatures(e.point, { layers: ["cbu-clusters"] })

            if (!features || features.length === 0) return

            const clusterId: number = features[0].properties?.cluster_id as number

            try {
                ; (map.getSource("cbu-crime-incidents") as mapboxgl.GeoJSONSource).getClusterExpansionZoom(
                    clusterId,
                    (err, zoom) => {
                        if (err) {
                            console.error("Error getting cluster expansion zoom:", err)
                            return
                        }

                        const coordinates = (features[0].geometry as any).coordinates

                        map.flyTo({
                            center: coordinates,
                            zoom: zoom ?? 12,
                            bearing: 0,
                            pitch: 45,
                            duration: 1000,
                        })
                    },
                )
            } catch (error) {
                console.error("Error handling cluster click:", error)
            }
        },
        [map],
    )

    // Use centralized layer visibility management
    useEffect(() => {
        if (!map) return;

        const isActive = visible && showClusters && !focusedDistrictId && sourceType === "cbu";
        console.log(`Setting CBU cluster visibility to: ${isActive ? "visible" : "none"}`);

        // Ensure layers exist before trying to set their visibility
        const layersExist = LAYER_IDS.some(id => map.getLayer(id));
        if (!layersExist) {
            console.log("CBU layers don't exist yet, skipping visibility change");
            return;
        }

        // Directly set visibility to ensure it overrides any other effects
        LAYER_IDS.forEach(id => {
            if (map.getLayer(id)) {
                map.setLayoutProperty(id, "visibility", isActive ? "visible" : "none");
                console.log(`Set ${id} visibility to: ${isActive ? "visible" : "none"}`);
            }
        });

        return () => {
            // Clean up if needed
        };
    }, [map, visible, showClusters, focusedDistrictId, sourceType]);

    // Layer creation effect
    useEffect(() => {
        if (!map) return;

        console.log(`CBU layer effect running, sourceType: ${sourceType}`);

        // Only create layer if source type is CBU
        if (sourceType !== "cbu") {
            console.log("CBU layer skipped - source type is not CBU");
            // Hide layers if they exist
            LAYER_IDS.forEach(id => {
                if (map.getLayer(id)) {
                    map.setLayoutProperty(id, "visibility", "none");
                }
            });
            return;
        }

        const onStyleLoad = () => {
            if (!map) return

            try {
                const layers = map.getStyle().layers
                let firstSymbolId: string | undefined
                for (const layer of layers) {
                    if (layer.type === "symbol") {
                        firstSymbolId = layer.id
                        break
                    }
                }

                // Define properly typed event handlers
                const handleClusterMouseEnter = () => {
                    if (map && map.getCanvas()) {
                        map.getCanvas().style.cursor = "pointer"
                    }
                }

                const handleClusterMouseLeave = () => {
                    if (map && map.getCanvas()) {
                        map.getCanvas().style.cursor = ""
                    }
                }

                const handleCrimePointMouseEnter = () => {
                    if (map && map.getCanvas()) {
                        map.getCanvas().style.cursor = "pointer"
                    }
                }

                const handleCrimePointMouseLeave = () => {
                    if (map && map.getCanvas()) {
                        map.getCanvas().style.cursor = ""
                    }
                }

                const handleCrimePointClick = (e: any) => {
                    if (!map) return

                    // Stop event propagation
                    e.originalEvent.stopPropagation()
                    e.preventDefault()

                    const features = map.queryRenderedFeatures(e.point, { layers: ["cbu-crime-points"] })

                    if (features.length > 0) {
                        // Handle crime point click if needed
                    }
                }

                // Check if the source already exists and remove it if we need to recreate
                if (map.getSource("cbu-crime-incidents")) {
                    console.log("CBU source exists, removing existing source and layers");

                    // First remove layers that use this source
                    LAYER_IDS.forEach(id => {
                        if (map.getLayer(id)) {
                            map.removeLayer(id);
                        }
                    });

                    // Then remove the source
                    map.removeSource("cbu-crime-incidents");
                }

                // First, filter crimes based on year, month, and category
                const filteredCrimes = crimes.filter(crime => {
                    // Year filter
                    if (year && year !== "all" && crime.year !== null && Number(crime.year) !== Number(year)) {
                        return false;
                    }

                    // Month filter
                    if (month && month !== "all" && crime.month !== null && Number(crime.month) !== Number(month)) {
                        return false;
                    }


                    return true;
                });

                console.log(`CBU filtered crimes: ${filteredCrimes.length} of ${crimes.length} match criteria`);

                // Extract features from filtered crimes
                const features = filteredCrimes.map(crime => {
                    const crimeCount = crime.number_of_crime || 0;

                    return {
                        type: "Feature",
                        properties: {
                            district_id: crime.district_id,
                            district_name: crime.districts ? crime.districts.name : "Unknown",
                            crime_count: crimeCount,
                            level: crime.level,
                            category: filterCategory !== "all" ? filterCategory : "All",
                            year: crime.year,
                            month: crime.month,
                            weight: crimeCount,
                        },
                        geometry: {
                            type: "Point",
                            coordinates: [
                                crime.districts?.geographics?.[0]?.longitude || 0,
                                crime.districts?.geographics?.[0]?.latitude || 0,
                            ],
                        },
                    } as GeoJSON.Feature;
                }).filter(feature =>
                    feature.properties &&
                    feature.properties.crime_count > 0

                ) as GeoJSON.Feature[];

                console.log(`CBU valid features: ${features.length}`);

                // Add the source
                map.addSource("cbu-crime-incidents", {
                    type: "geojson",
                    data: {
                        type: "FeatureCollection",
                        features: features,
                    },
                    cluster: clusteringEnabled,
                    clusterMaxZoom: 14,
                    clusterRadius: 50,
                    clusterProperties: {
                        // Sum the weight property for clusters
                        sum: ["+", ["get", "weight"]]
                    }
                });

                // Add the layers
                map.addLayer(
                    {
                        id: "cbu-clusters",
                        type: "circle",
                        source: "cbu-crime-incidents",
                        filter: ["has", "point_count"],
                        paint: {
                            "circle-color": ["step", ["get", "sum"], "#51bbd6", 5, "#f1f075", 15, "#f28cb1"],
                            "circle-radius": ["step", ["get", "sum"], 20, 5, 30, 15, 40],
                            "circle-opacity": 0.75,
                            "circle-stroke-width": 2,
                            "circle-stroke-color": "#ffffff"
                        },
                        layout: {
                            visibility: (visible && showClusters && !focusedDistrictId && sourceType === "cbu") ? "visible" : "none",
                        },
                    },
                    firstSymbolId,
                );

                map.addLayer({
                    id: "cbu-cluster-count",
                    type: "symbol",
                    source: "cbu-crime-incidents",
                    filter: ["has", "point_count"],
                    layout: {
                        "text-field": "{sum}",
                        "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
                        "text-size": 12,
                        visibility: (visible && showClusters && !focusedDistrictId && sourceType === "cbu") ? "visible" : "none",
                    },
                    paint: {
                        "text-color": "#ffffff",
                    },
                });

                map.addLayer({
                    id: "cbu-crime-points",
                    type: "circle",
                    source: "cbu-crime-incidents",
                    filter: ["!", ["has", "point_count"]],
                    paint: {
                        "circle-radius": [
                            "interpolate",
                            ["linear"],
                            ["zoom"],
                            8,
                            ["interpolate", ["linear"], ["get", "crime_count"], 0, 5, 100, 20],
                            12,
                            ["interpolate", ["linear"], ["get", "crime_count"], 0, 8, 100, 30],
                        ],
                        "circle-color": [
                            "match",
                            ["get", "level"],
                            "low",
                            "#47B39C",
                            "medium",
                            "#FFC154",
                            "high",
                            "#EC6B56",
                            "#888888",
                        ],
                        "circle-opacity": 0.7,
                        "circle-stroke-width": 1,
                        "circle-stroke-color": "#ffffff",
                    },
                    layout: {
                        visibility: (visible && showClusters && !focusedDistrictId && sourceType === "cbu") ? "visible" : "none",
                    },
                });

                map.addLayer({
                    id: "cbu-crime-count-labels",
                    type: "symbol",
                    source: "cbu-crime-incidents",
                    filter: ["!", ["has", "point_count"]],
                    layout: {
                        "text-field": "{crime_count}",
                        "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
                        "text-size": 12,
                        visibility: (visible && showClusters && !focusedDistrictId && sourceType === "cbu") ? "visible" : "none",
                    },
                    paint: {
                        "text-color": "#ffffff",
                    },
                });

                console.log("CBU layers created successfully");

                // Add event listeners
                map.on("mouseenter", "cbu-crime-points", handleCrimePointMouseEnter);
                map.on("mouseleave", "cbu-crime-points", handleCrimePointMouseLeave);
                map.off("click", "cbu-crime-points", handleCrimePointClick);
                map.on("click", "cbu-crime-points", handleCrimePointClick);

                // Add cluster event listeners
                map.on("mouseenter", "cbu-clusters", handleClusterMouseEnter);
                map.on("mouseleave", "cbu-clusters", handleClusterMouseLeave);
                map.off("click", "cbu-clusters", handleClusterClick);
                map.on("click", "cbu-clusters", handleClusterClick);
            } catch (error) {
                console.error("Error adding CBU cluster layer:", error);
            }
        };

        if (map.isStyleLoaded()) {
            onStyleLoad();
        } else {
            map.once("style.load", onStyleLoad);
        }

        // Cleanup function
        return () => {
            if (map) {
                // Define cleanup handlers
                const cleanupClusterMouseEnter = () => {
                    if (map && map.getCanvas()) {
                        map.getCanvas().style.cursor = "pointer";
                    }
                };

                const cleanupClusterMouseLeave = () => {
                    if (map && map.getCanvas()) {
                        map.getCanvas().style.cursor = "";
                    }
                };

                const cleanupCrimePointMouseEnter = () => {
                    if (map && map.getCanvas()) {
                        map.getCanvas().style.cursor = "pointer";
                    }
                };

                const cleanupCrimePointMouseLeave = () => {
                    if (map && map.getCanvas()) {
                        map.getCanvas().style.cursor = "";
                    }
                };

                const cleanupCrimePointClick = (e: any) => {
                    if (!map) return;
                    e.originalEvent.stopPropagation();
                    e.preventDefault();
                    const features = map.queryRenderedFeatures(e.point, { layers: ["cbu-crime-points"] });
                    if (features.length > 0) {
                        // Handle crime point click if needed
                    }
                };

                // Remove event listeners
                map.off("click", "cbu-clusters", handleClusterClick)
                map.off("mouseenter", "cbu-clusters", cleanupClusterMouseEnter)
                map.off("mouseleave", "cbu-clusters", cleanupClusterMouseLeave)

                if (map.getLayer("cbu-crime-points")) {
                    map.off("mouseenter", "cbu-crime-points", cleanupCrimePointMouseEnter)
                    map.off("mouseleave", "cbu-crime-points", cleanupCrimePointMouseLeave)
                    map.off("click", "cbu-crime-points", cleanupCrimePointClick)
                }
            }
        }
    }, [
        map,
        visible,
        crimes,
        filterCategory,
        focusedDistrictId,
        handleClusterClick,
        clusteringEnabled,
        showClusters,
        sourceType,
        year,
        month,
    ])

    // Update data when filters change but source type is still CBU
    useEffect(() => {
        if (!map || sourceType !== "cbu") return;
        if (!map.getSource("cbu-crime-incidents")) return;

        try {
            // First, filter crimes based on year, month, and category
            const filteredCrimes = crimes.filter(crime => {
                // Year filter
                if (year && year !== "all" && crime.year !== null && Number(crime.year) !== Number(year)) {
                    return false;
                }

                // Month filter
                if (month && month !== "all" && crime.month !== null && Number(crime.month) !== Number(month)) {
                    return false;
                }


                return true;
            });

            // Extract features from filtered crimes
            const features = filteredCrimes.map(crime => {
                const crimeCount = crime.number_of_crime || 0;

                return {
                    type: "Feature",
                    properties: {
                        district_id: crime.district_id,
                        district_name: crime.districts ? crime.districts.name : "Unknown",
                        crime_count: crimeCount,
                        level: crime.level,
                        category: filterCategory !== "all" ? filterCategory : "All",
                        year: crime.year,
                        month: crime.month,
                        weight: crimeCount,
                    },
                    geometry: {
                        type: "Point",
                        coordinates: [
                            crime.districts?.geographics?.[0]?.longitude || 0,
                            crime.districts?.geographics?.[0]?.latitude || 0,
                        ],
                    },
                } as GeoJSON.Feature;
            }).filter(feature =>
                feature.properties &&
                feature.properties.crime_count > 0
            ) as GeoJSON.Feature[];

            const currentSource = map.getSource("cbu-crime-incidents") as mapboxgl.GeoJSONSource;

            currentSource.setData({
                type: "FeatureCollection",
                features: features,
            });

            console.log(`CBU source updated with ${features.length} features`);

            // Ensure visibility is correct for updated data
            const shouldBeVisible = visible && showClusters && !focusedDistrictId && sourceType === "cbu";

            LAYER_IDS.forEach(layerId => {
                if (map.getLayer(layerId)) {
                    map.setLayoutProperty(layerId, "visibility", shouldBeVisible ? "visible" : "none");
                    console.log(`Updated ${layerId} visibility to: ${shouldBeVisible ? "visible" : "none"}`);
                }
            });
        } catch (error) {
            console.error("Error updating CBU cluster data:", error);
        }
    }, [
        map,
        visible,
        showClusters,
        focusedDistrictId,
        crimes,
        filterCategory,
        year,
        month
    ])

    return null
}