"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/app/_components/ui/card";
import {
    AlertCircle,
    CheckCircle,
    Clock,
    FileText,
    TrendingDown,
    TrendingUp,
    BarChart3,
    UserCheck
} from "lucide-react";
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip
} from "recharts";
import { useMemo } from "react";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

// Function to group and count data by a specific field
const groupAndCountByField = (data: any[], field: string, limit = 5): { name: string, value: number }[] => {
    if (!data || !data.length) return [];

    const grouped = data.reduce((acc, item) => {
        // Handle nested fields with dot notation
        const fieldParts = field.split('.');
        let value = item;
        for (const part of fieldParts) {
            value = value?.[part];
            if (value === undefined || value === null) break;
        }

        const key = value?.toString() || 'Unknown';

        if (!acc[key]) {
            acc[key] = { name: key, value: 0 };
        }
        acc[key].value += 1;
        return acc;
    }, {});

    // Convert to array and sort by count descending
    return Object.values(grouped)
        .sort((a, b) => (b as { value: number }).value - (a as { value: number }).value)
        .slice(0, limit) as { name: string; value: number; }[];
};

// Function to group and count data by month
const groupByMonth = (data: any[], timestampField: string) => {
    if (!data || !data.length) return [];

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const result = Array(12).fill(0).map((_, i) => ({ name: months[i], count: 0 }));

    data.forEach(item => {
        const date = new Date(item[timestampField]);
        if (!isNaN(date.getTime())) {
            const monthIndex = date.getMonth();
            result[monthIndex].count++;
        }
    });

    // Return only months with data and the three months before
    const monthsWithData = result.filter(m => m.count > 0);
    if (monthsWithData.length === 0) return result.slice(0, 6);

    const lastMonthWithDataIndex = months.indexOf(monthsWithData[monthsWithData.length - 1].name);
    const startIndex = Math.max(0, lastMonthWithDataIndex - 5);
    return result.slice(startIndex, startIndex + 6);
};

// Incident Logs Stats Component
export function IncidentLogsStats({ incidentLogs = [] }: { incidentLogs: any[] }) {
    // Calculate stats from actual data
    const totalIncidents = incidentLogs.length;
    const verifiedIncidents = incidentLogs.filter(log => log.verified).length;
    const pendingVerification = totalIncidents - verifiedIncidents;
    const verificationRate = totalIncidents > 0 ? Math.round((verifiedIncidents / totalIncidents) * 100) : 0;

    // Data for time-based chart
    const incidentsByMonth = useMemo(() => {
        return groupByMonth(incidentLogs, 'time');
    }, [incidentLogs]);

    // Data for sources
    const incidentsBySource = useMemo(() => {
        return groupAndCountByField(incidentLogs, 'source');
    }, [incidentLogs]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Incident Reports</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="flex justify-between items-center">
                        <div className="space-y-1">
                            <p className="text-2xl font-bold">{totalIncidents}</p>
                            <p className="text-xs text-muted-foreground">
                                {incidentsByMonth.length > 0 && `${incidentsByMonth[incidentsByMonth.length - 1].count} this month`}
                            </p>
                        </div>
                        <div className="h-16 w-32">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={incidentsByMonth}>
                                    <Tooltip
                                        labelFormatter={(value) => `Month: ${value}`}
                                        formatter={(value) => [`Reports: ${value}`]}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="count"
                                        stroke="#8884d8"
                                        strokeWidth={2}
                                        dot={false}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Verification Status</CardTitle>
                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                </CardHeader>
                <CardContent>
                    <div className="flex justify-between items-center">
                        <div className="space-y-1">
                            <div className="flex gap-2">
                                <div>
                                    <p className="text-2xl font-bold text-emerald-600">{verifiedIncidents}</p>
                                    <p className="text-xs text-emerald-600">Verified</p>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-amber-600">{pendingVerification}</p>
                                    <p className="text-xs text-amber-600">Pending</p>
                                </div>
                            </div>
                            <p className="text-xs text-emerald-500">
                                <span className="inline-flex items-center">
                                    {verificationRate > 0 ? <TrendingUp className="mr-1 h-3 w-3" /> : <TrendingDown className="mr-1 h-3 w-3" />}
                                    {verificationRate}% verification rate
                                </span>
                            </p>
                        </div>
                        <div className="h-16 w-16">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={[
                                            { name: "Verified", value: verifiedIncidents || 1 },
                                            { name: "Pending", value: pendingVerification || 1 },
                                        ]}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={15}
                                        outerRadius={30}
                                        paddingAngle={2}
                                        dataKey="value"
                                    >
                                        <Cell fill="#10b981" />
                                        <Cell fill="#f59e0b" />
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Incident Sources</CardTitle>
                    <AlertCircle className="h-4 w-4 text-sky-500" />
                </CardHeader>
                <CardContent>
                    <div className="flex justify-between items-center">
                        <div className="space-y-2">
                            <p className="text-2xl font-bold">{incidentsBySource.length}</p>
                            <p className="text-xs text-muted-foreground">Different sources</p>
                        </div>
                        <div className="h-16 w-32">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={incidentsBySource}>
                                    <Tooltip
                                        formatter={(value) => [`${value} incidents`]}
                                        labelFormatter={(name) => `Source: ${name}`}
                                    />
                                    <Bar dataKey="value" fill="#0ea5e9">
                                        {incidentsBySource.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    <div className="mt-4 text-xs space-y-1">
                        {incidentsBySource.slice(0, 2).map((source, i) => (
                            <div key={i} className="flex justify-between">
                                <span>{source.name}</span>
                                <span>{source.value} reports</span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

// Crime Incidents Stats Component
export function CrimeIncidentsStats({ crimeIncidents = [] }: { crimeIncidents: any[] }) {
    const totalCases = crimeIncidents.length;

    // Group by status
    const statuses = useMemo(() => {
        const openCases = crimeIncidents.filter(c => c.status === 'open').length;
        const underInvestigationCases = crimeIncidents.filter(c => c.status === 'under_investigation').length;
        const resolvedCases = crimeIncidents.filter(c => c.status === 'resolved').length;

        return {
            open: openCases,
            underInvestigation: underInvestigationCases,
            resolved: resolvedCases
        };
    }, [crimeIncidents]);

    // Data for categories chart
    const incidentsByCategory = useMemo(() => {
        return groupAndCountByField(crimeIncidents, 'crime_categories.name');
    }, [crimeIncidents]);

    // Data for district chart
    const incidentsByDistrict = useMemo(() => {
        return groupAndCountByField(crimeIncidents, 'locations.districts.name');
    }, [crimeIncidents]);

    const resolutionRate = totalCases > 0 ? Math.round((statuses.resolved / totalCases) * 100) : 0;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Case Status</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="flex justify-between items-center">
                        <div className="space-y-1">
                            <p className="text-2xl font-bold">{totalCases}</p>
                            <p className="text-xs text-muted-foreground">
                                {statuses.resolved} resolved • {statuses.open} open • {statuses.underInvestigation} investigating
                            </p>
                        </div>
                        <div className="h-16 w-32">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Tooltip
                                        formatter={(value, name) => [`${value} cases`, name]}
                                    />
                                    <Pie
                                        data={[
                                            { name: "Open", value: statuses.open || 0 },
                                            { name: "Investigating", value: statuses.underInvestigation || 0 },
                                            { name: "Resolved", value: statuses.resolved || 0 },
                                        ]}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={15}
                                        outerRadius={30}
                                        paddingAngle={2}
                                        dataKey="value"
                                    >
                                        <Cell fill="#f59e0b" /> {/* Open - amber */}
                                        <Cell fill="#3b82f6" /> {/* Investigating - blue */}
                                        <Cell fill="#10b981" /> {/* Resolved - green */}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Crime Categories</CardTitle>
                    <CheckCircle className="h-4 w-4 text-sky-500" />
                </CardHeader>
                <CardContent>
                    <div className="flex justify-between items-center">
                        <div className="space-y-1">
                            <p className="text-2xl font-bold">{incidentsByCategory.length}</p>
                            <p className="text-xs text-sky-500">
                                <span className="inline-flex items-center">
                                    Different crime types
                                </span>
                            </p>
                        </div>
                        <div className="h-16 w-32">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={incidentsByCategory}>
                                    <Tooltip
                                        formatter={(value) => [`${value} cases`]}
                                        labelFormatter={(name) => `${name}`}
                                    />
                                    <Bar dataKey="value" fill="#3b82f6">
                                        {incidentsByCategory.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    <div className="mt-4 text-xs space-y-1">
                        {incidentsByCategory.slice(0, 3).map((category, i) => (
                            <div key={i} className="flex justify-between">
                                <span>{category.name}</span>
                                <span>{category.value} cases</span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Case Resolution</CardTitle>
                    <Clock className="h-4 w-4 text-emerald-500" />
                </CardHeader>
                <CardContent>
                    <div className="flex justify-between items-center">
                        <div className="space-y-1">
                            <p className="text-2xl font-bold">{resolutionRate}%</p>
                            <p className="text-xs text-emerald-500">
                                <span className="inline-flex items-center">
                                    <TrendingUp className="mr-1 h-3 w-3" />
                                    Resolution rate
                                </span>
                            </p>
                        </div>
                        <div className="h-16 w-32">
                            <div className="w-full h-full flex items-end gap-1">
                                {incidentsByDistrict.slice(0, 6).map((district, i) => (
                                    <div
                                        key={i}
                                        className={`w-1/6 rounded-sm ${i < 3 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                                        style={{ height: `${Math.min(100, (district.value / Math.max(...incidentsByDistrict.map(d => d.value))) * 100)}%` }}
                                    ></div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="mt-4 text-xs text-muted-foreground">
                        Top districts: {incidentsByDistrict.slice(0, 2).map(d => d.name).join(', ')}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

// Crime Summary Stats Component
export function CrimesSummaryStats({ crimes = [] }: { crimes: any[] }) {
    // Fix calculation of crime statistics to avoid duplication

    // For total reported crimes, just use the count of entries in the crimes array
    // This represents the actual record count (4,278) from the database
    const totalCrimesReported = crimes.length;

    // For crimes cleared, calculate the percentage based on cleared status
    // instead of summing potentially duplicate data
    const crimesCleared = useMemo(() => {
        return crimes.filter(crime => crime.crime_cleared && parseInt(crime.crime_cleared) > 0).length;
    }, [crimes]);

    // Calculate risk levels
    const riskLevels = useMemo(() => {
        const levels = {
            low: 0,
            medium: 0,
            high: 0,
            critical: 0
        };

        crimes.forEach(crime => {
            if (crime.level) {
                levels[crime.level as keyof typeof levels]++;
            }
        });

        return levels;
    }, [crimes]);

    // Group crimes by district - using districts as primary key rather than summing number_of_crime
    const crimesByDistrict = useMemo(() => {
        return crimes.reduce((acc, crime) => {
            const districtName = crime.districts?.name || 'Unknown';

            if (!acc[districtName]) {
                acc[districtName] = { name: districtName, count: 0 };
            }

            // Count each crime record once instead of using potentially inflated number_of_crime
            acc[districtName].count += 1;
            return acc;
        }, {} as Record<string, { name: string, count: number }>);
    }, [crimes]);

    // Convert to array and sort by count
    const crimesByDistrictArray = useMemo(() => {
        return (Object.values(crimesByDistrict) as { name: string, count: number }[])
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
    }, [crimesByDistrict]);

    // High risk districts are those with critical or high level
    const highRiskDistricts = crimes.filter(c => c.level === 'critical' || c.level === 'high').length;
    const clearanceRate = totalCrimesReported > 0 ? Math.round((crimesCleared / totalCrimesReported) * 100) : 0;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Crimes Reported</CardTitle>
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="flex justify-between items-center">
                        <div className="space-y-1">
                            <p className="text-2xl font-bold">{totalCrimesReported.toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground">Crime records in database</p>
                        </div>
                        <div className="h-16 w-32">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={crimesByDistrictArray}>
                                    <Tooltip
                                        formatter={(value) => [`${parseInt(value as string).toLocaleString()} crimes`]
                                        }
                                        labelFormatter={(value) => `District: ${value}`}
                                    />
                                    <Bar dataKey="count" fill="#8884d8">
                                        {crimesByDistrictArray.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    <div className="mt-4 text-xs space-y-1">
                        {crimesByDistrictArray.slice(0, 2).map((district, i) => (
                            <div key={i} className="flex justify-between">
                                <span>{district.name}</span>
                                <span>{district.count.toLocaleString()} crimes</span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Crimes Cleared</CardTitle>
                    <UserCheck className="h-4 w-4 text-emerald-500" />
                </CardHeader>
                <CardContent>
                    <div className="flex justify-between items-center">
                        <div className="space-y-1">
                            <p className="text-2xl font-bold">{crimesCleared.toLocaleString()}</p>
                            <p className="text-xs text-emerald-500">
                                <span className="inline-flex items-center">
                                    <TrendingUp className="mr-1 h-3 w-3" />
                                    {clearanceRate}% clearance rate
                                </span>
                            </p>
                        </div>
                        <div className="h-16 w-32">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Tooltip
                                        formatter={(value) => [`${parseInt(value as string).toLocaleString()} crimes`, '']}
                                    />
                                    <Pie
                                        data={[
                                            { name: "Cleared", value: crimesCleared || 1 },
                                            { name: "Uncleared", value: totalCrimesReported - crimesCleared || 1 },
                                        ]}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={15}
                                        outerRadius={30}
                                        paddingAngle={2}
                                        dataKey="value"
                                        nameKey="name"
                                    >
                                        <Cell fill="#10b981" />
                                        <Cell fill="#d1d5db" />
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Risk Level Distribution</CardTitle>
                    <AlertCircle className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                    <div className="flex justify-between items-center">
                        <div className="space-y-1">
                            <p className="text-2xl font-bold">{highRiskDistricts}</p>
                            <p className="text-xs text-red-500">
                                <span className="inline-flex items-center">
                                    <AlertCircle className="mr-1 h-3 w-3" />
                                    High risk areas
                                </span>
                            </p>
                        </div>
                        <div className="h-16 w-32 flex justify-center items-end">
                            <div className="flex items-end gap-2 h-full">
                                <div title="Critical" className="bg-red-500 rounded-sm w-5"
                                    style={{ height: `${Math.max(10, (riskLevels.critical / Math.max(1, crimes.length)) * 100)}%` }}>
                                </div>
                                <div title="High" className="bg-orange-500 rounded-sm w-5"
                                    style={{ height: `${Math.max(10, (riskLevels.high / Math.max(1, crimes.length)) * 100)}%` }}>
                                </div>
                                <div title="Medium" className="bg-yellow-500 rounded-sm w-5"
                                    style={{ height: `${Math.max(10, (riskLevels.medium / Math.max(1, crimes.length)) * 100)}%` }}>
                                </div>
                                <div title="Low" className="bg-green-500 rounded-sm w-5"
                                    style={{ height: `${Math.max(10, (riskLevels.low / Math.max(1, crimes.length)) * 100)}%` }}>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="mt-4 text-xs grid grid-cols-4 gap-1">
                        <div className="text-center text-red-500">Critical<br />{riskLevels.critical}</div>
                        <div className="text-center text-orange-500">High<br />{riskLevels.high}</div>
                        <div className="text-center text-yellow-500">Medium<br />{riskLevels.medium}</div>
                        <div className="text-center text-green-500">Low<br />{riskLevels.low}</div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
