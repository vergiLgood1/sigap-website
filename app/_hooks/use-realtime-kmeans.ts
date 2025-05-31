"use client";

import { useEffect, useRef, useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { RealtimeKMeansService, DistrictClusterUpdate, ClusterUpdateEvent } from '@/app/_lib/realtime-kmeans-service';
import { useGetRealtimeClusterData, useMarkDistrictForUpdate } from '@/app/(pages)/(admin)/dashboard/crime-management/crime-overview/_queries/queries';

interface UseRealtimeKMeansOptions {
    enabled?: boolean;
    year?: number;
    onClusterUpdate?: (clusters: DistrictClusterUpdate[]) => void;
    onError?: (error: Error) => void;
}

export function useRealtimeKMeans({
    enabled = true,
    year = new Date().getFullYear(),
    onClusterUpdate,
    onError
}: UseRealtimeKMeansOptions = {}) {
    const queryClient = useQueryClient();
    const serviceRef = useRef<RealtimeKMeansService | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

    // SAFETY: Only enable for current year
    const currentYear = new Date().getFullYear();
    const isCurrentYear = year === currentYear;
    const shouldEnable = enabled && isCurrentYear;

    // SAFETY: Log warning if attempting to use with historical data
    useEffect(() => {
        if (enabled && !isCurrentYear) {
            console.warn(`🔒 Real-time K-means disabled for historical year ${year}. Only current year ${currentYear} is supported.`);
        }
    }, [enabled, isCurrentYear, year, currentYear]);

    // Get initial cluster data - ONLY FOR CURRENT YEAR
    const {
        data: clusterData,
        isLoading,
        refetch: refetchClusters
    } = useGetRealtimeClusterData(isCurrentYear ? year : currentYear);

    // Mark district for update mutation - SAFETY: Only current year
    const { refetch: markForUpdateQuery } = useMarkDistrictForUpdate('', isCurrentYear ? year : currentYear);

    // Handle cluster updates from real-time subscription
    const handleClusterUpdate = useCallback((event: ClusterUpdateEvent) => {
        console.log('Received cluster update:', event);
        setLastUpdate(new Date());

        // Update the React Query cache
        queryClient.setQueryData(
            ['realtime-cluster-data', year],
            (oldData: any[]) => {
                if (!oldData) return oldData;

                if (event.eventType === 'INSERT' && event.new) {
                    return [...oldData, event.new];
                }

                if (event.eventType === 'UPDATE' && event.new) {
                    return oldData.map(cluster =>
                        cluster.district_id === event.new?.district_id
                            ? { ...cluster, ...event.new }
                            : cluster
                    );
                }

                if (event.eventType === 'DELETE' && event.old) {
                    return oldData.filter(cluster =>
                        cluster.district_id !== event.old?.district_id
                    );
                }

                return oldData;
            }
        );

        // Call external callback
        if (onClusterUpdate && clusterData) {
            onClusterUpdate(clusterData);
        }

        // Invalidate related queries to ensure consistency
        queryClient.invalidateQueries({
            queryKey: ['district-clusters']
        });
    }, [queryClient, year, onClusterUpdate, clusterData]);

    // Create a function to mark district for update with proper district ID
    const markDistrictForUpdate = useCallback(async (districtId: string) => {
        // SAFETY: Additional check before marking
        if (!isCurrentYear) {
            const error = new Error(`🔒 SAFETY: Cannot mark district for update in historical year ${year}. Only current year ${currentYear} allowed.`);
            console.error(error.message);
            if (onError) onError(error);
            return;
        }

        try {
            // Use the server action directly instead of the React Query hook
            const { markDistrictForUpdate } = await import('@/app/(pages)/(admin)/dashboard/crime-management/crime-overview/action');
            await markDistrictForUpdate(districtId, currentYear); // Force current year
            console.log(`✅ Marked district ${districtId} for update in current year ${currentYear}`);
        } catch (error) {
            console.error('Failed to mark district for update:', error);
            if (onError) {
                onError(error instanceof Error ? error : new Error('Failed to mark district for update'));
            }
        }
    }, [currentYear, isCurrentYear, year, onError]);

    // Handle crime incident updates (trigger incremental updates)
    const handleCrimeIncident = useCallback(async (incident: any) => {
        console.log('New crime incident detected:', incident);

        // Extract district ID from the incident structure
        let districtId = null;

        // Try different possible paths for district ID
        if (incident.locations?.district_id) {
            districtId = incident.locations.district_id;
        } else if (incident.locations?.districts?.id) {
            districtId = incident.locations.districts.id;
        } else if (incident.district_id) {
            districtId = incident.district_id;
        }

        if (districtId) {
            await markDistrictForUpdate(districtId);
        } else {
            console.warn('No district ID found in crime incident:', incident);
        }
    }, [markDistrictForUpdate]);

    // Handle incident verification (trigger incremental updates)
    const handleIncidentVerification = useCallback(async (incident: any) => {
        console.log('Incident verified:', incident);

        // Extract district ID from the incident structure
        let districtId = null;

        // Try different possible paths for district ID
        if (incident.locations?.district_id) {
            districtId = incident.locations.district_id;
        } else if (incident.locations?.districts?.id) {
            districtId = incident.locations.districts.id;
        } else if (incident.district_id) {
            districtId = incident.district_id;
        }

        if (districtId) {
            await markDistrictForUpdate(districtId);
        } else {
            console.warn('No district ID found in verified incident:', incident);
        }
    }, [markDistrictForUpdate]);

    // Initialize and manage real-time service
    useEffect(() => {
        if (!shouldEnable) {
            return;
        }

        // Initialize service
        serviceRef.current = new RealtimeKMeansService();

        // Subscribe to cluster updates
        const clusterChannel = serviceRef.current.subscribeToClusterUpdates(
            handleClusterUpdate,
            onError
        );

        // Subscribe to crime incidents
        const incidentChannel = serviceRef.current.subscribeToCrimeIncidents(
            handleCrimeIncident,
            onError
        );

        // Subscribe to incident verifications  
        const verificationChannel = serviceRef.current.subscribeToVerifiedIncidents(
            handleIncidentVerification,
            onError
        );

        setIsConnected(true);

        // Cleanup function
        return () => {
            if (serviceRef.current) {
                serviceRef.current.unsubscribe();
            }
            if (clusterChannel) {
                clusterChannel.unsubscribe();
            }
            if (incidentChannel) {
                incidentChannel.unsubscribe();
            }
            if (verificationChannel) {
                verificationChannel.unsubscribe();
            }
            setIsConnected(false);
        };
    }, [shouldEnable, handleClusterUpdate, handleCrimeIncident, handleIncidentVerification, onError]);

    // Manual refresh function
    const refreshClusters = useCallback(async () => {
        try {
            await refetchClusters();
        } catch (error) {
            console.error('Failed to refresh clusters:', error);
            if (onError) {
                onError(error instanceof Error ? error : new Error('Failed to refresh clusters'));
            }
        }
    }, [refetchClusters, onError]);

    return {
        clusterData: shouldEnable ? (clusterData || []) : [],
        isLoading: shouldEnable ? isLoading : false,
        isConnected: isConnected && shouldEnable,
        isRealTimeEnabled: shouldEnable,
        lastUpdate: shouldEnable ? lastUpdate : null,
        refreshClusters,
        // SAFETY: Add year info to return object
        safetyInfo: {
            requestedYear: year,
            currentYear,
            isSafeMode: isCurrentYear,
            warningMessage: !isCurrentYear ? `Historical year ${year} detected. Real-time features disabled for safety.` : null
        }
    };
}
