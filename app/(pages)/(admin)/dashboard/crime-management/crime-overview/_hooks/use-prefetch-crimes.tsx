"use client"

import { useState, useMemo } from "react"
import { useGetAvailableYears, useGetCrimes } from "../_queries/queries"

type CrimeData = any // Replace with your actual crime data type

interface PrefetchedCrimeDataResult {
    availableYears: (number | null)[] | undefined
    isYearsLoading: boolean
    yearsError: Error | null
    crimes: CrimeData | undefined
    isCrimesLoading: boolean
    crimesError: Error | null
    setSelectedYear: (year: number) => void
    setSelectedMonth: (month: number | "all") => void
    selectedYear: number
    selectedMonth: number | "all"
}

export function usePrefetchedCrimeData(initialYear: number = 2024, initialMonth: number | "all" = "all"): PrefetchedCrimeDataResult {
    const [selectedYear, setSelectedYear] = useState<number>(initialYear)
    const [selectedMonth, setSelectedMonth] = useState<number | "all">(initialMonth)

    // Get available years
    const {
        data: availableYears,
        isLoading: isYearsLoading,
        error: yearsError
    } = useGetAvailableYears()

    // Get all crime data in a single request
    const {
        data: allCrimes,
        isLoading: isCrimesLoading,
        error: crimesError
    } = useGetCrimes()

    // Filter crimes based on selected year and month
    const filteredCrimes = useMemo(() => {
        if (!allCrimes) return []

        return allCrimes.filter((crime: any) => {
            const yearMatch = crime.year === selectedYear

            if (selectedMonth === "all") {
                return yearMatch
            } else {
                return yearMatch && crime.month === selectedMonth
            }
        })
    }, [allCrimes, selectedYear, selectedMonth])

    return {
        availableYears,
        isYearsLoading,
        yearsError,
        crimes: filteredCrimes,
        isCrimesLoading,
        crimesError,
        setSelectedYear,
        setSelectedMonth,
        selectedYear,
        selectedMonth,
    }
}
