"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/app/_components/ui/badge";

// Create columns for the crime summary table
export const createCrimeColumns = (): ColumnDef<any>[] => {
    return [
        {
            accessorKey: "id",
            header: "ID",
        },
        {
            accessorKey: "districts.name",
            header: "District",
        },
        {
            accessorKey: "year",
            header: "Year",
        },
        {
            accessorKey: "month",
            header: "Month",
        },
        {
            accessorKey: "number_of_crime",
            header: "Total Crimes",
        },
        {
            accessorKey: "crime_cleared",
            header: "Cleared",
        },
        {
            accessorKey: "level",
            header: "Risk Level",
            cell: ({ row }) => {
                const level = row.getValue("level") as string;
                return (
                    <Badge variant={
                        level === "critical" ? "destructive" :
                            level === "high" ? "destructive" :
                                level === "medium" ? "secondary" : "outline"
                    }>
                        {level.charAt(0).toUpperCase() + level.slice(1)}
                    </Badge>
                );
            },
        },
        {
            accessorKey: "source_type",
            header: "Source Type",
        },
    ];
};

// Create columns for crime incidents table
export const createIncidentColumns = (): ColumnDef<any>[] => {
    return [
        {
            accessorKey: "id",
            header: "ID",
        },
        {
            accessorKey: "crime_categories.name",
            header: "Category",
        },
        {
            accessorKey: "locations",
            header: "Location",
            cell: ({ row }) => {
                const location = row.original.locations;
                return `${location?.districts?.name || "Unknown"}, ${location?.address || "No address"}`;
            },
        },
        {
            accessorKey: "timestamp",
            header: "Date",
            cell: ({ row }) => {
                const date = row.getValue("timestamp") as string;
                return new Date(date).toLocaleDateString();
            },
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                const status = row.getValue("status") as string;
                return (
                    <Badge variant={
                        status === "resolved" ? "default" :
                            status === "under_investigation" ? "secondary" :
                                status === "open" ? "default" : "outline"
                    }>
                        {status ? status.replace("_", " ") : "unknown"}
                    </Badge>
                );
            },
        },
        {
            accessorKey: "victim_count",
            header: "Victims",
        },
    ];
};

// Create columns for incident logs table
export const createIncidentLogColumns = (): ColumnDef<any>[] => {
    return [
        {
            accessorKey: "id",
            header: "ID",
            cell: ({ row }) => {
                const id = row.getValue("id") as string;
                return id.substring(0, 8) + "...";
            },
        },
        {
            accessorKey: "crime_categories.name",
            header: "Category",
        },
        {
            accessorKey: "user",
            header: "Reporter",
            cell: ({ row }) => {
                const user = row.original.user;
                return `${user?.profile?.first_name || ""} ${user?.profile?.last_name || ""}`;
            },
        },
        {
            accessorKey: "locations.districts.name",
            header: "Location",
        },
        {
            accessorKey: "time",
            header: "Date",
            cell: ({ row }) => {
                const date = row.getValue("time") as string;
                return new Date(date).toLocaleDateString();
            },
        },
        {
            accessorKey: "source",
            header: "Source",
        },
        {
            accessorKey: "verified",
            header: "Verified",
            cell: ({ row }) => {
                const verified = row.getValue("verified") as boolean;
                return (
                    <Badge variant={verified ? "default" : "outline"}
                        className={verified ? "bg-green-500 text-white" : ""}>
                        {verified ? "Verified" : "Pending"}
                    </Badge>
                );
            },
        },
    ];
};
