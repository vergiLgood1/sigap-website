import React from 'react'
import { Card, CardContent } from "@/app/_components/ui/card"

interface ISystemStatusCardProps {
    title: string
    status: string
    statusIcon: React.ReactNode
    statusColor: string
    updatedTime?: string
    bgColor?: string
    borderColor?: string
}

export function SystemStatusCard({
    title,
    status,
    statusIcon,
    statusColor,
    updatedTime,
    bgColor = "bg-sidebar-accent/20",
    borderColor = "border-sidebar-border"
}: ISystemStatusCardProps) {
    return (
        <Card className={`${bgColor} border ${borderColor} hover:border-sidebar-border/80 transition-colors`}>
            <CardContent className="p-3 text-xs">
                <div className="font-medium mb-1.5">{title}</div>
                <div className={`flex items-center gap-1.5 ${statusColor} text-base font-semibold`}>
                    {statusIcon}
                    <span>{status}</span>
                </div>
                {updatedTime && (
                    <div className="text-sidebar-foreground/50 text-[10px] mt-1.5">{updatedTime}</div>
                )}
            </CardContent>
        </Card>
    )
}
