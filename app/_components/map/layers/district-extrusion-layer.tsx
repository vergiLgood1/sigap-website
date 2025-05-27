"use client"

import { getCrimeRateColor, getFillOpacity } from "@/app/_utils/map/common"
import type { IExtrusionLayerProps } from "@/app/_utils/types/map"
import { useEffect, useRef } from "react"
import { manageLayerVisibility } from "@/app/_utils/map/layer-visibility"

export default function DistrictExtrusionLayer({
    visible = true,
    map,
    tilesetId,
    focusedDistrictId,
    crimeDataByDistrict,
}: IExtrusionLayerProps) {
    const animationRef = useRef<number | null>(null)
    const bearingRef = useRef(0)
    const rotationAnimationRef = useRef<number | null>(null)
    const extrusionCreatedRef = useRef(false)
    const lastFocusedDistrictRef = useRef<string | null>(null)

    // Define layer IDs for consistent management
    const LAYER_IDS = ['district-extrusion'];

    // Helper to (re)create the extrusion layer
    const createExtrusionLayer = () => {
        if (!map) return

        const fillOpacity = getFillOpacity('units', true)

        // Remove existing layer if exists
        if (map.getLayer("district-extrusion")) {
            map.removeLayer("district-extrusion")
            extrusionCreatedRef.current = false
        }

        // Make sure the districts source exists
        if (!map.getSource("districts")) {
            if (!tilesetId) {
                console.error("No tileset ID provided for districts source")
                return
            }
            map.addSource("districts", {
                type: "vector",
                url: `mapbox://${tilesetId}`,
            })
        }

        // Find first symbol layer for correct layer order
        const layers = map.getStyle().layers
        let firstSymbolId: string | undefined
        for (const layer of layers) {
            if (layer.type === "symbol") {
                firstSymbolId = layer.id
                break
            }
        }

        // Create the extrusion layer
        map.addLayer(
            {
                id: "district-extrusion",
                type: "fill-extrusion",
                source: "districts",
                "source-layer": "Districts",
                paint: {
                    "fill-extrusion-color": [
                        "case",
                        ["has", "kode_kec"],
                        [
                            "match",
                            ["get", "kode_kec"],
                            focusedDistrictId || "",
                            getCrimeRateColor(crimeDataByDistrict[focusedDistrictId || ""]?.level),
                            "transparent",
                        ],
                        "transparent",
                    ],
                    "fill-extrusion-height": [
                        "case",
                        ["has", "kode_kec"],
                        ["match", ["get", "kode_kec"], focusedDistrictId || "", 0, 0], // Start at 0 for animation
                        0,
                    ],
                    "fill-extrusion-base": 0,
                    "fill-extrusion-opacity": fillOpacity,
                },
                filter: ["==", ["get", "kode_kec"], focusedDistrictId || ""],
            },
            firstSymbolId,
        )
        extrusionCreatedRef.current = true
    }

    // Handle extrusion layer creation and updates
    useEffect(() => {
        if (!map || !visible) return

        const onStyleLoad = () => {
            if (!map) return
            try {
                createExtrusionLayer()
                // Start animation if focusedDistrictId ada
                if (focusedDistrictId) {
                    lastFocusedDistrictRef.current = focusedDistrictId
                    // setTimeout(() => {
                    if (map.getLayer("district-extrusion")) {
                        animateExtrusion()
                    }
                    // }, 50)
                }
            } catch (error) {
                console.error("Error adding district extrusion layer:", error)
            }
        }

        if (map.isStyleLoaded()) {
            onStyleLoad()
        } else {
            map.once("style.load", onStyleLoad)
        }

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current)
                animationRef.current = null
            }
        }
        // Tambahkan crimeDataByDistrict ke deps agar update color jika data berubah
    }, [map, visible, tilesetId, focusedDistrictId, crimeDataByDistrict])

    // Update filter dan color ketika focusedDistrictId berubah
    useEffect(() => {
        if (!map) return

        // Jika layer belum ada, buat dulu
        if (!map.getLayer("district-extrusion")) {
            createExtrusionLayer()
        }

        // Tunggu layer benar-benar ada
        if (!map.getLayer("district-extrusion")) return

        // Skip unnecessary updates if nothing has changed
        if (lastFocusedDistrictRef.current === focusedDistrictId) return

        // Jika unfocus
        if (!focusedDistrictId) {
            if (rotationAnimationRef.current) {
                cancelAnimationFrame(rotationAnimationRef.current)
                rotationAnimationRef.current = null
            }
            bearingRef.current = 0

            // Animate height down
            const animateHeightDown = () => {
                if (!map || !map.getLayer("district-extrusion")) return

                const currentHeight = 800
                const duration = 500
                const startTime = performance.now()

                const animate = (time: number) => {
                    const elapsed = time - startTime
                    const progress = Math.min(elapsed / duration, 1)
                    const easedProgress = progress * (2 - progress)
                    const height = 800 - 800 * easedProgress

                    try {
                        map.setPaintProperty("district-extrusion", "fill-extrusion-height", [
                            "case",
                            ["has", "kode_kec"],
                            ["match", ["get", "kode_kec"], lastFocusedDistrictRef.current || "", height, 0],
                            0,
                        ])

                        if (progress < 1) {
                            animationRef.current = requestAnimationFrame(animate)
                        } else {
                            map.setPaintProperty("district-extrusion", "fill-extrusion-height", [
                                "case",
                                ["has", "kode_kec"],
                                ["match", ["get", "kode_kec"], "", 0, 0],
                                0,
                            ])
                            map.setFilter("district-extrusion", ["==", ["get", "kode_kec"], ""])
                            lastFocusedDistrictRef.current = null
                            map.setBearing(0)
                        }
                    } catch (error) {
                        if (animationRef.current) {
                            cancelAnimationFrame(animationRef.current)
                            animationRef.current = null
                        }
                    }
                }

                if (animationRef.current) {
                    cancelAnimationFrame(animationRef.current)
                }
                animationRef.current = requestAnimationFrame(animate)
            }

            animateHeightDown()
            return
        }

        try {
            // Update filter dan color
            map.setFilter("district-extrusion", ["==", ["get", "kode_kec"], focusedDistrictId])
            map.setPaintProperty("district-extrusion", "fill-extrusion-color", [
                "case",
                ["has", "kode_kec"],
                [
                    "match",
                    ["get", "kode_kec"],
                    focusedDistrictId,
                    getCrimeRateColor(crimeDataByDistrict[focusedDistrictId]?.level),
                    "transparent",
                ],
                "transparent",
            ])
            map.setPaintProperty("district-extrusion", "fill-extrusion-height", [
                "case",
                ["has", "kode_kec"],
                ["match", ["get", "kode_kec"], focusedDistrictId, 0, 0],
                0,
            ])

            lastFocusedDistrictRef.current = focusedDistrictId

            if (rotationAnimationRef.current) {
                cancelAnimationFrame(rotationAnimationRef.current)
                rotationAnimationRef.current = null
            }
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current)
                animationRef.current = null
            }

            setTimeout(() => {
                if (map.getLayer("district-extrusion")) {
                    animateExtrusion()
                }
            }, 50)
        } catch (error) {
            console.error("Error updating district extrusion:", error)
        }
    }, [map, focusedDistrictId, crimeDataByDistrict])

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current)
                animationRef.current = null
            }
            if (rotationAnimationRef.current) {
                cancelAnimationFrame(rotationAnimationRef.current)
                rotationAnimationRef.current = null
            }
        }
    }, [])

    // Animate extrusion height
    const animateExtrusion = () => {
        if (!map || !map.getLayer("district-extrusion") || !focusedDistrictId) {
            return
        }

        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current)
            animationRef.current = null
        }

        const startHeight = 0
        const targetHeight = 800
        const duration = 700
        const startTime = performance.now()

        const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime
            const progress = Math.min(elapsed / duration, 1)
            const easedProgress = progress * (2 - progress)
            const currentHeight = startHeight + (targetHeight - startHeight) * easedProgress

            try {
                map.setPaintProperty("district-extrusion", "fill-extrusion-height", [
                    "case",
                    ["has", "kode_kec"],
                    ["match", ["get", "kode_kec"], focusedDistrictId, currentHeight, 0],
                    0,
                ])

                if (progress < 1) {
                    animationRef.current = requestAnimationFrame(animate)
                } else {
                    startRotation()
                }
            } catch (error) {
                if (animationRef.current) {
                    cancelAnimationFrame(animationRef.current)
                    animationRef.current = null
                }
            }
        }

        animationRef.current = requestAnimationFrame(animate)
    }

    // Start rotation animation
    const startRotation = () => {
        if (!map || !focusedDistrictId) return

        const rotationSpeed = 0.05 // degrees per frame
        bearingRef.current = 0

        const animate = () => {
            if (!map || !focusedDistrictId || focusedDistrictId !== lastFocusedDistrictRef.current) {
                if (rotationAnimationRef.current) {
                    cancelAnimationFrame(rotationAnimationRef.current)
                    rotationAnimationRef.current = null
                }
                return
            }

            try {
                bearingRef.current = (bearingRef.current + rotationSpeed) % 360
                map.setBearing(bearingRef.current)
                rotationAnimationRef.current = requestAnimationFrame(animate)
            } catch (error) {
                if (rotationAnimationRef.current) {
                    cancelAnimationFrame(rotationAnimationRef.current)
                    rotationAnimationRef.current = null
                }
            }
        }

        if (rotationAnimationRef.current) {
            cancelAnimationFrame(rotationAnimationRef.current)
            rotationAnimationRef.current = null
        }
        rotationAnimationRef.current = requestAnimationFrame(animate)
    }

    // Use centralized layer visibility management
    useEffect(() => {
        if (!map) return;

        // Special case: also cancel animations when hiding the layer
        return manageLayerVisibility(map, LAYER_IDS, visible && !!focusedDistrictId, () => {
            if (!visible && animationRef.current) {
                cancelAnimationFrame(animationRef.current);
                animationRef.current = null;
            }

            if (!visible && rotationAnimationRef.current) {
                cancelAnimationFrame(rotationAnimationRef.current);
                rotationAnimationRef.current = null;
            }
        });
    }, [map, visible, focusedDistrictId]);

    return null
}
