// cells/created-at-cell.tsx
"use client"

import React from "react"

interface CreatedAtCellProps {
    createdAt: string | null | undefined
}

export const CreatedAtCell: React.FC<CreatedAtCellProps> = ({ createdAt }) => {
    return <>{createdAt ? new Date(createdAt).toLocaleString() : "N/A"}</>
}