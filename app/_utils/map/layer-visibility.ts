import type mapboxgl from "mapbox-gl"

/**
 * Manages layer visibility based on provided condition
 * 
 * @param map - MapboxGL map instance
 * @param layerIds - Array of layer IDs to manage
 * @param visible - Whether layers should be visible
 */
export function manageLayerVisibility(
    map: mapboxgl.Map | null | undefined,
    layerIds: string[],
    visible: boolean
) {
    if (!map) return;

    const visibilityValue: 'visible' | 'none' = visible ? 'visible' : 'none';

    // Check if style is loaded before attempting to change layer visibility
    if (!map.isStyleLoaded()) {
        // console.warn('Map style not yet loaded while trying to change layer visibility');

        // Try again after a short delay
        setTimeout(() => {
            if (map && map.isStyleLoaded()) {
                setLayersVisibility(map, layerIds, visibilityValue);
            }
        }, 100);
        return;
    }

    setLayersVisibility(map, layerIds, visibilityValue);
}

function setLayersVisibility(map: mapboxgl.Map, layerIds: string[], visibilityValue: 'visible' | 'none') {
    layerIds.forEach(layerId => {
        try {
            // Check if the layer exists first before trying to change its visibility
            if (map.getLayer(layerId)) {
                map.setLayoutProperty(layerId, 'visibility', visibilityValue);
                // console.log(`Set ${layerId} visibility to ${visibilityValue}`);
            } else {
                // console.log(`Layer ${layerId} not found on map`);
            }
        } catch (error) {
            console.warn(`Error setting ${layerId} visibility to ${visibilityValue}:`, error);
        }
    });
}
