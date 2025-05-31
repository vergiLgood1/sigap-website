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
    const layerIds = ['cbu-clusters', 'cbu-cluster-count', 'cbu-crime-points', 'cbu-crime-count-labels'];

    // Filter crimes by sourceType = cbu and match year/month criteria
    const getCBUCrimes = useCallback(() => {
        try {
            const selectedYear = year ? Number(year) : new Date().getFullYear();

            return crimes.filter(crime => {
                // Filter by source type
                if (crime.source_type !== "cbu") return false;

                // Filter by year
                if (crime.year !== selectedYear) return false;

                // If specific month is selected, filter by month
                // If month is "all" or null, include crimes with null month for that year
                if (month !== "all" && month !== null) {
                    return crime.month === Number(month);
                } else {
                    return crime.month === null || crime.month === undefined;
                }
            });
        } catch (error) {
            console.error("Error filtering CBU crimes:", error);
            return [];
        }
    }, [crimes, year, month]);

    // Create GeoJSON from CBU crimes
    const geoJsonData = useCallback(() => {
        try {
            const cbuCrimes = getCBUCrimes();

            // Transform to GeoJSON format
            const features = cbuCrimes
                .map((crime) => {
                    try {
                        const district = crime.districts;
                        if (!district) return null;

                        // Find most recent geographic data
                        const geoArray = district.geographics || [];
                        if (geoArray.length === 0) return null;

                        const geo = [...geoArray]
                            .filter(g => g && g.longitude && g.latitude)
                            .sort((a, b) => ((b?.year || 0) - (a?.year || 0)))[0];

                        if (!geo || !geo.longitude || !geo.latitude) return null;

                        return {
                            type: "Feature" as const,
                            properties: {
                                id: crime.id || "",
                                district_id: crime.district_id || "",
                                district_name: district.name || "Unknown District",
                                number_of_crime: crime.number_of_crime || 0,
                                level: crime.level || "unknown",
                                year: crime.year || new Date().getFullYear(),
                                month: crime.month
                            },
                            geometry: {
                                type: "Point" as const,
                                coordinates: [
                                    Number(geo.longitude) || 0,
                                    Number(geo.latitude) || 0
                                ],
                            },
                        };
                    } catch (error) {
                        console.error("Error processing crime for GeoJSON:", error);
                        return null;
                    }
                })
                .filter(Boolean) as GeoJSON.Feature[];

            return {
                type: "FeatureCollection" as const,
                features,
            } as GeoJSON.FeatureCollection;
        } catch (error) {
            console.error("Error generating CBU GeoJSON data:", error);
            return {
                type: "FeatureCollection",
                features: []
            } as GeoJSON.FeatureCollection;
        }
    }, [getCBUCrimes]);

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
                // Add source if it doesn't exist
                map.addSource(sourceId, {
                    type: "geojson",
                    data: geoJsonData(),
                    cluster: clusteringEnabled,
                    clusterMaxZoom: 14,
                    clusterRadius: 50,
                });
            } else {
                // Update the source data
                (source as mapboxgl.GeoJSONSource).setData(geoJsonData());
            }

            // Add layers if they don't exist yet
            if (!layersAdded.current) {
                // Add cluster layer
                if (!map.getLayer("cbu-clusters")) {
                    map.addLayer({
                        id: "cbu-clusters",
                        type: "circle",
                        source: sourceId,
                        filter: ["has", "point_count"],
                        paint: {
                            "circle-color": [
                                "step",
                                ["get", "point_count"],
                                "#4287f5", // Light blue
                                10,
                                "#2970df", // Medium blue
                                30,
                                "#1657c0", // Dark blue
                            ],
                            "circle-radius": [
                                "step",
                                ["get", "point_count"],
                                20,
                                10,
                                30,
                                30,
                                40,
                            ],
                        },
                    });
                }

                // Add cluster count label
                if (!map.getLayer("cbu-cluster-count")) {
                    map.addLayer({
                        id: "cbu-cluster-count",
                        type: "symbol",
                        source: sourceId,
                        filter: ["has", "point_count"],
                        layout: {
                            "text-field": "{point_count_abbreviated}",
                            "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
                            "text-size": 12,
                            "text-allow-overlap": true
                        },
                    });
                }

                // Add unclustered crime points
                if (!map.getLayer("cbu-crime-points")) {
                    map.addLayer({
                        id: "cbu-crime-points",
                        type: "circle",
                        source: sourceId,
                        filter: ["!", ["has", "point_count"]],
                        paint: {
                            "circle-color": "#4287f5",
                            "circle-radius": [
                                "interpolate", ["linear"], ["zoom"],
                                10, ["*", 0.5, ["sqrt", ["get", "number_of_crime"]]],
                                16, ["*", 1.5, ["sqrt", ["get", "number_of_crime"]]]
                            ],
                            "circle-stroke-width": 1,
                            "circle-stroke-color": "#ffffff",
                            "circle-opacity": 0.8
                        }
                    });
                }

                // Add district crime count labels
                if (!map.getLayer("cbu-crime-count-labels")) {
                    map.addLayer({
                        id: "cbu-crime-count-labels",
                        type: "symbol",
                        source: sourceId,
                        filter: ["!", ["has", "point_count"]],
                        layout: {
                            "text-field": ["to-string", ["get", "number_of_crime"]],
                            "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
                            "text-size": 12,
                            "text-allow-overlap": true
                        },
                        paint: {
                            "text-color": "#ffffff"
                        }
                    });
                }

                layersAdded.current = true;
            }

            // Handle click events for CBU points and clusters
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

            // Handle click events on clusters to zoom in
            const handleClusterClick = (e: mapboxgl.MapMouseEvent & { features?: mapboxgl.MapboxGeoJSONFeature[] }) => {
                if (!e.features || e.features.length === 0 || !map) return;

                const feature = e.features[0];
                const clusterId = feature.properties?.cluster_id;

                try {
                    const source = map.getSource(sourceId) as mapboxgl.GeoJSONSource & { getClusterExpansionZoom: Function };
                    if (source && typeof source.getClusterExpansionZoom === 'function') {
                        source.getClusterExpansionZoom(
                            clusterId,
                            (error: Error | null | undefined, zoom: number | null | undefined) => {
                                if (error || zoom === null || zoom === undefined || !map) return;

                                const coordinates = (feature.geometry as GeoJSON.Point).coordinates.slice() as [number, number];
                                map.easeTo({
                                    center: coordinates,
                                    zoom: zoom
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

            // Add event listeners
            if (map.getLayer('cbu-clusters')) {
                map.on('click', 'cbu-clusters', handleClusterClick);
                map.on('mouseenter', 'cbu-clusters', () => {
                    if (map.getCanvas()) map.getCanvas().style.cursor = 'pointer';
                });
                map.on('mouseleave', 'cbu-clusters', () => {
                    if (map.getCanvas()) map.getCanvas().style.cursor = '';
                });
            }

            if (map.getLayer('cbu-crime-points')) {
                map.on('click', 'cbu-crime-points', handleCBUPointClick);
                map.on('mouseenter', 'cbu-crime-points', () => {
                    if (map.getCanvas()) map.getCanvas().style.cursor = 'pointer';
                });
                map.on('mouseleave', 'cbu-crime-points', () => {
                    if (map.getCanvas()) map.getCanvas().style.cursor = '';
                });
            }

            // Set visibility based on props
            manageLayerVisibility(map, layerIds, visible && showClusters && sourceType === 'cbu');

        } catch (error) {
            console.error("Error initializing CBU layer:", error);
        }

        return cleanup;
    }, [map, mapReady, geoJsonData, clusteringEnabled]);

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

    // Update layer visibility when visibility props change
    useEffect(() => {
        if (!map || !mapReady) return;

        try {
            manageLayerVisibility(map, layerIds, visible && showClusters && sourceType === 'cbu');
        } catch (error) {
            // Ignore visibility errors
        }
    }, [map, mapReady, visible, showClusters, sourceType]);

    return (
        <>
            {selectedIncident && (
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