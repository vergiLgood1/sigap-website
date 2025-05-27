"use client";

import { use } from "react";
import { useSearchParams } from "next/navigation";

import { IncidentLogDetail } from "../_components/detail-views/incident-log-detail";
import { AlertCircle } from "lucide-react";
import { CrimeIncidentDetail } from "../_components/detail-views/crime-incident-detail";
import { CrimeSummaryDetail } from "../_components/detail-views/crime-summary-detail";

interface DetailPageProps {
    params: Promise<{
        id: string;
    }>;
}

export default function DetailPage({ params }: DetailPageProps) {
    const searchParams = useSearchParams();
    const type = searchParams.get("type");
    const { id } = use(params);

    // Render based on type parameter
    switch (type) {
        case "incident-log":
            return <IncidentLogDetail id={id} />;

        case "crime-incident":
            return <CrimeIncidentDetail id={id} />;

        case "crime-summary":
            return <CrimeSummaryDetail id={id} />;

        default:
            return (
                <div className="flex flex-col items-center justify-center h-96 gap-4">
                    <AlertCircle className="h-10 w-10 text-destructive" />
                    <div className="text-center">
                        <h2 className="text-lg font-semibold">Invalid Detail Type</h2>
                        <p className="text-muted-foreground">
                            Please specify a valid type parameter (incident-log, crime-incident, or crime-summary)
                        </p>
                    </div>
                </div>
            );
    }
}
