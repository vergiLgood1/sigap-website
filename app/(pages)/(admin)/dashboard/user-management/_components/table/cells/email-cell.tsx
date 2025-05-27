// cells/email-cell.tsx
"use client"

import React from "react"
import Image from "next/image"
import { Avatar } from "@/app/_components/ui/avatar"
import { IUserSchema } from "@/src/entities/models/users/users.model"

interface EmailCellProps {
    user: IUserSchema
}

export const EmailCell: React.FC<EmailCellProps> = ({ user }) => {
    return (
        <div className="flex items-center gap-2">
            <Avatar className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                {user.profile?.avatar ? (
                    <Image
                        src={user.profile.avatar || "/placeholder.svg"}
                        alt="Avatar"
                        className="w-full h-full rounded-full"
                        width={32}
                        height={32}
                    />
                ) : (
                    user.email?.[0]?.toUpperCase() || "?"
                )}
            </Avatar>
            <div>
                <div className="font-medium">{user.email || "No email"}</div>
                <div className="text-xs text-muted-foreground">{user.profile?.username}</div>
            </div>
        </div>
    )
}