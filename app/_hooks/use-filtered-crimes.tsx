"use client"

import { useMemo } from "react"

export function useFilteredCrimeData(
    crimes: any[] | undefined,
    selectedCategory: string | "all" = "all"
) {
    // Handle filtered crime data
    return useMemo(() => {
        if (!crimes || crimes.length === 0) {
            return []
        }

        if (selectedCategory === "all") {
            return crimes
        }

        return crimes.filter(crime => {
            // Check if any incident in this crime matches the category
            return crime.incidents?.some((incident: any) =>
                incident.category === selectedCategory
            )
        }).map(crime => ({
            ...crime,
            // Only include incidents that match the selected category
            incidents: crime.incidents.filter((incident: any) =>
                incident.category === selectedCategory
            ),
            // Update number_of_crime to reflect the filtered count
            number_of_crime: crime.incidents.filter(
                (incident: any) => incident.category === selectedCategory
            ).length
        }))
    }, [crimes, selectedCategory])
}
