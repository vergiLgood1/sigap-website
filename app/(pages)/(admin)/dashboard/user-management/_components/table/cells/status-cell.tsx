// cells/status-cell.tsx
"use client"

import React from "react"
import { Badge } from "@/app/_components/ui/badge"
import { IUserSchema } from "@/src/entities/models/users/users.model"

interface StatusCellProps {
    user: IUserSchema
}

export const StatusCell: React.FC<StatusCellProps> = ({ user }) => {
    if (user.banned_until) {
        return <Badge variant="destructive">Banned</Badge>
    }
    if (!user.email_confirmed_at) {
        return <Badge variant="outline">Unconfirmed</Badge>
    }
    return <Badge variant="default">Active</Badge>
}