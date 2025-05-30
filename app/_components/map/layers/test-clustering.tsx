"use client"

import { Button } from "@/app/_components/ui/button"
import { createClient } from "@/app/_utils/supabase/client"
import { useState } from "react"

export default function TestClustering() {
    const [isLoading, setIsLoading] = useState(false)

    const generateRandomData = () => {
        return {
            total_crimes: Math.floor(Math.random() * 100),
            population_density: Math.random() * 1000,
            unemployment_rate: Math.random(),
            crime_score: Math.random(),
            density_score: Math.random(),
            unemployment_score: Math.random(),
            cluster_score: Math.random(),
            centroid_features: [Math.random(), Math.random(), Math.random()],
            member_count: Math.floor(Math.random() * 10) + 1,
            update_count: Math.floor(Math.random() * 100),
            risk_level: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)]
        }
    }

    const updateAllDistricts = async () => {
        setIsLoading(true)
        try {
            const supabase = createClient()
            const now = new Date().toISOString()

            // Get all districts first
            const { data: districts, error: districtError } = await supabase
                .from('districts')
                .select('id')

            if (districtError) {
                console.error('Error fetching districts:', districtError)
                throw districtError
            }

            if (!districts || districts.length === 0) {
                console.error('No districts found')
                return
            }

            // Update each district
            for (const district of districts) {
                const randomData = generateRandomData()

                // Get existing record first
                const { data: existingData, error: fetchError } = await supabase
                    .from('district_clusters')
                    .select('*')
                    .eq('year', 2025)
                    .eq('month', 1)
                    .eq('district_id', district.id)
                    .limit(1)
                    .maybeSingle()

                if (!existingData) {
                    // If no record exists, create one
                    const { error: insertError } = await supabase
                        .from('district_clusters')
                        .insert({
                            district_id: district.id,
                            year: 2025,
                            month: 1,
                            ...randomData,
                            needs_recompute: false,
                            created_at: now,
                            updated_at: now
                        })

                    if (insertError) {
                        console.error('Insert error for district', district.id, ':', insertError)
                        continue
                    }
                } else {
                    // If record exists, update it
                    const { error: updateError } = await supabase
                        .from('district_clusters')
                        .update({
                            ...randomData,
                            updated_at: now
                        })
                        .eq('id', existingData.id)

                    if (updateError) {
                        console.error('Update error for district', district.id, ':', updateError)
                        continue
                    }
                }

                // Create cluster update record
                const { error: insertError } = await supabase
                    .from('cluster_updates')
                    .insert({
                        district_id: district.id,
                        update_type: 'incremental',
                        old_value: {
                            crime_score: Math.random(),
                            density_score: Math.random(),
                            unemployment_score: Math.random()
                        },
                        new_value: {
                            crime_score: randomData.crime_score,
                            density_score: randomData.density_score,
                            unemployment_score: randomData.unemployment_score
                        },
                        processed: false,
                        timestamp: now
                    })

                if (insertError) {
                    console.error('Cluster update insert error for district', district.id, ':', insertError)
                }
            }

            console.log('All districts updated successfully')
        } catch (error) {
            console.error('Error updating districts:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const simulateIncrementalUpdate = async () => {
        setIsLoading(true)
        try {
            const supabase = createClient()
            const now = new Date().toISOString()

            // Check if district exists first
            const { data: district, error: districtError } = await supabase
                .from('districts')
                .select('id')
                .eq('id', '350931')
                .single()

            if (districtError || !district) {
                // Create district first if it doesn't exist
                const { error: createDistrictError } = await supabase
                    .from('districts')
                    .insert({
                        id: '350931',
                        name: 'Test District',
                        city_id: '3509' // Parent city ID
                    })

                if (createDistrictError) {
                    console.error('Error creating district:', createDistrictError)
                    throw createDistrictError
                }
            }

            // Get existing record first
            const { data: existingData, error: fetchError } = await supabase
                .from('district_clusters')
                .select('*')
                .eq('year', 2025)
                .eq('month', 1)
                .eq('district_id', '350931')
                .limit(1)
                .maybeSingle()

            if (!existingData) {
                // If no record exists, create one
                const { error: insertError } = await supabase
                    .from('district_clusters')
                    .insert({
                        district_id: '350931',
                        year: 2025,
                        month: 1,
                        risk_level: 'low',
                        total_crimes: 24,
                        population_density: 487.211314225532,
                        unemployment_rate: 0.253701845132402,
                        crime_score: 0.203241088410547,
                        density_score: 0.0783424870804006,
                        unemployment_score: 0.0826048483420575,
                        cluster_score: 0.129580635990956,
                        centroid_features: [0.1149544318834564, 0.1655506656350974, 0.08092454337044326],
                        member_count: 1,
                        last_update_type: 'incremental',
                        update_count: Math.floor(Math.random() * 100),
                        needs_recompute: false,
                        created_at: now,
                        updated_at: now
                    })

                if (insertError) {
                    console.error('Insert error:', insertError)
                    throw insertError
                }
            } else {
                // If record exists, update it
                const { error: updateError } = await supabase
                    .from('district_clusters')
                    .update({
                        last_update_type: 'incremental',
                        update_count: Math.floor(Math.random() * 100),
                        updated_at: now
                    })
                    .eq('id', existingData.id)

                if (updateError) {
                    console.error('Update error:', updateError)
                    throw updateError
                }
            }

            // Create cluster update record
            const { error: insertError } = await supabase
                .from('cluster_updates')
                .insert({
                    district_id: '350931',
                    update_type: 'incremental',
                    old_value: {
                        crime_score: 0.203241088410547,
                        density_score: 0.0783424870804006,
                        unemployment_score: 0.0826048483420575
                    },
                    new_value: {
                        crime_score: 0.303241088410547,
                        density_score: 0.0883424870804006,
                        unemployment_score: 0.0926048483420575
                    },
                    processed: false,
                    timestamp: now
                })

            if (insertError) {
                console.error('Cluster update insert error:', insertError)
                throw insertError
            }

            console.log('Incremental update simulated successfully')
        } catch (error) {
            console.error('Error simulating incremental update:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const simulateBatchUpdate = async () => {
        setIsLoading(true)
        try {
            const supabase = createClient()
            const now = new Date().toISOString()

            // Check if district exists first
            const { data: district, error: districtError } = await supabase
                .from('districts')
                .select('id')
                .eq('id', '350931')
                .single()

            if (districtError || !district) {
                // Create district first if it doesn't exist
                const { error: createDistrictError } = await supabase
                    .from('districts')
                    .insert({
                        id: '350931',
                        name: 'Test District',
                        city_id: '3509' // Parent city ID
                    })

                if (createDistrictError) {
                    console.error('Error creating district:', createDistrictError)
                    throw createDistrictError
                }
            }

            // Get existing record first
            const { data: existingData, error: fetchError } = await supabase
                .from('district_clusters')
                .select('*')
                .eq('year', 2025)
                .eq('month', 1)
                .eq('district_id', '350931')
                .limit(1)
                .maybeSingle()

            if (!existingData) {
                // If no record exists, create one
                const { error: insertError } = await supabase
                    .from('district_clusters')
                    .insert({
                        district_id: '350931',
                        year: 2025,
                        month: 1,
                        risk_level: 'low',
                        total_crimes: 24,
                        population_density: 487.211314225532,
                        unemployment_rate: 0.253701845132402,
                        crime_score: 0.203241088410547,
                        density_score: 0.0783424870804006,
                        unemployment_score: 0.0826048483420575,
                        cluster_score: 0.129580635990956,
                        centroid_features: [0.1149544318834564, 0.1655506656350974, 0.08092454337044326],
                        member_count: 1,

                        last_update_type: 'batch',
                        update_count: Math.floor(Math.random() * 100),
                        needs_recompute: false,
                        created_at: now,
                        updated_at: now
                    })

                if (insertError) {
                    console.error('Insert error:', insertError)
                    throw insertError
                }
            } else {
                // If record exists, update it
                const { error: updateError } = await supabase
                    .from('district_clusters')
                    .update({
                        last_update_type: 'batch',
                        update_count: Math.floor(Math.random() * 100),
                        updated_at: now
                    })
                    .eq('id', existingData.id)

                if (updateError) {
                    console.error('Update error:', updateError)
                    throw updateError
                }
            }

            // Create cluster update record
            const { error: insertError } = await supabase
                .from('cluster_updates')
                .insert({
                    district_id: '350931',
                    update_type: 'batch',
                    old_value: {
                        centroids: [
                            [0.1149544318834564, 0.1655506656350974, 0.08092454337044326],
                            [0.2149544318834564, 0.2655506656350974, 0.18092454337044326],
                            [0.3149544318834564, 0.3655506656350974, 0.28092454337044326]
                        ]
                    },
                    new_value: {
                        centroids: [
                            [0.2149544318834564, 0.2655506656350974, 0.18092454337044326],
                            [0.3149544318834564, 0.3655506656350974, 0.28092454337044326],
                            [0.4149544318834564, 0.4655506656350974, 0.38092454337044326]
                        ]
                    },
                    processed: false,
                    timestamp: now
                })

            if (insertError) {
                console.error('Cluster update insert error:', insertError)
                throw insertError
            }

            console.log('Batch update simulated successfully')
        } catch (error) {
            console.error('Error simulating batch update:', error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="fixed bottom-4 right-4 flex flex-col gap-2 z-50">
            <Button
                onClick={updateAllDistricts}
                disabled={isLoading}
                className="bg-purple-500 hover:bg-purple-600"
            >
                Update All Districts
            </Button>
            <Button
                onClick={simulateIncrementalUpdate}
                disabled={isLoading}
                className="bg-emerald-500 hover:bg-emerald-600"
            >
                Test Incremental Update
            </Button>
            <Button
                onClick={simulateBatchUpdate}
                disabled={isLoading}
                className="bg-blue-500 hover:bg-blue-600"
            >
                Test Batch Update
            </Button>
        </div>
    )
} 