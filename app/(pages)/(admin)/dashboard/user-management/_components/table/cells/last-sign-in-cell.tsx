// cells/last-sign-in-cell.tsx
"use client"

import React from "react"

interface LastSignInCellProps {
    lastSignInAt: string | null | undefined
}

export const LastSignInCell: React.FC<LastSignInCellProps> = ({ lastSignInAt }) => {
    return <>{lastSignInAt ? new Date(lastSignInAt).toLocaleString() : "Never"}</>
}