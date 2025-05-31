"use client"

import { Button } from "@/app/_components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/app/_components/ui/tooltip"
import { IconRefresh, IconBrain } from "@tabler/icons-react"
import { useState, useEffect } from "react"
import type { ITooltipsControl } from "./tooltips"
import KMeansDialog from "../../pop-up/kmeans-dialog"
import { useGetKMeansClustering } from "@/app/(pages)/(admin)/dashboard/crime-management/crime-overview/_queries/queries"
import { useRealtimeKMeans } from "@/app/_hooks/use-realtime-kmeans"

const kmeansTooltips = [
    {
        id: "incremental" as ITooltipsControl,
        icon: <IconRefresh size={20} />,
        label: "Incremental K-Means",
    },
    {
        id: "batch" as ITooltipsControl,
        icon: <IconBrain size={20} />,
        label: "Full K-Means Recomputation",
    },
]

interface KMeansTooltipsProps {
    activeControl?: string
    onControlChange?: (controlId: ITooltipsControl) => void
    sourceType?: string
    selectedYear: number
    selectedMonth: number | "all"
}

export default function KMeansTooltips({
    activeControl,
    onControlChange,
    sourceType = "cbt",
    selectedYear,
    selectedMonth,
}: KMeansTooltipsProps) {
    const [dialogOpen, setDialogOpen] = useState(false)
    const [kmeansMode, setKmeansMode] = useState<"incremental" | "batch">("incremental")
    const [isProcessing, setIsProcessing] = useState(false)

    const currentYear = new Date().getFullYear()
    const isCurrentYear = selectedYear === currentYear

    // Get K-means operations when needed (don't auto-fetch)
    const {
        refetch: performKMeans,
        isLoading: isKmeansLoading,
        isSuccess: isKmeansSuccess
    } = useGetKMeansClustering(
        selectedYear,
        selectedMonth === 'all' ? undefined : selectedMonth,
        kmeansMode,
        { enabled: false }
    )

    // Add real-time K-means hook
    const {
        isConnected: isRealtimeConnected,
        isRealTimeEnabled,
        lastUpdate,
        refreshClusters
    } = useRealtimeKMeans({
        enabled: sourceType === "cbt" && isCurrentYear,
        year: selectedYear,
        onClusterUpdate: (clusters) => {
            console.log("Real-time cluster update received:", clusters.length, "clusters");
            // Trigger map layer refresh if needed
            if (onControlChange) {
                onControlChange("refresh");
            }
        },
        onError: (error) => {
            console.error("Real-time K-means error:", error);
        }
    });

    // Reset dialog state when activeControl changes
    useEffect(() => {
        if (!activeControl?.includes('incremental') && !activeControl?.includes('batch')) {
            setDialogOpen(false)
        }
    }, [activeControl])

    // Handle K-means completion
    useEffect(() => {
        if (isProcessing && isKmeansSuccess) {
            setIsProcessing(false)
            setDialogOpen(false)
        }
    }, [isKmeansSuccess, isProcessing])

    const handleControlClick = (controlId: ITooltipsControl) => {
        // If control is disabled, don't do anything
        if (isDisabled(controlId)) {
            return
        }

        // For kmeans buttons, show dialog first
        if (controlId === "incremental" || controlId === "batch") {
            setKmeansMode(controlId)
            setDialogOpen(true)
            return
        }
    }

    const handleKmeansConfirm = async () => {
        setIsProcessing(true)

        try {
            // Perform K-means clustering
            await performKMeans()

            // Refresh real-time data
            if (isRealTimeEnabled) {
                await refreshClusters()
            }

            // Trigger refetch of K-means data without changing layer
            if (onControlChange) {
                // Trigger a temporary state change to force refetch
                onControlChange("refresh")
                // Reset back to previous state immediately
                setTimeout(() => {
                    if (onControlChange && activeControl) {
                        onControlChange(activeControl as ITooltipsControl)
                    }
                }, 100)
            }
        } catch (error) {
            console.error("K-means operation failed:", error)
            setIsProcessing(false)
        }
    }

    // Determine which controls should be disabled based on source type and year
    const isDisabled = (controlId: ITooltipsControl) => {
        if (sourceType !== "cbt") return true

        // Incremental K-means is only available for the current year
        if (controlId === "incremental" && !isCurrentYear) return true

        return false
    }

    return (
        <>
            <div className="z-10 bg-background rounded-md p-1 flex items-center space-x-1">
                {/* Real-time indicator */}
                {/* {isRealTimeEnabled && (
                    <div className={`h-2 w-2 rounded-full ${isRealtimeConnected ? 'bg-green-500' : 'bg-red-500'
                        } animate-pulse`}
                        title={isRealtimeConnected ? 'Real-time connected' : 'Real-time disconnected'}
                    />
                )} */}

                <TooltipProvider>
                    {kmeansTooltips.map((control) => {
                        const isButtonDisabled = isDisabled(control.id)
                        let tooltipText = control.label

                        if (isButtonDisabled) {
                            tooltipText = control.id === "incremental" && !isCurrentYear
                                ? "Incremental updates only available for current year data"
                                : "Not available for this data type"
                        } else if (control.id === "incremental" && isRealTimeEnabled) {
                            tooltipText += " (Real-time enabled)"
                        }

                        return (
                            <Tooltip key={control.id}>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant={activeControl === control.id ? "default" : "ghost"}
                                        size="medium"
                                        className={`h-8 w-8 rounded-md ${isButtonDisabled
                                            ? "opacity-40 cursor-not-allowed bg-gray-700/30 text-gray-400 border-gray-600 hover:bg-gray-700/30 hover:text-gray-400"
                                            : "text-white hover:bg-emerald-500/90 hover:text-background"
                                            }`}
                                        onClick={() => handleControlClick(control.id)}
                                        disabled={isButtonDisabled}
                                        aria-disabled={isButtonDisabled}
                                    >
                                        {control.icon}
                                        <span className="sr-only">{control.label}</span>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent side="bottom">
                                    <p>{tooltipText}</p>
                                    {lastUpdate && isRealTimeEnabled && (
                                        <p className="text-xs text-gray-400">
                                            Last update: {lastUpdate.toLocaleTimeString()}
                                        </p>
                                    )}
                                </TooltipContent>
                            </Tooltip>
                        )
                    })}
                </TooltipProvider>
            </div>

            {/* Portal the dialog to ensure it appears above the map */}
            <div className="portal-root">
                <KMeansDialog
                    open={dialogOpen}
                    onOpenChange={setDialogOpen}
                    onConfirm={handleKmeansConfirm}
                    mode={kmeansMode}
                    isLoading={isProcessing}
                />
            </div>
        </>
    )
}