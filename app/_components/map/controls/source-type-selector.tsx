"use client"

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/app/_components/ui/select"
import { cn } from "@/app/_lib/utils"
import { useEffect, useRef, useState } from "react"
import { Skeleton } from "../../ui/skeleton"
import { ICrimeSourceTypes } from "@/app/_utils/types/map"

interface SourceTypeSelectorProps {
    selectedSourceType: ICrimeSourceTypes
    onSourceTypeChange: (sourceType: ICrimeSourceTypes) => void
    availableSourceTypes: string[]
    className?: string
    isLoading?: boolean
}

export default function SourceTypeSelector({
    selectedSourceType,
    onSourceTypeChange,
    availableSourceTypes,
    className,
    isLoading = false,
}: SourceTypeSelectorProps) {

    const containerRef = useRef<HTMLDivElement>(null)
    const [isClient, setIsClient] = useState(false)

    useEffect(() => {
        // This will ensure that the document is only used in the client-side context
        setIsClient(true)
    }, [])

    const container = isClient ? document.getElementById("root") : null

    return (
        <div ref={containerRef} className="mapboxgl-category-selector">
            {isLoading ? (
                <div className="flex items-center justify-center h-8">
                    <Skeleton className="h-full w-full rounded-md" />
                </div>
            ) : (
                <Select
                    value={selectedSourceType}
                        onValueChange={(value: ICrimeSourceTypes) => onSourceTypeChange(value)}
                >
                    <SelectTrigger className={className}>
                        <SelectValue placeholder="Crime Category" />
                    </SelectTrigger>
                    <SelectContent
                        container={containerRef.current || container || undefined}
                        style={{ zIndex: 2000 }}
                        className={`${className}`}
                    >
                            {availableSourceTypes.map((type) => (
                                <SelectItem key={type} value={type}>
                                    {type === "cbt" ? "Crime by type" : type === "cbu" ? "Crime by unit" : type}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            )}
        </div>
    )
}
