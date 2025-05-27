"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
    AlertTriangle,
    Calendar,
    ChevronRight,
    Clock,
    MapPin,
    X,
} from "lucide-react";
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/app/_components/ui/card";
import { cn } from "@/app/_lib/utils";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/app/_components/ui/tabs";
import { Button } from "@/app/_components/ui/button";
import { Skeleton } from "@/app/_components/ui/skeleton";
import { useMap } from "react-map-gl/mapbox";
import { ICrimes, IIncidentLogs } from "@/app/_utils/types/crimes";

// Import sidebar components
import { SidebarIncidentsTab } from "./tabs/incidents-tab";

import { getMonthName } from "@/app/_utils/common";
import { SidebarInfoTab } from "./tabs/info-tab";
import { SidebarStatisticsTab } from "./tabs/statistics-tab";
import { useCrimeAnalytics } from "@/app/(pages)/(admin)/dashboard/crime-management/crime-overview/_hooks/use-crime-analytics";
import { usePagination } from "@/app/_hooks/use-pagination";
import { ICrimeSourceTypes } from "@/app/_utils/types/map";

interface CrimeSidebarProps {
    className?: string;
    defaultCollapsed?: boolean;
    selectedCategory?: string | "all";
    selectedYear: number | "all";
    selectedMonth?: number | "all";
    crimes: ICrimes[];
    recentIncidents?: IIncidentLogs[]; // User reports from last 24 hours
    isLoading?: boolean;
    sourceType?: ICrimeSourceTypes;
}

export default function CrimeSidebar({
    className,
    defaultCollapsed = true,
    selectedCategory = "all",
    selectedYear,
    selectedMonth,
    crimes = [],
    recentIncidents = [], // User reports from last 24 hours
    isLoading = false,
    sourceType = "cbt",
}: CrimeSidebarProps) {
    const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
    const [activeTab, setActiveTab] = useState("incidents");
    const [activeIncidentTab, setActiveIncidentTab] = useState("recent");
    const [currentTime, setCurrentTime] = useState<Date>(new Date());
    const [location, setLocation] = useState<string>("Jember, East Java");

    // Get the map instance to use for flyTo
    const { current: map } = useMap();

    // Use custom hooks for analytics and pagination
    const crimeStats = useCrimeAnalytics(crimes);
    const { paginationState, handlePageChange } = usePagination(
        crimeStats.availableMonths,
    );

    // Update current time every minute for the real-time display
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 60000);

        return () => clearInterval(timer);
    }, []);

    // Set default tab based on source type
    useEffect(() => {
        if (sourceType === "cbu") {
            setActiveTab("incidents");
        }
    }, [sourceType]);

    // Format date with selected year and month if provided
    const getDisplayDate = () => {
        if (selectedMonth && selectedMonth !== "all") {
            const date = new Date();
            date.setFullYear(
                typeof selectedYear === "number"
                    ? selectedYear
                    : new Date().getFullYear(),
            );
            date.setMonth(Number(selectedMonth) - 1);

            return new Intl.DateTimeFormat("en-US", {
                year: "numeric",
                month: "long",
            }).format(date);
        }

        return new Intl.DateTimeFormat("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        }).format(currentTime);
    };

    const formattedDate = getDisplayDate();

    const formattedTime = new Intl.DateTimeFormat("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    }).format(currentTime);

    const getTimePeriodDisplay = () => {
        if (selectedMonth && selectedMonth !== "all") {
            return `${getMonthName(Number(selectedMonth))} ${selectedYear}`;
        }
        return `${selectedYear} - All months`;
    };

    const handleIncidentClick = (incident: any) => {
        if (!map || !incident.longitude || !incident.latitude) return;
    };

    return (
        <div
            className={cn(
                "fixed top-0 left-0 h-full z-40 transition-transform duration-300 ease-in-out bg-background border-r border-sidebar-border",
                isCollapsed ? "-translate-x-full" : "translate-x-0",
                className,
            )}
        >
            <div className="relative h-full flex items-stretch">
                <div className="bg-background backdrop-blur-sm border-r border-sidebar-border h-full w-[420px]">
                    <div className="p-4 text-sidebar-foreground h-full flex flex-col max-h-full overflow-hidden">
                        <CardHeader className="p-0 pb-4 shrink-0 relative">
                            <div className="absolute top-0 right-0">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/30"
                                    onClick={() => setIsCollapsed(true)}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="bg-sidebar-primary p-2 rounded-lg">
                                    <AlertTriangle className="h-5 w-5 text-sidebar-primary-foreground" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl font-semibold">
                                        Crime Analysis
                                        {sourceType && (
                                            <span className="ml-2 text-xs font-normal px-2 py-1 bg-sidebar-accent rounded-full">
                                                {sourceType.toUpperCase()}
                                            </span>
                                        )}
                                    </CardTitle>
                                    {!isLoading && (
                                        <CardDescription className="text-sm text-sidebar-foreground/70">
                                            {getTimePeriodDisplay()}
                                        </CardDescription>
                                    )}
                                </div>
                            </div>
                        </CardHeader>

                        <Tabs
                            defaultValue="incidents"
                            className="w-full flex-1 flex flex-col overflow-hidden"
                            value={activeTab}
                            onValueChange={setActiveTab}
                        >
                            <TabsList className="w-full mb-4 bg-sidebar-accent p-1 rounded-full">
                                <TabsTrigger
                                    value="incidents"
                                    className="flex-1 rounded-full data-[state=active]:bg-sidebar-primary data-[state=active]:text-sidebar-primary-foreground"
                                >
                                    Dashboard
                                </TabsTrigger>

                                <TabsTrigger
                                    value="statistics"
                                    className="flex-1 rounded-full data-[state=active]:bg-sidebar-primary data-[state=active]:text-sidebar-primary-foreground"
                                >
                                    Statistics
                                </TabsTrigger>
                                <TabsTrigger
                                    value="info"
                                    className="flex-1 rounded-full data-[state=active]:bg-sidebar-primary data-[state=active]:text-sidebar-primary-foreground"
                                >
                                    Information
                                </TabsTrigger>
                            </TabsList>

                            <div className="flex-1 overflow-y-auto overflow-x-hidden pr-1 custom-scrollbar">
                                {isLoading
                                    ? (
                                        <div className="space-y-4">
                                            <Skeleton className="h-24 w-full" />
                                            <div className="grid grid-cols-2 gap-2">
                                                <Skeleton className="h-16 w-full" />
                                                <Skeleton className="h-16 w-full" />
                                                <Skeleton className="h-16 w-full" />
                                                <Skeleton className="h-16 w-full" />
                                            </div>
                                            <div className="space-y-2">
                                                <Skeleton className="h-20 w-full" />
                                                <Skeleton className="h-20 w-full" />
                                                <Skeleton className="h-20 w-full" />
                                            </div>
                                        </div>
                                    )
                                    : (
                                        <>
                                            <TabsContent
                                                value="incidents"
                                                className="m-0 p-0 space-y-4"
                                            >
                                                <SidebarIncidentsTab
                                                    crimeStats={crimeStats}
                                                    formattedDate={formattedDate}
                                                    formattedTime={formattedTime}
                                                    location={location}
                                                    selectedMonth={selectedMonth}
                                                    selectedYear={selectedYear}
                                                    selectedCategory={selectedCategory}
                                                    getTimePeriodDisplay={getTimePeriodDisplay}
                                                    paginationState={paginationState}
                                                    handlePageChange={handlePageChange}
                                                    handleIncidentClick={handleIncidentClick}
                                                    activeIncidentTab={activeIncidentTab}
                                                    setActiveIncidentTab={setActiveIncidentTab}
                                                    sourceType={sourceType}
                                                    recentIncidents={recentIncidents} // Pass the recentIncidents
                                                />
                                            </TabsContent>

                                            <TabsContent
                                                value="statistics"
                                                className="m-0 p-0 space-y-4"
                                            >
                                                <SidebarStatisticsTab
                                                    crimeStats={crimeStats}
                                                    selectedMonth={selectedMonth}
                                                    selectedYear={selectedYear}
                                                    sourceType={sourceType}
                                                    crimes={crimes}
                                                />
                                            </TabsContent>

                                            <TabsContent
                                                value="info"
                                                className="m-0 p-0 space-y-4"
                                            >
                                                <SidebarInfoTab
                                                    sourceType={sourceType}
                                                />
                                            </TabsContent>
                                        </>
                                    )}
                            </div>
                        </Tabs>
                    </div>
                </div>

                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className={cn(
                        "absolute h-12 w-8 bg-background border-t border-b border-r border-sidebar-primary-foreground/30 flex items-center justify-center",
                        "top-1/2 -translate-y-1/2 transition-all duration-300 ease-in-out",
                        isCollapsed
                            ? "-right-8 rounded-r-md"
                            : "left-[420px] rounded-r-md",
                    )}
                    aria-label={isCollapsed
                        ? "Expand sidebar"
                        : "Collapse sidebar"}
                >
                    <ChevronRight
                        className={cn(
                            "h-5 w-5 text-sidebar-primary-foreground transition-transform",
                            !isCollapsed && "rotate-180",
                        )}
                    />
                </button>
            </div>
        </div>
    );
}
