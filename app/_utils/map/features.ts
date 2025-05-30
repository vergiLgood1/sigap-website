export function extractIncidentFeatures(feature: any) {
    if (!feature || !feature.properties) return null

    return {
        id: feature.properties.id,
        severity: feature.properties.severity,
        category: feature.properties.category,
        description: feature.properties.description,
        timestamp: feature.properties.timestamp ? new Date(feature.properties.timestamp) : null,
        coordinates: feature.geometry?.coordinates || [0, 0]
    }
}

export function extractUnitFeatures(feature: any) {
    if (!feature || !feature.properties) return null

    return {
        id: feature.properties.id,
        name: feature.properties.name,
        code: feature.properties.code,
        status: feature.properties.status,
        type: feature.properties.type,
        members: feature.properties.members,
        last_update: feature.properties.last_update ? new Date(feature.properties.last_update) : null,
        coordinates: feature.geometry?.coordinates || [0, 0]
    }
} 