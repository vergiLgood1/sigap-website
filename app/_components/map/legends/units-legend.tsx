"use client"

import { useState, useMemo } from "react"
import { Card } from "@/app/_components/ui/card"
import { Button } from "@/app/_components/ui/button"
import { ChevronDown, ChevronUp, X } from "lucide-react"
import { getCategoryColor } from "@/app/_utils/colors"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/app/_components/ui/tooltip"
import { ScrollArea } from "@/app/_components/ui/scroll-area"

interface UnitsLegendProps {
    categories: string[]
    onClose?: () => void
    position?: "top-right" | "top-left" | "bottom-right" | "bottom-left"
}

export default function UnitsLegend({
    categories,
    onClose,
    position = "bottom-right"
}: UnitsLegendProps) {
    const [collapsed, setCollapsed] = useState(false)

    const positionClasses = {
        "top-right": "top-4 right-4",
        "top-left": "top-4 left-4",
        "bottom-right": "bottom-4 right-4",
        "bottom-left": "bottom-4 left-4",
    }

    const sortedCategories = useMemo(() => {
        return [...categories].sort((a, b) => a.localeCompare(b))
    }, [categories])

    if (categories.length === 0) return null

    return (
        <Card className={`absolute z-10 bg-black/80 border-gray-700 shadow-lg overflow-hidden w-64 ${positionClasses[position]}`}>
            <div className="p-2 border-b border-gray-700 flex items-center justify-between">
                <h3 className="text-sm font-medium text-white">Crime Categories</h3>
                <div className="flex gap-1">
                    <Button
                        variant="ghost"
                        size="xs"
                        className="h-6 w-6 p-0 text-white hover:bg-white/20"
                        onClick={() => setCollapsed(!collapsed)}
                    >
                        {collapsed ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        <span className="sr-only">{collapsed ? "Expand" : "Collapse"}</span>
                    </Button>

                    {onClose && (
                        <Button
                            variant="ghost"
                            size="xs"
                            className="h-6 w-6 p-0 text-white hover:bg-white/20"
                            onClick={onClose}
                        >
                            <X size={14} />
                            <span className="sr-only">Close</span>
                        </Button>
                    )}
                </div>
            </div>

            {!collapsed && (
                <ScrollArea className="h-64">
                    <div className="p-2 grid grid-cols-1 gap-1">
                        <TooltipProvider>
                            {sortedCategories.map((category) => (
                                <Tooltip key={category}>
                                    <TooltipTrigger asChild>
                                        <div className="flex items-center gap-2 text-xs text-white p-1 rounded hover:bg-white/10">
                                            <div
                                                className="w-4 h-2 flex-shrink-0 rounded-sm"
                                                style={{ backgroundColor: getCategoryColor(category) }}
                                            />
                                            <span className="truncate">{category}</span>
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent side="left">
                                        <p>{category}</p>
                                    </TooltipContent>
                                </Tooltip>
                            ))}
                        </TooltipProvider>
                    </div>
                </ScrollArea>
            )}
        </Card>
    )
}
