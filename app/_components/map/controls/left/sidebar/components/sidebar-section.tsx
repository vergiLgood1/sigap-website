import React from 'react'

interface ISidebarSectionProps {
    title: string
    children: React.ReactNode
    icon?: React.ReactNode
}

export function SidebarSection({ title, children, icon }: ISidebarSectionProps) {
    return (
        <div>
            <h3 className="text-sm font-medium text-sidebar-foreground/90 mb-3 flex items-center gap-2 pl-1">
                {icon}
                {title}
            </h3>
            {children}
        </div>
    )
}
