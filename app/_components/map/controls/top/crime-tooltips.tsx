"use client"

import { Button } from "@/app/_components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/app/_components/ui/tooltip"
import { AlertTriangle, Building, Car, Thermometer, History } from "lucide-react"
import type { ITooltipsControl } from "./tooltips"
import { IconChartBubble, IconClock, IconRefresh, IconBrain } from "@tabler/icons-react"
import { useState } from "react"
import KMeansDialog from "../../pop-up/kmeans-dialog"

// Update the tooltip for "incidents" to "All Incidents"
const crimeTooltips = [
    { id: "incidents" as ITooltipsControl, icon: <AlertTriangle size={20} />, label: "All Incidents" },
    { id: "heatmap" as ITooltipsControl, icon: <Thermometer size={20} />, label: "Density Heatmap" },
    { id: "units" as ITooltipsControl, icon: <Building size={20} />, label: "Police Units" },
    { id: "clusters" as ITooltipsControl, icon: <IconChartBubble size={20} />, label: "Clustered Incidents" },
    { id: "patrol" as ITooltipsControl, icon: <Car size={20} />, label: "Patrol Areas" },
    { id: "timeline" as ITooltipsControl, icon: <IconClock size={20} />, label: "Time Analysis" },
]


interface CrimeTooltipsProps {
    activeControl?: string
    onControlChange?: (controlId: ITooltipsControl) => void
    sourceType?: string
}

export default function CrimeTooltips({ activeControl, onControlChange, sourceType = "cbt" }: CrimeTooltipsProps) {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [kmeansMode, setKmeansMode] = useState<"incremental" | "batch">("incremental");

    const handleControlClick = (controlId: ITooltipsControl) => {
        // If control is disabled, don't do anything
        if (isDisabled(controlId)) {
            return
        }

        // For kmeans buttons, show dialog first
        if (controlId === "incremental" || controlId === "batch") {
            setKmeansMode(controlId);
            setDialogOpen(true);
            return;
        }

        // For other controls, change immediately
        if (onControlChange) {
            onControlChange(controlId)
            console.log("Control changed to:", controlId)
        }
    }


    // Determine which controls should be disabled based on source type
    const isDisabled = (controlId: ITooltipsControl) => {
        if (sourceType === "cbu") {
            return !["clusters", "incremental", "batch"].includes(controlId);
        }
        return false;
    }

    return (
        <>
            <div className="z-10 bg-background rounded-md p-1 flex items-center space-x-1">
                <TooltipProvider>
                    {crimeTooltips.map((control) => {
                        const isButtonDisabled = isDisabled(control.id)

                        return (
                            <Tooltip key={control.id}>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant={activeControl === control.id ? "default" : "ghost"}
                                        size="medium"
                                        className={`h-8 w-8 rounded-md ${isButtonDisabled
                                            ? "opacity-40 cursor-not-allowed bg-gray-700/30 text-gray-400 border-gray-600 hover:bg-gray-700/30 hover:text-gray-400"
                                            : activeControl === control.id
                                                ? "bg-emerald-500 text-black hover:bg-emerald-500/90"
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
                                    <p>{isButtonDisabled ? "Not available for CBU data" : control.label}</p>
                                </TooltipContent>
                            </Tooltip>
                        )
                    })}


                </TooltipProvider>
            </div>


        </>
    )
}
