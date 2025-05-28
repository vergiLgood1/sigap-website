"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

// You should store this in an environment variable
const MAPBOX_ACCESS_TOKEN =
  process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN ||
  "pk.eyJ1IjoiZGl5b2FuZ2dhcmEiLCJhIjoiY203ZG5rcjhzMDA4djJqcXpzMXpoZzh6cSJ9.ZMiOrYWSYsabmZp3lnI5xw";

mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;

export const MapboxMap = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [lng, setLng] = useState(113.7025);
  const [lat, setLat] = useState(-8.1725);
  const [zoom, setZoom] = useState(10);

  useEffect(() => {
    if (map.current) return; // initialize map only once
    if (!mapContainer.current) return; // wait for map container to be ready

    // Set the bounds to Kabupaten Jember
    const bounds: mapboxgl.LngLatBoundsLike = [
      [113.0, -8.5], // Southwest coordinates
      [114.0, -7.5], // Northeast coordinates
    ];

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [lng, lat],
      zoom: zoom,
    });

    // Add zoom and rotation controls to the map (top-right corner)
    map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    // Add fullscreen control to the map (top-left corner)
    map.current.addControl(new mapboxgl.FullscreenControl(), "top-left");

    // Add control to focus on Jember (top-left corner)
    // const focusButton = document.createElement("button");
    // focusButton.className = "mapboxgl-ctrl-icon";
    // focusButton.title = "Focus on Jember";
    // focusButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-map-pin" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
    //   <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
    //   <circle cx="12" cy="11" r="3" />
    //   <path d="M17.657 16.657l-2.828 -2.828a4 4 0 1 0 -5.656 0l-2.828 2.828" />
    // </svg>`;
    // focusButton.onclick = () => {
    //   focusButton;
    // };

    // map.current.addControl(
    //   {
    //     onAdd: () => focusButton,
    //     onRemove: () => focusButton.remove(),
    //   },
    //   "top-left"
    // );

    map.current.on("move", () => {
      if (!map.current) return;
      setLng(Number(map.current.getCenter().lng.toFixed(4)));
      setLat(Number(map.current.getCenter().lat.toFixed(4)));
      setZoom(Number(map.current.getZoom().toFixed(2)));
    });

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, []);

  const focusOnJember = () => {
    if (map.current) {
      const bounds: mapboxgl.LngLatBoundsLike = [
        [113.0, -8.5], // Southwest coordinates
        [114.0, -7.5], // Northeast coordinates
      ];
      map.current.fitBounds(bounds, { padding: 20 });
    }
  };

  return (
    <div className="relative h-full w-full">
      <div ref={mapContainer} className="h-full w-full rounded-xl" />
      <div className="absolute bottom-2 left-2 z-10 rounded-md bg-white/80 p-2 text-sm text-black">
        Longitude: {lng} | Latitude: {lat} | Zoom: {zoom}
      </div>
      {/* <Button
        onClick={focusOnJember}
        className="absolute top-2 left-2 z-10 rounded-md bg-blue-500 p-2 text-sm text-white"
      >
        <IconMapPin className="h-5 w-5" />
      </Button> */}
    </div>
  );
};
