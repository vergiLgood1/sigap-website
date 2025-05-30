"use client"

import { useEffect, useCallback } from "react"
import mapboxgl from "mapbox-gl"
import type { GeoJSON } from "geojson"
import type { IClusterLayerProps } from "@/app/_utils/types/map"
import { extractCrimeIncidents } from "@/app/_utils/map/common"
import { manageLayerVisibility } from "@/app/_utils/map/layer-visibility"

interface ExtendedClusterLayerProps extends IClusterLayerProps {
  clusteringEnabled?: boolean
  showClusters?: boolean
  sourceType?: string
}

export default function ClusterLayer({
  visible = true,
  map,
  crimes = [],
  filterCategory = "all",
  focusedDistrictId,
  clusteringEnabled = false,
  showClusters = false,
  sourceType = "cbt",
}: ExtendedClusterLayerProps) {
  // Define layer IDs for consistent management
  const LAYER_IDS = ['clusters', 'cluster-count', 'crime-points', 'crime-count-labels'];

  const handleClusterClick = useCallback(
    (e: any) => {
      if (!map) return

      // Stop event propagation to prevent district layer from handling this click
      e.originalEvent.stopPropagation()
      e.preventDefault()

      const features = map.queryRenderedFeatures(e.point, { layers: ["clusters"] })

      if (!features || features.length === 0) return

      const clusterId: number = features[0].properties?.cluster_id as number

      try {
        ; (map.getSource("crime-incidents") as mapboxgl.GeoJSONSource).getClusterExpansionZoom(
          clusterId,
          (err, zoom) => {
            if (err) {
              console.error("Error getting cluster expansion zoom:", err)
              return
            }

            const coordinates = (features[0].geometry as any).coordinates

            map.flyTo({
              center: coordinates,
              zoom: zoom ?? 12,
              bearing: 0,
              pitch: 45,
              duration: 1000,
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

        if (!map.getSource("crime-incidents")) {
          let features: GeoJSON.Feature[] = []

          if (sourceType === "cbu") {
            features = crimes.map(crime => ({
              type: "Feature",
              properties: {
                district_id: crime.district_id,
                district_name: crime.districts ? crime.districts.name : "Unknown",
                crime_count: crime.number_of_crime || 0,
                level: crime.level,
                category: filterCategory !== "all" ? filterCategory : "All",
                year: crime.year,
                month: crime.month,
                isCBU: true,
              },
              geometry: {
                type: "Point",
                coordinates: [
                  crime.districts?.geographics?.[0]?.longitude || 0,
                  crime.districts?.geographics?.[0]?.latitude || 0,
                ],
              },
            })) as GeoJSON.Feature[]
          } else {
            features = extractCrimeIncidents(crimes, filterCategory).filter(Boolean) as GeoJSON.Feature[]
          }

          map.addSource("crime-incidents", {
            type: "geojson",
            data: {
              type: "FeatureCollection",
              features: features,
            },
            cluster: clusteringEnabled,
            clusterMaxZoom: 14,
            clusterRadius: 50,
          })

          if (!map.getLayer("clusters")) {
            map.addLayer(
              {
                id: "clusters",
                type: "circle",
                source: "crime-incidents",
                filter: ["has", "point_count"],
                paint: {
                  "circle-color": ["step", ["get", "point_count"], "#51bbd6", 5, "#f1f075", 15, "#f28cb1"],
                  "circle-radius": ["step", ["get", "point_count"], 20, 5, 30, 15, 40],
                  "circle-opacity": 0.75,
                },
                layout: {
                  visibility: showClusters && !focusedDistrictId ? "visible" : "none",
                },
              },
              firstSymbolId,
            )
          }

          if (!map.getLayer("cluster-count")) {
            map.addLayer({
              id: "cluster-count",
              type: "symbol",
              source: "crime-incidents",
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

          if (sourceType === "cbu" && !map.getLayer("crime-points")) {
            map.addLayer({
              id: "crime-points",
              type: "circle",
              source: "crime-incidents",
              filter: ["!", ["has", "point_count"]],
              paint: {
                "circle-radius": [
                  "interpolate",
                  ["linear"],
                  ["zoom"],
                  8,
                  ["interpolate", ["linear"], ["get", "crime_count"], 0, 5, 100, 20],
                  12,
                  ["interpolate", ["linear"], ["get", "crime_count"], 0, 8, 100, 30],
                ],
                "circle-color": [
                  "match",
                  ["get", "level"],
                  "low",
                  "#47B39C",
                  "medium",
                  "#FFC154",
                  "high",
                  "#EC6B56",
                  "#888888",
                ],
                "circle-opacity": 0.7,
                "circle-stroke-width": 1,
                "circle-stroke-color": "#ffffff",
              },
              layout: {
                visibility: showClusters && !focusedDistrictId ? "visible" : "none",
              },
            })

            map.addLayer({
              id: "crime-count-labels",
              type: "symbol",
              source: "crime-incidents",
              filter: ["!", ["has", "point_count"]],
              layout: {
                "text-field": "{crime_count}",
                "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
                "text-size": 12,
                visibility: showClusters && !focusedDistrictId ? "visible" : "none",
              },
              paint: {
                "text-color": "#ffffff",
              },
            })

            map.on("mouseenter", "crime-points", () => {
              map.getCanvas().style.cursor = "pointer"
            })

            map.on("mouseleave", "crime-points", () => {
              map.getCanvas().style.cursor = ""
            })

            const handleCrimePointClick = (e: any) => {
              if (!map) return

              // Stop event propagation
              e.originalEvent.stopPropagation()
              e.preventDefault()

              const features = map.queryRenderedFeatures(e.point, { layers: ["crime-points"] })

              if (features.length > 0) {
                const feature = features[0]
                const props = feature.properties
                const coordinates = (feature.geometry as any).coordinates.slice()

                // if (props) {
                //   if (props) {
                //     const popupHTML = `
                //       <div class="p-3">
                //         <h3 class="font-bold">${props.district_name}</h3>
                //         <div class="mt-2">
                //           <p>Total Crimes: <b>${props.crime_count}</b></p>
                //           <p>Crime Level: <b>${props.level}</b></p>
                //           <p>Year: ${props.year} - Month: ${props.month}</p>
                //           ${filterCategory !== "all" ? `<p>Category: ${filterCategory}</p>` : ""}
                //         </div>
                //       </div>
                //     `

                //     new mapboxgl.Popup().setLngLat(coordinates).setHTML(popupHTML).addTo(map)
                //   }
                // }
              }
            }

            map.off("click", "crime-points", handleCrimePointClick)
            map.on("click", "crime-points", handleCrimePointClick)
          }

          map.on("mouseenter", "clusters", () => {
            map.getCanvas().style.cursor = "pointer"
          })

          map.on("mouseleave", "clusters", () => {
            map.getCanvas().style.cursor = ""
          })

          map.off("click", "clusters", handleClusterClick)
          map.on("click", "clusters", handleClusterClick)
        } else {
          try {
            const currentSource = map.getSource("crime-incidents") as mapboxgl.GeoJSONSource
            const data = (currentSource as any)._data

            const existingClusterState = (currentSource as any).options?.cluster
            const sourceTypeChanged =
              data.features.length > 0 &&
              ((sourceType === "cbu" && !data.features[0].properties.isCBU) ||
                (sourceType !== "cbu" && data.features[0].properties.isCBU))

            if (existingClusterState !== clusteringEnabled || sourceTypeChanged) {
              if (map.getLayer("clusters")) map.removeLayer("clusters")
              if (map.getLayer("cluster-count")) map.removeLayer("cluster-count")
              if (map.getLayer("unclustered-point")) map.removeLayer("unclustered-point")
              if (map.getLayer("crime-points")) map.removeLayer("crime-points")
              if (map.getLayer("crime-count-labels")) map.removeLayer("crime-count-labels")

              map.removeSource("crime-incidents")

              let features: GeoJSON.Feature[] = []

              if (sourceType === "cbu") {
                features = crimes.map(crime => ({
                  type: "Feature",
                  properties: {
                    district_id: crime.district_id,
                    district_name: crime.districts ? crime.districts.name : "Unknown",
                    crime_count: crime.number_of_crime || 0,
                    level: crime.level,
                    category: filterCategory !== "all" ? filterCategory : "All",
                    year: crime.year,
                    month: crime.month,
                    isCBU: true,
                  },
                  geometry: {
                    type: "Point",
                    coordinates: [
                      crime.districts?.geographics?.[0]?.longitude || 0,
                      crime.districts?.geographics?.[0]?.latitude || 0,
                    ],
                  },
                })) as GeoJSON.Feature[]
              } else {
                features = extractCrimeIncidents(crimes, filterCategory).filter(Boolean) as GeoJSON.Feature[]
              }

              map.addSource("crime-incidents", {
                type: "geojson",
                data: {
                  type: "FeatureCollection",
                  features: features,
                },
                cluster: clusteringEnabled,
                clusterMaxZoom: 14,
                clusterRadius: 50,
              })

              if (!map.getLayer("clusters")) {
                map.addLayer(
                  {
                    id: "clusters",
                    type: "circle",
                    source: "crime-incidents",
                    filter: ["has", "point_count"],
                    paint: {
                      "circle-color": ["step", ["get", "point_count"], "#51bbd6", 5, "#f1f075", 15, "#f28cb1"],
                      "circle-radius": ["step", ["get", "point_count"], 20, 5, 30, 15, 40],
                      "circle-opacity": 0.75,
                    },
                    layout: {
                      visibility: showClusters && !focusedDistrictId ? "visible" : "none",
                    },
                  },
                  firstSymbolId,
                )
              }

              if (!map.getLayer("cluster-count")) {
                map.addLayer({
                  id: "cluster-count",
                  type: "symbol",
                  source: "crime-incidents",
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

              if (sourceType === "cbu") {
                if (!map.getLayer("crime-points")) {
                  map.addLayer({
                    id: "crime-points",
                    type: "circle",
                    source: "crime-incidents",
                    filter: ["!", ["has", "point_count"]],
                    paint: {
                      "circle-radius": [
                        "interpolate",
                        ["linear"],
                        ["zoom"],
                        8,
                        ["interpolate", ["linear"], ["get", "crime_count"], 0, 5, 100, 20],
                        12,
                        ["interpolate", ["linear"], ["get", "crime_count"], 0, 8, 100, 30],
                      ],
                      "circle-color": [
                        "match",
                        ["get", "level"],
                        "low",
                        "#47B39C",
                        "medium",
                        "#FFC154",
                        "high",
                        "#EC6B56",
                        "#888888",
                      ],
                      "circle-opacity": 0.7,
                      "circle-stroke-width": 1,
                      "circle-stroke-color": "#ffffff",
                    },
                    layout: {
                      visibility: showClusters && !focusedDistrictId ? "visible" : "none",
                    },
                  })

                  map.addLayer({
                    id: "crime-count-labels",
                    type: "symbol",
                    source: "crime-incidents",
                    filter: ["!", ["has", "point_count"]],
                    layout: {
                      "text-field": "{crime_count}",
                      "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
                      "text-size": 12,
                      visibility: showClusters && !focusedDistrictId ? "visible" : "none",
                    },
                    paint: {
                      "text-color": "#ffffff",
                    },
                  })

                  map.on("mouseenter", "crime-points", () => {
                    map.getCanvas().style.cursor = "pointer"
                  })

                  map.on("mouseleave", "crime-points", () => {
                    map.getCanvas().style.cursor = ""
                  })

                  const handleCrimePointClick = (e: any) => {
                    if (!map) return

                    // Stop event propagation
                    e.originalEvent.stopPropagation()
                    e.preventDefault()

                    const features = map.queryRenderedFeatures(e.point, { layers: ["crime-points"] })

                    if (features.length > 0) {
                      const feature = features[0]
                      const props = feature.properties
                      const coordinates = (feature.geometry as any).coordinates.slice()

                      // if (props) {
                      //   const popupHTML = `
                      //     <div class="p-3">
                      //       <h3 class="font-bold">${props.district_name}</h3>
                      //       <div class="mt-2">
                      //         <p>Total Crimes: <b>${props.crime_count}</b></p>
                      //         <p>Crime Level: <b>${props.level}</b></p>
                      //         <p>Year: ${props.year} - Month: ${props.month}</p>
                      //         ${filterCategory !== "all" ? `<p>Category: ${filterCategory}</p>` : ""}
                      //       </div>
                      //     </div>
                      //   `

                      //   new mapboxgl.Popup().setLngLat(coordinates).setHTML(popupHTML).addTo(map)
                      // }
                    }
                  }

                  map.off("click", "crime-points", handleCrimePointClick)
                  map.on("click", "crime-points", handleCrimePointClick)
                }
              }
            }
          } catch (error) {
            console.error("Error updating cluster source:", error)
          }

          if (map.getLayer("clusters")) {
            map.setLayoutProperty("clusters", "visibility", showClusters && !focusedDistrictId ? "visible" : "none")
          }

          if (map.getLayer("cluster-count")) {
            map.setLayoutProperty(
              "cluster-count",
              "visibility",
              showClusters && !focusedDistrictId ? "visible" : "none",
            )
          }

          if (sourceType === "cbu" && map.getLayer("crime-points")) {
            map.setLayoutProperty(
              "crime-points",
              "visibility",
              showClusters && !focusedDistrictId ? "visible" : "none",
            )
            map.setLayoutProperty(
              "crime-count-labels",
              "visibility",
              showClusters && !focusedDistrictId ? "visible" : "none",
            )
          }

          map.off("click", "clusters", handleClusterClick)
          map.on("click", "clusters", handleClusterClick)
        }
      } catch (error) {
        console.error("Error adding cluster layer:", error)
      }
    }

    if (map.isStyleLoaded()) {
      onStyleLoad()
    } else {
      map.once("style.load", onStyleLoad)
    }

    return () => {
      if (map) {
        map.off("click", "clusters", handleClusterClick)
        if (sourceType === "cbu" && map.getLayer("crime-points")) {
          // Define properly typed event handlers
          const crimePointsMouseEnter = () => {
            if (map && map.getCanvas()) {
              map.getCanvas().style.cursor = "pointer";
            }
          };

          const crimePointsMouseLeave = () => {
            if (map && map.getCanvas()) {
              map.getCanvas().style.cursor = "";
            }
          };

          const crimePointsClick = (e: mapboxgl.MapMouseEvent) => {
            if (!map) return;

            e.originalEvent.stopPropagation();
            e.preventDefault();

            const features = map.queryRenderedFeatures(e.point, { layers: ["crime-points"] });

            if (features.length > 0) {
              const feature = features[0];
              const props = feature.properties;
              const coordinates = (feature.geometry as any).coordinates.slice();

              // if (props) {
              //   const popupHTML = `
              //     <div class="p-3">
              //       <h3 class="font-bold">${props.district_name}</h3>
              //       <div class="mt-2">
              //         <p>Total Crimes: <b>${props.crime_count}</b></p>
              //         <p>Crime Level: <b>${props.level}</b></p>
              //         <p>Year: ${props.year} - Month: ${props.month}</p>
              //         ${filterCategory !== "all" ? `<p>Category: ${filterCategory}</p>` : ""}
              //       </div>
              //     </div>
              //   `;

              //   // new mapboxgl.Popup()
              //   //   .setLngLat(coordinates)
              //   //   .setHTML(popupHTML)
              //   //   .addTo(map);
              // }
            }
          };

          // Remove event listeners with properly typed handlers
          map.off("mouseenter", "crime-points", crimePointsMouseEnter);
          map.off("mouseleave", "crime-points", crimePointsMouseLeave);
          map.off("click", "crime-points", crimePointsClick);
        }
      }
    }
  }, [
    map,
    visible,
    crimes,
    filterCategory,
    focusedDistrictId,
    handleClusterClick,
    clusteringEnabled,
    showClusters,
    sourceType,
  ])

  useEffect(() => {
    if (!map || !map.getSource("crime-incidents")) return

    try {
      let features: GeoJSON.Feature[]

      if (sourceType === "cbu") {
        features = crimes.map(crime => ({
          type: "Feature",
          properties: {
            district_id: crime.district_id,
            district_name: crime.districts ? crime.districts.name : "Unknown",
            crime_count: crime.number_of_crime || 0,
            level: crime.level,
            category: filterCategory !== "all" ? filterCategory : "All",
            year: crime.year,
            month: crime.month,
            isCBU: true,
          },
          geometry: {
            type: "Point",
            coordinates: [
              crime.districts?.geographics?.[0]?.longitude || 0,
              crime.districts?.geographics?.[0]?.latitude || 0,
            ],
          },
        })) as GeoJSON.Feature[]
      } else {
        features = extractCrimeIncidents(crimes, filterCategory).filter(Boolean) as GeoJSON.Feature[]
      }

      ; (map.getSource("crime-incidents") as mapboxgl.GeoJSONSource).setData({
        type: "FeatureCollection",
        features: features,
      })
    } catch (error) {
      console.error("Error updating incident data:", error)
    }
  }, [map, crimes, filterCategory, sourceType])

  useEffect(() => {
    if (!map) return

    try {
      if (map.getLayer("clusters")) {
        map.setLayoutProperty("clusters", "visibility", showClusters && !focusedDistrictId ? "visible" : "none")
      }

      if (map.getLayer("cluster-count")) {
        map.setLayoutProperty(
          "cluster-count",
          "visibility",
          showClusters && !focusedDistrictId ? "visible" : "none",
        )
      }

      if (sourceType === "cbu") {
        if (map.getLayer("crime-points")) {
          map.setLayoutProperty(
            "crime-points",
            "visibility",
            showClusters && !focusedDistrictId ? "visible" : "none",
          )
        }

        if (map.getLayer("crime-count-labels")) {
          map.setLayoutProperty(
            "crime-count-labels",
            "visibility",
            showClusters && !focusedDistrictId ? "visible" : "none",
          )
        }
      }
    } catch (error) {
      console.error("Error updating cluster visibility:", error)
    }
  }, [map, showClusters, focusedDistrictId, sourceType])

  return null
}