"use client"

import { useEffect, useCallback } from "react"
import mapboxgl, { DataDrivenPropertyValueSpecification } from "mapbox-gl"
import type { GeoJSON } from "geojson"
import type { IClusterLayerProps } from "@/app/_utils/types/map"
import { extractCrimeIncidents } from "@/app/_utils/map/common"
import { manageLayerVisibility } from "@/app/_utils/map/layer-visibility"
import { ICrimes } from "@/app/_utils/types/crimes"
import { BASE_DURATION, BASE_PITCH, BASE_ZOOM } from "@/app/_utils/const/map"

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
  // Define layer IDs for consistent management - CBT specific
  const LAYER_IDS = ['cbt-clusters', 'cbt-cluster-count'];

  const currentYear = new Date().getFullYear();
  const isCurrentYear = Number(year) === currentYear;

  // Log data source for debugging
  useEffect(() => {
    console.log(`CBT Cluster Layer - Using crime incidents data for ${year}: ${crimes.length} crimes`);
    console.log(`Is current year: ${isCurrentYear}, Real-time crime_incidents enabled in Supabase`);
  }, [year, isCurrentYear, crimes.length]);

  const handleClusterClick = useCallback(
    (e: any) => {
      if (!map) return

      e.originalEvent.stopPropagation()
      e.preventDefault()

      const features = map.queryRenderedFeatures(e.point, { layers: ["cbt-clusters"] })

      if (!features || features.length === 0) return

      const clusterId: number = features[0].properties?.cluster_id as number

      try {
        ; (map.getSource("cbt-crime-incidents") as mapboxgl.GeoJSONSource).getClusterExpansionZoom(
          clusterId,
          (err, zoom) => {
            if (err) {
              console.error("Error getting cluster expansion zoom:", err)
              return
            }

            const coordinates = (features[0].geometry as any).coordinates

            map.flyTo({
              center: coordinates,
              zoom: zoom ?? BASE_ZOOM,
              bearing: 0,
              pitch: BASE_PITCH,
              duration: BASE_DURATION,
            })
          },
        )
      } catch (error) {
        console.error("Error handling cluster click:", error)
      }
    },
    [map],
  )

  // Use centralized layer visibility management
  useEffect(() => {
    if (!map) return;

    return manageLayerVisibility(map, LAYER_IDS, visible && showClusters && !focusedDistrictId);
  }, [map, visible, showClusters, focusedDistrictId]);

  useEffect(() => {
    if (!map || !visible) return

    const onStyleLoad = () => {
      if (!map) return

      try {
        const layers = map.getStyle().layers
        let firstSymbolId: string | undefined
        for (const layer of layers) {
          if (layer.type === "symbol") {
            firstSymbolId = layer.id
            break
          }
        }

        if (!map.getSource("cbt-crime-incidents")) {
          // Extract crime incidents from crimes data (CBT only)
          // This will automatically get real-time data for current year from Supabase
          let features = extractCrimeIncidents(crimes as ICrimes[], filterCategory).filter(Boolean) as GeoJSON.Feature[]

          // Add metadata for current year data (real-time from Supabase)
          if (isCurrentYear) {
            features = features.map(feature => ({
              ...feature,
              properties: {
                ...feature.properties,
                isRealTime: true,
                year: Number(year),
                lastUpdate: new Date().toISOString(),
                dataSource: 'supabase_realtime'
              }
            }));
          }

          map.addSource("cbt-crime-incidents", {
            type: "geojson",
            data: {
              type: "FeatureCollection",
              features: features,
            },
            cluster: clusteringEnabled,
            clusterMaxZoom: 14,
            clusterRadius: 50,
          })

          if (!map.getLayer("cbt-clusters")) {
            // Enhanced cluster styling for current year real-time data
            const clusterColorExpression = (isCurrentYear
              ? ["step", ["get", "point_count"], "#10b981", 5, "#f59e0b", 15, "#ef4444"] // Green-yellow-red for real-time
              : ["step", ["get", "point_count"], "#51bbd6", 5, "#f1f075", 15, "#f28cb1"]) as DataDrivenPropertyValueSpecification<string>; // Original colors for historical

            map.addLayer(
              {
                id: "cbt-clusters",
                type: "circle",
                source: "cbt-crime-incidents",
                filter: ["has", "point_count"],
                paint: {
                  "circle-color": clusterColorExpression,
                  "circle-radius": ["step", ["get", "point_count"], 20, 5, 30, 15, 40],
                  "circle-opacity": 0.75,
                  // Add stroke for current year clusters
                  "circle-stroke-width": isCurrentYear ? 2 : 0,
                  "circle-stroke-color": isCurrentYear ? "#ffffff" : "transparent",
                },
                layout: {
                  visibility: showClusters && !focusedDistrictId ? "visible" : "none",
                },
              },
              firstSymbolId,
            )
          }

          if (!map.getLayer("cbt-cluster-count")) {
            map.addLayer({
              id: "cbt-cluster-count",
              type: "symbol",
              source: "cbt-crime-incidents",
              filter: ["has", "point_count"],
              layout: {
                "text-field": "{point_count_abbreviated}",
                "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
                "text-size": 12,
                visibility: showClusters && !focusedDistrictId ? "visible" : "none",
              },
              paint: {
                "text-color": "#ffffff",
              },
            })
          }

          // Event handlers for clusters
          map.on("mouseenter", "cbt-clusters", () => {
            map.getCanvas().style.cursor = "pointer"
          })

          map.on("mouseleave", "cbt-clusters", () => {
            map.getCanvas().style.cursor = ""
          })

          map.off("click", "cbt-clusters", handleClusterClick)
          map.on("click", "cbt-clusters", handleClusterClick)
        } else {
          // Update existing source with new data
          try {
            const currentSource = map.getSource("cbt-crime-incidents") as mapboxgl.GeoJSONSource

            // Extract crime incidents from updated crimes data
            let features = extractCrimeIncidents(crimes as ICrimes[], filterCategory).filter(Boolean) as GeoJSON.Feature[]

            // Add metadata for current year data
            if (isCurrentYear) {
              features = features.map(feature => ({
                ...feature,
                properties: {
                  ...feature.properties,
                  isRealTime: true,
                  year: Number(year),
                  lastUpdate: new Date().toISOString(),
                  dataSource: 'supabase_realtime'
                }
              }));
            }

            // Update the source data
            currentSource.setData({
              type: "FeatureCollection",
              features: features,
            })

            // Update cluster colors based on data type
            if (map.getLayer("cbt-clusters")) {
              const clusterColorExpression = (isCurrentYear
                ? ["step", ["get", "point_count"], "#10b981", 5, "#f59e0b", 15, "#ef4444"]
                : ["step", ["get", "point_count"], "#51bbd6", 5, "#f1f075", 15, "#f28cb1"]) as DataDrivenPropertyValueSpecification<string>;

              map.setPaintProperty("cbt-clusters", "circle-color", clusterColorExpression);
              map.setPaintProperty("cbt-clusters", "circle-stroke-width", isCurrentYear ? 2 : 0);
              map.setPaintProperty("cbt-clusters", "circle-stroke-color", isCurrentYear ? "#ffffff" : "transparent");
            }

            console.log(`Updated CBT crime incident clusters: ${features.length} incidents ${isCurrentYear ? "(Real-time from Supabase)" : "(Historical)"}`);
          } catch (error) {
            console.error("Error updating CBT cluster source:", error)
          }

          // Update visibility for existing layers
          if (map.getLayer("cbt-clusters")) {
            map.setLayoutProperty("cbt-clusters", "visibility", showClusters && !focusedDistrictId ? "visible" : "none")
          }

          if (map.getLayer("cbt-cluster-count")) {
            map.setLayoutProperty("cbt-cluster-count", "visibility", showClusters && !focusedDistrictId ? "visible" : "none")
          }

          map.off("click", "cbt-clusters", handleClusterClick)
          map.on("click", "cbt-clusters", handleClusterClick)
        }
      } catch (error) {
        console.error("Error adding CBT cluster layer:", error)
      }
    }

    if (map.isStyleLoaded()) {
      onStyleLoad()
    } else {
      map.once("style.load", onStyleLoad)
    }

    return () => {
      if (map) {
        map.off("click", "cbt-clusters", handleClusterClick)
      }
    }
  }, [
    map,
    visible,
    crimes, // Direct dependency on crimes data
    filterCategory,
    focusedDistrictId,
    handleClusterClick,
    clusteringEnabled,
    showClusters,
    sourceType,
    isCurrentYear,
    year,
  ])

  // Visibility effect
  useEffect(() => {
    if (!map) return

    try {
      if (map.getLayer("cbt-clusters")) {
        map.setLayoutProperty("cbt-clusters", "visibility", showClusters && !focusedDistrictId ? "visible" : "none")
      }

      if (map.getLayer("cbt-cluster-count")) {
        map.setLayoutProperty(
          "cbt-cluster-count",
          "visibility",
          showClusters && !focusedDistrictId ? "visible" : "none",
        )
      }
    } catch (error) {
      console.error("Error updating CBT cluster visibility:", error)
    }
  }, [map, showClusters, focusedDistrictId])

  return null
}