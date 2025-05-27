"use client"

import { useGetCrimes } from "../../_queries/queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/_components/ui/card";
import { useRouter } from "next/navigation";
import { ArrowLeft, BarChart3, Calendar, MapPin, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { Badge } from "@/app/_components/ui/badge";
import { Button } from "@/app/_components/ui/button";
import { Progress } from "@/app/_components/ui/progress";
import StaticMap from "@/app/_components/map/StaticMap";
import { MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/app/_components/ui/dropdown-menu";
import { Skeleton } from "@/app/_components/ui/skeleton";

export function CrimeSummaryDetail({ id }: { id: string }) {
    const { data: crimes, isLoading, error } = useGetCrimes();
    const router = useRouter();

    // Find the specific crime by ID
    const crime = crimes?.find(c => c.id === id);

    if (isLoading) return (
        <div className="p-6">
            <div className="space-y-6">
                <div className="flex items-center justify-between gap-2 mb-4">
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
    if (error) return <div className="p-4 text-red-500">Error loading crime summary</div>;
    if (!crime) return <div className="p-4 text-center">Crime summary not found</div>;

    const clearanceRate = crime.number_of_crime > 0 ? (crime.crime_cleared / crime.number_of_crime) * 100 : 0;
    const pendingCases = crime.number_of_crime - crime.crime_cleared;

    const getCrimeLevel = (level: string) => {
        switch (level) {
            case 'high':
                return { color: 'bg-red-500', icon: AlertTriangle, text: 'High Risk' };
            case 'medium':
                return { color: 'bg-yellow-500', icon: Clock, text: 'Medium Risk' };
            case 'low':
                return { color: 'bg-green-500', icon: CheckCircle, text: 'Low Risk' };
            default:
                return { color: 'bg-gray-500', icon: BarChart3, text: 'Unknown' };
        }
    };

    const levelInfo = getCrimeLevel(crime.level);
    const LevelIcon = levelInfo.icon;

    const getMonthName = (month: number | null | undefined) => {
        console.log('Month value:', month, 'Type:', typeof month); // Debug log

        if (month === null || month === undefined || month === 0) return 'Unknown';

        // Ensure month is a number and within valid range
        const monthNum = Number(month);
        if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) return 'Unknown';

        const months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];

        return months[monthNum - 1] || 'Unknown';
    };

    console.log('Crime data:', {
        id: crime.id,
        month: crime.month,
        year: crime.year,
        district_id: crime.district_id,
        monthName: getMonthName(crime.month)
    }); // Debug log

    return (
        <div className="space-y-6 p-6">
            {/* Back and Actions */}
            <div className="flex items-center justify-between gap-2 mb-4">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push("/dashboard/crime-management/crime-incident")}
                    className="flex items-center gap-2"
                >
                    <ArrowLeft size={16} />
                    Back to Crime Summary
                </Button>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon">
                            <MoreHorizontal className="w-4 h-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => router.push(`/dashboard/crime-management/crime-incident/${id}?type=crime-summary&action=update`)}>
                            Update
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => alert(`Delete Crime Summary: ${id}`)} className="text-destructive">
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Header Section */}
            <Card className="border-l-4 border-l-blue-500">
                <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                                <BarChart3 className="h-4 w-4" />
                                <span>Crime Statistics Summary</span>
                            </div>

                            <h2 className="text-2xl font-bold mb-2">
                                {crime.districts?.name || `District ${crime.district_id}`} - {getMonthName(crime.month)} {crime.year || 'Unknown Year'}
                            </h2>

                            <div className="flex flex-wrap items-center gap-3 text-muted-foreground">
                                <div className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4" />
                                    {getMonthName(crime.month)} {crime.year || 'Unknown Year'}
                                </div>
                                <div className="flex items-center gap-1">
                                    <MapPin className="h-4 w-4" />
                                    {crime.districts?.name || `District ${crime.district_id || 'Unknown'}`}
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col md:items-end gap-2">
                            <Badge
                                variant="outline"
                                className={`${levelInfo.color} text-white flex items-center gap-1 px-3 py-1 min-w-32 justify-center`}
                            >
                                <LevelIcon size={14} />
                                {levelInfo.text}
                            </Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Crime Statistics Overview */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <BarChart3 className="h-5 w-5" />
                                Crime Statistics Overview
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="text-center p-4 bg-blue-50 rounded-lg">
                                    <div className="text-2xl font-bold text-blue-600">
                                        {crime.number_of_crime}
                                    </div>
                                    <div className="text-sm text-muted-foreground">Total Cases</div>
                                </div>
                                <div className="text-center p-4 bg-green-50 rounded-lg">
                                    <div className="text-2xl font-bold text-green-600">
                                        {crime.crime_cleared}
                                    </div>
                                    <div className="text-sm text-muted-foreground">Cases Cleared</div>
                                </div>
                                <div className="text-center p-4 bg-orange-50 rounded-lg">
                                    <div className="text-2xl font-bold text-orange-600">
                                        {pendingCases}
                                    </div>
                                    <div className="text-sm text-muted-foreground">Pending Cases</div>
                                </div>
                            </div>

                            {/* Clearance Rate Progress */}
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium">Case Clearance Rate</span>
                                    <span className="text-sm text-muted-foreground">{clearanceRate.toFixed(1)}%</span>
                                </div>
                                <Progress value={clearanceRate} className="h-3" />
                            </div>

                            {/* Crime Score */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h4 className="text-sm font-medium text-muted-foreground">Crime Score</h4>
                                    <p className="text-lg font-semibold">{crime.score}</p>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-muted-foreground">Average Crime Rate</h4>
                                    <p className="text-lg font-semibold">{crime.avg_crime}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Trends and Analysis */}
                    <Card>
                        <CardHeader className="pb-1">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <TrendingUp className="h-5 w-5" />
                                Analysis & Trends
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Risk Level Analysis */}
                            <div className="p-4 border rounded-lg">
                                <h4 className="font-medium mb-2">Risk Level Assessment</h4>
                                <div className="flex items-center gap-2 mb-2">
                                    <LevelIcon className="h-5 w-5" />
                                    <span className="font-medium">{levelInfo.text}</span>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    {crime.level === 'high' && "This area requires immediate attention with increased patrol and community engagement."}
                                    {crime.level === 'medium' && "Moderate crime activity detected. Regular monitoring and preventive measures recommended."}
                                    {crime.level === 'low' && "Crime activity is within acceptable limits. Continue current security measures."}
                                </p>
                            </div>

                            {/* Clearance Rate Analysis */}
                            <div className="p-4 border rounded-lg">
                                <h4 className="font-medium mb-2">Case Resolution Performance</h4>
                                <div className="flex items-center gap-2 mb-2">
                                    {clearanceRate >= 75 ? (
                                        <TrendingUp className="h-5 w-5 text-green-500" />
                                    ) : clearanceRate >= 50 ? (
                                        <Clock className="h-5 w-5 text-yellow-500" />
                                    ) : (
                                        <TrendingDown className="h-5 w-5 text-red-500" />
                                    )}
                                    <span className="font-medium">
                                        {clearanceRate >= 75 ? "Excellent" : clearanceRate >= 50 ? "Average" : "Needs Improvement"}
                                    </span>
                                    <span className="text-sm text-muted-foreground">({clearanceRate.toFixed(1)}%)</span>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    {clearanceRate >= 75 && "Outstanding case resolution rate. Investigative team performing excellently."}
                                    {clearanceRate >= 50 && clearanceRate < 75 && "Moderate case resolution rate. Consider resource allocation review."}
                                    {clearanceRate < 50 && "Below average case resolution rate. Additional resources and training may be needed."}
                                </p>
                            </div>
                            {/* Show static map if coordinates available */}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-1">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <MapPin className="h-5 w-5" />
                                Geographic Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">

                            {crime.districts?.geographics[0]?.latitude && crime.districts?.geographics[0]?.longitude ? (
                                <div className="mt-1">
                                    <StaticMap
                                        latitude={crime.districts.geographics[0].latitude}
                                        longitude={crime.districts.geographics[0].longitude}
                                        width="100%"
                                        height={180}
                                        markerColor="2563eb"
                                        className="w-full rounded-md"
                                    />
                                </div>
                            ) : null}
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    {/* District Information */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <MapPin className="h-5 w-5" />
                                District Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div>
                                    <h4 className="text-sm font-medium text-muted-foreground">District Name</h4>
                                    <p className="mt-1 font-medium">{crime.districts?.name || `District ${crime.district_id || 'Unknown'}`}</p>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-muted-foreground">District ID</h4>
                                    <p className="mt-1 font-mono text-sm">{crime.district_id || 'Unknown'}</p>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-muted-foreground">Period</h4>
                                    <p className="mt-1">{getMonthName(crime.month)} {crime.year || 'Unknown Year'}</p>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-muted-foreground">Data Collection Method</h4>
                                    <p className="mt-1 capitalize">{crime.method || 'Unknown'}</p>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-muted-foreground">Source Type</h4>
                                    <p className="mt-1 uppercase">{crime.source_type || "Unknown"}</p>
                                </div>

                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg">Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Button variant="outline" className="w-full justify-start">
                                <BarChart3 className="h-4 w-4 mr-2" />
                                View Detailed Analytics
                            </Button>
                            <Button variant="outline" className="w-full justify-start">
                                <MapPin className="h-4 w-4 mr-2" />
                                View on Map
                            </Button>
                            <Button variant="outline" className="w-full justify-start">
                                <Calendar className="h-4 w-4 mr-2" />
                                Compare with Previous Period
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Metadata */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg">Record Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div>
                                    <h4 className="text-sm font-medium text-muted-foreground">Record ID</h4>
                                    <p className="mt-1 font-mono text-sm">{crime.id}</p>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-muted-foreground">Created</h4>
                                    <p className="mt-1 text-sm">{crime.created_at ? new Date(crime.created_at).toLocaleDateString() : 'N/A'}</p>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-muted-foreground">Last Updated</h4>
                                    <p className="mt-1 text-sm">{crime.updated_at ? new Date(crime.updated_at).toLocaleDateString() : 'N/A'}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}