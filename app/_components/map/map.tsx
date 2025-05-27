"use client"

import type React from "react"
import { useState, useCallback, useRef, useEffect } from "react"
import { type ViewState, Map, type MapRef, NavigationControl, GeolocateControl } from "react-map-gl/mapbox"
import { FullscreenControl } from "react-map-gl/mapbox"
import { BASE_BEARING, BASE_LATITUDE, BASE_LONGITUDE, BASE_PITCH, BASE_ZOOM, MAPBOX_STYLES, type MapboxStyle } from "@/app/_utils/const/map"
import "mapbox-gl/dist/mapbox-gl.css"
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';

import mapboxgl from "mapbox-gl"
import TimezoneLayer from './layers/timezone';

interface MapViewProps {
  children?: React.ReactNode
  initialViewState?: Partial<ViewState>
  mapStyle?: MapboxStyle
  className?: string
  width?: string | number
  height?: string | number
  mapboxApiAccessToken?: string
  onMoveEnd?: (viewState: ViewState) => void
  customControls?: React.ReactNode
  showTimezones?: boolean // Add option to show timezones
}

export default function MapView({
  children,
  initialViewState,
  mapStyle = MAPBOX_STYLES.Standard,
  className = "w-full h-96",
  width = "100%",
  height = "100%",
  mapboxApiAccessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN,
  onMoveEnd,
  showTimezones = false, // Add option to show timezones
}: MapViewProps) {
  const mapContainerRef = useRef<MapRef | null>(null);
  const mapRef = useRef<MapRef | null>(null);

  const defaultViewState: Partial<ViewState> = {
    longitude: BASE_LONGITUDE,
    latitude: BASE_LATITUDE,
    zoom: BASE_ZOOM,
    bearing: BASE_BEARING,
    pitch: BASE_PITCH,
    ...initialViewState,
  }

  const geocoder = new MapboxGeocoder(
    {
      accessToken: mapboxApiAccessToken!,
      mapboxgl: mapboxgl as any, // Type assertion to bypass type checking
      marker: false,
      placeholder: "Search for places",
      proximity: {
        longitude: BASE_LONGITUDE,
        latitude: BASE_LATITUDE,
      },
    },
  )

  const fullscreenControl = new mapboxgl.FullscreenControl();
  const navigationControl = new mapboxgl.NavigationControl({
    showCompass: false,
  });

  const handleMapLoad = useCallback(() => {
    if (mapRef.current) {
      // mapRef.current.addControl(geocoder, "top-right")
      mapRef.current.addControl(fullscreenControl, "top-right")
      mapRef.current.addControl(navigationControl, "top-right")
    }
  }, [mapRef, geocoder, fullscreenControl, navigationControl])

  const handleMoveEnd = useCallback(
    (event: any) => {
      if (onMoveEnd) {
        onMoveEnd(event.viewState)
      }
    },
    [onMoveEnd],
  )

  useEffect(() => {
    if (!mapRef.current) return;

    const map = mapRef.current.getMap();

    const handleFlyToEvent = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (!customEvent.detail) return;
      const { longitude, latitude, zoom, bearing, pitch, duration } = customEvent.detail;
      map.flyTo({
        center: [longitude, latitude],
        zoom: zoom || 15,
        bearing: bearing || 0,
        pitch: pitch || 45,
        duration: duration || 2000,
      });
    };

    map.getContainer().addEventListener('mapbox_fly_to', handleFlyToEvent as EventListener);

    return () => {
      map.getContainer().removeEventListener('mapbox_fly_to', handleFlyToEvent as EventListener);
    };
  }, [mapRef.current]);

  return (
    <div className={`relative ${className}`}>
      <div className="flex h-full">
        <div className="relative flex-grow h-full transition-all duration-300">
          <Map
            ref={mapRef}
            mapStyle={mapStyle}
            mapboxAccessToken={mapboxApiAccessToken}
            initialViewState={defaultViewState}
            onLoad={handleMapLoad}
            onMoveEnd={handleMoveEnd}
            style={{ width: "100%", height: "100%" }}
            attributionControl={false}
            preserveDrawingBuffer={true} // This helps with fullscreen stability
          >
            {/* <FullscreenControl position="top-right" />
            <NavigationControl position="top-right" showCompass={false} /> */}

            {/* {showTimezones && mapRef.current && <TimezoneLayer map={mapRef.current.getMap()} />} */}

            {children}
          </Map>
        </div>
      </div>
    </div>
  )
}