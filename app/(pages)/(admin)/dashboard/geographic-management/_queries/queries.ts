import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    getAllDistricts,
    getDistrictById,
    createDistrict,
    updateDistrict,
    deleteDistrict,
    getAllCities,
    getCityById,
    createCity,
    updateCity,
    deleteCity,
    createGeographic,
    deleteGeographic,
    getDemographicsByDistrict,
    createDemographic,
    updateDemographic,
    deleteDemographic,
} from "../action";

// DISTRICT QUERIES
export function useGetDistricts() {
    return useQuery({
        queryKey: ["districts"],
        queryFn: () => getAllDistricts(),
    });
}

export function useGetDistrictById(id: string) {
    return useQuery({
        queryKey: ["district", id],
        queryFn: () => getDistrictById(id),
        enabled: !!id,
    });
}

export function useCreateDistrict() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: { id: string; city_id: string; name: string }) => createDistrict(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["districts"] });
        },
    });
}

export function useUpdateDistrict() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => updateDistrict(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["districts"] });
        },
    });
}

export function useDeleteDistrict() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => deleteDistrict(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["districts"] });
        },
    });
}

// CITY QUERIES
export function useGetCities() {
    return useQuery({
        queryKey: ["cities"],
        queryFn: () => getAllCities(),
    });
}

export function useGetCityById(id: string) {
    return useQuery({
        queryKey: ["city", id],
        queryFn: () => getCityById(id),
        enabled: !!id,
    });
}

export function useCreateCity() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: { id: string; name: string }) => createCity(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["cities"] });
        },
    });
}

export function useUpdateCity() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => updateCity(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["cities"] });
        },
    });
}

export function useDeleteCity() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => deleteCity(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["cities"] });
        },
    });
}

// GEOGRAPHIC QUERIES
export function useCreateGeographic() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: any) => createGeographic(data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["district", variables.district_id] });
            queryClient.invalidateQueries({ queryKey: ["districts"] });
        },
    });
}

export function useDeleteGeographic() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => deleteGeographic(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["districts"] });
        },
    });
}

// DEMOGRAPHIC QUERIES
export function useGetDemographicsByDistrict(districtId: string) {
    return useQuery({
        queryKey: ["demographics", districtId],
        queryFn: () => getDemographicsByDistrict(districtId),
        enabled: !!districtId,
    });
}

export function useCreateDemographic() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: {
            district_id: string;
            population: number;
            number_of_unemployed: number;
            population_density: number;
            year: number;
        }) => createDemographic(data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["demographics", variables.district_id] });
            queryClient.invalidateQueries({ queryKey: ["district", variables.district_id] });
        },
    });
}

export function useUpdateDemographic() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data, districtId }: { id: string; data: any; districtId: string }) => updateDemographic(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["demographics", variables.districtId] });
            queryClient.invalidateQueries({ queryKey: ["district", variables.districtId] });
        },
    });
}

export function useDeleteDemographic() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, districtId }: { id: string; districtId: string }) => deleteDemographic(id),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["demographics", variables.districtId] });
            queryClient.invalidateQueries({ queryKey: ["district", variables.districtId] });
        },
    });
}
