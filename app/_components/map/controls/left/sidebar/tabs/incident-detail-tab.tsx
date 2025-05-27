import React from "react";
import { ArrowLeft, Calendar, Clock, MapPin, AlertCircle, FileText, Shield, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardFooter, CardTitle } from "@/app/_components/ui/card";
import { Button } from "@/app/_components/ui/button";
import { Badge } from "@/app/_components/ui/badge";
import { Separator } from "@/app/_components/ui/separator";
import { format } from 'date-fns';
import Image from "next/image";
import { cn } from "@/app/_lib/utils";


// Use the same IIncident interface as in incidents-tab.tsx
interface IIncident {
    id: string;
    category: string;
    address: string;
    timestamp: string | Date;
    district?: string;
    severity?: number | "Low" | "Medium" | "High" | "Critical";
    status?: string | true;
    description?: string;
    location?: {
        lat: number;
        lng: number;
    };
    reporter?: string;
    reporter_id?: string;
    images?: string[];
    responding_unit?: string;
    resolution?: string;
    created_at?: string | Date;
    updated_at?: string | Date;
}

interface IIncidentDetailTabProps {
    incident: IIncident;
    onBack: () => void;
}


export default function IncidentDetailTab({ incident, onBack }: IIncidentDetailTabProps) {
    // Format the timestamp for display
    const formatDate = (date: string | Date) => {
        if (!date) return "Unknown date";
        try {
            const dateObj = typeof date === 'string' ? new Date(date) : date;
            return format(dateObj, 'MMMM d, yyyy - HH:mm');
        } catch (error) {
            return "Invalid date";
        }
    };

    const normalizeSeverity = (sev: number | "Low" | "Medium" | "High" | "Critical" | undefined): string => {
        if (typeof sev === "string") return sev;
        switch (sev) {
            case 4:
                return "Critical";
            case 3:
                return "High";
            case 2:
                return "Medium";
            case 1:
                return "Low";
            default:
                return "Low";
        }
    }

    const getSeverityGradient = (severity: string) => {
        switch (severity) {
            case "Critical":
                return "bg-gradient-to-r from-purple-500/10 to-purple-600/5 dark:from-purple-900/20 dark:to-purple-800/10"
            case "High":
                return "bg-gradient-to-r from-red-500/10 to-red-600/5 dark:from-red-900/20 dark:to-red-800/10"
            case "Medium":
                return "bg-gradient-to-r from-yellow-500/10 to-yellow-600/5 dark:from-yellow-900/20 dark:to-yellow-800/10"
            case "Low":
            default:
                return "bg-gradient-to-r from-blue-500/10 to-blue-600/5 dark:from-blue-900/20 dark:to-blue-800/10"
        }
    }

    const getSeverityIconColor = (severity: number) => {
        switch (severity) {
            case 4:
                return "text-purple-600 dark:text-purple-400"
            case 3:
                return "text-red-500 dark:text-red-400"
            case 2:
                return "text-yellow-600 dark:text-yellow-400"
            case 1:
            default:
                return "text-blue-500 dark:text-blue-400"
        }
    }

    const getStatusInfo = (status?: string | true) => {
        if (status === true) {
            return {
                text: "Verified",
                color: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400"
            };
        }

        if (!status) {
            return {
                text: "Pending",
                color: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400"
            };
        }

        switch (status.toLowerCase()) {
            case "resolved":
                return {
                    text: "Resolved",
                    color: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400"
                };
            case "in progress":
                return {
                    text: "In Progress",
                    color: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400"
                };
            case "pending":
                return {
                    text: "Pending",
                    color: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400"
                };
            default:
                return {
                    text: status.charAt(0).toUpperCase() + status.slice(1),
                    color: "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/30 dark:text-gray-400"
                };
        }
    };
    // Get appropriate color for severity badge
    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case "Critical": return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400";
            case "High": return "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400";
            case "Medium": return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400";
            case "Low": return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400";
            default: return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400";
        }
    };


    const severityText = normalizeSeverity(incident.severity);
    const severityColor = getSeverityColor(severityText);
    const statusInfo = getStatusInfo(incident.status);

    return (
        <>
            {/* Header with back button */}
            <div className="flex items-center justify-between mb-4">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onBack}
                    className="h-8 gap-1 text-sidebar-foreground/70 hover:text-sidebar-foreground"
                >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Back to incidents</span>
                </Button>
            </div>

            {/* Main incident info card */}
            <Card
                className={cn(
                    "overflow-hidden transition-all duration-300 border",
                    getSeverityGradient(severityText),
                    "hover:shadow-md hover:translate-y-[-2px]",
                    "group cursor-pointer",
                )}>
                <CardHeader className="p-4 pb-2">
                    <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{incident.category}</CardTitle>
                        <div className="flex gap-2">
                            <Badge variant="outline" className={severityColor}>
                                {severityText}
                            </Badge>
                            <Badge variant="outline" className={statusInfo.color}>
                                {statusInfo.text}
                            </Badge>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="p-4 pt-2">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                            <span className="text-sm">{formatDate(incident.timestamp)}</span>
                        </div>

                        <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                            <div className="text-sm flex-1">
                                <p>{incident.address}</p>
                                {incident.district && <p className="text-muted-foreground">{incident.district}</p>}
                                {incident.location && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Coordinates: {incident.location.lat.toFixed(6)}, {incident.location.lng.toFixed(6)}
                                    </p>
                                )}
                            </div>
                        </div>

                        <Separator />

                        <div className="space-y-2">
                            <h4 className="font-medium flex items-center gap-1.5">
                                <FileText className="h-4 w-4" /> Description
                            </h4>
                            <p className="text-sm whitespace-pre-wrap">
                                {incident.description || "No description provided."}
                            </p>
                        </div>

                        {(incident.reporter || incident.reporter_id) && (
                            <>
                                <Separator />
                                <div className="flex items-center gap-2 text-sm">
                                    <User className="h-4 w-4 text-muted-foreground shrink-0" />
                                    <span>Reported by: {incident.reporter || "Anonymous"}</span>
                                </div>
                            </>
                        )}

                        {incident.responding_unit && (
                            <div className="flex items-center gap-2 text-sm">
                                <Shield className="h-4 w-4 text-muted-foreground shrink-0" />
                                <span>Responding unit: {incident.responding_unit}</span>
                            </div>
                        )}
                    </div>
                </CardContent>

                <CardFooter className="p-4 pt-2 flex justify-between text-xs text-muted-foreground">
                    <span>ID: {incident.id}</span>
                    {incident.created_at && (
                        <span>Created: {formatDate(incident.created_at)}</span>
                    )}
                </CardFooter>
            </Card>

            {/* Display resolution information if available */}
            {incident.resolution && (
                <Card className="border border-border bg-card">
                    <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-sm flex items-center gap-1.5">
                            <AlertCircle className="h-4 w-4 text-green-500" />
                            Resolution
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-2">
                        <p className="text-sm whitespace-pre-wrap">{incident.resolution}</p>
                    </CardContent>
                </Card>
            )}

            {/* Display images if available */}
            {incident.images && incident.images.length > 0 && (
                <Card className="border border-border bg-card mt-4">
                    <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-sm">Evidence Images</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-2">
                        <div className="grid grid-cols-2 gap-2">
                            {incident.images.map((image, index) => (
                                <div key={index} className="aspect-square bg-muted rounded-md overflow-hidden">
                                    <Image
                                        src={image}
                                        alt={`Evidence ${index + 1}`}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </>
    );
}
