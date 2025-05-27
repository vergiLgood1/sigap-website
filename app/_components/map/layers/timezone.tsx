"use client";

import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import { manageLayerVisibility } from "@/app/_utils/map/layer-visibility";
import { createRoot } from "react-dom/client";
import { Badge } from "../../ui/badge";

interface TimezoneLayerProps {
    map: mapboxgl.Map | null;
    visible?: boolean;
}

// Component to display time in a specific timezone
function Jam({ timeZone }: { timeZone: string }) {
    const [time, setTime] = React.useState<string>("");

    useEffect(() => {
        function updateTime() {
            const now = new Date();
            const options: Intl.DateTimeFormatOptions = {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit", // Added seconds display
                hour12: false,
                timeZone,
            };
            setTime(now.toLocaleTimeString("id-ID", options));
        }

        updateTime();
        const interval = setInterval(updateTime, 1000);
        return () => clearInterval(interval);
    }, [timeZone]);

    return <>{time}</>;
}

export default function TimezoneLayer({
    map,
    visible = true,
}: TimezoneLayerProps) {
    const hoverTimezone = useRef<any>(null);
    const markersRef = useRef<mapboxgl.Marker[]>([]);

    // Define layer IDs for consistent management
    const LAYER_IDS = ["timezone-layer"];

    useEffect(() => {
        if (!map) return;

        // Function to add timezone layer
        const setupTimezoneLayer = () => {
            const sourceId = "timezone-source";
            const layerId = "timezone-layer";

            try {
                // Check if the source already exists
                if (!map.getSource(sourceId)) {
                    // Add timezone data source
                    const url = "/geojson/timezones_wVVG8.geojson";
                    map.addSource(sourceId, {
                        type: "geojson",
                        generateId: true,
                        data: url,
                    });

                    // Add a line layer to visualize the timezones
                    map.addLayer({
                        id: layerId,
                        type: "line",
                        source: sourceId,
                        layout: {
                            visibility: visible ? "visible" : "none",
                        },
                        paint: {
                            "line-color": "green",
                            "line-width": 1,
                            "line-opacity": 0.5,
                            "line-dasharray": [2, 2],
                        },
                    });
                }

                // Create markers for Indonesian time zones
                const createTimeMarker = (
                    lngLat: [number, number],
                    timeZone: string,
                    label: string,
                ) => {
                    const markerElement = document.createElement("div");
                    const root = createRoot(markerElement);
                    root.render(
                        <div className="bordered p-1 text-time show-pop-up text-center">
                            <p
                                className="uppercase text-xl"
                                style={{
                                    lineHeight: "1rem",
                                }}
                            >
                                <Jam timeZone={timeZone} />
                            </p>
                            <Badge variant="outline" className="text-xs mt-1">
                                {label}
                            </Badge>
                        </div>,
                    );

                    const marker = new mapboxgl.Marker(markerElement)
                        .setLngLat(lngLat)
                        .addTo(map);

                    markersRef.current.push(marker);
                    return marker;
                };

                // WIB (GMT+7)
                createTimeMarker(
                    [107.4999769225339, 3.4359354227361933],
                    "Asia/Jakarta",
                    "WIB / GMT+7",
                );

                // WITA (GMT+8)
                createTimeMarker(
                    [119.1174733337183, 3.4359354227361933],
                    "Asia/Makassar",
                    "WITA / GMT+8",
                );

                // WIT (GMT+9)
                createTimeMarker(
                    [131.58387377752751, 3.4359354227361933],
                    "Asia/Jayapura",
                    "WIT / GMT+9",
                );

                // Use the manageLayerVisibility utility to handle layer visibility
                manageLayerVisibility(map, LAYER_IDS, visible);
            } catch (error) {
                console.warn("Error adding timezone layer:", error);
            }
        };

        // Try to add the layers now or set up listeners for when map is ready
        try {
            if (map.loaded() && map.isStyleLoaded()) {
                setupTimezoneLayer();
            } else {
                // Use event to catch map ready state
                map.once("load", setupTimezoneLayer);
            }
        } catch (error) {
            console.warn("Error setting up timezone layer:", error);
        }

        // Cleanup function
        return () => {
            if (map) {
                map.off("load", setupTimezoneLayer);
            }
        };
    }, [map, visible]);

    return null;
}
