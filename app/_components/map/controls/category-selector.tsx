"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/_components/ui/select"
import { useEffect, useRef, useState } from "react"
import { Skeleton } from "../../ui/skeleton"

interface CategorySelectorProps {
    categories: string[]
    selectedCategory: string | "all"
    onCategoryChange: (category: string | "all") => void
    className?: string
    includeAllOption?: boolean
    isLoading?: boolean
}

export default function CategorySelector({
    categories,
    selectedCategory,
    onCategoryChange,
    className = "w-[150px]",
    includeAllOption = true,
    isLoading = false,
}: CategorySelectorProps) {
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
                    value={selectedCategory}
                    onValueChange={(value) => onCategoryChange(value)}
                >
                    <SelectTrigger className={className}>
                        <SelectValue placeholder="Crime Category" />
                    </SelectTrigger>
                    <SelectContent
                        container={containerRef.current || container || undefined}
                        style={{ zIndex: 2000 }}
                        className={`${className}`}
                    >
                        {includeAllOption && <SelectItem value="all">All Categories</SelectItem>}
                        {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                                {category}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            )}
        </div>
    )
}
