import React from "react";
import { FilePlus, FileCheck, ChartBar } from "lucide-react";
import { ActionToolbar } from "@/app/_components/ui/action-toolbar";
import { ActionItem } from "@/app/_components/ui/action-menu";

interface CrimeActionMenuProps {
    onCreateNewIncident: () => void;
    onVerifyIncidents: () => void;
    onGenerateReport: () => void;
    activeFilterCount?: number;
    clearFilters?: () => void;
}

export const CrimeActionMenu: React.FC<CrimeActionMenuProps> = ({
    onCreateNewIncident,
    onVerifyIncidents,
    onGenerateReport,
    activeFilterCount = 0,
    clearFilters,
}) => {
    const actionItems: ActionItem[] = [
        {
            label: "Create Incident",
            icon: FilePlus,
            onClick: onCreateNewIncident
        },
        {
            label: "Verify Incidents",
            icon: FileCheck,
            onClick: onVerifyIncidents
        },
        {
            label: "Generate Report",
            icon: ChartBar,
            onClick: onGenerateReport
        }
    ];

    return (
        <ActionToolbar
            primaryAction={{
                label: "Crime Actions",
                variant: "default",
                items: actionItems
            }}
            filter={clearFilters ? {
                show: true,
                count: activeFilterCount,
                onClick: clearFilters
            } : undefined}
        />
    );
};
