import { Layer, Source } from "react-map-gl/mapbox";
import { useMemo, useEffect } from "react";
import { ICrimes } from "@/app/_utils/types/crimes";
import { manageLayerVisibility } from "@/app/_utils/map/layer-visibility";
import type mapboxgl from "mapbox-gl";

interface HeatmapLayerProps {
    crimes: ICrimes[];
    year: string;
    month: string;
    filterCategory: string | "all";
    visible?: boolean;
    useAllData?: boolean;
    enableInteractions?: boolean;
    setFocusedDistrictId?: (id: string | null, isMarkerClick?: boolean) => void;
    map?: mapboxgl.Map | null;
}

export default function HeatmapLayer({
    crimes,
    visible = true,
    useAllData = false,
    filterCategory,
    year,
    month,
    enableInteractions = true,
    setFocusedDistrictId,
    map
}: HeatmapLayerProps) {
    // Define layer IDs for consistent management
    const LAYER_IDS = ['crime-heatmap'];

    // Convert crime data to GeoJSON format for the heatmap
    const heatmapData = useMemo(() => {
        const features = crimes.flatMap(crime =>
            crime.crime_incidents
                .filter(incident => {
                    // Enhanced filtering logic
                    if (!incident.locations?.latitude || !incident.locations?.longitude) {
                        return false;
                    }

                    // Filter by category if specified
                    if (filterCategory !== "all" &&
                        incident.crime_categories?.name !== filterCategory) {
                        return false;
                    }

                    // Filter by year and month if not using all data
                    if (!useAllData && year && month) {
                        const incidentDate = new Date(incident.timestamp);
                        const incidentYear = incidentDate.getFullYear().toString();
                        const incidentMonth = (incidentDate.getMonth() + 1).toString();

                        if (incidentYear !== year || incidentMonth !== month) {
                            return false;
                        }
                    }

                    return true;
                })
                .map(incident => ({
                    type: "Feature" as const,
                    properties: {
                        id: incident.id,
                        category: incident.crime_categories?.name || "Unknown",
                        intensity: 1, // Base intensity value
                        timestamp: incident.timestamp ? new Date(incident.timestamp).getTime() : null,
                        districtId: crime.district_id // Add district ID for potential interactions
                    },
                    geometry: {
                        type: "Point" as const,
                        coordinates: [incident.locations!.longitude, incident.locations!.latitude],
                    },
                }))
        );

        return {
            type: "FeatureCollection" as const,
            features,
        };
    }, [crimes, filterCategory, useAllData, year, month]);

    // Manage layer visibility
    useEffect(() => {
        if (!map) return;

        return manageLayerVisibility(map, LAYER_IDS, visible);
    }, [map, visible]);

    if (!visible) return null;

    return (
        <Source id="crime-heatmap-data" type="geojson" data={heatmapData}>
            <Layer
                id="crime-heatmap"
                type="heatmap"
                paint={{
                    // Enhanced heatmap configuration
                    'heatmap-radius': [
                        'interpolate',
                        ['linear'],
                        ['zoom'],
                        8, 12,  // At zoom level 8, radius will be 12px
                        13, 30  // At zoom level 13, radius will be 30px
                    ],
                    'heatmap-intensity': [
                        'interpolate',
                        ['linear'],
                        ['zoom'],
                        8, 0.7,  // More intense at zoom level 8
                        13, 2.0  // Even more intense at zoom level 13
                    ],
                    // Improved color gradient for better visualization
                    'heatmap-color': [
                        'interpolate',
                        ['linear'],
                        ['heatmap-density'],
                        0, 'rgba(33,102,172,0)',
                        0.1, 'rgb(36,104,180)',
                        0.3, 'rgb(103,169,207)',
                        0.5, 'rgb(209,229,240)',
                        0.7, 'rgb(253,219,199)',
                        0.9, 'rgb(239,138,98)',
                        1, 'rgb(178,24,43)'
                    ],
                    // Higher opacity when showing all data for better visibility
                    'heatmap-opacity': useAllData ? 0.9 : 0.8,
                    // Heatmap weight based on properties
                    'heatmap-weight': [
                        'interpolate',
                        ['linear'],
                        ['get', 'intensity'],
                        0, 0.5,
                        5, 2
                    ],
                }}
            />
        </Source>
    );
}