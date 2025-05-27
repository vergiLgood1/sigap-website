"use client"

import React, { useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import { manageLayerVisibility } from "@/app/_utils/map/layer-visibility"

interface FaultLinesLayerProps {
    map: mapboxgl.Map | null;
    visible?: boolean;
}

export default function FaultLinesLayer({ map, visible = true }: FaultLinesLayerProps) {
    // Define layer IDs for consistent management
    const LAYER_IDS = ['indo-faults-line-layer'];

    useEffect(() => {
        if (!map) return;

        // Function to add fault lines layer
        const setupFaultLines = () => {
            const sourceId = 'indo-faults-lines';
            const layerId = 'indo-faults-line-layer';

            try {
                // Check if the source already exists
                if (!map.getSource(sourceId)) {
                    // Add fault lines data source
                    const url = "/geojson/indo_faults_lines.geojson";
                    map.addSource(sourceId, {
                        'type': 'geojson',
                        'generateId': true,
                        'data': url
                    });

                    // Add a line layer to visualize the fault lines
                    map.addLayer({
                        'id': layerId,
                        'type': 'line',
                        'source': sourceId,
                        'layout': {
                            'visibility': visible ? 'visible' : 'none'
                        },
                        'paint': {
                            'line-color': 'red',
                            'line-width': 1,
                            'line-opacity': 0.5
                        }
                    });
                }

                // Use the manageLayerVisibility utility to handle layer visibility
                manageLayerVisibility(map, LAYER_IDS, visible);
            } catch (error) {
                console.warn("Error adding fault lines:", error);
            }
        };

        // Try to add the layers now or set up listeners for when map is ready
        try {
            if (map.loaded() && map.isStyleLoaded()) {
                setupFaultLines();
            } else {
                // Use multiple events to catch map ready state
                map.once('load', setupFaultLines);
            }
        } catch (error) {
            console.warn("Error setting up fault lines:", error);
        }

        // Single cleanup function
        return () => {
            if (map) {
                map.off('load', setupFaultLines);
            }
        };
    }, [map, visible]);

    return null;
}
