// cells/phone-cell.tsx
"use client"

import React from "react"

interface PhoneCellProps {
    phone: string | null | undefined
}

export const PhoneCell: React.FC<PhoneCellProps> = ({ phone }) => {
    return <>{phone || "-"}</>
}