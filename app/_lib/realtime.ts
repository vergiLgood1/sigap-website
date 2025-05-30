import { createClient } from "@/app/_utils/supabase/client"
import { RealtimePostgresChangesPayload, SupabaseClient } from "@supabase/supabase-js"

type PostgresEvent = 'INSERT' | 'UPDATE' | 'DELETE' | '*'

interface RealtimeFilter {
    column: string
    operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'in'
    value: any
}

interface SubscriptionConfig<T extends Record<string, any>> {
    table: string
    schema?: string
    event?: PostgresEvent
    filters?: RealtimeFilter[]
    onData?: (payload: RealtimePostgresChangesPayload<T>) => void
}

class RealtimeService {
    private supabase: SupabaseClient
    private channels: Map<string, any>

    constructor() {
        this.supabase = createClient()
        this.channels = new Map()
    }

    private buildFilter(filters?: RealtimeFilter[]) {
        if (!filters || filters.length === 0) return undefined

        return filters.reduce((acc, filter) => {
            if (acc) {
                return `${acc},${filter.column}=${filter.operator}.${filter.value}`
            }
            return `${filter.column}=${filter.operator}.${filter.value}`
        }, '')
    }

    private getChannelKey(config: SubscriptionConfig<any>): string {
        return `${config.schema || 'public'}-${config.table}-${config.event || '*'}-${JSON.stringify(config.filters || [])}`
    }

    subscribe<T extends Record<string, any>>(config: SubscriptionConfig<T>) {
        const {
            table,
            schema = 'public',
            event = '*',
            filters,
            onData
        } = config

        const channelKey = this.getChannelKey(config)

        // Return existing subscription if already subscribed
        if (this.channels.has(channelKey)) {
            return () => this.unsubscribe(config)
        }

        const channel = this.supabase
            .channel(channelKey)
            .on(
                'postgres_changes' as any, // Type assertion needed due to Supabase types
                {
                    event,
                    schema,
                    table,
                    filter: this.buildFilter(filters)
                },
                (payload: RealtimePostgresChangesPayload<T>) => {
                    onData?.(payload)
                }
            )
            .subscribe()

        this.channels.set(channelKey, channel)

        return () => this.unsubscribe(config)
    }

    unsubscribe(config: SubscriptionConfig<any>) {
        const channelKey = this.getChannelKey(config)
        const channel = this.channels.get(channelKey)

        if (channel) {
            channel.unsubscribe()
            this.channels.delete(channelKey)
        }
    }

    unsubscribeAll() {
        this.channels.forEach(channel => channel.unsubscribe())
        this.channels.clear()
    }
}

// Create singleton instance
const realtimeService = new RealtimeService()
export default realtimeService

// Types for cluster updates
interface DistrictCluster {
    id: string
    district_id: string
    year: number
    month: number | null
    risk_level: string
    last_update_type: string
    [key: string]: any
}

interface ClusterUpdate {
    id: string
    district_id: string
    update_type: string
    processed: boolean
}

// Example usage for clusters (previous implementation)
export const subscribeToClusterUpdates = ({
    year,
    month,
    kmeansMode,
    onDistrictClusterUpdate
}: {
    year: number
    month?: number | null
    kmeansMode: "incremental" | "batch"
    onDistrictClusterUpdate?: () => void
}) => {
    const unsubscribeDistrict = realtimeService.subscribe<DistrictCluster>({
        table: 'district_clusters',
        filters: [
            {
                column: 'year',
                operator: 'eq',
                value: year
            }
        ],
        onData: (payload) => {
            if (!payload.new || !isDistrictCluster(payload.new)) return

            const newData = payload.new
            if (newData.last_update_type === 'incremental' &&
                (typeof month === "string" && month === "all" ||
                    newData.month === month)) {
                console.log('Processing kmeans update:', {
                    year: newData.year,
                    month: newData.month,
                    type: newData.last_update_type
                })
                onDistrictClusterUpdate?.()
            }
        }
    })

    const unsubscribeUpdates = realtimeService.subscribe<ClusterUpdate>({
        table: 'cluster_updates',
        event: 'INSERT',
        filters: [
            {
                column: 'processed',
                operator: 'eq',
                value: false
            }
        ],
        onData: (payload) => {
            if (!payload.new || !isClusterUpdate(payload.new)) return

            const newData = payload.new
            if (newData.update_type === kmeansMode) {
                onDistrictClusterUpdate?.()
            }
        }
    })

    return () => {
        unsubscribeDistrict()
        unsubscribeUpdates()
    }
}

// Type guards
function isDistrictCluster(data: any): data is DistrictCluster {
    return (
        typeof data === 'object' &&
        data !== null &&
        'id' in data &&
        'district_id' in data &&
        'year' in data &&
        'month' in data &&
        'risk_level' in data &&
        'last_update_type' in data
    )
}

function isClusterUpdate(data: any): data is ClusterUpdate {
    return (
        typeof data === 'object' &&
        data !== null &&
        'id' in data &&
        'district_id' in data &&
        'update_type' in data &&
        'processed' in data
    )
}
