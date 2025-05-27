"use client"

import { calculateDistances } from '@/app/(pages)/(admin)/dashboard/crime-management/crime-overview/action'
import { useState, useEffect } from 'react'
import { Skeleton } from '../../ui/skeleton'
import { formatDistance } from '@/app/_utils/map/common'
import { useQuery } from '@tanstack/react-query'


interface DistanceInfoProps {
    unitId?: string
    districtId?: string
    className?: string
}

export default function DistanceInfo({ unitId, districtId, className = '' }: DistanceInfoProps) {

    const { data, isLoading } = useQuery({
        queryKey: ['calculate-distances', unitId, districtId],
        queryFn: () => calculateDistances(unitId, districtId),
    })

    if (isLoading) {
        return (
            <div className={`p-4 rounded bg-white shadow-sm ${className}`}>
                <h3 className="text-lg font-semibold mb-2">Distance Information</h3>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full" />
            </div>
        )
    }

    if (!data) {
        return (
            <div className={`p-4 rounded bg-white shadow-sm ${className}`}>
                <h3 className="text-lg font-semibold mb-2">Distance Information</h3>
                <p className="text-sm text-gray-500">No distance data available</p>
            </div>
        )
    }

    if (!data.length) {
        return (
            <div className={`p-4 rounded bg-white shadow-sm ${className}`}>
                <h3 className="text-lg font-semibold mb-2">Distance Information</h3>
                <p className="text-sm text-gray-500">No distance data available</p>
            </div>
        )
    }

    // Group by unit if we're showing multiple units
    const unitGroups = !unitId ?
        data.reduce((acc, item) => {
            if (!acc[item.unit_code]) {
                acc[item.unit_code] = {
                    name: item.unit_name,
                    incidents: []
                }
            }
            acc[item.unit_code].incidents.push(item)
            return acc
        }, {} as Record<string, { name: string, incidents: any[] }>) :
        null

    return (
        <div className={`p-4 rounded bg-white shadow-sm ${className}`}>
            <h3 className="text-lg font-semibold mb-2">Distance Information</h3>

            {unitId ? (
                // Single unit view
                <div>
                    <h4 className="font-medium text-sm">{data[0]?.unit_name || 'Selected Unit'}</h4>
                    <ul className="mt-2 space-y-2">
                        {data.map(item => (
                            <li key={item.incident_id} className="text-xs flex justify-between border-b pb-1">
                                <span className="font-medium">{item.category_name}</span>
                                <span className="text-gray-600">{formatDistance(item.distance_meters)}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            ) : (
                // Multi-unit view (grouped)
                <div className="space-y-4">
                    {unitGroups && Object.entries(unitGroups).map(([code, unit]) => (
                        <div key={code}>
                            <h4 className="font-medium text-sm">{unit.name}</h4>
                            <ul className="mt-1">
                                {unit.incidents.slice(0, 3).map(item => (
                                    <li key={item.incident_id} className="text-xs flex justify-between border-b pb-1">
                                        <span>{item.category_name}</span>
                                        <span className="text-gray-600">{formatDistance(item.distance_meters)}</span>
                                    </li>
                                ))}
                                {unit.incidents.length > 3 && (
                                    <li className="text-xs text-gray-500 mt-1">
                                        + {unit.incidents.length - 3} more incidents
                                    </li>
                                )}
                            </ul>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
