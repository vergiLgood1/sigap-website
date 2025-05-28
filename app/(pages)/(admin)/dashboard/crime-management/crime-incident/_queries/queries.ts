import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    getCrimesList,
    getCrimeIncidentsList,
    getIncidentLogsList,
    getIncidentLogById,
    getCrimeIncidentById,
    verifyIncidentLog,
    updateCrimeIncidentStatus,
    getDistricts,
    getAvailableSourceTypes,
    createIncidentLog,
    createCrimeIncident,
    createCrimeSummary,
    deleteIncidentLog,
    deleteCrimeIncident,
    deleteCrimeSummary,
} from "../action";

// Fetch all incident logs
export function useGetIncidentLogs() {
    return useQuery({
        queryKey: ["incidentLogs"],
        queryFn: async () => {
            return getIncidentLogsList();
        }
    });
}

// Fetch all crime incidents
export function useGetCrimeIncidents() {
    return useQuery({
        queryKey: ["crimeIncidents"],
        queryFn: async () => {
            return getCrimeIncidentsList();
        }
    });
}

// Fetch all crimes
export function useGetCrimes() {
    return useQuery({
        queryKey: ["crimes"],
        queryFn: async () => {
            return getCrimesList();
        }
    });
}

// Fetch incident log details by ID
export function useGetIncidentLogDetail(id: string) {
    return useQuery({
        queryKey: ["incidentLogDetail", id],
        queryFn: async () => {
            if (!id) return null;
            return getIncidentLogById(id);
        },
        enabled: !!id
    });
}

// Fetch crime incident details by ID
export function useGetCrimeIncidentDetail(id: string) {
    return useQuery({
        queryKey: ["crimeIncidentDetail", id],
        queryFn: async () => {
            if (!id) return null;
            return getCrimeIncidentById(id);
        },
        enabled: !!id
    });
}

// Fetch crime details by ID
// Note: There's no direct getCrimeById in action.ts, so we'd need to filter from the list
// or create a new server action for fetching a single crime
export function useGetCrimeDetail(id: string) {
    return useQuery({
        queryKey: ["crimeDetail", id],
        queryFn: async () => {
            if (!id) return null;
            // Since there's no direct method to get a crime by ID in the server actions,
            // we can get all crimes and filter for the one we want
            const crimes = await getCrimesList();
            return crimes.find(crime => crime.id === id) || null;
        },
        enabled: !!id
    });
}

// Verify an incident log
export function useVerifyIncidentLog() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            return verifyIncidentLog(id);
        },
        onSuccess: (data, variables) => {
            // Invalidate queries to refresh data
            queryClient.invalidateQueries({ queryKey: ["incidentLogs"] });
            queryClient.invalidateQueries({ queryKey: ["incidentLogDetail", variables] });
            queryClient.invalidateQueries({ queryKey: ["crimeIncidents"] });
        }
    });
}

// Update crime incident status
export function useUpdateCrimeIncidentStatus() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, status }: { id: string; status: string }) => {
            return updateCrimeIncidentStatus(id, status);
        },
        onSuccess: (data, variables) => {
            // Invalidate relevant queries
            queryClient.invalidateQueries({ queryKey: ["crimeIncidents"] });
            queryClient.invalidateQueries({ queryKey: ["crimeIncidentDetail", variables.id] });
        }
    });
}


// Get all districts
export function useGetDistricts() {
    return useQuery({
        queryKey: ["districts"],
        queryFn: () => getDistricts(),
    });
}

// Get available source types
export function useGetSourceTypes() {
    return useQuery({
        queryKey: ["sourceTypes"],
        queryFn: () => getAvailableSourceTypes(),
    });
}

// Create Incident Log
export function useCreateIncidentLog() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: any) => createIncidentLog(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["incidentLogs"] });
        },
    });
}

// Create Crime Incident
export function useCreateCrimeIncident() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: any) => createCrimeIncident(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["crimeIncidents"] });
        },
    });
}

// Create Crime Summary
export function useCreateCrimeSummary() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: any) => createCrimeSummary(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["crimes"] });
        },
    });
}

// DELETE HOOKS
export function useDeleteIncidentLog() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            return await deleteIncidentLog(id);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['incident-logs'] });
            queryClient.invalidateQueries({ queryKey: ['crime-incidents'] });
            queryClient.invalidateQueries({ queryKey: ['crimes'] });
        },
        onError: (error) => {
            console.error('Error deleting incident log:', error);
        },
    });
}

export function useDeleteCrimeIncident() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            return await deleteCrimeIncident(id);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['crime-incidents'] });
            queryClient.invalidateQueries({ queryKey: ['crimes'] });
        },
        onError: (error) => {
            console.error('Error deleting crime incident:', error);
        },
    });
}

export function useDeleteCrimeSummary() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            return await deleteCrimeSummary(id);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['crimes'] });
            queryClient.invalidateQueries({ queryKey: ['crime-incidents'] });
        },
        onError: (error) => {
            console.error('Error deleting crime summary:', error);
        },
    });
}