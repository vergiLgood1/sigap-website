"use client"

import { useGetIncidentLogDetail, useVerifyIncidentLog } from "../../_queries/queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/_components/ui/card";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowLeft, Camera, CheckCircle, Clock, FileText, Globe, InfoIcon, Mail, Map, MapPin, MessageSquare, MoreHorizontal, Phone, Smartphone, User } from "lucide-react";
import { Badge } from "@/app/_components/ui/badge";
import { Button } from "@/app/_components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/app/_components/ui/dropdown-menu";
import StaticMap from "@/app/_components/map/StaticMap";
import { Skeleton } from "@/app/_components/ui/skeleton";

export function IncidentLogDetail({ id }: { id: string }) {
    const { data: log, isLoading, error } = useGetIncidentLogDetail(id);
    const verifyMutation = useVerifyIncidentLog();
    const router = useRouter();

    if (isLoading) return (
        <div className="p-6">
            <div className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                    <Skeleton className="h-8 w-40 rounded" />
                    <Skeleton className="h-8 w-10 rounded" />
                </div>
                <Skeleton className="h-24 w-full rounded" />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <Skeleton className="h-64 w-full rounded" />
                        <Skeleton className="h-64 w-full rounded" />
                        <Skeleton className="h-48 w-full rounded" />
                    </div>
                    <div className="space-y-6">
                        <Skeleton className="h-64 w-full rounded" />
                        <Skeleton className="h-48 w-full rounded" />
                        <Skeleton className="h-48 w-full rounded" />
                    </div>
                </div>
            </div>
        </div>
    );
    if (error) return <div className="p-4 text-red-500">Error loading incident log details</div>;
    if (!log) return <div className="p-4 text-center">Incident log not found</div>;

    const handleVerify = () => {
        verifyMutation.mutate(id);
    };

    const getStatusColor = () => {
        if (log.verified) return "bg-green-500";
        return "bg-amber-500";
    };

    const getStatusText = () => {
        if (log.verified) return "Verified";
        return "Pending Verification";
    };

    const getSourceIcon = () => {
        switch (log.source?.toLowerCase()) {
            case 'mobile app':
                return <Smartphone className="w-4 h-4" />;
            case 'web':
                return <Globe className="w-4 h-4" />;
            case 'call center':
                return <Phone className="w-4 h-4" />;
            default:
                return <MessageSquare className="w-4 h-4" />;
        }
    };

    const formatDate = (dateInput: string | Date | null) => {
        if (!dateInput) return "N/A";
        const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
        return date.toLocaleString("id-ID", {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="space-y-6 p-6">
            {/* Back and Actions */}
            <div className="flex items-center justify-between mb-4">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push("/dashboard/crime-management/crime-incident")}
                    className="flex items-center gap-2"
                >
                    <ArrowLeft size={16} />
                    Back to Incident Logs
                </Button>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon">
                            <MoreHorizontal className="w-4 h-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => router.push(`/dashboard/crime-management/crime-incident/${id}?type=incident-log&action=update`)}>
                            Update
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => alert(`Delete Incident Log: ${id}`)} className="text-destructive">
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Enhanced Header Section */}
            <Card className="border-l-4" style={{ borderLeftColor: log.verified ? "#22c55e" : "#f59e0b" }}>
                <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                                <AlertCircle className="h-4 w-4" />
                                <span>Incident Report</span>
                                <span>•</span>
                                <div className="flex items-center gap-1">
                                    {getSourceIcon()}
                                    <span>Reported via {log.source || "Unknown"}</span>
                                </div>
                            </div>

                            <h2 className="text-2xl font-bold mb-2">
                                {log.crime_categories?.name || "Unknown Incident"}
                            </h2>

                            <div className="flex flex-wrap items-center gap-3 text-muted-foreground">
                                <div className="flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    {formatDate(log.time)}
                                </div>

                                <div className="flex items-center gap-1">
                                    <MapPin className="h-4 w-4" />
                                    {log.locations?.districts?.name || "Unknown Location"}
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col md:items-end gap-2">
                            <Badge
                                variant="outline"
                                className={`${getStatusColor()} text-white flex items-center gap-1 px-3 py-1 min-w-24 justify-center`}
                            >
                                {log.verified ?
                                    <CheckCircle size={14} /> :
                                    <AlertCircle size={14} />
                                }
                                {getStatusText()}
                            </Badge>

                            {!log.verified && (
                                <Button
                                    onClick={handleVerify}
                                    variant="default"
                                    disabled={verifyMutation.isPending}
                                    className="flex items-center gap-2 mt-2"
                                >
                                    <CheckCircle size={16} />
                                    Verify & Create Case
                                </Button>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Incident Details Section */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Incident Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="prose max-w-none">
                                <p>{log.description || "No description provided."}</p>
                            </div>

                            {/* Category Tags */}
                            <div className="flex flex-wrap gap-2 mt-4">
                                <Badge variant="outline" className="bg-primary/10 text-primary">
                                    {log.crime_categories?.type || "Uncategorized"}
                                </Badge>
                                {/* If you have tags, map them here, e.g. log.tags?.map(...) */}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Location Section with Map */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <MapPin className="h-5 w-5" />
                                Location
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h4 className="text-sm font-medium text-muted-foreground">Address</h4>
                                    <p className="mt-1">{log.locations?.address || "No address provided"}</p>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-muted-foreground">District</h4>
                                    <p className="mt-1">{log.locations?.districts?.name || "Unknown district"}</p>
                                </div>
                                {log.locations?.latitude && log.locations?.longitude && (
                                    <>
                                        <div>
                                            <h4 className="text-sm font-medium text-muted-foreground">Latitude</h4>
                                            <p className="mt-1">{log.locations.latitude}</p>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-medium text-muted-foreground">Longitude</h4>
                                            <p className="mt-1">{log.locations.longitude}</p>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Static Map Display */}
                            <div className="mt-4">
                                {log.locations?.latitude && log.locations?.longitude ? (
                                    <StaticMap
                                        latitude={log.locations.latitude}
                                        longitude={log.locations.longitude}
                                        width="100%"
                                        height={300}
                                        zoom={16}
                                        markerColor="e11d48"
                                        showCoordinates={true}
                                        className="border border-border"
                                    />
                                ) : (
                                    <div className="flex flex-col items-center justify-center w-full h-[300px] bg-muted rounded-md border">
                                        <Map className="h-8 w-8 text-muted-foreground mb-2" />
                                        <span className="text-sm text-muted-foreground">Location coordinates not available</span>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Evidence Gallery Section */}
                    {log.evidence && log.evidence.length > 0 && (
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Camera className="h-5 w-5" />
                                    Evidence ({log.evidence.length})
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                    {log.evidence.map((item: any) => (
                                        <div key={item.id} className="group cursor-pointer relative">
                                            <div className="aspect-square rounded-md overflow-hidden bg-muted flex items-center justify-center border">
                                                {item.type === 'image' ? (
                                                    <img
                                                        src={item.url}
                                                        alt={item.caption || "Evidence"}
                                                        className="w-full h-full object-cover rounded-md group-hover:scale-105 transition-transform"
                                                    />
                                                ) : (
                                                    <div className="flex flex-col items-center justify-center p-4">
                                                        <FileText size={32} className="text-muted-foreground mb-2" />
                                                        <span className="text-xs text-center">{item.type}</span>
                                                    </div>
                                                )}
                                            </div>
                                            {item.caption && (
                                                <div className="mt-2">
                                                    <span className="text-xs truncate block">{item.caption}</span>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                <div className="space-y-6">
                    {/* Reporter Information Section */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Reporter Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-3 mb-4">
                                {log.user?.profile?.avatar ? (
                                    <img
                                        src={log.user.profile.avatar}
                                        alt="Reporter"
                                        className="w-12 h-12 rounded-full object-cover border-2 border-primary/20"
                                    />
                                ) : (
                                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                                        <User size={24} />
                                    </div>
                                )}
                                <div>
                                    <p className="font-medium text-lg">
                                        {log.user?.profile?.first_name} {log.user?.profile?.last_name || ""}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {log.user?.email && (
                                    <div className="flex items-center gap-2">
                                        <Mail className="h-4 w-4 text-muted-foreground" />
                                        <span>{log.user.email}</span>
                                    </div>
                                )}
                                {log.user?.phone && (
                                    <div className="flex items-center gap-2">
                                        <Phone className="h-4 w-4 text-muted-foreground" />
                                        <span>{log.user.phone}</span>
                                    </div>
                                )}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="mt-2 w-full"
                                    onClick={() => {
                                        // Handle viewing full profile
                                    }}
                                >
                                    View Full Profile
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Status & Metadata Section */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <InfoIcon className="h-5 w-5" />
                                Status & Metadata
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div>
                                    <h4 className="text-sm font-medium text-muted-foreground">Verification Status</h4>
                                    <div className="flex items-center mt-1">
                                        {log.verified ? (
                                            <span className="flex items-center text-green-600">
                                                <CheckCircle size={16} className="mr-2" />
                                                Verified
                                            </span>
                                        ) : (
                                            <span className="flex items-center text-amber-600">
                                                <AlertCircle size={16} className="mr-2" />
                                                Pending Verification
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-muted-foreground">Report Source</h4>
                                    <div className="flex items-center gap-2 mt-1">
                                        {getSourceIcon()}
                                        <span>{log.source || "Unknown"}</span>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-muted-foreground">Report ID</h4>
                                    <p className="mt-1 font-mono text-sm">{log.id}</p>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-muted-foreground">Received</h4>
                                    <p className="mt-1">{formatDate(log.created_at)}</p>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-muted-foreground">Last Updated</h4>
                                    <p className="mt-1">{formatDate(log.updated_at)}</p>
                                </div>
                                {log.verified && (
                                    <div>
                                        <h4 className="text-sm font-medium text-muted-foreground">Verified At</h4>
                                        <p className="mt-1">{formatDate(log.location_id)}</p>
                                    </div>
                                )}

                            </div>
                        </CardContent>
                    </Card>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2">
                        {!log.verified && (
                            <Button
                                onClick={handleVerify}
                                variant="default"
                                disabled={verifyMutation.isPending}
                                className="flex items-center justify-center gap-2 w-full"
                            >
                                <CheckCircle size={16} />
                                Verify & Create Case
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}