"use client"

import { Button } from "@/app/_components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/app/_components/ui/tooltip"
import { IconAd2 } from "@tabler/icons-react"
import { Switch } from "@/app/_components/ui/switch"
import { Label } from "@/app/_components/ui/label"

interface ClusterToggleProps {
    showIncidents: boolean;
    onToggleIncidents: (show: boolean) => void;
    disabled?: boolean;
}

export default function ClusterToggle({
    showIncidents,
    onToggleIncidents,
    disabled = false
}: ClusterToggleProps) {
    return (
        <div className="z-10 bg-background rounded-md p-2 flex items-center space-x-2">
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div className="flex items-center space-x-2">
                            <Switch
                                id="show-incidents"
                                checked={showIncidents}
                                onCheckedChange={onToggleIncidents}
                                disabled={disabled}
                                className={disabled ? "opacity-50" : ""}
                            />
                            <Label htmlFor="show-incidents" className="text-xs text-white">
                                Show Incidents
                            </Label>
                        </div>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                        <p>
                            {disabled
                                ? "Individual incidents not available"
                                : showIncidents
                                    ? "Showing individual crime incidents"
                                    : "Showing district clusters only"}
                        </p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>
    )
}
