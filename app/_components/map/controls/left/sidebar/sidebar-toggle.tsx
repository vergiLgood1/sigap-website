"use client"

import React from "react"
import { Button } from "@/app/_components/ui/button"
import { cn } from "@/app/_lib/utils"
import { ChevronLeft, ChevronRight } from "lucide-react"

import type { ControlPosition } from "mapbox-gl"
import { Overlay } from "../../../overlay"

interface SidebarToggleProps {
    isCollapsed: boolean
    onClick: () => void
    className?: string
    position?: ControlPosition
}

export default function SidebarToggle({
    isCollapsed,
    onClick,
    className,
    position = "left"
}: SidebarToggleProps) {
    return (
        <Overlay position={position}>
            <Button
                variant="ghost"
                size="icon"
                onClick={onClick}
                className={cn(
                    "absolute z-10 shadow-md h-8 w-8 bg-background border"
                )}
            >
                {isCollapsed ? (
                    <ChevronRight className="h-4 w-4" />
                ) : (
                    <ChevronLeft className="h-4 w-4" />
                )}
            </Button>
        </Overlay>
    )
}
