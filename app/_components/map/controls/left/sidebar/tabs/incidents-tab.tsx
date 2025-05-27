import React, { useState } from "react";
import {
    AlertCircle,
    AlertTriangle,
    ArrowRight,
    Calendar,
    ChevronLeft,
    ChevronRight,
    Clock,
    FileText,
    MapPin,
    RefreshCw,
    Shield,
} from "lucide-react";
import { Card, CardContent } from "@/app/_components/ui/card";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/app/_components/ui/tabs";
import { Badge } from "@/app/_components/ui/badge";
import { Button } from "@/app/_components/ui/button";
import {
    formatMonthKey,
    getIncidentSeverity,
    getMonthName,
    getTimeAgo,
} from "@/app/_utils/common";
import { SystemStatusCard } from "../components/system-status-card";
import { IncidentCardV2 } from "../components/incident-card";
import { ICrimeAnalytics } from "@/app/(pages)/(admin)/dashboard/crime-management/crime-overview/_hooks/use-crime-analytics";
import { IIncidentLogs } from "@/app/_utils/types/crimes";
import IncidentDetailTab from "./incident-detail-tab";
import { ICrimeSourceTypes } from "@/app/_utils/types/map";

interface Incident {
    id: string;
    category: string;
    address: string;
    timestamp: string | Date; // Accept both string and Date for timestamp
    district?: string;
    severity?: number | "Low" | "Medium" | "High" | "Critical"; // Match severity types
    status?: string | true; // Match status types
    description?: string;
    location?: {
        lat: number;
        lng: number;
    };
}

interface SidebarIncidentsTabProps {
    crimeStats: ICrimeAnalytics;
    formattedDate: string;
    formattedTime: string;
    location: string;
    selectedMonth?: number | "all";
    selectedYear: number | "all";
    selectedCategory: string | "all";
    getTimePeriodDisplay: () => string;
    paginationState: Record<string, number>;
    handlePageChange: (monthKey: string, direction: "next" | "prev") => void;
    handleIncidentClick: (incident: Incident) => void;
    activeIncidentTab: string;
    setActiveIncidentTab: (tab: string) => void;
    recentIncidents?: IIncidentLogs[]; // User reports from last 24 hours
    sourceType?: ICrimeSourceTypes; // Data source type (CBT or CBU)
}

export function SidebarIncidentsTab({
    crimeStats,
    formattedDate,
    formattedTime,
    location,
    selectedMonth = "all",
    selectedYear,
    selectedCategory,
    getTimePeriodDisplay,
    paginationState,
    handlePageChange,
    handleIncidentClick,
    activeIncidentTab,
    setActiveIncidentTab,
    sourceType = "cbt",
    recentIncidents = [],
}: SidebarIncidentsTabProps) {
    const currentYear = new Date().getFullYear();
    const isCurrentYear = selectedYear === currentYear ||
        selectedYear === "all";

    const [selectedIncidentDetail, setSelectedIncidentDetail] = useState<Incident | null>(null);
    const [showDetailView, setShowDetailView] = useState(false);

    const topCategories = crimeStats.categoryCounts
        ? Object.entries(crimeStats.categoryCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 4)
            .map(([type, count]) => {
                const percentage =
                    Math.round((count / crimeStats.totalIncidents) * 100) || 0;
                return { type, count, percentage };
            })
        : [];

    // Filter history incidents by the selected year
    const filteredAvailableMonths = crimeStats.availableMonths.filter(
        (monthKey) => {
            // If selectedYear is "all", show all months
            if (selectedYear === "all") return true;

            // Extract year from the monthKey (format: YYYY-MM)
            const yearFromKey = parseInt(monthKey.split("-")[0]);
            return yearFromKey === selectedYear;
        },
    );

    // Format recent incidents data from user reports
    const formattedRecentIncidents = recentIncidents
        .filter((incident) => {
            // Filter by category if needed
            return selectedCategory === "all" ||
                incident.category?.toLowerCase() ===
                selectedCategory.toLowerCase();
        })
        .map((incident) => ({
            id: incident.id,
            category: incident.category || "Uncategorized",
            address: incident.address || "Unknown location",
            timestamp: incident.timestamp
                ? incident.timestamp.toString()
                : new Date().toISOString(), // Convert to string
            description: incident.description || "",
            status: incident.verified || "pending",
            severity: getIncidentSeverity(incident),
        }))
        .sort((a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );

    const handleSwicthToCurrentYear = () => {
        window.dispatchEvent(
            new CustomEvent("set-year", {
                detail: currentYear,
            }),
        );
    }

    const handleSwitchDataSource = () => {
        window.dispatchEvent(
            new CustomEvent("set-data-source", {
                detail: sourceType === "cbt" ? "cbu" : "cbt",
            }),
        );
    }

    const handleIncidentCardClick = (incident: Incident) => {
        setSelectedIncidentDetail(incident);
        setShowDetailView(true);
        handleIncidentClick(incident);
    };

    const handleBackToList = () => {
        setShowDetailView(false);
        setSelectedIncidentDetail(null);
    };

    // If source type is CBU, display warning instead of regular content
    if (sourceType === "cbu") {
        return (
            <Card className="bg-gradient-to-r from-emerald-900/20 to-emerald-800/10 border border-emerald-500/30">
                <CardContent className="p-6 flex flex-col items-center text-center">
                    <div className="bg-emerald-500/20 rounded-full p-3 mb-3">
                        <AlertTriangle className="h-8 w-8 text-emerald-400" />
                    </div>

                    <h3 className="text-lg font-medium text-white mb-2">
                        Limited Data View
                    </h3>

                    <p className="text-white/80 mb-4">
                        The CBU data source only provides aggregated statistics
                        without detailed incident information.
                    </p>

                    <div className="bg-black/20 rounded-lg p-3 w-full mb-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-white/60 text-sm">
                                Current Data Source:
                            </span>
                            <span className="font-medium text-emerald-400 text-sm">
                                CBU
                            </span>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-white/60 text-sm">
                                Recommended:
                            </span>
                            <span className="font-medium text-blue-400 text-sm">
                                CBT
                            </span>
                        </div>
                    </div>

                    <p className="text-white/70 text-sm mb-5">
                        To view detailed incident reports, individual crime
                        records, and location-specific information, please
                        switch to the CBT data source.
                    </p>

                    <div className="flex items-center gap-2 text-sm">
                        <Button
                            variant="outline"
                            size="sm"
                            className="border-emerald-500/50 hover:bg-emerald-500/20 text-emerald-300"
                            onClick={handleSwitchDataSource}
                        >
                            <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                            Change Data Source
                        </Button>
                    </div>

                    <div className="w-full mt-6 pt-3 border-t border-emerald-500/20">
                        <p className="text-xs text-white/60">
                            The CBU (Crime By Unit) data provides insights at
                            the district level, while CBT (Crime By Type)
                            includes detailed incident-level information.
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (showDetailView && selectedIncidentDetail) {
        return (
            <IncidentDetailTab
                incident={selectedIncidentDetail}
                onBack={handleBackToList}
            />
        );
    }

    return (
        <>
            {/* Enhanced info card */}
            <Card className="bg-gradient-to-r from-sidebar-primary/30 to-sidebar-primary/20 border border-sidebar-primary/20 overflow-hidden">
                <CardContent className="p-4 text-sm relative">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-sidebar-primary/10 rounded-full -translate-y-1/2 translate-x-1/2">
                    </div>
                    <div className="absolute bottom-0 left-0 w-16 h-16 bg-sidebar-primary/10 rounded-full translate-y-1/2 -translate-x-1/2">
                    </div>

                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-sidebar-primary" />
                            <span className="font-medium">{formattedDate}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-sidebar-primary" />
                            <span>{formattedTime}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                        <MapPin className="h-4 w-4 text-sidebar-primary" />
                        <span className="text-sidebar-foreground/70">
                            {location}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 bg-sidebar-accent/30 p-2 rounded-lg">
                        <AlertTriangle className="h-5 w-5 text-emerald-400" />
                        <span>
                            <strong>{crimeStats.totalIncidents || 0}</strong>
                            {" "}
                            incidents reported
                            {selectedMonth !== "all"
                                ? ` in ${getMonthName(Number(selectedMonth))}`
                                : ` in ${selectedYear}`}
                        </span>
                    </div>
                </CardContent>
            </Card>

            {/* Enhanced stat cards */}
            <div className="grid grid-cols-2 gap-3">
                <SystemStatusCard
                    title="Total Cases"
                    status={`${crimeStats?.totalIncidents || 0}`}
                    statusIcon={
                        <AlertCircle className="h-4 w-4 text-green-400" />
                    }
                    statusColor="text-green-400"
                    updatedTime={getTimePeriodDisplay()}
                    bgColor="bg-gradient-to-br from-sidebar-accent/30 to-sidebar-accent/20"
                    borderColor="border-sidebar-border"
                />
                <SystemStatusCard
                    title="Recent Cases"
                    status={`${crimeStats?.recentIncidents?.length || 0}`}
                    statusIcon={<Clock className="h-4 w-4 text-emerald-400" />}
                    statusColor="text-emerald-400"
                    updatedTime="Last 30 days"
                    bgColor="bg-gradient-to-br from-sidebar-accent/30 to-sidebar-accent/20"
                    borderColor="border-sidebar-border"
                />
                <SystemStatusCard
                    title="Top Category"
                    status={topCategories.length > 0
                        ? topCategories[0].type
                        : "None"}
                    statusIcon={<Shield className="h-4 w-4 text-green-400" />}
                    statusColor="text-green-400"
                    bgColor="bg-gradient-to-br from-sidebar-accent/30 to-sidebar-accent/20"
                    borderColor="border-sidebar-border"
                />
                <SystemStatusCard
                    title="Districts"
                    status={`${Object.keys(crimeStats.districts).length}`}
                    statusIcon={<MapPin className="h-4 w-4 text-purple-400" />}
                    statusColor="text-purple-400"
                    updatedTime="Affected areas"
                    bgColor="bg-gradient-to-br from-sidebar-accent/30 to-sidebar-accent/20"
                    borderColor="border-sidebar-border"
                />
            </div>

            {/* Nested tabs for Recent and History */}
            <Tabs
                defaultValue="recent"
                value={activeIncidentTab}
                onValueChange={setActiveIncidentTab}
                className="w-full"
            >
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-sidebar-foreground/90 flex items-center gap-2 pl-1">
                        <AlertTriangle className="h-4 w-4 text-red-400" />
                        Incident Reports
                    </h3>
                    <TabsList className="bg-sidebar-accent p-0.5 rounded-md h-7">
                        <TabsTrigger
                            value="recent"
                            className="text-xs px-3 py-0.5 h-6 rounded-sm data-[state=active]:bg-sidebar-primary data-[state=active]:text-sidebar-primary-foreground"
                        >
                            Recent
                        </TabsTrigger>
                        <TabsTrigger
                            value="history"
                            className="text-xs px-3 py-0.5 h-6 rounded-sm data-[state=active]:bg-sidebar-primary data-[state=active]:text-sidebar-primary-foreground"
                        >
                            History
                        </TabsTrigger>
                    </TabsList>
                </div>

                {/* Recent Incidents Tab Content */}
                <TabsContent value="recent" className="m-0 p-0">
                    {!isCurrentYear
                        ? (
                            <Card className="bg-amber-900/20 border border-amber-500/30 mb-3">
                                <CardContent className="p-4 flex flex-col items-center text-center">
                                    <div className="bg-amber-500/20 rounded-full p-2 mb-2">
                                        <Calendar className="h-5 w-5 text-amber-400" />
                                    </div>
                                    <h4 className="text-sm font-medium text-amber-200">
                                        Year Selection Notice
                                    </h4>
                                    <p className="text-xs text-amber-100/80 mt-1 mb-2">
                                        Recent incidents are only available for
                                        the current year ({currentYear}).
                                    </p>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="text-xs border-amber-500/50 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300"
                                        onClick={handleSwicthToCurrentYear}

                                    >
                                        <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                                        Switch to {currentYear}
                                    </Button>
                                </CardContent>
                            </Card>
                        )
                        : formattedRecentIncidents.length === 0
                            ? (
                                <Card className="bg-white/5 border-0 text-white shadow-none">
                                    <CardContent className="p-4 text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <AlertCircle className="h-6 w-6 text-white/40" />
                                            <p className="text-sm text-white/70">
                                                {selectedCategory !== "all"
                                                    ? `No ${selectedCategory} incidents reported in the last 24 hours`
                                                    : "No incidents reported in the last 24 hours"}
                                            </p>
                                            <p className="text-xs text-white/50">
                                                The most recent user reports will
                                                appear here
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            )
                            : (
                                <div className="space-y-3">
                                    {formattedRecentIncidents.slice(0, 6).map((
                                        incident,
                                    ) => (
                                        <IncidentCardV2
                                            key={incident.id}
                                            incidentId={incident.id} // Pass incident ID for navigation
                                            title={`${incident.category || "Unknown"
                                                } in ${incident.address?.split(",")[0] ||
                                                "Unknown Location"
                                                }`}
                                            time={typeof incident.timestamp ===
                                                "string"
                                                ? getTimeAgo(incident.timestamp)
                                                : getTimeAgo(incident.timestamp)}
                                            location={incident.address?.split(",")
                                                .slice(1, 3).join(", ") ||
                                                "Unknown Location"}
                                            severity={incident.severity}
                                            onClick={() =>
                                                handleIncidentCardClick(incident as Incident)}
                                            status={incident.status}
                                            isUserReport={true}
                                        />
                                    ))}
                                </div>
                            )}
                </TabsContent>

                {/* History Incidents Tab Content */}
                <TabsContent value="history" className="m-0 p-0">
                    {filteredAvailableMonths.length === 0
                        ? (
                            <Card className="bg-white/5 border-0 text-white shadow-none">
                                <CardContent className="p-4 text-center">
                                    <div className="flex flex-col items-center gap-2">
                                        <FileText className="h-6 w-6 text-white/40" />
                                        <p className="text-sm text-white/70">
                                            {selectedCategory !== "all"
                                                ? `No ${selectedCategory} incidents found in ${selectedYear === "all"
                                                    ? "any period"
                                                    : selectedYear
                                                }`
                                                : `No incidents found in ${selectedYear === "all"
                                                    ? "any period"
                                                    : selectedYear
                                                }`}
                                        </p>
                                        <p className="text-xs text-white/50">
                                            Try adjusting your filters
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        )
                        : (
                            <div className="space-y-6">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-xs text-white/60">
                                        Showing incidents from{" "}
                                        {filteredAvailableMonths.length}{" "}
                                        {filteredAvailableMonths.length === 1
                                            ? "month"
                                            : "months"}
                                        {selectedYear !== "all"
                                            ? ` in ${selectedYear}`
                                            : ""}
                                    </span>
                                    <Badge
                                        variant="outline"
                                        className="h-5 text-[10px]"
                                    >
                                        {selectedCategory !== "all"
                                            ? selectedCategory
                                            : "All Categories"}
                                    </Badge>
                                </div>

                                {filteredAvailableMonths.map(
                                    (monthKey: string) => {
                                        const incidents = crimeStats
                                            .incidentsByMonthDetail[
                                            monthKey
                                        ] || [];
                                        const pageSize = 5;
                                        const currentPage =
                                            paginationState[monthKey] || 0;
                                        const totalPages = Math.ceil(
                                            incidents.length / pageSize,
                                        );
                                        const startIdx = currentPage * pageSize;
                                        const endIdx = startIdx + pageSize;
                                        const paginatedIncidents = incidents
                                            .slice(startIdx, endIdx);

                                        if (incidents.length === 0) {
                                            return null;
                                        }

                                        return (
                                            <div
                                                key={monthKey}
                                                className="mb-5"
                                            >
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-1.5">
                                                        <Calendar className="h-3.5 w-3.5 text-emerald-400" />
                                                        <h4 className="font-medium text-xs">
                                                            {formatMonthKey(
                                                                monthKey,
                                                            )}
                                                        </h4>
                                                    </div>
                                                    <Badge
                                                        variant="secondary"
                                                        className="h-5 text-[10px]"
                                                    >
                                                        {incidents.length}{" "}
                                                        incident{incidents
                                                            .length !== 1
                                                            ? "s"
                                                            : ""}
                                                    </Badge>
                                                </div>

                                                <div className="space-y-2">
                                                    {paginatedIncidents.map((
                                                        incident: Incident,
                                                    ) => (
                                                        <IncidentCardV2
                                                            key={incident.id}
                                                            incidentId={incident.id} // Pass incident ID for navigation
                                                            title={`${incident
                                                                .category ||
                                                                "Unknown"
                                                                } in ${incident.address
                                                                    ?.split(
                                                                        ",",
                                                                    )[0] ||
                                                                "Unknown Location"
                                                                }`}
                                                            time={incident
                                                                .timestamp
                                                                ? new Date(
                                                                    incident
                                                                        .timestamp,
                                                                ).toLocaleDateString()
                                                                : "Unknown date"}
                                                            location={incident
                                                                .address?.split(
                                                                    ",",
                                                                ).slice(1, 3)
                                                                .join(", ") ||
                                                                "Unknown Location"}
                                                            severity={getIncidentSeverity(
                                                                incident,
                                                            )}
                                                            onClick={() =>
                                                                handleIncidentCardClick(
                                                                    incident,
                                                                )}
                                                            showTimeAgo={false}
                                                        />
                                                    ))}
                                                </div>

                                                {totalPages > 1 && (
                                                    <div className="flex items-center justify-between mt-2">
                                                        <span className="text-xs text-white/50">
                                                            Page{" "}
                                                            {currentPage + 1} of
                                                            {" "}
                                                            {totalPages}
                                                        </span>
                                                        <div className="flex gap-1">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="h-7 px-2 py-1 text-[10px]"
                                                                disabled={currentPage ===
                                                                    0}
                                                                onClick={() =>
                                                                    handlePageChange(
                                                                        monthKey,
                                                                        "prev",
                                                                    )}
                                                            >
                                                                <ChevronLeft className="h-3 w-3 mr-1" />
                                                                Prev
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="h-7 px-2 py-1 text-[10px]"
                                                                disabled={currentPage >=
                                                                    totalPages -
                                                                    1}
                                                                onClick={() =>
                                                                    handlePageChange(
                                                                        monthKey,
                                                                        "next",
                                                                    )}
                                                            >
                                                                Next
                                                                <ChevronRight className="h-3 w-3 ml-1" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    },
                                )}
                            </div>
                        )}
                </TabsContent>
            </Tabs>
        </>
    );
}
