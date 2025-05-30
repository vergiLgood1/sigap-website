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
        // For CBT type, get crime count based on the number of available incidents
        // For CBU type, use the already validated crime_count from our useEffect
        let features: GeoJSON.Feature[] = [];
        let totalCrimes = 0;

        if (sourceType === "cbu") {
          // For CBU, we need to use weighted points based on crime_count
          // Only count crimes with valid month and year data
          features = crimes.map(crime => {
            const crimeCount = (crime.month != null && crime.year != null) ? (crime.number_of_crime || 0) : 0;
            totalCrimes += crimeCount;

            return {
              type: "Feature",
              properties: {
                district_id: crime.district_id,
                district_name: crime.districts ? crime.districts.name : "Unknown",
                crime_count: crimeCount,
                level: crime.level,
                category: filterCategory !== "all" ? filterCategory : "All",
                year: crime.year,
                month: crime.month,
                isCBU: true,
                weight: crimeCount,
              },
              geometry: {
                type: "Point",
                coordinates: [
                  crime.districts?.geographics?.[0]?.longitude || 0,
                  crime.districts?.geographics?.[0]?.latitude || 0,
                ],
              },
            } as GeoJSON.Feature;
          }).filter(feature =>
            feature.properties &&
            feature.properties.crime_count > 0 &&
            feature.properties.year != null &&
            feature.properties.month != null
          );
        } else {
          // For CBT, count crimes based on the actual number of incidents
          // Group crimes by district to correctly count them
          const districtMap = new Map();

          crimes.forEach(crime => {
            if (crime.district_id) {
              if (!districtMap.has(crime.district_id)) {
                districtMap.set(crime.district_id, {
                  count: 1,
                  district: crime.districts,
                  month: crime.month,
                  year: crime.year
                });
              } else {
                const entry = districtMap.get(crime.district_id);
                entry.count += 1;
              }
            }
          });

          features = Array.from(districtMap.entries()).map(([districtId, data]) => {
            const count = data.count;
            totalCrimes += count;

            return {
              type: "Feature",
              properties: {
                district_id: districtId,
                district_name: data.district ? data.district.name : "Unknown",
                crime_count: count,
                category: filterCategory !== "all" ? filterCategory : "All",
                year: data.year,
                month: data.month,
                isCBT: true,
                weight: count,
              },
              geometry: {
                type: "Point",
                coordinates: [
                  data.district?.geographics?.[0]?.longitude || 0,
                  data.district?.geographics?.[0]?.latitude || 0,
                ],
              },
            } as GeoJSON.Feature;
          }).filter(feature => feature.properties && feature.properties.crime_count > 0);
        }

        console.log(`Source type: ${sourceType}, total crimes: ${totalCrimes}, features: ${features.length}`);
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
          let clusterProps: any = undefined;

          if (sourceType === "cbu") {
            // For CBU, we need to use weighted points based on crime_count
            let totalCrimes = 0;

            // First, extract actual features from districts
            features = crimes.map(crime => {
              // Only count crimes with valid month and year data
              const crimeCount = (crime.month != null && crime.year != null) ? (crime.number_of_crime || 0) : 0;
              totalCrimes += crimeCount;

              return {
                type: "Feature",
                properties: {
                  district_id: crime.district_id,
                  district_name: crime.districts ? crime.districts.name : "Unknown",
                  crime_count: crimeCount,
                  level: crime.level,
                  category: filterCategory !== "all" ? filterCategory : "All",
                  year: crime.year,
                  month: crime.month,
                  isCBU: true,
                  // Add weight for supercluster to use - this is crucial for accurate counts
                  weight: crimeCount,
                },
                geometry: {
                  type: "Point",
                  coordinates: [
                    crime.districts?.geographics?.[0]?.longitude || 0,
                    crime.districts?.geographics?.[0]?.latitude || 0,
                  ],
                },
              } as GeoJSON.Feature;
            }).filter(feature => feature.properties &&
              feature.properties.crime_count > 0 &&
              feature.properties.year != null &&
              feature.properties.month != null) as GeoJSON.Feature[];

            console.log(`CBU total crimes: ${totalCrimes}, features: ${features.length}`);

            // Set cluster properties for CBU - sums weight property
            clusterProps = {
              sum: ["+", ["coalesce", ["get", "weight"], 0]]
            };
          } else {
            // For CBT, use extracted incidents but add weight property
            features = extractCrimeIncidents(crimes, filterCategory).filter(Boolean) as GeoJSON.Feature[];

            // Add weight property to each feature for CBT
            features = features.map(feature => {
              if (feature.properties) {
                feature.properties.isCBT = true;
                feature.properties.weight = 1; // Each incident counts as 1
              }
              return feature;
            });

            // Count total crimes for logging
            const totalCrimes = features.length;
            console.log(`CBT total crimes: ${totalCrimes}, features: ${features.length}`);

            // For CBT we want to count the number of incidents (point_count)
            clusterProps = {
              // Also track a sum for display purposes if needed
              incident_count: ["+", 1]
            };
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
            clusterProperties: clusterProps
          });

          if (!map.getLayer("clusters")) {
            map.addLayer(
              {
                id: "clusters",
                type: "circle",
                source: "crime-incidents",
                filter: ["has", "point_count"],
                paint: {
                  // Use appropriate cluster property based on source type
                  "circle-color": sourceType === "cbu"
                    ? ["step", ["get", "sum"], "#51bbd6", 5, "#f1f075", 15, "#f28cb1"]
                    : ["step", ["get", "point_count"], "#51bbd6", 5, "#f1f075", 15, "#f28cb1"],
                  "circle-radius": sourceType === "cbu"
                    ? ["step", ["get", "sum"], 20, 5, 30, 15, 40]
                    : ["step", ["get", "point_count"], 20, 5, 30, 15, 40],
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
                // For CBT, we use point_count directly, for CBU we use our custom sum
                "text-field": sourceType === "cbu" ? "{sum}" : "{point_count}",
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
              let clusterProps: any = undefined;

              if (sourceType === "cbu") {
                // For CBU, process the same as before
                let totalCrimes = 0;

                features = crimes.map(crime => {
                  const crimeCount = (crime.month != null && crime.year != null) ? (crime.number_of_crime || 0) : 0;
                  totalCrimes += crimeCount;

                  return {
                    type: "Feature",
                    properties: {
                      district_id: crime.district_id,
                      district_name: crime.districts ? crime.districts.name : "Unknown",
                      crime_count: crimeCount,
                      level: crime.level,
                      category: filterCategory !== "all" ? filterCategory : "All",
                      year: crime.year,
                      month: crime.month,
                      isCBU: true,
                      weight: crimeCount,
                    },
                    geometry: {
                      type: "Point",
                      coordinates: [
                        crime.districts?.geographics?.[0]?.longitude || 0,
                        crime.districts?.geographics?.[0]?.latitude || 0,
                      ],
                    },
                  } as GeoJSON.Feature;
                }).filter(feature => feature.properties &&
                  feature.properties.crime_count > 0 &&
                  feature.properties.year != null &&
                  feature.properties.month != null) as GeoJSON.Feature[];

                console.log(`CBU recreate - total crimes: ${totalCrimes}, features: ${features.length}`);

                clusterProps = {
                  sum: ["+", ["coalesce", ["get", "weight"], 0]]
                };
              } else {
                // For CBT, update extraction but ensure we add weight property
                features = extractCrimeIncidents(crimes, filterCategory)
                  .filter(Boolean)
                  .map(feature => {
                    if (feature && feature.properties) {
                      (feature.properties as any).isCBT = true;
                      (feature.properties as any).weight = 1; // Each incident counts as 1
                    }
                    return feature;
                  }) as GeoJSON.Feature[];

                console.log(`CBT recreate - total features: ${features.length}`);
                console.log(`CBT sample feature properties:`, features.length > 0 ? features[0].properties : 'No features');

                clusterProps = {
                  incident_count: ["+", 1]
                };
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
                clusterProperties: clusterProps
              });

              if (!map.getLayer("clusters")) {
                map.addLayer(
                  {
                    id: "clusters",
                    type: "circle",
                    source: "crime-incidents",
                    filter: ["has", "point_count"],
                    paint: {
                      // Use appropriate properties based on source type
                      "circle-color": sourceType === "cbu"
                        ? ["step", ["get", "sum"], "#51bbd6", 5, "#f1f075", 15, "#f28cb1"]
                        : ["step", ["get", "point_count"], "#51bbd6", 5, "#f1f075", 15, "#f28cb1"],
                      "circle-radius": sourceType === "cbu"
                        ? ["step", ["get", "sum"], 20, 5, 30, 15, 40]
                        : ["step", ["get", "point_count"], 20, 5, 30, 15, 40],
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
                    // For CBT, use point_count directly, for CBU use our custom sum
                    "text-field": sourceType === "cbu" ? "{sum}" : "{point_count}",
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
        // For CBU, update with weighted points
        let totalCrimes = 0;

        features = crimes.map(crime => {
          // Only count crimes with valid month and year data
          const crimeCount = (crime.month != null && crime.year != null) ? (crime.number_of_crime || 0) : 0;
          totalCrimes += crimeCount;

          return {
            type: "Feature",
            properties: {
              district_id: crime.district_id,
              district_name: crime.districts ? crime.districts.name : "Unknown",
              crime_count: crimeCount,
              level: crime.level,
              category: filterCategory !== "all" ? filterCategory : "All",
              year: crime.year,
              month: crime.month,
              isCBU: true,
              // Ensure weight always correctly represents crime count
              weight: crimeCount,
            },
            geometry: {
              type: "Point",
              coordinates: [
                crime.districts?.geographics?.[0]?.longitude || 0,
                crime.districts?.geographics?.[0]?.latitude || 0,
              ],
            },
          } as GeoJSON.Feature;
        }).filter(feature => feature.properties &&
          feature.properties.crime_count > 0 &&
          feature.properties.year != null &&
          feature.properties.month != null) as GeoJSON.Feature[];

        console.log(`CBU update - total crimes: ${totalCrimes}, features: ${features.length}`);
      } else {
        // For CBT, ensure we have weight properties
        features = extractCrimeIncidents(crimes, filterCategory)
          .filter(Boolean)
          .map(feature => {
            if (feature && feature.properties) {
              // Use type assertion to safely add properties
              (feature.properties as any).isCBT = true;
              (feature.properties as any).weight = 1;
            }
            return feature;
          }) as GeoJSON.Feature[];

        console.log(`CBT update - features: ${features.length}`);
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