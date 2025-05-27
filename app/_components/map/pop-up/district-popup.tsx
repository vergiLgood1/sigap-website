"use client"

import { useState, useMemo, useEffect } from "react"
import { Popup } from "react-map-gl/mapbox"
import { Badge } from "@/app/_components/ui/badge"
import { Card } from "@/app/_components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/_components/ui/tabs"
import { Button } from "@/app/_components/ui/button"
import { getMonthName } from "@/app/_utils/common"
import { BarChart, Users, Home, AlertTriangle, ChevronRight, Building, Calendar, X } from 'lucide-react'
import { IDistrictFeature } from "@/app/_utils/types/map"

// Helper function to format numbers
function formatNumber(num?: number): string {
    if (num === undefined || num === null) return "N/A"

    if (num >= 1_000_000) {
        return (num / 1_000_000).toFixed(1) + "M"
    }

    if (num >= 1_000) {
        return (num / 1_000).toFixed(1) + "K"
    }

    return num.toLocaleString()
}

interface DistrictPopupProps {
    longitude: number
    latitude: number
    onClose: () => void
    district: IDistrictFeature
    year?: string
    month?: string
    filterCategory?: string | "all"
}

export default function DistrictPopup({
    longitude,
    latitude,
    onClose,
    district,
    year,
    month,
    filterCategory = "all",
}: DistrictPopupProps) {
    const [activeTab, setActiveTab] = useState("overview")

    // Add debug log when the component is rendered
    // useEffect(() => {
    //     console.log("DistrictPopup mounted:", {
    //         district: district.name,
    //         coords: [longitude, latitude],
    //         year,
    //         month
    //     });
    // }, [district, longitude, latitude, year, month]);

    // Extract all crime incidents from the district data and apply filtering if needed
    const allCrimeIncidents = useMemo(() => {
        // Check if there are crime incidents in the district object
        if (!Array.isArray(district.crime_incidents)) {
            console.warn("No crime incidents array found in district data")
            return []
        }

        // Return all incidents if filterCategory is 'all'
        if (filterCategory === "all") {
            return district.crime_incidents
        }

        // Otherwise, filter by category
        return district.crime_incidents.filter((incident) => incident.category === filterCategory)
    }, [district, filterCategory])

    const getCrimeRateBadge = (level?: string) => {
        switch (level) {
            case "low":
                return <Badge className="bg-emerald-600 text-white hover:bg-emerald-600">Low</Badge>
            case "medium":
                return <Badge className="bg-amber-500 text-white hover:bg-amber-500">Medium</Badge>
            case "high":
                return <Badge className="bg-rose-600 text-white hover:bg-rose-600">High</Badge>
            case "critical":
                return <Badge className="bg-red-700 text-white hover:bg-red-700">Critical</Badge>
            default:
                return <Badge className="bg-slate-600">Unknown</Badge>
        }
    }

    // Format a time period string from year and month
    const getTimePeriod = () => {
        if (year && month && month !== "all") {
            return `${getMonthName(Number(month))} ${year}`
        }
        return year || "All time"
    }


    return (
        <Popup
            longitude={longitude}
            latitude={latitude}
            closeButton={false} // Hide default close button
            closeOnClick={false}
            onClose={onClose}
            anchor="top"
            maxWidth="300px"
            className="district-popup z-50"
        >
            <div className="relative">
                <Card className="bg-background p-0 w-full max-w-[300px] shadow-xl border-0 overflow-hidden">
                    <div className="bg-tertiary text-white p-3 relative">
                        {/* Custom close button */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-2 right-2 h-5 w-5 rounded-full bg-white/20 hover:bg-white/30 text-white"
                            onClick={onClose}
                        >
                            <X className="h-3 w-3" />
                            <span className="sr-only">Close</span>
                        </Button>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Building className="h-4 w-4" />
                                <h3 className="font-bold text-base">{district.name}</h3>
                            </div>
                            {getCrimeRateBadge(district.level)}
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-1 p-2 bg-background">
                        <div className="flex flex-col items-center justify-center p-1.5 bg-accent rounded-lg shadow-sm">
                            <AlertTriangle className="h-3.5 w-3.5 text-amber-500 mb-0.5" />
                            <span className="text-base font-bold">{formatNumber(district.number_of_crime || 0)}</span>
                            <span className="text-[10px] text-muted-foreground">Incidents</span>
                        </div>

                        <div className="flex flex-col items-center justify-center p-1.5 bg-accent rounded-lg shadow-sm">
                            <Users className="h-3.5 w-3.5 text-blue-500 mb-0.5" />
                            <span className="text-base font-bold">{formatNumber(district.demographics?.population || 0)}</span>
                            <span className="text-[10px] text-muted-foreground">Population</span>
                        </div>

                        <div className="flex flex-col items-center justify-center p-1.5 bg-accent rounded-lg shadow-sm">
                            <Home className="h-3.5 w-3.5 text-green-500 mb-0.5" />
                            <span className="text-base font-bold">{formatNumber(district.geographics?.land_area || 0)}</span>
                            <span className="text-[10px] text-muted-foreground">km²</span>
                        </div>
                    </div>

                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="w-full grid grid-cols-3 h-10 rounded-none bg-background border-b">
                            <TabsTrigger
                                value="overview"
                                className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary-foreground dark:data-[state=active]:text-primary-foreground data-[state=active]:shadow-none font-medium text-xs"
                            >
                                Overview
                            </TabsTrigger>
                            <TabsTrigger
                                value="demographics"
                                className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary-foreground dark:data-[state=active]:text-primary-foreground data-[state=active]:shadow-none font-medium text-xs"
                            >
                                Demographics
                            </TabsTrigger>
                            <TabsTrigger
                                value="crime_incidents"
                                className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary-foreground dark:data-[state=active]:text-primary-foreground data-[state=active]:shadow-none font-medium text-xs"
                            >
                                Incidents
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="overview" className="mt-0 p-4">
                            <div className="text-sm space-y-3">
                                <div className="flex items-start gap-3">
                                    <div className="bg-amber-100 dark:bg-amber-950/30 p-2 rounded-full">
                                        <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-base text-slate-800 dark:text-slate-200">Crime Level</p>
                                        <p className="text-muted-foreground text-xs">
                                            This area has a {district.level || "unknown"} level of crime based on incident reports.
                                        </p>
                                    </div>
                                </div>

                                {district.geographics && district.geographics.land_area && (
                                    <div className="flex items-start gap-3">
                                        <div className="bg-emerald-100 dark:bg-emerald-950/30 p-2 rounded-full">
                                            <Home className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-base text-slate-800 dark:text-slate-200">Geography</p>
                                            <p className="text-muted-foreground text-xs">
                                                Land area: {formatNumber(district.geographics.land_area)} km²
                                            </p>
                                            {district.geographics.address && (
                                                <p className="text-muted-foreground text-xs">Address: {district.geographics.address}</p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-start gap-3">
                                    <div className="bg-blue-100 dark:bg-blue-950/30 p-2 rounded-full">
                                        <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-base text-slate-800 dark:text-slate-200">Time Period</p>
                                        <p className="text-muted-foreground text-xs">
                                            Data shown for {getTimePeriod()}
                                            {filterCategory !== "all" ? ` (${filterCategory} category)` : ""}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="demographics" className="mt-0 p-4">
                            {district.demographics ? (
                                <div className="text-sm space-y-3">
                                    <div className="flex items-start gap-3">
                                        <div className="bg-blue-100 dark:bg-blue-950/30 p-2 rounded-full">
                                            <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-base text-slate-800 dark:text-slate-200">Population</p>
                                            <p className="text-muted-foreground text-xs">
                                                Total: {formatNumber(district.demographics.population || 0)}
                                            </p>
                                            <p className="text-muted-foreground text-xs">
                                                Density: {formatNumber(district.demographics.population_density || 0)} people/km²
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <div className="bg-red-100 dark:bg-red-950/30 p-2 rounded-full">
                                            <BarChart className="w-5 h-5 text-red-600 dark:text-red-400" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-base text-slate-800 dark:text-slate-200">Unemployment</p>
                                            <p className="text-muted-foreground text-xs">
                                                {formatNumber(district.demographics.number_of_unemployed || 0)} unemployed people
                                            </p>
                                            {district.demographics.population && district.demographics.number_of_unemployed && (
                                                <p className="text-muted-foreground text-xs">
                                                    Rate:{" "}
                                                    {(
                                                        (district.demographics.number_of_unemployed / district.demographics.population) *
                                                        100
                                                    ).toFixed(1)}
                                                    %
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <div className="bg-purple-100 dark:bg-purple-950/30 p-2 rounded-full">
                                            <AlertTriangle className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-base text-slate-800 dark:text-slate-200">Crime Rate</p>
                                            {district.number_of_crime && district.demographics.population ? (
                                                <p className="text-muted-foreground text-xs">
                                                    {((district.number_of_crime / district.demographics.population) * 10000).toFixed(2)} crime
                                                    incidents per 10,000 people
                                                </p>
                                            ) : (
                                                <p className="text-muted-foreground text-xs">No data available</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center p-4 text-sm text-muted-foreground">
                                    <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                    <p>No demographic data available for this district.</p>
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="crime_incidents" className="mt-0 max-h-[250px] overflow-y-auto">
                            {allCrimeIncidents && allCrimeIncidents.length > 0 ? (
                                <div className="divide-y divide-border">
                                    {allCrimeIncidents.map((incident, index) => (
                                        <div
                                            key={incident.id || index}
                                            className="p-3 text-xs hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors"
                                        >
                                            <div className="flex justify-between items-center">
                                                <span className="font-medium flex items-center gap-1">
                                                    <AlertTriangle className="w-3 h-3 text-amber-500" />
                                                    {incident.category || incident.type || "Unknown"}
                                                </span>
                                                <Badge variant="outline" className="text-[10px] h-5">
                                                    {incident.status || "unknown"}
                                                </Badge>
                                            </div>
                                            <p className="text-muted-foreground mt-1 truncate">{incident.description || "No description"}</p>
                                            <div className="flex justify-between items-center mt-1">
                                                <p className="text-muted-foreground">
                                                    {incident.timestamp ? new Date(incident.timestamp).toLocaleString() : "Unknown date"}
                                                </p>
                                                <ChevronRight className="w-3 h-3 text-muted-foreground" />
                                            </div>
                                        </div>
                                    ))}

                                    {district.number_of_crime > allCrimeIncidents.length && (
                                        <div className="p-3 text-xs text-center text-muted-foreground bg-muted/50">
                                            <p>
                                                Showing {allCrimeIncidents.length} of {district.number_of_crime} total incidents
                                                {filterCategory !== "all" ? ` for ${filterCategory} category` : ""}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center p-4 text-sm text-muted-foreground">
                                    <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                    <p>
                                        No crime incidents available to display{filterCategory !== "all" ? ` for ${filterCategory}` : ""}.
                                    </p>
                                    <p className="text-xs mt-2">Total reported incidents: {district.number_of_crime || 0}</p>
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </Card>
            </div>
        </Popup>
    )
}
