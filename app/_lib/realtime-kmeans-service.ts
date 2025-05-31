"use client";

import { createClient } from "@/app/_utils/supabase/client";
import { RealtimeChannel } from "@supabase/supabase-js";
import { CNumbers } from "../_utils/const/numbers";

export interface DistrictClusterUpdate {
    id: string;
    district_id: string;
    district_name?: string; // Optional since it comes from join
    year: number;
    month: number | null; // Changed from number | undefined to match Prisma schema
    risk_level: 'low' | 'medium' | 'high' | 'critical';
    total_crimes: number;
    cluster_score: number;
    crime_score: number;
    density_score: number;
    unemployment_score: number;
    last_update_type: string;
    update_count?: number;
    needs_recompute?: boolean;
    updated_at: Date | string; // Accept both Date and string to handle serialization
    location?: {
        latitude: number;
        longitude: number;
    } | null;
}

export interface ClusterUpdateEvent {
    eventType: 'INSERT' | 'UPDATE' | 'DELETE';
    new?: DistrictClusterUpdate;
    old?: DistrictClusterUpdate;
}

export class RealtimeKMeansService {
    private supabase = createClient();
    private channel: RealtimeChannel | null = null;
    private currentYear = new Date().getFullYear();

    /**
     * Subscribe to real-time cluster updates for current year only
     */
    subscribeToClusterUpdates(
        onUpdate: (event: ClusterUpdateEvent) => void,
        onError?: (error: Error) => void
    ): RealtimeChannel {
        // Remove existing subscription if any
        this.unsubscribe();

        this.channel = this.supabase
            .channel('district_clusters_realtime')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'district_clusters',
                    filter: `year=eq.${this.currentYear}`,
                },
                (payload) => {
                    try {
                        const event: ClusterUpdateEvent = {
                            eventType: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
                            new: payload.new as DistrictClusterUpdate,
                            old: payload.old as DistrictClusterUpdate,
                        };
                        onUpdate(event);
                    } catch (error) {
                        console.error('Error processing cluster update:', error);
                        if (onError) {
                            onError(error instanceof Error ? error : new Error('Unknown error'));
                        }
                    }
                }
            )
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                    console.log('Successfully subscribed to district clusters updates');
                } else if (status === 'CHANNEL_ERROR') {
                    console.error('Error subscribing to district clusters updates');
                    if (onError) {
                        onError(new Error('Failed to subscribe to real-time updates'));
                    }
                }
            });

        return this.channel;
    }

    /**
     * Subscribe to crime incidents for triggering incremental updates
     */
    subscribeToCrimeIncidents(
        onIncident: (incident: any) => void,
        onError?: (error: Error) => void
    ): RealtimeChannel {
        const incidentChannel = this.supabase
            .channel('crime_incidents_realtime')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'crime_incidents',
                },
                (payload) => {
                    try {
                        onIncident(payload.new);
                    } catch (error) {
                        console.error('Error processing crime incident:', error);
                        if (onError) {
                            onError(error instanceof Error ? error : new Error('Unknown error'));
                        }
                    }
                }
            )
            .subscribe();

        return incidentChannel;
    }

    /**
     * Subscribe to verified incident logs that might trigger updates
     */
    subscribeToVerifiedIncidents(
        onVerification: (incident: any) => void,
        onError?: (error: Error) => void
    ): RealtimeChannel {
        const verificationChannel = this.supabase
            .channel('incident_verification_realtime')
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'incident_logs',
                    filter: 'verified=eq.true',
                },
                (payload) => {
                    try {
                        // Only process if verified status changed from false to true
                        if (payload.old?.verified === false && payload.new?.verified === true) {
                            onVerification(payload.new);
                        }
                    } catch (error) {
                        console.error('Error processing incident verification:', error);
                        if (onError) {
                            onError(error instanceof Error ? error : new Error('Unknown error'));
                        }
                    }
                }
            )
            .subscribe();

        return verificationChannel;
    }

    /**
     * Unsubscribe from all channels
     */
    unsubscribe(): void {
        if (this.channel) {
            this.supabase.removeChannel(this.channel);
            this.channel = null;
        }
    }

    /**
     * Get current cluster data for specified districts
     */
    async getCurrentClusters(districtIds?: string[]): Promise<DistrictClusterUpdate[]> {
        try {
            let query = this.supabase
                .from('district_clusters')
                .select('*')
                .eq('year', this.currentYear)
                .is('month', null);

            if (districtIds && districtIds.length > 0) {
                query = query.in('district_id', districtIds);
            }

            const { data, error } = await query;

            if (error) {
                throw new Error(`Failed to fetch cluster data: ${error.message}`);
            }

            return data || [];
        } catch (error) {
            console.error('Error fetching current clusters:', error);
            throw error;
        }
    }

    /**
     * Check if incremental update threshold is reached
     */
    async checkUpdateThreshold(threshold: number = CNumbers.KMEANS_THRESHOLD): Promise<boolean> {
        try {
            const { data, error } = await this.supabase
                .from('district_clusters')
                .select('update_count')
                .eq('year', this.currentYear)
                .is('month', null)
                .gte('update_count', threshold);

            if (error) {
                throw new Error(`Failed to check update threshold: ${error.message}`);
            }

            return (data?.length || 0) > 0;
        } catch (error) {
            console.error('Error checking update threshold:', error);
            return false;
        }
    }
}
