"use client"

import { useState, useEffect } from 'react';
import { Button } from '@/app/_components/ui/button';
import {
    AlertTriangle,
    Bell,
    ShieldAlert,
    Radio,
    RadioTower,
    Shield
} from 'lucide-react';
import { cn } from '@/app/_lib/utils';
import { Badge } from '@/app/_components/ui/badge';
import { IIncidentLog } from '@/app/_utils/types/ews';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/app/_components/ui/tooltip";

interface PanicButtonDemoProps {
    onTriggerAlert: (priority: 'high' | 'medium' | 'low') => void;
    onResolveAllAlerts: () => void;
    activeIncidents: IIncidentLog[];
    className?: string;
    onPanicTriggered?: () => void; // New callback for notifying parent about panic trigger
}

export default function PanicButtonDemo({
    onTriggerAlert,
    onResolveAllAlerts,
    activeIncidents,
    className,
    onPanicTriggered
}: PanicButtonDemoProps) {
    const [isTriggering, setIsTriggering] = useState(false);
    const [activeButton, setActiveButton] = useState<string | null>(null);

    const handleTriggerPanic = (priority: 'high' | 'medium' | 'low') => {
        setIsTriggering(true);
        setActiveButton(priority);
        onTriggerAlert(priority);

        // Notify parent component that panic was triggered
        if (onPanicTriggered) {
            onPanicTriggered();
        }

        // Reset animation
        setTimeout(() => {
            setIsTriggering(false);
            setActiveButton(null);
        }, 1000);
    };

    return (
        <div className={cn("border border-muted bg-background p-1 rounded-lg shadow-xl", className)}>
            <TooltipProvider>
                <div className="flex items-center space-x-1">
                    {/* High Priority Alert Button */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                size="medium"
                                className={cn(
                                    "h-8 w-8 rounded-md",
                                    activeButton === 'high'
                                        ? "bg-red-600 text-white"
                                        : "bg-background text-red-600 hover:bg-red-600 hover:text-white",
                                    isTriggering && activeButton === 'high' && "animate-pulse"
                                )}
                                onClick={() => handleTriggerPanic('high')}
                            >
                                <AlertTriangle className="h-5 w-5" />
                                <span className="sr-only">High Priority Alert</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">
                            <p>Send High Priority Alert</p>
                        </TooltipContent>
                    </Tooltip>

                    {/* Medium Priority Alert Button */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                size="medium"
                                className={cn(
                                    "h-8 w-8 rounded-md",
                                    activeButton === 'medium'
                                        ? "bg-amber-600 text-white"
                                        : "bg-background text-amber-600 hover:bg-amber-600 hover:text-white",
                                    isTriggering && activeButton === 'medium' && "animate-pulse"
                                )}
                                onClick={() => handleTriggerPanic('medium')}
                            >
                                <Bell className="h-5 w-5" />
                                <span className="sr-only">Medium Priority Alert</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">
                            <p>Send Medium Priority Alert</p>
                        </TooltipContent>
                    </Tooltip>

                    {/* Low Priority Alert Button */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                size="medium"
                                className={cn(
                                    "h-8 w-8 rounded-md",
                                    activeButton === 'low'
                                        ? "bg-blue-600 text-white"
                                        : "bg-background text-blue-600 hover:bg-blue-600 hover:text-white",
                                    isTriggering && activeButton === 'low' && "animate-pulse"
                                )}
                                onClick={() => handleTriggerPanic('low')}
                            >
                                <RadioTower className="h-5 w-5" />
                                <span className="sr-only">Low Priority Alert</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">
                            <p>Send Low Priority Alert</p>
                        </TooltipContent>
                    </Tooltip>

                    {/* Resolve All Alerts Button (only shown when there are active incidents) */}
                    {activeIncidents.length > 0 && (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    size="medium"
                                    className="h-8 w-8 rounded-md bg-background text-green-600 hover:bg-green-600 hover:text-white relative"
                                    onClick={onResolveAllAlerts}
                                >
                                    <Shield className="h-5 w-5" />
                                    <span className="sr-only">Resolve All Alerts</span>

                                    {/* Badge showing active incident count */}
                                    <Badge
                                        variant="destructive"
                                        className="absolute -top-2 -right-2 h-4 w-4 flex items-center justify-center p-0 text-[10px]"
                                    >
                                        {activeIncidents.length}
                                    </Badge>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom">
                                <p>Resolve All Active Alerts ({activeIncidents.length})</p>
                            </TooltipContent>
                        </Tooltip>
                    )}
                </div>
            </TooltipProvider>
        </div>
    );
}
