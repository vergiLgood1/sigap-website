"use client"

import {
    useGetCrimes,
    useGetCrimeIncidents,
    useGetIncidentLogs,
    useCreateIncidentLog,
    useCreateCrimeIncident,
    useCreateCrimeSummary,
    useUpdateCrimeIncidentStatus,
    useVerifyIncidentLog,
    useDeleteIncidentLog,
    useDeleteCrimeIncident,
    useDeleteCrimeSummary,
} from "../_queries/queries";

import { useState, useMemo } from "react";
import { Card } from "@/app/_components/ui/card";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

// Import new components
import { DataTable } from "@/app/_components/data-table";
import { CrimeManagementToolbar } from "./toolbars/crime-management-toolbar";
import { createCrimeColumns, createIncidentColumns, createIncidentLogColumns } from "./table/columns";
import { useCrimeManagementHandlers, filterCrimes } from "../_handlers/use-crime-management";
import { CirclePlus, MoreHorizontal, Trash2, Pencil } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/app/_components/ui/dropdown-menu";
import { Button } from "@/app/_components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/app/_components/ui/dialog";
import {
    CreateIncidentLogForm,
    CreateCrimeIncidentForm,
    CreateCrimeSummaryForm
} from "./forms/incident-create-forms";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from "@/app/_components/ui/alert-dialog";

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
                    <DropdownMenuItem
                        onClick={(e) => {
                            e.stopPropagation();
                            onUpdate(row.original);
                        }}
                    >
                        <Pencil className="w-4 h-4 mr-2" />
                        Update
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(row.original);
                        }}
                        className="text-destructive"
                    >
                        <Trash2 className="w-4 h-4 mr-2" />
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
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<any>(null);

    const createIncidentLogMutation = useCreateIncidentLog();
    const verifyIncidentLogMutation = useVerifyIncidentLog();
    const deleteIncidentLogMutation = useDeleteIncidentLog();

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
        toast.info("Opening incident log for editing");
    };

    const handleDelete = (row: any) => {
        setSelectedItem(row);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (selectedItem) {
            try {
                await deleteIncidentLogMutation.mutateAsync(selectedItem.id);
                toast.success(`Incident log ${selectedItem.id.substring(0, 8)}... was deleted`);
            } catch (err: any) {
                toast.error(err?.message || "Failed to delete incident log");
            }
            setDeleteDialogOpen(false);
            setSelectedItem(null);
        }
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

    const handleCreateSubmit = async (formData: any) => {
        try {
            toast.promise(
                createIncidentLogMutation.mutateAsync(formData),
                {
                    loading: 'Creating new incident log...',
                    success: 'Incident log created successfully!',
                    error: (err) => `Error: ${err.message || 'Failed to create incident log'}`
                }
            );
            setIsCreateDialogOpen(false);
        } catch (error) {
            console.error("Error creating incident log:", error);
        }
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
                    onClick={() => setIsCreateDialogOpen(true)}
                >
                    <CirclePlus className="mr-2 h-4 w-4" />
                    Create Incident Log
                </Button>
            </div>

            <DataTable
                columns={columns}
                data={filteredLogs}
                loading={isLoading}
                onRowClick={handleRowClick}
                onCurrentPageDataCountChange={setCurrentPageDataCount}
            />

            {/* Create Incident Log Dialog with improved width */}
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogContent className="max-w-4xl">
                    <DialogHeader>
                        <DialogTitle>Create New Incident Log</DialogTitle>
                        <DialogDescription>
                            Fill in the details to create a new incident log entry.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-2 flex items-center justify-center">
                        <CreateIncidentLogForm
                            onCancel={() => setIsCreateDialogOpen(false)}
                            onSubmit={handleCreateSubmit}
                        />
                    </div>
                </DialogContent>
            </Dialog>

            {/* Delete confirmation dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the incident log.
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Card>
    );
}

// Crime incidents table - second in order
export function CrimeIncidentsTable() {
    const router = useRouter();
    const { data: crimeIncidents = [], isLoading, error } = useGetCrimeIncidents();
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const createCrimeIncidentMutation = useCreateCrimeIncident();
    const deleteCrimeIncidentMutation = useDeleteCrimeIncident();

    // Use crime management handlers
    const {
        searchQuery,
        setSearchQuery,
        clearFilters,
        getActiveFilterCount,
    } = useCrimeManagementHandlers();

    const handleUpdate = (row: any) => {
        router.push(`/dashboard/crime-management/crime-incident/${row.id}?type=crime-incident&action=update`);
        toast.info("Opening crime incident for editing");
    };
    const handleDelete = (row: any) => {
        setSelectedItem(row);
        setDeleteDialogOpen(true);
    };
    const confirmDelete = async () => {
        if (selectedItem) {
            try {
                await deleteCrimeIncidentMutation.mutateAsync(selectedItem.id);
                toast.success(`Crime incident ${selectedItem.id.substring(0, 8)}... was deleted`);
            } catch (err: any) {
                toast.error(err?.message || "Failed to delete crime incident");
            }
            setDeleteDialogOpen(false);
            setSelectedItem(null);
        }
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

    const handleCreateSubmit = async (formData: any) => {
        await createCrimeIncidentMutation.mutateAsync(formData);
        setIsCreateDialogOpen(false);
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
                    onClick={() => setIsCreateDialogOpen(true)}
                >
                    <CirclePlus className="mr-2 h-4 w-4" />
                    Create Incident
                </Button>
            </div>

            <DataTable
                columns={columns}
                data={filteredIncidents}
                loading={isLoading}
                onRowClick={handleRowClick}
                onCurrentPageDataCountChange={setCurrentPageDataCount}
            />

            {/* Create Crime Incident Dialog */}
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogContent className="max-w-xl">
                    <DialogHeader>
                        <DialogTitle>Create New Crime Incident</DialogTitle>
                        <DialogDescription>
                            Fill in the details to create a new crime incident.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4">
                        <CreateCrimeIncidentForm
                            onCancel={() => setIsCreateDialogOpen(false)}
                            onSubmit={handleCreateSubmit}
                        />
                    </div>
                </DialogContent>
            </Dialog>

            {/* Delete confirmation dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the crime incident.
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Card>
    );
}

// Crime summary table - third in order
export function CrimesTable() {
    const router = useRouter();
    const { data: crimes = [], isLoading, error } = useGetCrimes();
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const createCrimeSummaryMutation = useCreateCrimeSummary();
    const deleteCrimeSummaryMutation = useDeleteCrimeSummary();

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
        toast.info("Opening crime summary for editing");
    };
    const handleDelete = (row: any) => {
        setSelectedItem(row);
        setDeleteDialogOpen(true);
    };
    const confirmDelete = async () => {
        if (selectedItem) {
            try {
                await deleteCrimeSummaryMutation.mutateAsync(selectedItem.id);
                toast.success(`Crime summary ${selectedItem.id.substring(0, 8)}... was deleted`);
            } catch (err: any) {
                toast.error(err?.message || "Failed to delete crime summary");
            }
            setDeleteDialogOpen(false);
            setSelectedItem(null);
        }
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

    const handleCreateSubmit = async (formData: any) => {
        await createCrimeSummaryMutation.mutateAsync(formData);
        setIsCreateDialogOpen(false);
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
                    onClick={() => setIsCreateDialogOpen(true)}
                >
                    <CirclePlus className="mr-2 h-4 w-4" />
                    Create
                </Button>
            </div>

            <DataTable
                columns={columns}
                data={filteredCrimes}
                loading={isLoading}
                onRowClick={handleRowClick}
                onCurrentPageDataCountChange={setCurrentPageDataCount}
            />

            {/* Create Crime Summary Dialog */}
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogContent className="max-w-xl">
                    <DialogHeader>
                        <DialogTitle>Create New Crime Summary</DialogTitle>
                        <DialogDescription>
                            Fill in the details to create a new crime statistics summary.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4">
                        <CreateCrimeSummaryForm
                            onCancel={() => setIsCreateDialogOpen(false)}
                            onSubmit={handleCreateSubmit}
                        />
                    </div>
                </DialogContent>
            </Dialog>

            {/* Delete confirmation dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the crime summary.
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Card>
    );
}
