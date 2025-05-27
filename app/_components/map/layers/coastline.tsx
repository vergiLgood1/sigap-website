"use client"

import React, { useEffect } from 'react';
import mapboxgl from 'mapbox-gl';

interface CoastlineLayerProps {
    map: mapboxgl.Map | null;
    visible?: boolean;
}

export default function CoastlineLayer({ map, visible = true }: CoastlineLayerProps) {
    useEffect(() => {
        if (!map) return;

        // Function to add coastline layer
        function addCoastline() {
            const sourceId = 'coastline_id';
            const layerId = 'outline-coastline';

            // Make sure map is defined
            if (!map) return;

            try {
                // More robust check if the source already exists
                let sourceExists = false;
                try {
                    sourceExists = !!map.getSource(sourceId);
                } catch (e) {
                    sourceExists = false;
                }

                if (!sourceExists) {
                    // Add coastline data source
                    fetch('/geojson/garis_pantai.geojson')
                        .then(response => response.json())
                        .then(data => {
                            // Double-check the source doesn't exist right before adding
                            if (!map.getSource(sourceId)) {
                                // Add coastline data source
                                map.addSource(sourceId, {
                                    type: 'geojson',
                                    generateId: true,
                                    data: data
                                });

                                // Add coastline layer
                                map.addLayer({
                                    'id': layerId,
                                    'type': 'line',
                                    'source': sourceId,
                                    'layout': {
                                        'visibility': visible ? 'visible' : 'none',
                                    },
                                    'paint': {
                                        'line-color': '#1a1a1a', // dull white color instead of ['get', 'color']
                                        'line-width': 5,
                                        'line-opacity': 1
                                    }
                                });
                            }
                        })
                        .catch((error) => {
                            console.error('Error fetching coastline data:', error);
                        });
                } else if (map.getLayer(layerId)) {
                    // If the layer exists, just update its visibility
                    map.setLayoutProperty(
                        layerId,
                        'visibility',
                        visible ? 'visible' : 'none'
                    );
                }
            } catch (error) {
                console.warn("Error adding coastline:", error);
            }
        }

        // Function to clean up layers
        function cleanupCoastline() {
            try {
                if (!map || !map.getStyle()) return;

                const layerId = 'outline-coastline';
                const sourceId = 'coastline_id';

                if (map.getLayer(layerId)) {
                    map.removeLayer(layerId);
                }

                if (map.getSource(sourceId)) {
                    map.removeSource(sourceId);
                }
            } catch (error) {
                console.warn("Error cleaning up coastline:", error);
            }
        }

        let timeoutId: NodeJS.Timeout | undefined;

        // Try to add the layers now or set up listeners for when map is ready
        try {
            if (map.loaded() && map.isStyleLoaded()) {
                addCoastline();
            } else {
                // Reduce event listeners to minimize duplicates
                const addLayerOnce = () => {
                    // Remove all listeners after first successful execution
                    map.off('load', addLayerOnce);
                    map.off('style.load', addLayerOnce);
                    map.off('styledata', addLayerOnce);
                    clearTimeout(timeoutId);

                    addCoastline();
                };

                map.on('load', addLayerOnce);
                map.on('style.load', addLayerOnce);
                map.on('styledata', addLayerOnce);

                // Fallback timeout
                timeoutId = setTimeout(() => {
                    addLayerOnce();
                }, 2000);
            }
        } catch (error) {
            console.warn("Error setting up coastline:", error);
        }

        // Single cleanup function
        return () => {
            if (timeoutId) clearTimeout(timeoutId);

            if (map) {
                map.off('load', addCoastline);
                map.off('style.load', addCoastline);
                map.off('styledata', addCoastline);
            }

            cleanupCoastline();
        };
    }, [map, visible]);

    return null;
}
