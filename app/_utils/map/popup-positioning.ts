/**
 * Utility functions for optimal popup positioning on maps
 */

import type mapboxgl from "mapbox-gl";

/**
 * Calculates the optimal position for a popup to be centered on screen
 * 
 * @param map The Mapbox map instance
 * @param coordinates The geographical coordinates [longitude, latitude]
 * @param popupHeight Estimated height of the popup in pixels
 * @returns Adjusted coordinates for better popup positioning
 */
export function calculateCenteredPopupPosition(
    map: mapboxgl.Map,
    coordinates: [number, number],
    popupHeight: number = 300
): [number, number] {
    if (!map) return coordinates;

    try {
        const mapHeight = map.getContainer().offsetHeight;
        const mapWidth = map.getContainer().offsetWidth;

        // Project geographical coordinates to pixel coordinates
        const pointPos = map.project(coordinates);

        // Calculate offset to position the point so the popup appears centered
        // Move the point up by half the popup height
        const offsetY = popupHeight / 2;

        // Create adjusted pixel coordinates (keep x the same, adjust y)
        const adjustedPixelPos = {
            x: pointPos.x,
            y: pointPos.y - offsetY
        };

        // Convert back to geographical coordinates
        const adjustedGeoCoords = map.unproject([adjustedPixelPos.x, adjustedPixelPos.y]);

        return [adjustedGeoCoords.lng, adjustedGeoCoords.lat];
    } catch (error) {
        console.warn("Error calculating centered popup position:", error);
        return coordinates; // Fall back to original coordinates
    }
}

/**
 * Calculates the optimal fly-to parameters for displaying a popup
 */
export function getFlyToOptionsForPopup(
    map: mapboxgl.Map,
    coordinates: [number, number],
    options: {
        popupHeight?: number;
        zoom?: number;
        pitch?: number;
        bearing?: number;
        duration?: number;
    } = {}
): mapboxgl.AnimationOptions & {
    center: mapboxgl.LngLatLike;
    zoom?: number;
    bearing?: number;
    pitch?: number;
} {
    const {
        popupHeight = 300,
        zoom = 15,
        pitch = 60,
        bearing = 0,
        duration = 1200
    } = options;

    try {
        const mapHeight = map.getContainer().offsetHeight;

        // Project geographical coordinates to pixel coordinates
        const pointPos = map.project(coordinates);

        // We want the point to be in the upper portion of the screen
        // to leave room for the popup below
        const offsetY = mapHeight / 4;  // Position at 1/4 from the top

        // Create adjusted pixel coordinates
        const adjustedPixelPos = {
            x: pointPos.x,
            y: pointPos.y - offsetY
        };

        // Convert back to geographical coordinates
        const adjustedGeoCoords = map.unproject([adjustedPixelPos.x, adjustedPixelPos.y]);

        return {
            center: [adjustedGeoCoords.lng, adjustedGeoCoords.lat],
            zoom,
            pitch,
            bearing,
            duration,
            essential: true
        };
    } catch (error) {
        console.warn("Error calculating fly-to options for popup:", error);

        // Fall back to basic options with original coordinates
        return {
            center: coordinates,
            zoom,
            pitch,
            bearing,
            duration
        };
    }
}

/**
 * Creates options for a smooth transition to a location while maintaining current view settings
 * 
 * @param map The mapbox map instance
 * @param coordinates The coordinates to center on [longitude, latitude]
 * @param options Optional settings for the transition
 * @returns Options for map.easeTo()
 */
export function createSmoothTransition(
    map: mapboxgl.Map | null,
    coordinates: [number, number],
    options: {
        duration?: number;
        easing?: (t: number) => number;
        offset?: [number, number];
    } = {}
): mapboxgl.CameraOptions & mapboxgl.AnimationOptions {
    if (!map) {
        return {
            center: coordinates,
            duration: options.duration || 1000
        };
    }

    const {
        duration = 1000,
        easing = (t) => t * (2 - t), // easeOutQuad
        offset = [0, 0]
    } = options;

    return {
        center: coordinates,
        offset,
        duration,
        easing,
        // Omit zoom, pitch, bearing to maintain current view
    };
}

/**
 * Positions the map view for optimal popup display
 * 
 * @param map The mapbox map instance
 * @param coordinates Location coordinates [longitude, latitude]
 * @param options Optional settings
 * @returns Map transition options with appropriate offsets
 */
export function positionForPopup(
    map: mapboxgl.Map | null,
    coordinates: [number, number],
    options: {
        duration?: number;
        popupHeight?: number;
        offsetY?: number;
    } = {}
): mapboxgl.CameraOptions & mapboxgl.AnimationOptions {
    if (!map) {
        return { center: coordinates };
    }

    const {
        duration = 1000,
        popupHeight = 280,
        offsetY
    } = options;

    // Calculate appropriate offset based on current map view
    const mapHeight = map.getCanvas().height;

    // If offsetY is provided, use it, otherwise calculate based on screen height
    // This positions the popup above center by approximately 1/4 of the map height
    const calculatedOffsetY = offsetY ?? -mapHeight / 5;

    return {
        center: coordinates,
        offset: [0, calculatedOffsetY], // Apply vertical offset to move marker up
        duration,
        easing: (t) => t * (2 - t), // easeOutQuad
    };
}

/**
 * Calculates an optimal offset for popup placement based on the current map view
 * 
 * @param map The mapbox map instance 
 * @param popupHeight Approximate height of the popup
 * @returns Offset as [x, y] array
 */
export function calculatePopupOffset(
    map: mapboxgl.Map | null,
    popupHeight: number = 300
): [number, number] {
    if (!map) return [0, 0];

    try {
        // Calculate an offset based on the current pitch value
        // Higher pitch values require larger offsets to center the popup
        const pitch = map.getPitch();
        const zoom = map.getZoom();

        // The higher the pitch, the more offset needed
        const pitchFactor = Math.sin(pitch * Math.PI / 180); // Convert to radians

        // Adjust y-offset based on pitch and zoom to center the popup
        const yOffset = -popupHeight * 0.5 * (1 + pitchFactor);

        return [0, yOffset];
    } catch (error) {
        console.warn("Error calculating popup offset:", error);
        return [0, 0];
    }
}
