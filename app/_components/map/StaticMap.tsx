import React from "react";
import { MapPin } from "lucide-react";

type StaticMapProps = {
    latitude: number;
    longitude: number;
    width?: number | string;
    height?: number | string;
    zoom?: number;
    markerColor?: string;
    className?: string;
    showCoordinates?: boolean;
};

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

export default function StaticMap({
    latitude,
    longitude,
    width = "100%",
    height = 300,
    zoom = 15,
    markerColor = "ff0000",
    className = "",
    showCoordinates = false,
}: StaticMapProps) {
    if (!MAPBOX_TOKEN) {
        return (
            <div
                className={`flex items-center justify-center bg-muted rounded-md border ${className}`}
                style={{ width, height }}
            >
                <div className="text-center">
                    <MapPin className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <span className="text-xs text-muted-foreground">
                        Mapbox token not configured
                    </span>
                </div>
            </div>
        );
    }

    // Validate coordinates
    if (
        !latitude ||
        !longitude ||
        latitude < -90 ||
        latitude > 90 ||
        longitude < -180 ||
        longitude > 180
    ) {
        return (
            <div
                className={`flex items-center justify-center bg-muted rounded-md border ${className}`}
                style={{ width, height }}
            >
                <div className="text-center">
                    <MapPin className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <span className="text-xs text-muted-foreground">
                        Invalid coordinates
                    </span>
                </div>
            </div>
        );
    }

    // Calculate dimensions for URL
    const widthPx = typeof width === "number" ? width : 600;
    const heightPx = typeof height === "number" ? height : parseInt(height?.toString() || "300");

    // Create marker for the map
    const marker = `pin-s+${markerColor}(${longitude},${latitude})`;

    // Generate Mapbox Static API URL
    const mapUrl = `https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/${marker}/${longitude},${latitude},${zoom}/${widthPx}x${heightPx}@2x?access_token=${MAPBOX_TOKEN}`;

    return (
        <div className={`relative ${className}`} style={{ width, height }}>
            <img
                src={mapUrl}
                alt={`Map showing location at ${latitude}, ${longitude}`}
                className="w-full h-full object-cover rounded-md border"
                style={{ width, height }}
                loading="lazy"
                onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                    const parent = target.parentElement;
                    if (parent) {
                        parent.innerHTML = `
              <div class="flex items-center justify-center bg-muted rounded-md border w-full h-full">
                <div class="text-center">
                  <div class="h-8 w-8 text-muted-foreground mx-auto mb-2">📍</div>
                  <span class="text-xs text-muted-foreground">Failed to load map</span>
                </div>
              </div>
            `;
                    }
                }}
            />

            {showCoordinates && (
                <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    {latitude.toFixed(6)}, {longitude.toFixed(6)}
                </div>
            )}

            {/* Overlay for click interaction */}
            <div
                className="absolute inset-0 cursor-pointer"
                onClick={() => {
                    // Open in Google Maps
                    const googleMapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
                    window.open(googleMapsUrl, "_blank");
                }}
                title="Click to open in Google Maps"
            />
        </div>
    );
}
