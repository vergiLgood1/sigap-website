"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/_components/ui/select"
import { useEffect, useRef, useState } from "react"
import { Skeleton } from "../../ui/skeleton"

// Month options
const months = [
    { value: "1", label: "January" },
    { value: "2", label: "February" },
    { value: "3", label: "March" },
    { value: "4", label: "April" },
    { value: "5", label: "May" },
    { value: "6", label: "June" },
    { value: "7", label: "July" },
    { value: "8", label: "August" },
    { value: "9", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
]

interface MonthSelectorProps {
    selectedMonth: number | "all"
    onMonthChange: (month: number | "all") => void
    className?: string
    includeAllOption?: boolean
    isLoading?: boolean
    disabled?: boolean
}

export default function MonthSelector({
    selectedMonth,
    onMonthChange,
    className = "w-[120px]",
    includeAllOption = true,
    isLoading = false,
    disabled = false,
}: MonthSelectorProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const [isClient, setIsClient] = useState(false)

    useEffect(() => {
        // This will ensure that the document is only used in the client-side context
        setIsClient(true)
    })

    const container = isClient ? document.getElementById("root") : null

    return (
        <div ref={containerRef} className="mapboxgl-month-selector">
            {isLoading ? (
                <div className="flex items-center justify-center h-8">
                    <Skeleton className="h-full w-full rounded-md" />
                </div>
            ) : (
                <Select
                    value={selectedMonth.toString()}
                    onValueChange={(value) => onMonthChange(value === "all" ? "all" : Number(value))}
                    disabled={disabled}
                >
                    <SelectTrigger className={`${className} ${disabled ? 'opacity-60 cursor-not-allowed bg-muted' : ''}`}>
                        <SelectValue placeholder="Month" />
                    </SelectTrigger>
                    <SelectContent
                        container={containerRef.current || container || undefined}
                        style={{ zIndex: 2000 }}
                        className={`${className}`}
                    >
                        {includeAllOption && <SelectItem value="all">All Months</SelectItem>}
                        {months.map((month) => (
                            <SelectItem key={month.value} value={month.value}>
                                {month.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            )}
        </div>
    )
}

// Export months constant so it can be reused elsewhere
export { months }
