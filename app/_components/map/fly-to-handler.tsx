"use client"

import { useEffect, useRef } from "react"

interface FlyToHandlerProps {
    map: mapboxgl.Map
}

export default function FlyToHandler({ map }: FlyToHandlerProps) {
    const animationRef = useRef<number | null>(null)

    useEffect(() => {
        if (!map) return

        const handleFlyToEvent = (e: CustomEvent) => {
            if (!map || !e.detail) return

            const { longitude, latitude, zoom, bearing, pitch, duration } = e.detail

            map.flyTo({
                center: [longitude, latitude],
                zoom: zoom || 15,
                bearing: bearing || 0,
                pitch: pitch || 45,
                duration: duration || 2000,
            })

            // Cancel any existing animation
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current)
            }

            // Add a highlight or pulse effect to the target incident
            try {
                if (map.getLayer("target-incident-highlight")) {
                    map.removeLayer("target-incident-highlight")
                }
                if (map.getSource("target-incident-highlight")) {
                    map.removeSource("target-incident-highlight")
                }
                map.addSource("target-incident-highlight", {
                    type: "geojson",
                    data: {
                        type: "Feature",
                        geometry: {
                            type: "Point",
                            coordinates: [longitude, latitude],
                        },
                        properties: {},
                    },
                })
                map.addLayer({
                    id: "target-incident-highlight",
                    source: "target-incident-highlight",
                    type: "circle",
                    paint: {
                        "circle-radius": ["interpolate", ["linear"], ["zoom"], 10, 10, 15, 15, 20, 20],
                        "circle-color": "#ff0000",
                        "circle-opacity": 0.7,
                        "circle-stroke-width": 2,
                        "circle-stroke-color": "#ffffff",
                    },
                })

                // Add a slower pulsing effect
                let size = 10
                let frameCount = 0
                const animationSpeed = 3

                const animatePulse = () => {
                    if (!map || !map.getLayer("target-incident-highlight")) {
                        if (animationRef.current) {
                            cancelAnimationFrame(animationRef.current)
                            animationRef.current = null
                        }
                        return
                    }
                    frameCount++
                    if (frameCount % animationSpeed === 0) {
                        size = (size % 20) + 0.5
                    }
                    map.setPaintProperty("target-incident-highlight", "circle-radius", [
                        "interpolate",
                        ["linear"],
                        ["zoom"],
                        10,
                        size,
                        15,
                        size * 1.5,
                        20,
                        size * 2,
                    ])
                    animationRef.current = requestAnimationFrame(animatePulse)
                }
                animationRef.current = requestAnimationFrame(animatePulse)
            } catch (error) {
                // ignore highlight error
            }
        }

        map.getCanvas().addEventListener("mapbox_fly_to", handleFlyToEvent as EventListener)
        document.addEventListener("mapbox_fly_to", handleFlyToEvent as EventListener)

        return () => {
            if (map && map.getCanvas()) {
                map.getCanvas().removeEventListener("mapbox_fly_to", handleFlyToEvent as EventListener)
            }
            document.removeEventListener("mapbox_fly_to", handleFlyToEvent as EventListener)
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current)
                animationRef.current = null
            }
        }
    }, [map])

    return null
}
