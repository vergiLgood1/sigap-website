"use client"

import { useEffect, useCallback, useState, useRef } from "react"
import mapboxgl from "mapbox-gl"
import type { GeoJSON } from "geojson"
import type { IClusterLayerProps } from "@/app/_utils/types/map"
import { manageLayerVisibility } from "@/app/_utils/map/layer-visibility"
import IncidentPopup from "../pop-up/incident-popup"

interface ICrimeIncident {
    id: string;
    district?: string;
    category?: string;
    type_category?: string | null;
    description?: string;
    status: string;
    address?: string | null;
    timestamp?: Date;
    latitude?: number;
    longitude?: number;
    district_id?: string;
    number_of_crime?: number;
    level?: string;
}

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
    // State for the selected incident to display in popup
    const [selectedIncident, setSelectedIncident] = useState<ICrimeIncident | null>(null);
    const [mapReady, setMapReady] = useState<boolean>(false);
    const layersAdded = useRef<boolean>(false);
    const sourceId = "cbu-crimes";
    const layerIds = ['cbu-clusters', 'cbu-cluster-count', 'cbu-unclustered-point', 'cbu-unclustered-count'];

    // Track total crime count for debugging
    const [totalCrimeCount, setTotalCrimeCount] = useState<number>(0);

    const prevSourceTypeRef = useRef<string>(sourceType);

    // Log when source type changes for this component
    useEffect(() => {
        // When source type changes, log it
        if (prevSourceTypeRef.current !== sourceType) {
            console.log(`CBU Layer: Source type changed from ${prevSourceTypeRef.current} to ${sourceType}`);
            prevSourceTypeRef.current = sourceType;
        }
    }, [sourceType]);

    // Filter crimes by sourceType = cbu and match year/month criteria
    const getCBUCrimes = useCallback(() => {
        try {
            // If not the active source type, return empty data
            if (sourceType !== "cbu") {
                return [];
            }

            const selectedYear = year ? Number(year) : new Date().getFullYear();

            // Filter crimes by source type, year, and month
            const filteredCrimes = crimes.filter(crime => {
                // Filter by source type
                if (crime.source_type !== "cbu") return false;

                // Filter by year
                if (crime.year !== selectedYear) return false;

                // If specific month is selected, filter by month
                if (month !== "all" && month !== null) {
                    return crime.month === Number(month);
                } else {
                    return crime.month === null || crime.month === undefined;
                }
            });

            // Calculate total crime count for debugging
            const totalCrimesCount = filteredCrimes.reduce((sum, crime) =>
                sum + (crime.number_of_crime || 0), 0);

            setTotalCrimeCount(totalCrimesCount);

            // Only log if this is the active source type
            if (sourceType === "cbu") {
                console.log(`CBU total crimes: ${totalCrimesCount} across ${filteredCrimes.length} districts for year ${selectedYear}, month ${month}`);
            }

            return filteredCrimes;
        } catch (error) {
            console.error("Error filtering CBU crimes:", error);
            return [];
        }
    }, [crimes, year, month, sourceType]);

    // Create GeoJSON from CBU crimes
    const geoJsonData = useCallback(() => {
        try {
            // If not the active source type, return empty data
            if (sourceType !== "cbu") {
                return {
                    type: "FeatureCollection",
                    features: []
                } as GeoJSON.FeatureCollection;
            }

            const cbuCrimes = getCBUCrimes();

            // Transform to GeoJSON format with actual crime counts
            const features: GeoJSON.Feature[] = [];

            cbuCrimes.forEach((crime) => {
                try {
                    const district = crime.districts;
                    if (!district) return;

                    // Find most recent geographic data
                    const geoArray = district.geographics || [];
                    if (geoArray.length === 0) return;

                    const geo = [...geoArray]
                        .filter(g => g && g.longitude && g.latitude)
                        .sort((a, b) => ((b?.year || 0) - (a?.year || 0)))[0];

                    if (!geo || !geo.longitude || !geo.latitude) return;

                    // Use the actual number_of_crime from the crime data
                    const crimeCount = crime.number_of_crime || 0;

                    // Only add districts with crimes
                    if (crimeCount > 0) {
                        features.push({
                            type: "Feature",
                            properties: {
                                id: crime.id || "",
                                district_id: crime.district_id || "",
                                district_name: district.name || "Unknown District",
                                number_of_crime: crimeCount,
                                level: crime.level || "unknown",
                                year: crime.year || new Date().getFullYear(),
                                month: crime.month,
                                // For clustering to work with point_count
                                crime_count: crimeCount,
                                // Weight feature for clustering algorithm
                                weight: crimeCount
                            },
                            geometry: {
                                type: "Point",
                                coordinates: [
                                    Number(geo.longitude) || 0,
                                    Number(geo.latitude) || 0
                                ],
                            },
                        });
                    }
                } catch (error) {
                    console.error("Error processing crime for GeoJSON:", error);
                }
            });

            return {
                type: "FeatureCollection",
                features
            } as GeoJSON.FeatureCollection;
        } catch (error) {
            console.error("Error generating CBU GeoJSON data:", error);
            return {
                type: "FeatureCollection",
                features: []
            } as GeoJSON.FeatureCollection;
        }
    }, [getCBUCrimes, sourceType]);

    // Handler for closing the popup
    const handlePopupClose = useCallback(() => {
        setSelectedIncident(null);
    }, []);

    // Check if map style is loaded
    useEffect(() => {
        if (!map) return;

        const checkIfStyleLoaded = () => {
            if (map.isStyleLoaded()) {
                setMapReady(true);
            } else {
                setTimeout(checkIfStyleLoaded, 100);
            }
        };

        checkIfStyleLoaded();
    }, [map]);

    // Add source and layers when map is ready
    useEffect(() => {
        if (!map || !mapReady) return;

        // Cleanup function to remove listeners
        const cleanup = () => {
            if (!map) return;

            // Remove event listeners
            layerIds.forEach(layerId => {
                try {
                    if (map.getLayer(layerId)) {
                        map.off('click', layerId, () => { });
                        map.off('mouseenter', layerId, () => { });
                        map.off('mouseleave', layerId, () => { });
                    }
                } catch (e) {
                    // Ignore errors during cleanup
                }
            });
        };

        try {
            // Check if source exists
            let source;
            try {
                source = map.getSource(sourceId);
            } catch (e) {
                // Source doesn't exist yet
            }

            if (!source) {
                // Add source with clustering enabled
                map.addSource(sourceId, {
                    type: "geojson",
                    data: geoJsonData(),
                    cluster: true,
                    clusterMaxZoom: 14,
                    clusterRadius: 80,
                    clusterProperties: {
                        // Sum the crime counts when clustering
                        sum: ["+", ["get", "number_of_crime"]]
                    }
                });
            } else {
                // Update the source data
                (source as mapboxgl.GeoJSONSource).setData(geoJsonData());
            }

            // Add layers if they don't exist yet
            if (!layersAdded.current) {
                // Add cluster circle layer with dynamic size based on crime count
                if (!map.getLayer("cbu-clusters")) {
                    map.addLayer({
                        id: "cbu-clusters",
                        type: "circle",
                        source: sourceId,
                        filter: ["has", "point_count"],
                        paint: {
                            // Size circles based on the sum of crime counts in the cluster
                            "circle-radius": [
                                "step",
                                ["get", "sum"],
                                15,  // Default radius
                                10, 25,  // 10+ crimes: radius 20
                                100, 30, // 100+ crimes: radius 30
                                200, 35, // 200+ crimes: radius 35
                                500, 40  // 500+ crimes: radius 40
                            ],
                            // Color circles based on the sum of crime counts
                            "circle-color": [
                                "step",
                                ["get", "sum"],
                                "#4287f5", // Light blue (low)
                                50, "#51bbd6", // Medium blue (medium low)
                                100, "#f1f075", // Dark blue (medium)
                                200, "#f28cb1", // Orange (medium high)
                                // 500, "#e53935"  // Red (high)
                            ],
                            // "circle-stroke-width": 1,
                            // "circle-stroke-color": "#ffffff",
                            "circle-opacity": 0.8
                        }
                    });
                }

                // Add cluster count label showing the sum of crimes
                if (!map.getLayer("cbu-cluster-count")) {
                    map.addLayer({
                        id: "cbu-cluster-count",
                        type: "symbol",
                        source: sourceId,
                        filter: ["has", "point_count"],
                        layout: {
                            "text-field": "{sum}",
                            "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
                            "text-size": 12,
                            "text-allow-overlap": true
                        },
                        paint: {
                            "text-color": "#ffffff"
                        }
                    });
                }

                // Add unclustered point layer
                if (!map.getLayer("cbu-unclustered-point")) {
                    map.addLayer({
                        id: "cbu-unclustered-point",
                        type: "circle",
                        source: sourceId,
                        filter: ["!", ["has", "point_count"]],
                        minzoom: 7,
                        paint: {
                            // Color based on crime level
                            "circle-color": [
                                "match",
                                ["get", "level"],
                                "high", "#f28cb1",
                                "medium", "#f1f075",
                                "low", "#51bbd6",
                                "#4287f5" // default color
                            ],
                            // Size based on number_of_crime using a more subtle scale for individual points
                            "circle-radius": [
                                "interpolate",
                                ["linear"],
                                ["zoom"],
                                7, ["*", 0.4, ["sqrt", ["get", "number_of_crime"]]],
                                10, ["*", 0.6, ["sqrt", ["get", "number_of_crime"]]],
                                14, ["*", 1.0, ["sqrt", ["get", "number_of_crime"]]]
                            ],
                            // "circle-stroke-width": 1,
                            // "circle-stroke-color": "#ffffff",
                            "circle-opacity": 0.8
                        }
                    });
                }

                // Add unclustered point count label
                if (!map.getLayer("cbu-unclustered-count")) {
                    map.addLayer({
                        id: "cbu-unclustered-count",
                        type: "symbol",
                        source: sourceId,
                        filter: ["!", ["has", "point_count"]],
                        minzoom: 8, // Only show at higher zoom levels
                        layout: {
                            "text-field": [
                                "to-string",
                                ["get", "number_of_crime"]
                            ],
                            "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
                            "text-size": [
                                "interpolate",
                                ["linear"],
                                ["zoom"],
                                8, 10,  // smaller text at zoom level 8
                                12, 12   // larger text at zoom level 12
                            ],
                            "text-allow-overlap": true
                        },
                        paint: {
                            "text-color": "#ffffff"
                        }
                    });
                }

                layersAdded.current = true;
            }

            // Handle click events for CBU points 
            const handleCBUPointClick = (e: mapboxgl.MapMouseEvent & { features?: mapboxgl.MapboxGeoJSONFeature[] }) => {
                if (!e.features || e.features.length === 0) return;

                const feature = e.features[0];
                const properties = feature.properties || {};
                const coordinates = (feature.geometry as GeoJSON.Point).coordinates.slice() as [number, number];

                // Create a formatted description of the district crime stats
                const crimeDescription = `${properties.district_name} district has ${properties.number_of_crime} crime incidents recorded ${properties.month !== null ? `in month ${properties.month}` : 'across all months'
                    } of year ${properties.year}.`;

                // For CBU data, use a district-level incident representation
                const districtIncident: ICrimeIncident = {
                    id: properties.id || "unknown",
                    district: properties.district_name,
                    district_id: properties.district_id,
                    category: "District Crime Summary",
                    description: crimeDescription,
                    status: "summary",
                    number_of_crime: properties.number_of_crime,
                    level: properties.level,
                    latitude: coordinates[1],
                    longitude: coordinates[0],
                    timestamp: new Date(properties.year, properties.month ? properties.month - 1 : 0)
                };

                setSelectedIncident(districtIncident);
            };

            // Handle click events on clusters to zoom in or show detailed popup
            const handleClusterClick = (e: mapboxgl.MapMouseEvent & { features?: mapboxgl.MapboxGeoJSONFeature[] }) => {
                if (!e.features || e.features.length === 0 || !map) return;

                const feature = e.features[0];
                const clusterId = feature.properties?.cluster_id;
                const crimeSum = feature.properties?.sum || 0;
                const pointCount = feature.properties?.point_count || 0;
                const coordinates = (feature.geometry as GeoJSON.Point).coordinates.slice() as [number, number];

                // Get current zoom level
                const currentZoom = map.getZoom();

                // If already at high zoom level, show popup instead of zooming further
                if (currentZoom >= 12) {
                    const clusterDescription = `This area contains ${pointCount} districts with a total of ${crimeSum} crime incidents for ${month !== "all" && month !== null ? `month ${month}` : 'all months'
                        } of ${year}.`;

                    const clusterIncident: ICrimeIncident = {
                        id: `cluster-${clusterId}`,
                        district: `${pointCount} Districts`,
                        category: "Crime Cluster",
                        description: clusterDescription,
                        status: "summary",
                        number_of_crime: crimeSum,
                        latitude: coordinates[1],
                        longitude: coordinates[0],
                        timestamp: new Date()
                    };

                    setSelectedIncident(clusterIncident);
                    return;
                }

                // Otherwise zoom in to expand the cluster
                try {
                    const source = map.getSource(sourceId) as mapboxgl.GeoJSONSource & { getClusterExpansionZoom: Function };
                    if (source && typeof source.getClusterExpansionZoom === 'function') {
                        source.getClusterExpansionZoom(
                            clusterId,
                            (error: Error | null | undefined, zoom: number | null | undefined) => {
                                if (error || zoom === null || zoom === undefined || !map) return;

                                // Limit zoom level to avoid zooming in too far
                                const targetZoom = Math.min(zoom, 14);

                                map.easeTo({
                                    center: coordinates,
                                    zoom: targetZoom
                                });
                            }
                        );
                    }
                } catch (error) {
                    console.error("Error handling cluster click:", error);
                }
            };

            // Clean up previous event listeners
            cleanup();

            // Add event listeners for clusters
            if (map.getLayer('cbu-clusters')) {
                map.on('click', 'cbu-clusters', handleClusterClick);
                map.on('mouseenter', 'cbu-clusters', () => {
                    if (map.getCanvas()) map.getCanvas().style.cursor = 'pointer';
                });
                map.on('mouseleave', 'cbu-clusters', () => {
                    if (map.getCanvas()) map.getCanvas().style.cursor = '';
                });
            }

            // Add event listeners for unclustered points
            if (map.getLayer('cbu-unclustered-point')) {
                map.on('click', 'cbu-unclustered-point', handleCBUPointClick);
                map.on('mouseenter', 'cbu-unclustered-point', () => {
                    if (map.getCanvas()) map.getCanvas().style.cursor = 'pointer';
                });
                map.on('mouseleave', 'cbu-unclustered-point', () => {
                    if (map.getCanvas()) map.getCanvas().style.cursor = '';
                });
            }

            // Set visibility based on props
            manageLayerVisibility(map, layerIds, visible && showClusters && sourceType === 'cbu');

        } catch (error) {
            console.error("Error initializing CBU layer:", error);
        }

        return cleanup;
    }, [map, mapReady, geoJsonData]);

    // Update source data when relevant props change
    useEffect(() => {
        if (!map || !mapReady) return;

        try {
            const source = map.getSource(sourceId) as mapboxgl.GeoJSONSource;
            if (source && typeof source.setData === 'function') {
                source.setData(geoJsonData());
            }
        } catch (error) {
            // Ignore errors - source might not be initialized yet
        }
    }, [map, mapReady, geoJsonData, crimes, filterCategory, year, month]);

    // Update layer visibility more explicitly
    useEffect(() => {
        if (!map || !mapReady) return;

        const isActive = visible && showClusters && sourceType === 'cbu';

        try {
            // Force immediate visibility update based on current state
            layerIds.forEach(layerId => {
                if (map.getLayer(layerId)) {
                    map.setLayoutProperty(
                        layerId,
                        'visibility',
                        isActive ? 'visible' : 'none'
                    );
                }
            });

            // Log visibility change for debugging
            console.log(`CBU Layer: Set visibility to ${isActive ? 'visible' : 'hidden'} (sourceType=${sourceType})`);
        } catch (error) {
            console.error("Error updating CBU layer visibility:", error);
        }
    }, [map, mapReady, visible, showClusters, sourceType, layerIds]);

    return (
        <>
            {selectedIncident && sourceType === "cbu" && (
                <IncidentPopup
                    longitude={selectedIncident.longitude || 0}
                    latitude={selectedIncident.latitude || 0}
                    onClose={handlePopupClose}
                    incident={{
                        id: selectedIncident.id,
                        category: selectedIncident.category,
                        description: selectedIncident.description,
                        date: selectedIncident.timestamp,
                        district: selectedIncident.district,
                        district_id: selectedIncident.district_id,
                    }}
                />
            )}
        </>
    );
}