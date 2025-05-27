import { useState } from "react";

// Define filter types for crime management
interface CrimeFilters {
    status?: string[];
    district?: string[];
    category?: string[];
    level?: string[];
    year?: number[];
    month?: number[];
}

export const useCrimeManagementHandlers = () => {
    // Search and filter states
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [filters, setFilters] = useState<CrimeFilters>({});

    // Detail view states
    const [selectedCrime, setSelectedCrime] = useState<any | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Handle clicking on a crime row
    const handleCrimeClick = (crime: any) => {
        setSelectedCrime(crime);
        setIsDialogOpen(true);
    };

    // Clear all filters
    const clearFilters = () => {
        setFilters({});
        setSearchQuery("");
    };

    // Count active filters
    const getActiveFilterCount = () => {
        let count = 0;
        Object.values(filters).forEach(filter => {
            if (filter && Array.isArray(filter) && filter.length > 0) {
                count += filter.length;
            }
        });
        return count;
    };

    return {
        searchQuery,
        setSearchQuery,
        filters,
        setFilters,
        selectedCrime,
        setSelectedCrime,
        isDialogOpen,
        setIsDialogOpen,
        handleCrimeClick,
        clearFilters,
        getActiveFilterCount,
    };
};

// Filter function for crimes
export const filterCrimes = (crimes: any[], searchQuery: string, filters: CrimeFilters) => {
    return crimes.filter(crime => {
        // Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            const searchableFields = [
                crime.districts?.name,
                crime.level,
                crime.source_type,
                crime.id,
            ];

            const matchesSearch = searchableFields.some(
                field => field && field.toString().toLowerCase().includes(query)
            );

            if (!matchesSearch) return false;
        }

        // Status filter
        if (filters.level?.length && !filters.level.includes(crime.level)) {
            return false;
        }

        // District filter
        if (filters.district?.length && !filters.district.includes(crime.districts?.name)) {
            return false;
        }

        // Year filter
        if (filters.year?.length && !filters.year.includes(crime.year)) {
            return false;
        }

        // Month filter
        if (filters.month?.length && !filters.month.includes(crime.month)) {
            return false;
        }

        return true;
    });
};
