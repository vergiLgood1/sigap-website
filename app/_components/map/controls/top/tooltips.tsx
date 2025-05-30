"use client"

import { useRef, useState } from "react"

import CrimeTooltips from "./crime-tooltips"
import AdditionalTooltips from "./additional-tooltips"
import SearchTooltip from "./search-control"
import type { ReactNode } from "react"
import { ICrimeSourceTypes } from "@/app/_utils/types/map"
import KMeansTooltips from "./kmeans-tooltips"

// Define the possible control IDs for the crime map
export type ITooltipsControl =
    | "incidents"
    | "heatmap"
    | "units"
    | "clusters"
    | "incremental"
    | "batch"
    | "patrol"
    | "timeline"
    | "refresh"
    | "search"
    | "alerts"
    | "layers"
    | "evidence"
    | "arrests"
    | "reports"
    | "recents";

// Map tools type definition
export interface IMapTools {
    id: ITooltipsControl
    label: string
    icon: ReactNode
    description?: string
}

interface TooltipProps {
    onControlChange?: (controlId: ITooltipsControl) => void
    activeControl?: string
    selectedSourceType: ICrimeSourceTypes
    setSelectedSourceType: (sourceType: ICrimeSourceTypes) => void
    availableSourceTypes: string[] // This must be string[] to match with API response
    selectedYear: number | "all"
    setSelectedYear: (year: number | "all") => void
    selectedMonth: number | "all"
    setSelectedMonth: (month: number | "all") => void
    selectedCategory: string | "all"
    setSelectedCategory: (category: string | "all") => void
    availableYears?: (number | null)[]
    categories?: string[]
    crimes?: any[] // Add this prop to receive crime data
    disableYearMonth?: boolean
}

export default function Tooltips({
    onControlChange,
    activeControl,
    selectedSourceType,
    setSelectedSourceType,
    availableSourceTypes = [],
    selectedYear,
    setSelectedYear,
    selectedMonth,
    setSelectedMonth,
    selectedCategory,
    setSelectedCategory,
    availableYears = [],
    categories = [],
    crimes = [],
    disableYearMonth = false,
}: TooltipProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const [isClient, setIsClient] = useState(false)

    const yearParam = selectedYear === 'all' ? 0 : selectedYear;

    return (
        <div ref={containerRef} className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2">
                {/* Crime Tooltips Component */}
              <CrimeTooltips
                  activeControl={activeControl}
                  onControlChange={onControlChange}
                  sourceType={selectedSourceType}
              />

              {/* Additional Tooltips Component */}
              <AdditionalTooltips
                  activeControl={activeControl}
                  onControlChange={onControlChange}
                  selectedSourceType={selectedSourceType}
                  setSelectedSourceType={setSelectedSourceType}
                  availableSourceTypes={availableSourceTypes}
                  selectedYear={selectedYear}
                  setSelectedYear={setSelectedYear}
                  selectedMonth={selectedMonth}
                  setSelectedMonth={setSelectedMonth}
                  selectedCategory={selectedCategory}
                  setSelectedCategory={setSelectedCategory}
                  availableYears={availableYears}
                  categories={categories}
                  disableYearMonth={disableYearMonth}
              />

                {/* K-Means Tooltips Component */}
                <KMeansTooltips
                    activeControl={activeControl}
                    onControlChange={onControlChange}
                    sourceType={selectedSourceType}
                    selectedYear={yearParam}
                    selectedMonth={selectedMonth}
                />

                {/* Search Control Component */}
              <SearchTooltip
                  activeControl={activeControl}
                  onControlChange={onControlChange}
                  crimes={crimes}
                  sourceType={selectedSourceType}
              />

          </div>
      </div>
  )
}
