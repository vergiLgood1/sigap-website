"use client"

import { useEffect, useCallback, useState, useRef } from "react"
import mapboxgl, { DataDrivenPropertyValueSpecification } from "mapbox-gl"
import type { GeoJSON } from "geojson"
import type { IClusterLayerProps } from "@/app/_utils/types/map"
import { extractCrimeIncidents } from "@/app/_utils/map/common"
import { manageLayerVisibility } from "@/app/_utils/map/layer-visibility"
import { useRealtimeKMeans } from "@/app/_hooks/use-realtime-kmeans"
import { ICrimes } from "@/app/_utils/types/crimes"
import IncidentPopup from "../pop-up/incident-popup"

interface ICrimeIncident {
  id: string;
  district?: string;
  category?: string;
  type_category?: string | null;
  description?: string;
  status: string;
  address?: string | null;
  timestamp?: Date;
  latitude?: number;
  longitude?: number;
}

interface ExtendedClusterLayerProps extends IClusterLayerProps {
  clusteringEnabled?: boolean
  showClusters?: boolean
  sourceType?: string
  year?: number | string
  month?: number | string
}

export default function CBTClusterLayer({
  visible = true,
  map,
  crimes = [],
  filterCategory = "all",
  focusedDistrictId,
  clusteringEnabled = false,
  showClusters = false,
  sourceType = "cbt",
  year,
  month,
}: ExtendedClusterLayerProps) {
  // State for incident popup
  const [selectedIncident, setSelectedIncident] = useState<ICrimeIncident | null>(null);
  const [mapReady, setMapReady] = useState<boolean>(false);
  const layersAdded = useRef<boolean>(false);
  const sourceId = "cbt-crimes";
  const layerIds = ['cbt-clusters', 'cbt-cluster-count', 'cbt-unclustered-point'];
  const [hasAddedSource, setHasAddedSource] = useState<boolean>(false);
  const prevSourceTypeRef = useRef<string>(sourceType);

  // Filter crimes by sourceType
  const cbtCrimes = crimes.filter(crime => crime.source_type === "cbt");

  // Log when source type changes for this component
  useEffect(() => {
    // When source type changes, log it
    if (prevSourceTypeRef.current !== sourceType) {
      console.log(`CBT Layer: Source type changed from ${prevSourceTypeRef.current} to ${sourceType}`);
      prevSourceTypeRef.current = sourceType;
    }
  }, [sourceType]);

  // Count and log CBT crimes
  useEffect(() => {
    // Only log if this is the active source type
    if (sourceType === "cbt") {
      const filteredCrimes = cbtCrimes.filter(crime => {
        const selectedYear = year ? Number(year) : new Date().getFullYear();
        // Filter by year
        if (crime.year !== selectedYear) return false;

        // If specific month is selected, filter by month
        if (month !== "all" && month !== null) {
          return crime.month === Number(month);
        }
        return true;
      });

      const totalIncidents = filteredCrimes.reduce((sum, crime) => {
        return sum + (crime.crime_incidents?.length || 0);
      }, 0);

      console.log(`CBT Layer: Found ${filteredCrimes.length} districts with ${totalIncidents} incidents for year ${year}, month ${month}`);
    }
  }, [cbtCrimes, year, month, sourceType]);

  // Extract detailed crime incidents for CBT visualization
  const geoJsonData = useCallback(() => {
    try {
      // If not the active source type, return empty data
      if (sourceType !== "cbt") {
        return {
          type: "FeatureCollection",
          features: []
        } as GeoJSON.FeatureCollection;
      }

      const incidents = extractCrimeIncidents(
        cbtCrimes,
        filterCategory
      );

      // Filter out null or undefined incidents
      const validIncidents = incidents.filter(incident =>
        incident && incident.geometry && incident.geometry.coordinates);

      // Transform to GeoJSON format
      const features = validIncidents.map((incident) => ({
        type: "Feature" as const,
        properties: {
          id: incident?.properties?.id || "unknown",
          district: incident?.properties?.district || "",
          category: incident?.properties?.category || "",
          type_category: incident?.properties?.category || null,
          description: incident?.properties?.description || "",
          status: incident?.properties?.status || "",
          address: incident?.properties?.address || null,
          timestamp: incident?.properties?.timestamp ?
            new Date(incident?.properties.timestamp).toISOString() : null,
        },
        geometry: {
          type: "Point" as const,
          coordinates: incident?.geometry.coordinates || [0, 0],
        },
      }));

      return {
        type: "FeatureCollection" as const,
        features,
      } as GeoJSON.FeatureCollection;
    } catch (error) {
      console.error("Error generating CBT GeoJSON data:", error);
      return {
        type: "FeatureCollection",
        features: []
      } as GeoJSON.FeatureCollection;
    }
  }, [cbtCrimes, filterCategory, sourceType]);

  // Handle incident popup close
  const handlePopupClose = useCallback(() => {
    setSelectedIncident(null);
  }, []);

  // Check if map style is loaded
  useEffect(() => {
    if (!map) return;

    const checkIfStyleLoaded = () => {
      if (map.isStyleLoaded()) {
        setMapReady(true);
      } else {
        setTimeout(checkIfStyleLoaded, 100);
      }
    };

    checkIfStyleLoaded();
  }, [map]);

  // Add source and layers when map is ready
  useEffect(() => {
    if (!map || !mapReady) return;

    // Cleanup function to remove listeners
    const cleanup = () => {
      if (!map) return;

      // Remove event listeners
      layerIds.forEach(layerId => {
        try {
          if (map.getLayer(layerId)) {
            map.off('click', layerId, () => { });
            map.off('mouseenter', layerId, () => { });
            map.off('mouseleave', layerId, () => { });
          }
        } catch (e) {
        // Ignore errors during cleanup
        }
      });
    };

    try {
      // Check if source exists
      let source;
      try {
        source = map.getSource(sourceId);
      } catch (e) {
        // Source doesn't exist yet
      }

      if (!source) {
        // Add source if it doesn't exist
        map.addSource(sourceId, {
          type: "geojson",
          data: geoJsonData(),
          cluster: clusteringEnabled,
          clusterMaxZoom: 14,
          clusterRadius: 50,
        });
      } else {
        // Update the source data
        (source as mapboxgl.GeoJSONSource).setData(geoJsonData());
      }

      // Add layers if they don't exist yet
      if (!layersAdded.current) {
      // Add cluster layer
        if (!map.getLayer("cbt-clusters")) {
          map.addLayer({
            id: "cbt-clusters",
            type: "circle",
            source: sourceId,
            filter: ["has", "point_count"],
            paint: {
              "circle-color": [
                "step",
                ["get", "point_count"],
                "#51bbd6",
                10,
                "#f1f075",
                30,
                "#f28cb1",
              ],
              "circle-radius": [
                "step",
                ["get", "point_count"],
                20,
                10,
                30,
                30,
                40,
              ],
            },
          });
        }

        // Add count label layer
        if (!map.getLayer("cbt-cluster-count")) {
          map.addLayer({
            id: "cbt-cluster-count",
            type: "symbol",
            source: sourceId,
            filter: ["has", "point_count"],
            layout: {
              "text-field": "{point_count_abbreviated}",
              "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
              "text-size": 12,
            },
          });
        }

        // Add unclustered point layer
        if (!map.getLayer("cbt-unclustered-point")) {
          map.addLayer({
            id: "cbt-unclustered-point",
            type: "circle",
            source: sourceId,
            filter: ["!", ["has", "point_count"]],
            paint: {
              "circle-color": "#11b4da",
              "circle-radius": 8,
              "circle-stroke-width": 1,
              "circle-stroke-color": "#fff",
            },
          });
        }

        layersAdded.current = true;
      }

      // Handle click events on unclustered points
      const handleUnclusteredClick = (e: mapboxgl.MapMouseEvent & { features?: mapboxgl.MapboxGeoJSONFeature[] }) => {
        if (!e.features || e.features.length === 0) return;

        const feature = e.features[0];
        const coordinates = (feature.geometry as GeoJSON.Point).coordinates.slice() as [number, number];
        const properties = feature.properties || {};

        // Create incident object for popup
        const incident: ICrimeIncident = {
          id: properties.id || "unknown",
          district: properties.district || undefined,
          category: properties.category || undefined,
          type_category: properties.type_category || undefined,
          description: properties.description || undefined,
          status: properties.status || "unknown",
          address: properties.address || undefined,
          timestamp: properties.timestamp ? new Date(properties.timestamp) : undefined,
          latitude: coordinates[1],
          longitude: coordinates[0]
        };

        setSelectedIncident(incident);
      };

      // Handle click events on clusters to zoom in
      const handleClusterClick = (e: mapboxgl.MapMouseEvent & { features?: mapboxgl.MapboxGeoJSONFeature[] }) => {
        if (!e.features || e.features.length === 0 || !map) return;

        const feature = e.features[0];
        const clusterId = feature.properties?.cluster_id;

        try {
          const source = map.getSource(sourceId) as mapboxgl.GeoJSONSource & { getClusterExpansionZoom: Function };
          if (source && typeof source.getClusterExpansionZoom === 'function') {
            source.getClusterExpansionZoom(
              clusterId,
              (error: Error | null | undefined, zoom: number | null | undefined) => {
                if (error || zoom === null || zoom === undefined || !map) return;

                const coordinates = (feature.geometry as GeoJSON.Point).coordinates.slice() as [number, number];
                map.easeTo({
                  center: coordinates,
                  zoom: zoom
                });
              }
            );
          }
        } catch (error) {
          console.error("Error handling cluster click:", error);
        }
      };

      // Clean up previous event listeners
      cleanup();

      // Add event listeners
      if (map.getLayer('cbt-clusters')) {
        map.on('click', 'cbt-clusters', handleClusterClick);
        map.on('mouseenter', 'cbt-clusters', () => {
          if (map.getCanvas()) map.getCanvas().style.cursor = 'pointer';
        });
        map.on('mouseleave', 'cbt-clusters', () => {
          if (map.getCanvas()) map.getCanvas().style.cursor = '';
        });
      }

      if (map.getLayer('cbt-unclustered-point')) {
        map.on('click', 'cbt-unclustered-point', handleUnclusteredClick);
        map.on('mouseenter', 'cbt-unclustered-point', () => {
          if (map.getCanvas()) map.getCanvas().style.cursor = 'pointer';
        });
        map.on('mouseleave', 'cbt-unclustered-point', () => {
          if (map.getCanvas()) map.getCanvas().style.cursor = '';
        });
      }

      // Set visibility based on props
      manageLayerVisibility(map, layerIds, visible && showClusters && sourceType === 'cbt');

    } catch (error) {
      console.error("Error initializing CBT layer:", error);
    }

    return cleanup;
  }, [map, mapReady, geoJsonData, clusteringEnabled, visible, showClusters, sourceType]);

  // Update source data when relevant props change
  useEffect(() => {
    if (!map || !mapReady) return;

    try {
      const source = map.getSource(sourceId) as mapboxgl.GeoJSONSource;
      if (source && typeof source.setData === 'function') {
        source.setData(geoJsonData());
      }
    } catch (error) {
    // Ignore errors - source might not be initialized yet
    }
  }, [map, mapReady, geoJsonData, cbtCrimes, filterCategory, year, month]);

  // Update layer visibility more explicitly
  useEffect(() => {
    if (!map || !mapReady) return;

    const isActive = visible && showClusters && sourceType === 'cbt';
    console.log(`CBT Layer: Setting visibility to ${isActive ? 'visible' : 'hidden'} (sourceType=${sourceType})`);

    try {
      manageLayerVisibility(map, layerIds, isActive);
    } catch (error) {
      console.error("Error updating CBT layer visibility:", error);
    }
  }, [map, mapReady, visible, showClusters, sourceType]);

  return (
    <>
      {selectedIncident && sourceType === "cbt" && (
        <IncidentPopup
          longitude={selectedIncident.longitude || 0}
          latitude={selectedIncident.latitude || 0}
          onClose={handlePopupClose}
          incident={{
            id: selectedIncident.id,
            category: selectedIncident.category,
            description: selectedIncident.description,
            date: selectedIncident.timestamp,
            district: selectedIncident.district,
          }}
        />
      )}
    </>
  );
}