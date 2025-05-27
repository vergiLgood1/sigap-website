"use client";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/app/_components/ui/card";
import { Skeleton } from "@/app/_components/ui/skeleton";
import MapView from "./map";
import { Button } from "@/app/_components/ui/button";
import { AlertCircle } from "lucide-react";
import { getMonthName } from "@/app/_utils/common";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useFullscreen } from "@/app/_hooks/use-fullscreen";
import { Overlay } from "./overlay";
import clusterLegend from "./legends/map-legend";
import UnitsLegend from "./legends/units-legend";
import TimelineLegend from "./legends/timeline-legend";
import {
    useGetAvailableYears,
    useGetCrimeCategories,
    useGetCrimes,
    useGetCrimeTypes,
    useGetRecentIncidents,
} from "@/app/(pages)/(admin)/dashboard/crime-management/crime-overview/_queries/queries";
import MapSelectors from "./controls/map-selector";

import { cn } from "@/app/_lib/utils";
import { CrimeTimelapse } from "./controls/bottom/crime-timelapse";
import { ITooltipsControl } from "./controls/top/tooltips";
import CrimeSidebar from "./controls/left/sidebar/map-sidebar";
import Tooltips from "./controls/top/tooltips";
import Layers from "./layers/layers";

import { useGetUnitsQuery } from "@/app/(pages)/(admin)/dashboard/crime-management/units/_queries/queries";
import { ICrimeSourceTypes, IDistrictFeature } from "@/app/_utils/types/map";
import EWSAlertLayer from "./layers/ews-alert-layer";
import { IIncidentLog } from "@/app/_utils/types/ews";
import {
    addMockIncident,
    getAllIncidents,
    resolveIncident,
} from "@/app/_utils/mock/ews-data";
import { useMap } from "react-map-gl/mapbox";
import PanicButtonDemo from "./controls/panic-button-demo";
import ClusterLegend from "./legends/map-legend";

export default function CrimeMap() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
    const [activeControl, setActiveControl] = useState<ITooltipsControl>(
        "clusters",
    );
    const [selectedDistrict, setSelectedDistrict] = useState<
        IDistrictFeature | null
    >(null);
    const [selectedSourceType, setSelectedSourceType] = useState<ICrimeSourceTypes>("cbu");
    const [selectedYear, setSelectedYear] = useState<number | "all">();
    const [selectedMonth, setSelectedMonth] = useState<number | "all">("all");
    const [selectedCategory, setSelectedCategory] = useState<string | "all">(
        "all",
    );
    const [ewsIncidents, setEwsIncidents] = useState<IIncidentLog[]>([]);

    const [useAllYears, setUseAllYears] = useState<boolean>(false);
    const [useAllMonths, setUseAllMonths] = useState<boolean>(false);

    const [showAllIncidents, setShowAllIncidents] = useState(false);
    const [showUnitsLayer, setShowUnitsLayer] = useState(false);
    const [showClustersLayer, setShowClustersLayer] = useState(false);
    const [showHeatmap, setShowHeatmap] = useState(false);
    const [showTimelineLayer, setShowTimelineLayer] = useState(false);
    const [showEWS, setShowEWS] = useState<boolean>(true);
    const [showPanicDemo, setShowPanicDemo] = useState(true);
    const [displayPanicDemo, setDisplayPanicDemo] = useState(
        showEWS && showPanicDemo,
    );

    const [isTimelapsePlaying, setisTimelapsePlaying] = useState(false);
    const [yearProgress, setYearProgress] = useState(0);
    const [isSearchActive, setIsSearchActive] = useState(false);

    const mapContainerRef = useRef<HTMLDivElement>(null);

    const { current: mapInstance } = useMap();

    const mapboxMap = mapInstance?.getMap() || null;

    const { isFullscreen } = useFullscreen(mapContainerRef);

    const { data: availableSourceTypes, isLoading: isTypeLoading } =
        useGetCrimeTypes();

    const {
        data: availableYears,
        isLoading: isYearsLoading,
        error: yearsError,
    } = useGetAvailableYears();

    const { data: categoriesData, isLoading: isCategoryLoading } =
        useGetCrimeCategories();

    const categories = useMemo(
        () =>
            categoriesData
                ? categoriesData.map((category) => category.name)
                : [],
        [categoriesData],
    );

    const {
        data: crimes,
        isLoading: isCrimesLoading,
        error: crimesError,
    } = useGetCrimes();

    const { data: fetchedUnits, isLoading } = useGetUnitsQuery();

    const { data: recentIncidents } = useGetRecentIncidents();

    useEffect(() => {
        const currentYear = new Date().getFullYear();
        const defaultYear = selectedSourceType === "cbu" ? 2024 : currentYear;
        setSelectedYear(defaultYear);
    }, [selectedSourceType]);

    useEffect(() => {
        if (
            activeControl === "heatmap" || activeControl === "timeline" ||
            activeControl === "incidents"
        ) {
            setSelectedYear("all");
            setUseAllYears(true);
            setUseAllMonths(true);
        } else if (selectedYear === "all") {
            const currentYear = new Date().getFullYear();
            setSelectedYear(selectedSourceType === "cbu" ? 2024 : currentYear);
            setUseAllYears(false);
            setUseAllMonths(false);
        }
    }, [activeControl, selectedSourceType, selectedYear]);

    const crimesBySourceType = useMemo(() => {
        if (!crimes) return [];
        return crimes.filter((crime) =>
            crime.source_type === selectedSourceType
        );
    }, [crimes, selectedSourceType]);

    const filteredByYearAndMonth = useMemo(() => {
        if (!crimesBySourceType || crimesBySourceType.length === 0) return [];

        if (useAllYears) {
            if (useAllMonths) {
                return crimesBySourceType;
            } else {
                return crimesBySourceType.filter((crime) => {
                    return selectedMonth === "all"
                        ? true
                        : crime.month === selectedMonth;
                });
            }
        }

        return crimesBySourceType.filter((crime) => {
            const yearMatch = crime.year === selectedYear;

            if (selectedMonth === "all" || useAllMonths) {
                return yearMatch;
            } else {
                return yearMatch && crime.month === selectedMonth;
            }
        });
    }, [
        crimesBySourceType,
        selectedYear,
        selectedMonth,
        useAllYears,
        useAllMonths,
    ]);

    const filteredCrimes = useMemo(() => {
        if (!filteredByYearAndMonth || filteredByYearAndMonth.length === 0)
            return [];
        if (selectedCategory === "all") return filteredByYearAndMonth;

        return filteredByYearAndMonth.map((crime) => {
            const filteredIncidents = crime.crime_incidents.filter(
                (incident) =>
                    incident.crime_categories.name === selectedCategory,
            );

            return {
                ...crime,
                crime_incidents: filteredIncidents,
                number_of_crime: filteredIncidents.length,
            };
        });
    }, [filteredByYearAndMonth, selectedCategory]);

    useEffect(() => {
        if (selectedSourceType === "cbu") {
            if (
                activeControl !== "clusters" && activeControl !== "reports" &&
                activeControl !== "layers" && activeControl !== "search" &&
                activeControl !== "alerts"
            ) {
                setActiveControl("clusters");
                setShowClustersLayer(true);
            }
        }
    }, [selectedSourceType, activeControl]);

    useEffect(() => {
        setEwsIncidents(getAllIncidents());
    }, []);

    useEffect(() => {
        const handleSetYear = (e: CustomEvent) => {
            if (typeof e.detail === 'number') {
                setSelectedYear(e.detail);
            }
        };

        window.addEventListener('set-year', handleSetYear as EventListener);

        return () => {
            window.removeEventListener('set-year', handleSetYear as EventListener);
        };
    }, []);

    useEffect(() => {
        const handleSetDataSource = (e: CustomEvent) => {
            if (typeof e.detail === 'string') {
                setSelectedSourceType(e.detail as ICrimeSourceTypes);
            }
        }

        window.addEventListener('set-data-source', handleSetDataSource as EventListener);

        return () => {
            window.removeEventListener('set-data-source', handleSetDataSource as EventListener);
        }
    })

    const handleTriggerAlert = useCallback(
        (priority: "high" | "medium" | "low") => {
            const newIncident = addMockIncident({ priority });
            setEwsIncidents(getAllIncidents());
        },
        [],
    );

    const handleResolveIncident = useCallback((id: string) => {
        resolveIncident(id);
        setEwsIncidents(getAllIncidents());
    }, []);

    const handleResolveAllAlerts = useCallback(() => {
        ewsIncidents.forEach((incident) => {
            if (incident.status === "active") {
                resolveIncident(incident.id);
            }
        });
        setEwsIncidents(getAllIncidents());
    }, [ewsIncidents]);

    const handleSourceTypeChange = useCallback((sourceType: ICrimeSourceTypes) => {
        setSelectedSourceType(sourceType);

        const currentYear = new Date().getFullYear();
        const defaultYear = sourceType === "cbu" ? 2024 : currentYear;
        setSelectedYear(defaultYear);

        if (sourceType === "cbu") {
            setActiveControl("clusters");
            setShowClustersLayer(true);
        } else {
            setActiveControl("clusters");
            setShowClustersLayer(true);
        }
    }, []);

    const handleTimelineChange = useCallback(
        (year: number, month: number, progress: number) => {
            setSelectedYear(year);
            setSelectedMonth(month);
            setYearProgress(progress);
        },
        [],
    );

    const handleTimelinePlayingChange = useCallback((playing: boolean) => {
        setisTimelapsePlaying(playing);

        if (playing) {
            setSelectedDistrict(null);
        }
    }, []);

    const resetFilters = useCallback(() => {
        const currentYear = new Date().getFullYear();
        const defaultYear = selectedSourceType === "cbu" ? 2024 : currentYear;
        setSelectedYear(defaultYear);
        setSelectedMonth("all");
        setSelectedCategory("all");
    }, [selectedSourceType]);

    const getMapTitle = () => {
        if (useAllYears) {
            return `All Years Data ${selectedCategory !== "all" ? `- ${selectedCategory}` : ""
                }`;
        }

        let title = `${selectedYear}`;
        if (selectedMonth !== "all" && !useAllMonths) {
            title += ` - ${getMonthName(Number(selectedMonth))}`;
        }
        if (selectedCategory !== "all") {
            title += ` - ${selectedCategory}`;
        }
        return title;
    };

    const handleControlChange = (controlId: ITooltipsControl) => {
        if (
            selectedSourceType === "cbu" &&
            !["clusters", "reports", "layers", "search", "alerts"].includes(
                controlId as string,
            )
        ) {
            return;
        }

        setActiveControl(controlId);

        if (controlId === "clusters") {
            setShowClustersLayer(true);
        } else {
            setShowClustersLayer(false);
        }

        if (controlId === "incidents") {
            setShowAllIncidents(true);
        } else {
            setShowAllIncidents(false);
        }

        if (controlId === "search") {
            setIsSearchActive((prev) => !prev);
        }

        if (controlId === "units") {
            setShowUnitsLayer(true);
        } else {
            setShowUnitsLayer(false);
        }

        if (controlId === "timeline") {
            setShowTimelineLayer(true);
        } else {
            setShowTimelineLayer(false);
        }

        if (
            controlId === "heatmap" || controlId === "timeline" ||
            controlId === "incidents"
        ) {
            setUseAllYears(true);
            setUseAllMonths(true);
        } else {
            setUseAllYears(false);
            setUseAllMonths(false);
        }

        setShowEWS(true);
    };

    // useEffect(() => {
    //     console.log(`Current source type: ${selectedSourceType}`);
    //     console.log(`Total crimes before filtering: ${crimes?.length || 0}`);
    //     console.log(
    //         `Total crimes after source type filtering: ${crimesBySourceType.length}`,
    //     );
    //     console.log(
    //         `Total crimes after all filtering: ${filteredCrimes.length}`,
    //     );
    // }, [crimes, crimesBySourceType, filteredCrimes, selectedSourceType]);

    const disableYearMonth = activeControl === "incidents" || activeControl === "heatmap" || activeControl === "timeline"

    const activeIncidents = useMemo(() => {
        return ewsIncidents.filter((incident) => incident.status === "active");
    }, [ewsIncidents])

    return (
        <Card className="w-full p-0 border-none shadow-none h-96">
            <CardHeader className="flex flex-row pb-2 pt-0 px-0 items-center justify-between">
                <CardTitle>Crime Map {getMapTitle()}</CardTitle>
                <MapSelectors
                    availableYears={availableYears || []}
                    selectedYear={selectedYear ?? "all"}
                    setSelectedYear={setSelectedYear}
                    selectedMonth={selectedMonth}
                    setSelectedMonth={setSelectedMonth}
                    selectedCategory={selectedCategory}
                    setSelectedCategory={setSelectedCategory}
                    categories={categories}
                    isYearsLoading={isYearsLoading}
                    isCategoryLoading={isCategoryLoading}
                    disableYearMonth={activeControl === "incidents" ||
                        activeControl === "heatmap" ||
                        activeControl === "timeline"}
                />
            </CardHeader>
            <CardContent className="p-0">
                {isCrimesLoading
                    ? (
                        <div className="flex items-center justify-center h-96">
                            <Skeleton className="h-full w-full rounded-md" />
                        </div>
                    )
                    : crimesError
                        ? (
                            <div className="flex flex-col items-center justify-center h-96 gap-4">
                                <AlertCircle className="h-10 w-10 text-destructive" />
                                <p className="text-center">
                                    Failed to load crime data. Please try again
                                    later.
                                </p>
                                <Button onClick={() => window.location.reload()}>
                                    Retry
                                </Button>
                            </div>
                        )
                        : (
                            <div
                                className="mapbox-container overlay-bg relative h-[600px]"
                                ref={mapContainerRef}
                            >
                                <div
                                    className={cn(
                                        "transition-all duration-300 ease-in-out",
                                        !sidebarCollapsed && isFullscreen &&
                                        "ml-[400px]",
                                    )}
                                >
                                    <div className="">
                                        <MapView
                                            mapStyle="mapbox://styles/mapbox/dark-v11"
                                            className="h-[600px] w-full rounded-md"
                                        >
                                            <Layers
                                                crimes={filteredCrimes || []}
                                                units={fetchedUnits || []}
                                                year={selectedYear?.toString() ?? "all"}
                                                month={selectedMonth.toString()}
                                                filterCategory={selectedCategory}
                                                activeControl={activeControl}
                                                useAllData={useAllYears}
                                                showEWS={showEWS}
                                                recentIncidents={recentIncidents ||
                                                    []}
                                                sourceType={selectedSourceType}
                                            />

                                            {isFullscreen && (
                                                <>
                                                    <div className="absolute flex w-full p-2">
                                                        <Tooltips
                                                            activeControl={activeControl}
                                                            onControlChange={handleControlChange}
                                                            selectedSourceType={selectedSourceType}
                                                            setSelectedSourceType={handleSourceTypeChange}
                                                            availableSourceTypes={availableSourceTypes || []}
                                                            selectedYear={selectedYear ?? "all"}
                                                            setSelectedYear={setSelectedYear}
                                                            selectedMonth={selectedMonth}
                                                            setSelectedMonth={setSelectedMonth}
                                                            selectedCategory={selectedCategory}
                                                            setSelectedCategory={setSelectedCategory}
                                                            availableYears={availableYears || []}
                                                            categories={categories}
                                                            crimes={filteredCrimes}
                                                            disableYearMonth={disableYearMonth}
                                                        />
                                                    </div>

                                                    {mapboxMap && (
                                                        <EWSAlertLayer
                                                            map={mapboxMap}
                                                            incidents={ewsIncidents}
                                                            onIncidentResolved={handleResolveIncident}
                                                        />
                                                    )}

                                                    {displayPanicDemo && (
                                                        <div className="absolute top-0 right-20 z-50 p-2">
                                                            <PanicButtonDemo
                                                                onTriggerAlert={handleTriggerAlert}
                                                                onResolveAllAlerts={handleResolveAllAlerts}
                                                                activeIncidents={activeIncidents}
                                                            />
                                                        </div>
                                                    )}

                                                    <CrimeSidebar
                                                        crimes={filteredCrimes || []}
                                                        recentIncidents={recentIncidents || []}
                                                        defaultCollapsed={sidebarCollapsed}
                                                        selectedCategory={selectedCategory}
                                                        selectedYear={selectedYear ?? "all"}
                                                        selectedMonth={selectedMonth}
                                                        sourceType={selectedSourceType}
                                                    />

                                                    {showClustersLayer && (
                                                        <div className="absolute bottom-20 right-0 z-20 p-2">
                                                            <ClusterLegend position="bottom-right" />
                                                        </div>
                                                    )}

                                                    {showUnitsLayer && (
                                                        <div className="absolute bottom-20 right-0 z-10 p-2">
                                                            <UnitsLegend
                                                                categories={categories}
                                                                position="bottom-right"
                                                            />
                                                        </div>
                                                    )}

                                                    {showTimelineLayer && (
                                                        <div className="absolute flex bottom-20 right-0 z-10 p-2">
                                                            <TimelineLegend position="bottom-right" />
                                                        </div>
                                                    )}
                                                </>
                                            )}

                                            <div className="absolute flex w-full bottom-0">
                                                <CrimeTimelapse
                                                    startYear={2020}
                                                    endYear={2024}
                                                    autoPlay={false}
                                                    onChange={handleTimelineChange}
                                                    onPlayingChange={handleTimelinePlayingChange}
                                                />
                                            </div>
                                        </MapView>
                                    </div>
                                </div>
                            </div>
                        )}
            </CardContent>
        </Card>
    );
}
