"use client"

import { Button } from "@/app/_components/ui/button"
import { FilterX } from "lucide-react"
import YearSelector from "./year-selector"
import MonthSelector from "./month-selector"
import CategorySelector from "./category-selector"
import { Skeleton } from "../../ui/skeleton"

interface MapSelectorsProps {
    availableYears: (number | null)[]
    selectedYear: number | "all"
    setSelectedYear: (year: number | "all") => void
    selectedMonth: number | "all"
    setSelectedMonth: (month: number | "all") => void
    selectedCategory: string | "all"
    setSelectedCategory: (category: string | "all") => void
    categories: string[]
    isYearsLoading?: boolean
    isCategoryLoading?: boolean
    className?: string
    compact?: boolean
    disableYearMonth?: boolean
}

export default function MapSelectors({
    availableYears,
    selectedYear,
    setSelectedYear,
    selectedMonth,
    setSelectedMonth,
    selectedCategory,
    setSelectedCategory,
    categories,
    isYearsLoading = false,
    isCategoryLoading = false,
    className = "",
    compact = false,
    disableYearMonth = false,
}: MapSelectorsProps) {
    const resetFilters = () => {
        setSelectedYear(2024)
        setSelectedMonth("all")
        setSelectedCategory("all")
    }

    return (
        <div className={`flex items-center gap-2 ${className} ${compact ? "flex-col" : "flex-row"}`}>
            <YearSelector
                availableYears={availableYears}
                selectedYear={selectedYear}
                onYearChange={setSelectedYear}
                isLoading={isYearsLoading}
                className={compact ? "w-full" : ""}
                disabled={disableYearMonth}
            />

            <MonthSelector
                selectedMonth={selectedMonth}
                onMonthChange={setSelectedMonth}
                isLoading={isYearsLoading}
                className={compact ? "w-full" : ""}
                disabled={disableYearMonth}
            />

            <CategorySelector
                categories={categories}
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
                isLoading={isCategoryLoading}
                className={compact ? "w-full" : ""}
            />

            {isYearsLoading ? (
                <div className="flex items-center justify-center h-8 w-full">
                    <Skeleton className="h-full w-full rounded-md" />
                </div>
            ) : (
                <Button
                    variant={compact ? "secondary" : "ghost"}
                    size={compact ? "sm" : "default"}
                    onClick={resetFilters}
                    disabled={selectedYear === 2024 && selectedMonth === "all" && selectedCategory === "all"}
                    className={compact ? "w-full" : ""}
                >
                    <FilterX className="h-4 w-4 mr-1" />
                    Reset
                </Button>
            )}
        </div>
    )
}

