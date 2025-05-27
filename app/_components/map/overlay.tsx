"use client"

import type React from "react"

import type { IControl, Map } from "mapbox-gl"
import type { ControlPosition } from "mapbox-gl"
import { cloneElement, memo, type ReactElement, useEffect, useState, useRef } from "react"
import { createPortal } from "react-dom"
import { useControl } from "react-map-gl/mapbox"
import { v4 as uuidv4 } from "uuid"

// Updated props type to include addControl in children props
type OverlayProps = {
    position: ControlPosition
    children: ReactElement<{
        map?: Map
        addControl?: (control: IControl, position?: ControlPosition) => void
    }>
    id?: string
    className?: string
    style?: React.CSSProperties
}

// Custom control for overlay
class OverlayControl implements IControl {
    _map: Map | null = null
    _container: HTMLElement | null = null
    _position: ControlPosition
    _id: string
    _redraw?: () => void
    _className?: string
    _style?: React.CSSProperties
    _isDestroyed = false

    constructor({
        position,
        id,
        redraw,
        className,
        style,
    }: {
            position: ControlPosition
            id: string
            redraw?: () => void
            className?: string
            style?: React.CSSProperties
    }) {
        this._position = position
        this._id = id
        this._redraw = redraw
        this._className = className
        this._style = style
    }

    onAdd(map: Map) {
        this._map = map
        this._container = document.createElement("div")

        // Apply base classes but keep it minimal to avoid layout conflicts
        this._container.className = `mapboxgl-ctrl ${this._className || ""}`
        this._container.id = this._id

        // Important: These styles make the overlay adapt to content
        this._container.style.pointerEvents = "auto"
        this._container.style.display = "inline-block" // Allow container to size to content
        this._container.style.maxWidth = "none" // Remove any max-width constraints
        this._container.style.width = "auto" // Let width be determined by content
        this._container.style.height = "auto" // Let height be determined by content
        this._container.style.overflow = "visible" // Allow content to overflow if needed
        this._container.style.zIndex = "10" // Ensure it's above other map elements

        // Apply any custom styles passed as props
        if (this._style) {
            Object.entries(this._style).forEach(([key, value]) => {
                // @ts-ignore - dynamically setting style properties
                this._container.style[key] = value
            })
        }

        if (this._redraw) {
            map.on("move", this._redraw)
            this._redraw()
        }

        return this._container
    }

    onRemove() {
        if (!this._map || !this._container || this._isDestroyed) return

        if (this._redraw) {
            this._map.off("move", this._redraw)
        }

        this._container.remove()
        this._map = null
        this._isDestroyed = true
    }

    getDefaultPosition() {
        return this._position
    }

    getMap() {
        return this._map
    }

    getElement() {
        return this._container
    }

    // Method to add other controls to the map
    addControl(control: IControl, position?: ControlPosition) {
        if (this._map) {
            this._map.addControl(control, position)
        }
        return this
    }
}

// Enhanced Overlay component
function _Overlay({ position, children, id = `overlay-${uuidv4()}`, className, style }: OverlayProps) {
    const [container, setContainer] = useState<HTMLElement | null>(null)
    const [map, setMap] = useState<Map | null>(null)
    const controlRef = useRef<OverlayControl | null>(null)

    // Use useControl with unique ID to avoid conflicts
    const ctrl = useControl<OverlayControl>(
        () => {
            const control = new OverlayControl({
                position,
                id,
                className,
                style,
            })
            controlRef.current = control
            return control
        },
        { position },
    )

    // Update container and map instance when control is ready
    useEffect(() => {
        if (ctrl) {
            setContainer(ctrl.getElement())
            setMap(ctrl.getMap())
        }

        // Cleanup function to ensure proper removal
        return () => {
            if (controlRef.current && !controlRef.current._isDestroyed) {
                controlRef.current.onRemove()
            }
        }
    }, [ctrl])

    // Only render if container is ready
    if (!container || !map) return null

    // Use createPortal to render children to container and pass addControl method
    // return createPortal(
    //     cloneElement(children, {
    //         map,
    //         addControl: (control: IControl, position?: ControlPosition) => ctrl.addControl(control, position),
    //     }),
    //     container,
    // )

    return createPortal(
        cloneElement(children, { map }),
        container,
    )
}

// Export as memoized component
export const Overlay = memo(_Overlay)
