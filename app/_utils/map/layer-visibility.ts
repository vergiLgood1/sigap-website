import type mapboxgl from "mapbox-gl"

/**
 * Centralized utility for managing layer visibility in Mapbox
 * 
 * @param map The Mapbox map instance
 * @param layerIds Array of layer IDs to manage
 * @param isVisible Whether the layers should be visible
 * @param onComplete Optional callback to run after visibility is set
 * @returns Cleanup function
 */
export const manageLayerVisibility = (
    map: mapboxgl.Map,
    layerIds: string[],
    isVisible: boolean,
    onComplete?: () => void
): (() => void) => {
    // Check if map is available
    if (!map) return () => { }

    // Set visibility for each layer
    layerIds.forEach(layerId => {
        try {
            if (map.getLayer(layerId)) {
                map.setLayoutProperty(
                    layerId,
                    'visibility',
                    isVisible ? 'visible' : 'none'
                )
            }
    } catch (error) {
        console.warn(`Failed to set visibility for layer ${layerId}:`, error)
    }
  })

    // Execute callback if provided
    if (onComplete) {
        onComplete()
    }

    // Return cleanup function
    return () => {
        if (!map) return
        // Hide layers on cleanup if needed
        if (isVisible) {
            layerIds.forEach(layerId => {
          try {
            if (map.getLayer(layerId)) {
              map.setLayoutProperty(layerId, 'visibility', 'none')
          }
        } catch (error) {
            // Ignore cleanup errors
        }
      })
      }
  }
}
