import React from 'react'
import { Card, CardContent } from "@/app/_components/ui/card"

interface IStatCardProps {
    title: string
    value: string
    change: string
    isPositive?: boolean
    icon?: React.ReactNode
    bgColor?: string
}

export function StatCard({
    title,
    value,
    change,
    isPositive = false,
    icon,
    bgColor = "bg-white/10"
}: IStatCardProps) {
    return (
        <Card className={`${bgColor} hover:bg-white/15 border-0 text-white shadow-none transition-colors`}>
            <CardContent className="p-3">
                <div className="flex justify-between items-center">
                    <span className="text-xs text-white/70 flex items-center gap-1.5">
                        {icon}
                        {title}
                    </span>
                    <span className={`text-xs ${isPositive ? "text-green-400" : "text-amber-400"}`}>{change}</span>
                </div>
                <div className="text-xl font-bold mt-1.5">{value}</div>
            </CardContent>
        </Card>
    )
}
