import type mapboxgl from "mapbox-gl"

/**
 * Manages visibility for map layers in a consistent way
 * 
 * @param map The mapbox map instance
 * @param layerIds Array of layer IDs to manage
 * @param isVisible Boolean indicating if layers should be visible
 * @param onCleanup Optional callback function to execute during cleanup
 * @returns A cleanup function to remove listeners
 */
export function manageLayerVisibility(
    map: mapboxgl.Map | null | undefined,
    layerIds: string[],
    isVisible: boolean,
    onCleanup?: () => void
): () => void {
    if (!map) return () => { }

    // Check if map is loaded, if not wait for it
    if (!map.isStyleLoaded()) {
        const setupOnLoad = () => {
            updateLayersVisibility(map, layerIds, isVisible)
        }

        map.once('load', setupOnLoad)
        return () => {
            map.off('load', setupOnLoad)
            if (onCleanup) onCleanup()
        }
    }

    // Map is loaded, update visibility directly
    updateLayersVisibility(map, layerIds, isVisible)

    return () => {
        if (onCleanup) onCleanup()
    }
}

/**
 * Updates visibility for specified layers
 */
function updateLayersVisibility(
    map: mapboxgl.Map,
    layerIds: string[],
    isVisible: boolean
): void {
    layerIds.forEach(layerId => {
        if (map.getLayer(layerId)) {
            map.setLayoutProperty(
                layerId,
                "visibility",
                isVisible ? "visible" : "none"
            )
        }
    })
}
