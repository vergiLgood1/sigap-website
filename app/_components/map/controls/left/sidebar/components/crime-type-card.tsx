import React from 'react'
import { Card, CardContent } from "@/app/_components/ui/card"
import { crime_categories } from '@prisma/client'

export interface ICrimeTypeCardProps {
    type: string
    count: number
    percentage: number
}

export function CrimeTypeCard({ type, count, percentage }: ICrimeTypeCardProps) {
    return (
        <Card className="bg-white/5 hover:bg-white/10 border-0 text-white shadow-none transition-colors">
            <CardContent className="p-3">
                <div className="flex justify-between items-center">
                    <span className="font-medium">{type}</span>
                    <span className="text-sm text-white/70">{count} cases</span>
                </div>
                <div className="mt-2 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                        className="bg-gradient-to-r from-primary to-primary/80 h-full rounded-full"
                        style={{ width: `${percentage}%` }}
                    ></div>
                </div>
                <div className="mt-1 text-xs text-white/70 text-right">{percentage}%</div>
            </CardContent>
        </Card>
    )
}
