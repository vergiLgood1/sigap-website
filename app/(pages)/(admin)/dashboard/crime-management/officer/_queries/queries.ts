import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    getOfficersList,
    getOfficerById,
    createOfficer,
    updateOfficer,
    deleteOfficer,
} from "../action";

// GET ALL
export function useGetOfficers() {
    return useQuery({
        queryKey: ["officers"],
        queryFn: () => getOfficersList(),
    });
}

// GET BY ID
export function useGetOfficerById(id: string) {
    return useQuery({
        queryKey: ["officer", id],
        queryFn: () => getOfficerById(id),
        enabled: !!id,
    });
}

// CREATE
export function useCreateOfficer() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createOfficer,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["officers"] });
        },
    });
}

// UPDATE
export function useUpdateOfficer() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => updateOfficer(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["officers"] });
        },
    });
}

// DELETE
export function useDeleteOfficer() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => deleteOfficer(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["officers"] });
        },
    });
}
