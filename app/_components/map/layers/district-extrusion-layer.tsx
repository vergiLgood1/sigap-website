"use client"

import { getCrimeRateColor, getFillOpacity } from "@/app/_utils/map/common"
import type { IExtrusionLayerProps } from "@/app/_utils/types/map"
import { useEffect, useRef } from "react"
import { MAPBOX_SOURCE_LAYER, MAPBOX_SOURCE_NAME } from "@/app/_utils/const/map"

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
                source: MAPBOX_SOURCE_NAME,
                "source-layer": MAPBOX_SOURCE_LAYER,
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
                layout: {
                    // Set initial visibility based on visible prop and focusedDistrictId
                    visibility: (visible && focusedDistrictId) ? "visible" : "none"
                }
            },
            firstSymbolId,
        )
        extrusionCreatedRef.current = true
    }

    // Handle extrusion layer creation and updates
    useEffect(() => {
        if (!map) return

        const onStyleLoad = () => {
            if (!map) return
            try {
                createExtrusionLayer()
                // Start animation if focusedDistrictId exists and layer is visible
                if (focusedDistrictId && visible) {
                    lastFocusedDistrictRef.current = focusedDistrictId
                    // Ensure the layer is visible
                    if (map.getLayer("district-extrusion")) {
                        map.setLayoutProperty("district-extrusion", "visibility", "visible");
                        animateExtrusion()
                    }
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
            if (rotationAnimationRef.current) {
                cancelAnimationFrame(rotationAnimationRef.current)
                rotationAnimationRef.current = null
            }
        }
    }, [map, visible, tilesetId, focusedDistrictId, crimeDataByDistrict])

    // Update visibility when props change
    useEffect(() => {
        if (!map || !map.getLayer("district-extrusion")) return;

        // Update visibility based on both visible prop and focusedDistrictId
        const shouldBeVisible = visible && !!focusedDistrictId;

        try {
            map.setLayoutProperty(
                "district-extrusion",
                "visibility",
                shouldBeVisible ? "visible" : "none"
            );
        } catch (error) {
            console.error("Error updating district extrusion visibility:", error);
        }
    }, [map, visible, focusedDistrictId]);

    // Update filter and color when focusedDistrictId changes
    useEffect(() => {
        if (!map || !visible) return

        // If layer doesn't exist, create it first
        if (!map.getLayer("district-extrusion")) {
            createExtrusionLayer()
        }

        // Wait until layer really exists
        if (!map.getLayer("district-extrusion")) return

        // Skip unnecessary updates if nothing has changed
        if (lastFocusedDistrictRef.current === focusedDistrictId) return

        // If unfocusing
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
                            map.setLayoutProperty("district-extrusion", "visibility", "none")
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
            // Update filter and color
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

            // Make sure the layer is visible if we have a focusedDistrictId
            map.setLayoutProperty("district-extrusion", "visibility", "visible")

            lastFocusedDistrictRef.current = focusedDistrictId

            if (rotationAnimationRef.current) {
                cancelAnimationFrame(rotationAnimationRef.current)
                rotationAnimationRef.current = null
            }
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current)
                animationRef.current = null
            }

            // Only animate if the component is visible
            if (visible) {
                setTimeout(() => {
                    if (map.getLayer("district-extrusion")) {
                        animateExtrusion()
                    }
                }, 50)
            }
        } catch (error) {
            console.error("Error updating district extrusion:", error)
        }
    }, [map, focusedDistrictId, crimeDataByDistrict, visible])

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
        if (!map || !map.getLayer("district-extrusion") || !focusedDistrictId || !visible) {
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
        if (!map || !focusedDistrictId || !visible) return

        const rotationSpeed = 0.05 // degrees per frame
        bearingRef.current = 0

        const animate = () => {
            if (!map || !focusedDistrictId || focusedDistrictId !== lastFocusedDistrictRef.current || !visible) {
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

    return null
}
