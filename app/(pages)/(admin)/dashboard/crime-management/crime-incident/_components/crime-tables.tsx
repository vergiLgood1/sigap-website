"use client"

import {
    useGetCrimes,
    useGetCrimeIncidents,
    useGetIncidentLogs,
} from "../_queries/queries";

import { useState, useMemo } from "react";
import { Card } from "@/app/_components/ui/card";
import { useRouter } from "next/navigation";

// Import new components
import { DataTable } from "@/app/_components/data-table";
import { CrimeManagementToolbar } from "./toolbars/crime-management-toolbar";
import { createCrimeColumns, createIncidentColumns, createIncidentLogColumns } from "./table/columns";
import { useCrimeManagementHandlers, filterCrimes } from "../_handlers/use-crime-management";
import { MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/app/_components/ui/dropdown-menu";
import { Button } from "@/app/_components/ui/button";

// Helper: Quick Action column for tables
function getQuickActionColumn(onUpdate: (row: any) => void, onDelete: (row: any) => void) {
    return {
        id: "actions",
        header: "Quick Action",
        cell: ({ row }: any) => (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <MoreHorizontal className="w-4 h-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onUpdate(row.original)}>
                        Update
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onDelete(row.original)} className="text-destructive">
                        Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        ),
        size: 80,
        enableSorting: false,
        enableHiding: false,
    };
}

// Incident logs table - first in order
export function IncidentLogsTable() {
    const router = useRouter();
    const { data: incidentLogs = [], isLoading, error } = useGetIncidentLogs();

    // Use crime management handlers
    const {
        searchQuery,
        setSearchQuery,
        clearFilters,
        getActiveFilterCount,
    } = useCrimeManagementHandlers();

    // Action handlers
    const handleUpdate = (row: any) => {
        router.push(`/dashboard/crime-management/crime-incident/${row.id}?type=incident-log&action=update`);
    };
    const handleDelete = (row: any) => {
        // Implement delete logic or open confirmation dialog
        alert(`Delete Incident Log: ${row.id}`);
    };

    // Add quick action column
    const columns = [
        ...createIncidentLogColumns(),
        getQuickActionColumn(handleUpdate, handleDelete),
    ];

    // Apply filters to log data
    const filteredLogs = useMemo(() => {
        return incidentLogs.filter(log => {
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                const matchesSearch = [
                    log.id,
                    log.crime_categories?.name,
                    log.user?.profile?.first_name,
                    log.user?.profile?.last_name,
                    log.locations?.districts?.name,
                    log.source
                ].some(field => field && field.toString().toLowerCase().includes(query));

                if (!matchesSearch) return false;
            }
            return true;
        });
    }, [incidentLogs, searchQuery]);

    // State for current page data count
    const [currentPageDataCount, setCurrentPageDataCount] = useState(0);

    const handleRowClick = (log: any) => {
        // Navigate to detail page with the real log ID and type
        router.push(`/dashboard/crime-management/crime-incident/${log.id}?type=incident-log`);
    };

    if (error) return <div className="p-4 text-red-500">Error loading incident logs data</div>;

    return (
        <Card className="p-4">
            <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div className="flex-1 flex items-center gap-2">
                    <h3 className="text-lg font-semibold mb-3">Incident Logs</h3>
                    <CrimeManagementToolbar
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                        activeFilterCount={getActiveFilterCount()}
                        clearFilters={clearFilters}
                        currentPageDataCount={currentPageDataCount}
                    />
                </div>
                <Button
                    variant="default"
                    onClick={() => router.push("/dashboard/crime-management/crime-incident/create?type=incident-log")}
                >
                    + Create
                </Button>
            </div>

            <DataTable
                columns={columns}
                data={filteredLogs}
                loading={isLoading}
                onRowClick={handleRowClick}
                onCurrentPageDataCountChange={setCurrentPageDataCount}
            />
        </Card>
    );
}

// Crime incidents table - second in order
export function CrimeIncidentsTable() {
    const router = useRouter();
    const { data: crimeIncidents = [], isLoading, error } = useGetCrimeIncidents();

    // Use crime management handlers
    const {
        searchQuery,
        setSearchQuery,
        clearFilters,
        getActiveFilterCount,
    } = useCrimeManagementHandlers();

    const handleUpdate = (row: any) => {
        router.push(`/dashboard/crime-management/crime-incident/${row.id}?type=crime-incident&action=update`);
    };
    const handleDelete = (row: any) => {
        alert(`Delete Crime Incident: ${row.id}`);
    };

    const columns = [
        ...createIncidentColumns(),
        getQuickActionColumn(handleUpdate, handleDelete),
    ];

    // Apply filters to incident data
    const filteredIncidents = useMemo(() => {
        return crimeIncidents.filter(incident => {
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                const matchesSearch = [
                    incident.id,
                    incident.crime_categories?.name,
                    incident.locations?.districts?.name,
                    incident.status
                ].some(field => field && field.toString().toLowerCase().includes(query));

                if (!matchesSearch) return false;
            }
            return true;
        });
    }, [crimeIncidents, searchQuery]);

    // State for current page data count
    const [currentPageDataCount, setCurrentPageDataCount] = useState(0);

    const handleRowClick = (incident: any) => {
        // Navigate to detail page with the real incident ID and type
        router.push(`/dashboard/crime-management/crime-incident/${incident.id}?type=crime-incident`);
    };

    if (error) return <div className="p-4 text-red-500">Error loading crime incidents data</div>;

    return (
        <Card className="p-4">
            <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div className="flex-1 flex items-center gap-2">
                    <h3 className="text-lg font-semibold mb-3">Crime Incidents</h3>
                    <CrimeManagementToolbar
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                        activeFilterCount={getActiveFilterCount()}
                        clearFilters={clearFilters}
                        currentPageDataCount={currentPageDataCount}
                    />
                </div>
                <Button
                    variant="default"
                    onClick={() => router.push("/dashboard/crime-management/crime-incident/create?type=crime-incident")}
                >
                    + Create
                </Button>
            </div>

            <DataTable
                columns={columns}
                data={filteredIncidents}
                loading={isLoading}
                onRowClick={handleRowClick}
                onCurrentPageDataCountChange={setCurrentPageDataCount}
            />
        </Card>
    );
}

// Crime summary table - third in order
export function CrimesTable() {
    const router = useRouter();
    const { data: crimes = [], isLoading, error } = useGetCrimes();

    // Use crime management handlers
    const {
        searchQuery,
        setSearchQuery,
        filters,
        setFilters,
        isDialogOpen,
        setIsDialogOpen,
        handleCrimeClick,
        clearFilters,
        getActiveFilterCount,
    } = useCrimeManagementHandlers();

    const handleUpdate = (row: any) => {
        router.push(`/dashboard/crime-management/crime-incident/${row.id}?type=crime-summary&action=update`);
    };
    const handleDelete = (row: any) => {
        alert(`Delete Crime Summary: ${row.id}`);
    };

    const columns = [
        ...createCrimeColumns(),
        getQuickActionColumn(handleUpdate, handleDelete),
    ];

    // Apply filters to crimes
    const filteredCrimes = useMemo(() => {
        return filterCrimes(crimes, searchQuery, filters);
    }, [crimes, searchQuery, filters]);

    // State for current page data count
    const [currentPageDataCount, setCurrentPageDataCount] = useState(0);

    const handleRowClick = (crime: any) => {
        // Navigate to detail page with the real crime ID and type
        router.push(`/dashboard/crime-management/crime-incident/${crime.id}?type=crime-summary`);
    };

    if (error) return <div className="p-4 text-red-500">Error loading crimes data</div>;

    return (
        <Card className="p-4">
            <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div className="flex-1 flex items-center gap-2">
                    <h3 className="text-lg font-semibold mb-3">Crime Statistics Summary</h3>
                    <CrimeManagementToolbar
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                        activeFilterCount={getActiveFilterCount()}
                        clearFilters={clearFilters}
                        currentPageDataCount={currentPageDataCount}
                    />
                </div>
                <Button
                    variant="default"
                    onClick={() => router.push("/dashboard/crime-management/crime-incident/create?type=crime-summary")}
                >
                    + Create
                </Button>
            </div>

            <DataTable
                columns={columns}
                data={filteredCrimes}
                loading={isLoading}
                onRowClick={handleRowClick}
                onCurrentPageDataCountChange={setCurrentPageDataCount}
            />
        </Card>
    );
}
