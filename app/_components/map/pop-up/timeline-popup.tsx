"use client"

import { useState } from "react"
import { Popup } from "react-map-gl/mapbox"
import { X, ChevronLeft, ChevronRight, Filter } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../ui/card"
import { Button } from "../../ui/button"
import { Badge } from "../../ui/badge"

interface TimelinePopupProps {
    longitude: number
    latitude: number
    onClose: () => void
    district: {
        id: string
        name: string
        formattedTime: string
        timeDescription: string
        totalIncidents: number
        earliestTime: string
        latestTime: string
        mostFrequentHour: number
        categoryCounts: Record<string, number>
        timeOfDay: string
        incidents?: Array<{
            id: string
            title: string
            time: string
            category: string
        }>
        selectedFilters?: {
            year: string
            month: string
            category: string
            label: string
        }
        allTimeCount?: number
        useAllData?: boolean
    }
}

export default function TimelinePopup({
    longitude,
    latitude,
    onClose,
    district,
}: TimelinePopupProps) {
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 3

    // Get top 5 categories
    const topCategories = Object.entries(district.categoryCounts)
        .sort(([, countA], [, countB]) => countB - countA)
        .slice(0, 5)

    // Get time of day color
    const getTimeOfDayColor = (timeOfDay: string) => {
        switch (timeOfDay) {
            case "morning":
                return "bg-yellow-400 text-black"
            case "afternoon":
                return "bg-orange-500 text-white"
            case "evening":
                return "bg-indigo-600 text-white"
            case "night":
                return "bg-slate-800 text-white"
            default:
                return "bg-green-500 text-white"
        }
    }

    // Get text color for time of day
    const getTextColorForTimeOfDay = (timeOfDay: string) => {
        switch (timeOfDay) {
            case "morning":
                return "text-yellow-400"
            case "afternoon":
                return "text-orange-500"
            case "evening":
                return "text-indigo-600"
            case "night":
                return "text-slate-800"
            default:
                return "text-green-500"
        }
    }

    // Get paginated incidents
    const getPaginatedIncidents = () => {
        if (!district.incidents) return []

        const startIndex = (currentPage - 1) * itemsPerPage
        return district.incidents.slice(startIndex, startIndex + itemsPerPage)
    }

    // Calculate total pages
    const totalPages = district.incidents ? Math.ceil(district.incidents.length / itemsPerPage) : 0

    // Handle page navigation
    const goToNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(prev => prev + 1)
        }
    }

    const goToPrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(prev => prev - 1)
        }
    }

    // Get current incidents for display
    const currentIncidents = getPaginatedIncidents()

    // Extract filter info
    const filterLabel = district.selectedFilters?.label || "All data";
    const isFiltered = district.selectedFilters?.year !== "all" || district.selectedFilters?.month !== "all";
    const categoryFilter = district.selectedFilters?.category !== "all"
        ? district.selectedFilters?.category
        : null;

    // Get percentage of incidents in the time window compared to all time
    const percentageOfAll = district.allTimeCount && district.allTimeCount > 0 && district.totalIncidents !== district.allTimeCount
        ? Math.round((district.totalIncidents / district.allTimeCount) * 100)
        : null;

    return (
        <Popup
            longitude={longitude}
            latitude={latitude}
            anchor="bottom"
            closeOnClick={false}
            onClose={onClose}
            className="timeline-popup z-10"
            maxWidth="300px"
        >
            <div className="relative">
                <Card className="border-0 shadow-none">
                    <CardHeader className="p-3 pb-2">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-base">{district.name}</CardTitle>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={onClose}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                        <CardDescription className="text-xs flex items-center gap-1">
                            <span>Average incident time analysis</span>
                            {isFiltered && (
                                <Badge variant="outline" className="h-4 text-[10px] gap-0.5 px-1 py-0 flex items-center">
                                    <Filter className="h-2.5 w-2.5" />
                                    {filterLabel}
                                </Badge>
                            )}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-3 pt-0">
                        <div className="mb-3">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="text-xl font-bold font-mono">{district.formattedTime}</div>
                                <Badge variant="outline" className={`${getTimeOfDayColor(district.timeOfDay)}`}>
                                    {district.timeDescription}
                                </Badge>
                            </div>
                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                                <span>Based on {district.totalIncidents} incidents</span>
                                {percentageOfAll && (
                                    <span className="text-[10px]">({percentageOfAll}% of all time)</span>
                                )}
                                {categoryFilter && (
                                    <Badge variant="secondary" className="h-4 text-[10px] px-1 py-0">
                                        {categoryFilter}
                                    </Badge>
                                )}
                            </div>
                        </div>

                        <div className="text-sm space-y-1 mb-3">
                            <div className="flex justify-between">
                                <span>Earliest incident:</span>
                                <span className="font-medium">{district.earliestTime}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Latest incident:</span>
                                <span className="font-medium">{district.latestTime}</span>
                            </div>
                        </div>

                        <div className="border-t border-border pt-2 mb-3">
                            <div className={`${getTextColorForTimeOfDay(district.timeOfDay)} text-sm font-medium mb-1`}>Top incident types:</div>
                            <div className="space-y-1">
                                {topCategories.map(([category, count]) => (
                                    <div key={category} className="flex justify-between">
                                        <span className="text-xs truncate mr-2">{category}</span>
                                        <span className="text-xs font-semibold">{count}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {district.incidents && district.incidents.length > 0 && (
                            <div className="border-t border-border pt-2">
                                <div className="flex justify-between items-center mb-2">
                                    <div className={`${getTextColorForTimeOfDay(district.timeOfDay)} text-sm font-medium`}>Incidents Timeline:</div>
                                    <div className="text-xs text-muted-foreground">
                                        {currentPage} of {totalPages}
                                    </div>
                                </div>

                                <div className="space-y-3 min-h-[120px]">
                                    {currentIncidents.map((incident) => (
                                        <div key={incident.id} className="last:mb-0">
                                            <div className="text-xs font-semibold mb-0.5">
                                                {incident.category}
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs text-muted-foreground line-clamp-1">{incident.title}</span>
                                                <Badge variant="outline" className={`${getTextColorForTimeOfDay(district.timeOfDay)} text-[10px] h-5 ml-1 shrink-0`} >
                                                    {incident.time}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Pagination Controls */}
                                <div className="flex justify-between items-center mt-4">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className={`${getTimeOfDayColor(district.timeOfDay)} h-7 px-2`}
                                        onClick={goToPrevPage}
                                        disabled={currentPage === 1}
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className={`${getTimeOfDayColor(district.timeOfDay)} h-7 px-2`}
                                        onClick={goToNextPage}
                                        disabled={currentPage === totalPages}
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </Popup>
    )
}
