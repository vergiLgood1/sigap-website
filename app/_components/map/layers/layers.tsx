"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useMap } from "react-map-gl/mapbox";
import {
    BASE_BEARING,
    BASE_DURATION,
    BASE_PITCH,
    BASE_ZOOM,
    MAPBOX_TILESET_ID,
    PITCH_3D,
    ZOOM_3D,
} from "@/app/_utils/const/map";
import DistrictPopup from "../pop-up/district-popup";
import DistrictExtrusionLayer from "./district-extrusion-layer";
import CBTClusterLayer from "./cbt-cluster-layer";
import HeatmapLayer from "./heatmap-layer";
import TimelineLayer from "./timeline-layer";

import type { ICrimes, IIncidentLogs } from "@/app/_utils/types/crimes";
import type { ICrimeSourceTypes, IDistrictFeature } from "@/app/_utils/types/map";
import {
    createFillColorExpression,
    getCrimeRateColor,
    processCrimeDataByDistrict,
} from "@/app/_utils/map/common";

import { toast } from "sonner";
import type { ITooltipsControl } from "../controls/top/tooltips";
import type { IUnits } from "@/app/_utils/types/units";
import UnitsLayer from "./units-layer";
import DistrictFillLineLayer from "./district-layer";

import TimezoneLayer from "./timezone";
import FaultLinesLayer from "./fault-lines";
import RecentIncidentsLayer from "./recent-incidents-layer";
import IncidentPopup from "../pop-up/incident-popup";
import { manageLayerVisibility } from "@/app/_utils/map/layer-visibility";
import AllIncidentsLayer from "./all-incidents-layer";
import CBUClusterLayer from "./cbu-cluster-layer";

// Interface for crime incident
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

// District layer props
export interface IDistrictLayerProps {
    visible?: boolean;
    onClick?: (feature: IDistrictFeature) => void;
    onDistrictClick?: (feature: IDistrictFeature) => void;
    map?: any;
    year: string;
    month: string;
    filterCategory: string | "all";
    crimes: ICrimes[];
    units?: IUnits[];
    tilesetId?: string;
    focusedDistrictId?: string | null;
    setFocusedDistrictId?: (id: string | null) => void;
    crimeDataByDistrict?: Record<string, any>;
    showFill?: boolean;
    activeControl?: ITooltipsControl;
}

interface LayersProps {
    visible?: boolean;
    crimes: ICrimes[];
    units?: IUnits[];
    recentIncidents: IIncidentLogs[];
    year: string;
    month: string;
    filterCategory: string | "all";
    activeControl: ITooltipsControl;
    tilesetId?: string;
    useAllData?: boolean;
    showEWS?: boolean;
    sourceType?: ICrimeSourceTypes;
}

export default function Layers({
    visible = true,
    crimes,
    recentIncidents,
    units,
    year,
    month,
    filterCategory,
    activeControl,
    tilesetId = MAPBOX_TILESET_ID,
    useAllData = false,
    showEWS = true,
    sourceType = "cbt",
}: LayersProps) {
    const animationRef = useRef<number | null>(null);

    const { current: map } = useMap();

    if (!map) {
        toast.error("Map not found");
        return null;
    }

    const mapboxMap = map.getMap();

    const [selectedDistrict, setSelectedDistrict] = useState<
        IDistrictFeature | null
    >(null);
    const [selectedIncident, setSelectedIncident] = useState<
        ICrimeIncident | null
    >(null);
    const [focusedDistrictId, setFocusedDistrictId] = useState<string | null>(
        null,
    );
    const selectedDistrictRef = useRef<IDistrictFeature | null>(null);
    // Track if we're currently interacting with a marker to prevent district selection
    const isInteractingWithMarker = useRef<boolean>(false);

    const crimeDataByDistrict = processCrimeDataByDistrict(crimes);

    const handlePopupClose = useCallback(() => {
        selectedDistrictRef.current = null;
        setSelectedDistrict(null);
        setSelectedIncident(null);
        setFocusedDistrictId(null);
        isInteractingWithMarker.current = false;

        if (map) {
            map.easeTo({
                zoom: BASE_ZOOM,
                pitch: BASE_PITCH,
                bearing: BASE_BEARING,
                duration: BASE_DURATION,
                easing: (t) => t * (2 - t),
            });

            if (map.getLayer("clusters")) {
                map.getMap().setLayoutProperty(
                    "clusters",
                    "visibility",
                    "visible",
                );
            }

            if (map.getLayer("unclustered-point")) {
                map.getMap().setLayoutProperty(
                    "unclustered-point",
                    "visibility",
                    "visible",
                );
            }

            if (map.getLayer("district-fill")) {
                const fillColorExpression = createFillColorExpression(
                    null,
                    crimeDataByDistrict,
                );
                map.getMap().setPaintProperty(
                    "district-fill",
                    "fill-color",
                    fillColorExpression as any,
                );
            }
        }
    }, [map, crimeDataByDistrict]);

    const animateExtrusionDown = () => {
        if (!map || !map.getLayer("district-extrusion") || !focusedDistrictId) {
            return;
        }

        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
            animationRef.current = null;
        }

        // Get the current height from the layer (default to 800 if not found)
        let currentHeight = 800;

        try {
            const paint = map.getPaintProperty(
                "district-extrusion",
                "fill-extrusion-height",
            );
            if (Array.isArray(paint) && paint.length > 0) {
                // Try to extract the current height from the expression
                const idx = paint.findIndex((v) => v === focusedDistrictId);
                if (idx !== -1 && typeof paint[idx + 1] === "number") {
                    currentHeight = paint[idx + 1];
                }
            }
        } catch {
            // fallback to default
        }

        const startHeight = currentHeight;
        const targetHeight = 0;
        const duration = 700;
        const startTime = performance.now();

        const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easedProgress = progress * (2 - progress);
            const newHeight = startHeight +
                (targetHeight - startHeight) * easedProgress;

            try {
                map.getMap().setPaintProperty(
                    "district-extrusion",
                    "fill-extrusion-height",
                    [
                        "case",
                        ["has", "kode_kec"],
                        [
                            "match",
                            ["get", "kode_kec"],
                            focusedDistrictId,
                            newHeight,
                            0,
                        ],
                        0,
                    ],
                );

                map.getMap().setPaintProperty(
                    "district-extrusion",
                    "fill-extrusion-color",
                    [
                        "case",
                        ["has", "kode_kec"],
                        [
                            "match",
                            ["get", "kode_kec"],
                            focusedDistrictId || "",
                            "transparent",
                            "transparent",
                        ],
                        "transparent",
                    ],
                );

                if (progress < 1) {
                    animationRef.current = requestAnimationFrame(animate);
                } else {
                    animationRef.current = null;
                }
            } catch (error) {
                if (animationRef.current) {
                    cancelAnimationFrame(animationRef.current);
                    animationRef.current = null;
                }
            }
        };

        animationRef.current = requestAnimationFrame(animate);
    };

    const handleCloseDistrictPopup = useCallback(() => {
        animateExtrusionDown();
        handlePopupClose();
    }, [handlePopupClose, animateExtrusionDown]);

    const handleDistrictClick = useCallback(
        (feature: IDistrictFeature) => {
            if (isInteractingWithMarker.current) {
                return;
            }

            setSelectedIncident(null);
            setSelectedDistrict(feature);
            selectedDistrictRef.current = feature;
            setFocusedDistrictId(feature.id);

            if (map && feature.longitude && feature.latitude) {
                map.flyTo({
                    center: [feature.longitude, feature.latitude],
                    zoom: ZOOM_3D,
                    pitch: PITCH_3D,
                    bearing: BASE_BEARING,
                    duration: BASE_DURATION,
                    easing: (t) => t * (2 - t),
                });

                if (map.getLayer("clusters")) {
                    map.getMap().setLayoutProperty(
                        "clusters",
                        "visibility",
                        "none",
                    );
                }
                if (map.getLayer("unclustered-point")) {
                    map.getMap().setLayoutProperty(
                        "unclustered-point",
                        "visibility",
                        "none",
                    );
                }
            }
        },
        [map],
    );

    useEffect(() => {
        if (!mapboxMap) return;

        const handleFlyToEvent = (e: Event) => {
            const customEvent = e as CustomEvent;
            if (!map || !customEvent.detail) return;

            const { longitude, latitude, zoom, bearing, pitch, duration } =
                customEvent.detail;

            map.flyTo({
                center: [longitude, latitude],
                zoom: zoom || 15,
                bearing: bearing || 0,
                pitch: pitch || 45,
                duration: duration || 2000,
            });
        };

        mapboxMap.getCanvas().addEventListener(
            "mapbox_fly_to",
            handleFlyToEvent as EventListener,
        );

        return () => {
            if (mapboxMap && mapboxMap.getCanvas()) {
                mapboxMap.getCanvas().removeEventListener(
                    "mapbox_fly_to",
                    handleFlyToEvent as EventListener,
                );
            }
        };
    }, [mapboxMap, map]);

    useEffect(() => {
        if (selectedDistrictRef.current) {
            const districtId = selectedDistrictRef.current.id;
            const districtCrime = crimes.find((crime) =>
                crime.district_id === districtId
            );

            if (districtCrime) {
                const selectedYearNum = year
                    ? Number.parseInt(year)
                    : new Date().getFullYear();

                let demographics = districtCrime.districts.demographics?.find((
                    d,
                ) => d.year === selectedYearNum);

                if (
                    !demographics &&
                    districtCrime.districts.demographics?.length
                ) {
                    demographics =
                        districtCrime.districts.demographics.sort((a, b) =>
                            b.year - a.year
                        )[0];
                }

                let geographics = districtCrime.districts.geographics?.find((
                    g,
                ) => g.year === selectedYearNum);

                if (
                    !geographics && districtCrime.districts.geographics?.length
                ) {
                    const validGeographics = districtCrime.districts.geographics
                        .filter((g) => g.year !== null)
                        .sort((a, b) => (b.year || 0) - (a.year || 0));

                    geographics = validGeographics.length > 0
                        ? validGeographics[0]
                        : districtCrime.districts.geographics[0];
                }

                if (!demographics || !geographics) {
                    console.error("Missing district data:", {
                        demographics,
                        geographics,
                    });
                    return;
                }

                const crime_incidents = districtCrime.crime_incidents
                    .filter((incident) =>
                        filterCategory === "all" ||
                        incident.crime_categories.name === filterCategory
                    )
                    .map((incident) => ({
                        id: incident.id,
                        timestamp: incident.timestamp,
                        description: incident.description,
                        status: incident.status || "",
                        category: incident.crime_categories.name,
                        type: incident.crime_categories.type || "",
                        address: incident.locations.address || "",
                        latitude: incident.locations.latitude,
                        longitude: incident.locations.longitude,
                    }));

                const updatedDistrict: IDistrictFeature = {
                    ...selectedDistrictRef.current,
                    number_of_crime:
                        crimeDataByDistrict[districtId]?.number_of_crime || 0,
                    level: crimeDataByDistrict[districtId]?.level ||
                        selectedDistrictRef.current.level,
                    demographics: {
                        number_of_unemployed: demographics.number_of_unemployed,
                        population: demographics.population,
                        population_density: demographics.population_density,
                        year: demographics.year,
                    },
                    geographics: {
                        address: geographics.address || "",
                        land_area: geographics.land_area || 0,
                        year: geographics.year || 0,
                        latitude: geographics.latitude,
                        longitude: geographics.longitude,
                    },
                    crime_incidents,
                    selectedYear: year,
                    selectedMonth: month,
                };

                selectedDistrictRef.current = updatedDistrict;

                setSelectedDistrict((prevDistrict) => {
                    if (
                        prevDistrict?.id === updatedDistrict.id &&
                        prevDistrict?.selectedYear ===
                        updatedDistrict.selectedYear &&
                        prevDistrict?.selectedMonth ===
                        updatedDistrict.selectedMonth
                    ) {
                        return prevDistrict;
                    }
                    return updatedDistrict;
                });
            }
        }
    }, [crimes, filterCategory, year, month, crimeDataByDistrict]);

    const handleSetFocusedDistrictId = useCallback(
        (id: string | null, isMarkerClick = false) => {
            if (isMarkerClick) {
                isInteractingWithMarker.current = true;

                setTimeout(() => {
                    isInteractingWithMarker.current = false;
                }, 1000);
            }

            setFocusedDistrictId(id);
        },
        [],
    );

    const showHeatmapLayer = activeControl === "heatmap" && sourceType !== "cbu";
    const showUnitsLayer = activeControl === "units";
    const showTimelineLayer = activeControl === "timeline";
    const showRecentIncidents = activeControl === "recents";
    const showAllIncidents = activeControl === "incidents";
    const showDistrictFill = activeControl === "clusters";

    // Show clusters based on source type and active control
    const showCBTClusters = activeControl === "clusters" && sourceType === "cbt";
    const showCBUClusters = activeControl === "clusters" && sourceType === "cbu";

    const showIncidentMarkers = activeControl !== "heatmap" &&
        activeControl !== "timeline" && sourceType !== "cbu";

    const shouldShowExtrusion = focusedDistrictId !== null &&
        !isInteractingWithMarker.current;


    useEffect(() => {
        if (!mapboxMap) return;

        const recentLayerIds = [
            "very-recent-incidents-pulse",
            "recent-incidents-glow",
            "recent-incidents",
        ];
        const timelineLayerIds = ["timeline-markers-bg", "timeline-markers"];
        const heatmapLayerIds = ["heatmap-layer"];
        const unitsLayerIds = [
            "units-points",
            "incidents-points",
            "units-labels",
            "units-connection-lines",
        ];
        const allIncidentsLayerIds = [
            "all-incidents-pulse",
            "all-incidents-circles",
            "all-incidents",
        ];
        // Add explicit CBT and CBU layer IDs
        const cbtLayerIds = ['cbt-clusters', 'cbt-cluster-count', 'cbt-unclustered-point'];
        const cbuLayerIds = ['cbu-clusters', 'cbu-cluster-count', 'cbu-unclustered-point', 'cbu-unclustered-count'];

        // Define a single function to hide all layers except the active one
        const showOnlyActiveLayers = () => {
            // First, hide all layers by default
            manageLayerVisibility(mapboxMap, recentLayerIds, activeControl === "recents");
            manageLayerVisibility(mapboxMap, timelineLayerIds, activeControl === "timeline");
            manageLayerVisibility(mapboxMap, heatmapLayerIds, activeControl === "heatmap");
            manageLayerVisibility(mapboxMap, unitsLayerIds, activeControl === "units");
            manageLayerVisibility(mapboxMap, allIncidentsLayerIds, activeControl === "incidents");

            // Handle cluster layers based on active control AND source type
            if (activeControl === "clusters") {
                // Only show CBT clusters if sourceType is "cbt"
                manageLayerVisibility(mapboxMap, cbtLayerIds, sourceType === "cbt");

                // Only show CBU clusters if sourceType is "cbu" 
                manageLayerVisibility(mapboxMap, cbuLayerIds, sourceType === "cbu");
            } else {
                // If not in clusters mode, hide all cluster layers
                manageLayerVisibility(mapboxMap, cbtLayerIds, false);
                manageLayerVisibility(mapboxMap, cbuLayerIds, false);
            }
        };

        // Execute immediately
        showOnlyActiveLayers();

        // Return cleanup function
        return () => {
            // No need for cleanup as each call to manageLayerVisibility properly handles its own state
        };
    }, [activeControl, sourceType, mapboxMap]);

    return (
        <>
            <DistrictFillLineLayer
                visible={true}
                map={mapboxMap}
                year={year}
                month={month}
                filterCategory={filterCategory}
                crimes={crimes}
                tilesetId={tilesetId}
                focusedDistrictId={focusedDistrictId}
                setFocusedDistrictId={handleSetFocusedDistrictId}
                crimeDataByDistrict={crimeDataByDistrict}
                showFill={showDistrictFill}
                activeControl={activeControl}
                onDistrictClick={handleDistrictClick}
            />

            {shouldShowExtrusion && (
                <DistrictExtrusionLayer
                    visible={true}
                    map={mapboxMap}
                    tilesetId={tilesetId}
                    focusedDistrictId={focusedDistrictId}
                    crimeDataByDistrict={crimeDataByDistrict}
                />
            )}

            <AllIncidentsLayer
                visible={showAllIncidents}
                map={mapboxMap}
                crimes={crimes}
                filterCategory={filterCategory}
            />

            <RecentIncidentsLayer
                visible={showRecentIncidents}
                map={mapboxMap}
                incidents={recentIncidents}
            />

            <HeatmapLayer
                crimes={crimes}
                year={year}
                month={month}
                filterCategory={filterCategory}
                visible={showHeatmapLayer}
                useAllData={useAllData}
                enableInteractions={true}
                setFocusedDistrictId={handleSetFocusedDistrictId}
            />

            <TimelineLayer
                crimes={crimes}
                year={year}
                month={month}
                filterCategory={filterCategory}
                visible={showTimelineLayer}
                map={mapboxMap}
                useAllData={useAllData}
            />

            <UnitsLayer
                crimes={crimes}
                units={units}
                filterCategory={filterCategory}
                visible={showUnitsLayer}
                map={mapboxMap}
            />

            {/* Always render both cluster layers but with proper visibility control */}
            <CBTClusterLayer
                visible={showCBTClusters}
                map={mapboxMap}
                crimes={crimes}
                filterCategory={filterCategory}
                focusedDistrictId={focusedDistrictId}
                clusteringEnabled={true}
                showClusters={showCBTClusters}
                sourceType={sourceType} // Pass current source type
                year={year}
                month={month}
            />

            <CBUClusterLayer
                visible={showCBUClusters}
                map={mapboxMap}
                crimes={crimes}
                filterCategory={filterCategory}
                focusedDistrictId={focusedDistrictId}
                clusteringEnabled={true}
                showClusters={showCBUClusters}
                sourceType={sourceType} // Pass current source type
                year={year}
                month={month}
            />

            {selectedDistrict && !selectedIncident &&
                !isInteractingWithMarker.current && (
                    <DistrictPopup
                        longitude={selectedDistrict.longitude || 0}
                        latitude={selectedDistrict.latitude || 0}
                        onClose={handleCloseDistrictPopup}
                        district={selectedDistrict}
                        year={year}
                        month={month}
                        filterCategory={filterCategory}
                    />
                )}

            <TimezoneLayer map={mapboxMap} />

            <FaultLinesLayer map={mapboxMap} />
        </>
    );
}
