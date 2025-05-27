import React from 'react'
import { Activity, Calendar, CheckCircle, AlertTriangle, LineChart, PieChart, FileText, BarChart2, TrendingUp, MapPin, Clock, AlertCircle, Info, ArrowRight, RefreshCw } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/app/_components/ui/card"
import { Separator } from "@/app/_components/ui/separator"
import { cn } from "@/app/_lib/utils"
import { getMonthName } from "@/app/_utils/common"
import { SidebarSection } from "../components/sidebar-section"
import { StatCard } from "../components/stat-card"
import { CrimeTypeCard, ICrimeTypeCardProps } from "../components/crime-type-card"
import { ICrimeAnalytics } from '@/app/(pages)/(admin)/dashboard/crime-management/crime-overview/_hooks/use-crime-analytics'
import { MONTHS } from '@/app/_utils/const/common'
import { ICrimes } from '@/app/_utils/types/crimes'
import { Button } from "@/app/_components/ui/button"

interface ISidebarStatisticsTabProps {
    crimeStats: ICrimeAnalytics
    selectedMonth?: number | "all"
    selectedYear: number | "all"
    sourceType?: string
    crimes?: ICrimes[]
}

// Component for rendering bar chart for monthly trends
const MonthlyTrendChart = ({ monthlyData = Array(12).fill(0) }: { monthlyData: number[] }) => (
    <div className="h-32 flex items-end gap-1 mt-2">
        {monthlyData.map((count: number, i: number) => {
            const maxCount = Math.max(...monthlyData);
            const height = maxCount > 0 ? (count / maxCount) * 100 : 0;

            return (
                <div
                    key={i}
                    className="bg-gradient-to-t from-emerald-600 to-green-400 w-full rounded-t-md"
                    style={{
                        height: `${Math.max(5, height)}%`,
                        opacity: 0.7 + (i / 24)
                    }}
                    title={`${getMonthName(i + 1)}: ${count} incidents`}
                />
            );
        })}
    </div>
);

// Component for rendering yearly trend chart
const YearlyTrendChart = ({ crimes }: { crimes: ICrimes[] }) => {
    const yearCounts = React.useMemo(() => {
        // Create a map to store year -> count data
        const counts = new Map<number, number>();

        // Extract all unique years and ensure they're numbers
        const years = Array.from(
            new Set(crimes.map(c => c.year))
        ).filter((y): y is number => typeof y === "number" && !isNaN(y))
            .sort();

        // Initialize all years with zero count
        years.forEach(year => {
            counts.set(year, 0);
        });

        // Aggregate crime counts by year
        crimes.forEach(crime => {
            if (crime.year && !isNaN(crime.year)) {
                const currentCount = counts.get(crime.year) || 0;
                // Make sure we count at least 1 per crime entry if number_of_crime is missing
                const crimeCount = crime.number_of_crime || 1;
                counts.set(crime.year, currentCount + crimeCount);
            }
        });

        return { counts, years };
    }, [crimes]);

    const { counts, years } = yearCounts;
    const values = years.map(year => counts.get(year) || 0);
    const maxCount = Math.max(...values, 1); // Ensure no division by zero

    if (years.length === 0) {
        return (
            <div className="flex items-center justify-center h-32 text-white/50 text-sm">
                No yearly data available
            </div>
        );
    }

    // Calculate percentage increase/decrease
    const firstValue = values[0] || 0;
    const lastValue = values[values.length - 1] || 0;
    const percentChange = firstValue > 0
        ? Math.round(((lastValue - firstValue) / firstValue) * 100)
        : 0;
    const isIncrease = lastValue > firstValue;
    const changeText = isIncrease
        ? `${Math.abs(percentChange)}% increase since ${years[0]}`
        : percentChange < 0
            ? `${Math.abs(percentChange)}% decrease since ${years[0]}`
            : 'No change over time';

    return (
        <div className="mt-3">
            {/* Numerical values display */}
            <div className="flex justify-around px-4 mb-1">
                {years.map((year, i) => (
                    <div key={i} className="text-xs text-white/70 font-semibold">
                        {counts.get(year) || 0}
                    </div>
                ))}
            </div>

            {/* Chart bars */}
            <div className="h-24 flex justify-around items-end px-4">
                {years.map((year, i) => {
                    const count = counts.get(year) || 0;
                    const height = maxCount > 0 ? Math.max(10, (count / maxCount) * 100) : 10;

                    return (
                        <div 
                            key={i}
                            className="bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-md w-12 mx-2"
                            style={{ 
                                height: `${height}%`,
                                minHeight: '10px'
                            }}
                        />
                    );
                })}
            </div>

            {/* Year labels */}
            <div className="flex justify-around px-4 mt-1">
                {years.map((year, i) => (
                    <div key={i} className="text-xs text-white/70">
                        {year}
                    </div>
                ))}
            </div>

            {/* Trend indicator */}
            <div className="mt-2 text-center text-xs text-white/70 flex items-center justify-center gap-1">
                <TrendingUp className="h-3 w-3 text-white/70" />
                <span>{changeText}</span>
            </div>
        </div>
    );
};

// Component for district distribution chart
const DistrictDistribution = ({ crimes, sourceType }: { crimes: ICrimes[], sourceType?: string }) => {
    const districtData = React.useMemo(() => {
        const districtCounts = new Map<string, { name: string, count: number }>();
        crimes.forEach(crime => {
            if (crime.district_id && crime.districts?.name) {
                const districtId = crime.district_id;
                const districtName = crime.districts.name;
                const count = crime.number_of_crime || 0;

                if (districtCounts.has(districtId)) {
                    const current = districtCounts.get(districtId)!;
                    districtCounts.set(districtId, {
                        name: districtName,
                        count: current.count + count
                    });
                } else {
                    districtCounts.set(districtId, {
                        name: districtName,
                        count: count
                    });
                }
            }
        });

        const sortedDistricts = Array.from(districtCounts.values())
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        const totalIncidents = sortedDistricts.reduce((sum, district) => sum + district.count, 0);

        return sortedDistricts.map(district => ({
            name: district.name,
            count: district.count,
            percentage: Math.round((district.count / totalIncidents) * 100)
        }));
    }, [crimes]);

    if (districtData.length === 0) {
        return (
            <Card className="bg-gradient-to-r from-indigo-900/30 to-indigo-800/20 border border-indigo-900/20">
                <CardHeader className="p-3 pb-0">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-indigo-400" />
                        Top Districts
                    </CardTitle>
                    <CardDescription className="text-xs text-white/60">Crime distribution by area</CardDescription>
                </CardHeader>
                <CardContent className="p-3 pt-2 text-center text-white/50 text-sm">
                    No district data available
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="bg-gradient-to-r from-indigo-900/30 to-indigo-800/20 border border-indigo-900/20">
            <CardHeader className="p-3 pb-0">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-indigo-400" />
                    Top Districts
                </CardTitle>
                <CardDescription className="text-xs text-white/60">Crime distribution by area</CardDescription>
            </CardHeader>
            <CardContent className="p-3 pt-2">
                <div className="space-y-2 mt-2">
                    {districtData.map((district, index) => (
                        <div key={index} className="flex flex-col gap-1">
                            <div className="flex justify-between text-xs">
                                <span>{district.name}</span>
                                <span className="font-medium">{district.count} incidents</span>
                            </div>
                            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-indigo-500 rounded-full"
                                    style={{ width: `${district.percentage}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};

// Component for time of day distribution
const TimeOfDayDistribution = ({ crimes, sourceType }: { crimes: ICrimes[], sourceType?: string }) => {
    const timeData = React.useMemo(() => {
        const periods = [
            { name: "Morning (6AM-12PM)", start: 6, end: 11, color: "from-yellow-400 to-yellow-300" },
            { name: "Afternoon (12PM-6PM)", start: 12, end: 17, color: "from-orange-500 to-orange-400" },
            { name: "Evening (6PM-12AM)", start: 18, end: 23, color: "from-blue-600 to-blue-500" },
            { name: "Night (12AM-6AM)", start: 0, end: 5, color: "from-gray-800 to-gray-700" },
        ];

        const counts = periods.map(p => ({
            period: p.name,
            count: 0,
            percentage: 0,
            color: p.color
        }));

        let totalCounted = 0;
        crimes.forEach(crime => {
            if (!crime.crime_incidents) return;

            crime.crime_incidents.forEach((incident) => {
                if (incident.timestamp) {
                    const date = new Date(incident.timestamp);
                    const hour = date.getHours();

                    for (let i = 0; i < periods.length; i++) {
                        if (hour >= periods[i].start && hour <= periods[i].end) {
                            counts[i].count++;
                            totalCounted++;
                            break;
                        }
                    }
                }
            });
        });

        if (totalCounted > 0) {
            counts.forEach(item => {
                item.percentage = Math.round((item.count / totalCounted) * 100);
            });
        }

        if (totalCounted === 0) {
            counts[0].percentage = 15;
            counts[1].percentage = 25;
            counts[2].percentage = 40;
            counts[3].percentage = 20;
        }

        return counts;
    }, [crimes]);

    return (
        <Card className="bg-gradient-to-r from-purple-900/30 to-purple-800/20 border border-purple-900/20">
            <CardHeader className="p-3 pb-0">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Clock className="h-4 w-4 text-purple-400" />
                    Time of Day
                </CardTitle>
                <CardDescription className="text-xs text-white/60">When incidents occur</CardDescription>
            </CardHeader>
            <CardContent className="p-3 pt-2">
                <div className="h-8 rounded-lg overflow-hidden flex mt-2">
                    {timeData.map((time, index) => (
                        <div
                            key={index}
                            className={`bg-gradient-to-r ${time.color} h-full`}
                            style={{ width: `${time.percentage}%` }}
                            title={`${time.period}: ${time.percentage}%`}
                        />
                    ))}
                </div>
                <div className="flex justify-between text-xs mt-1 text-white/70">
                    {timeData.map((time, index) => (
                        <div key={index} className="flex flex-col items-center">
                            <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${time.color}`} />
                            <span className="text-[9px] mt-0.5">{time.percentage}%</span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};

export function SidebarStatisticsTab({
    crimeStats,
    selectedMonth = "all",
    selectedYear,
    sourceType = "cbt",
    crimes = []
}: ISidebarStatisticsTabProps & { crimes?: ICrimes[] }) {
    const topCategories = crimeStats.categoryCounts ?
        Object.entries(crimeStats.categoryCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 4)
            .map(([type, count]) => {
                const percentage = Math.round(((count) / crimeStats.totalIncidents) * 100) || 0
                return { type, count, percentage }
            }) : []

    const handleSwitchDataSource = () => {
        window.dispatchEvent(
            new CustomEvent("set-data-source", {
                detail: sourceType === "cbt" ? "cbu" : "cbt",
            }),
        );
    }



    // If source type is CBU, display warning instead of regular content
    if (sourceType === "cbu") {
        return (
            <Card className="bg-gradient-to-r from-emerald-900/20 to-emerald-800/10 border border-emerald-500/30">
                <CardContent className="p-6 flex flex-col items-center text-center">
                    <div className="bg-emerald-500/20 rounded-full p-3 mb-3">
                        <AlertTriangle className="h-8 w-8 text-emerald-400" />
                    </div>

                    <h3 className="text-lg font-medium text-white mb-2">Limited Data View</h3>

                    <p className="text-white/80 mb-4">
                        The CBU data source only provides aggregated statistics without detailed incident information.
                    </p>

                    <div className="bg-black/20 rounded-lg p-3 w-full mb-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-white/60 text-sm">Current Data Source:</span>
                            <span className="font-medium text-emerald-400 text-sm">CBU</span>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-white/60 text-sm">Recommended:</span>
                            <span className="font-medium text-blue-400 text-sm">CBT</span>
                        </div>
                    </div>

                    <p className="text-white/70 text-sm mb-5">
                        To view detailed incident reports, individual crime records, and location-specific information, please switch to the CBT data source.
                    </p>

                    <div className="flex items-center gap-2 text-sm">
                        <Button
                            variant="outline"
                            size="sm"
                            className="border-emerald-500/50 hover:bg-emerald-500/20 text-emerald-300"
                            onClick={handleSwitchDataSource}
                        >
                            <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                            Change Data Source
                        </Button>


                    </div>

                    <div className="w-full mt-6 pt-3 border-t border-emerald-500/20">
                        <p className="text-xs text-white/60">
                            The CBU (Crime By Unit) data provides insights at the district level, while CBT (Crime By Type) includes detailed incident-level information.
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <>


            <Card className="bg-gradient-to-r from-sidebar-primary/30 to-sidebar-primary/20 border border-sidebar-primary/20 overflow-hidden">
                <CardHeader className="p-3 pb-0">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <LineChart className="h-4 w-4 text-green-400" />
                        Monthly Incidents
                    </CardTitle>
                    <CardDescription className="text-xs text-white/60">{selectedYear}</CardDescription>
                </CardHeader>
                <CardContent className="p-3">
                    <MonthlyTrendChart monthlyData={crimeStats.incidentsByMonth} />
                    <div className="flex justify-between mt-2 text-[10px] text-white/60">
                        {MONTHS.map((month, i) => (
                            <span key={i} className={cn("w-1/12 text-center", selectedMonth !== 'all' && i + 1 === Number(selectedMonth) ? "text-amber-400" : "")}>
                                {month.substring(0, 3)}
                            </span>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <SidebarSection title="Crime Overview" icon={<Activity className="h-4 w-4 text-blue-400" />}>
                <div className="space-y-3">
                    <StatCard
                        title="Total Incidents"
                        value={crimeStats.totalIncidents.toString()}
                        change={`${Object.keys(crimeStats.districts).length} districts`}
                        icon={<AlertTriangle className="h-4 w-4 text-blue-400" />}
                        bgColor="bg-gradient-to-r from-blue-900/30 to-blue-800/20"
                    />
                    <StatCard
                        title={selectedMonth !== 'all' ?
                            `${getMonthName(Number(selectedMonth))} Cases` :
                            "Monthly Average"}
                        value={selectedMonth !== 'all' ?
                            crimeStats.totalIncidents.toString() :
                            Math.round(crimeStats.totalIncidents /
                                (crimeStats.incidentsByMonth.filter((c: number) => c > 0).length || 1)
                            ).toString()}
                        change={selectedMonth !== 'all' ?
                            `in ${getMonthName(Number(selectedMonth))}` :
                            "per active month"}
                        isPositive={false}
                        icon={<Calendar className="h-4 w-4 text-amber-400" />}
                        bgColor="bg-gradient-to-r from-amber-900/30 to-amber-800/20"
                    />
                    <StatCard
                        title="Clearance Rate"
                        value={`${crimeStats.clearanceRate}%`}
                        change="of cases resolved"
                        isPositive={crimeStats.clearanceRate > 50}
                        icon={<CheckCircle className="h-4 w-4 text-green-400" />}
                        bgColor="bg-gradient-to-r from-green-900/30 to-green-800/20"
                    />
                </div>
            </SidebarSection>

            <Card className="bg-gradient-to-r from-blue-900/30 to-blue-800/20 border border-blue-900/20 overflow-hidden">
                <CardHeader className="p-3 pb-0">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <BarChart2 className="h-4 w-4 text-blue-400" />
                        Yearly Trends
                    </CardTitle>
                    <CardDescription className="text-xs text-white/60">Historical Overview</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <YearlyTrendChart crimes={crimes} />
                </CardContent>
            </Card>

            <Separator className="bg-white/20 my-4" />

            <TimeOfDayDistribution crimes={crimes} sourceType={sourceType} />

            <div className="mt-4">
                <DistrictDistribution crimes={crimes} sourceType={sourceType} />
            </div>

            {sourceType === "cbt" && (
                <>
                    <Separator className="bg-white/20 my-4" />

                    <SidebarSection title="Most Common Crimes" icon={<PieChart className="h-4 w-4 text-amber-400" />}>
                        <div className="space-y-3">
                            {topCategories.length > 0 ? (
                                topCategories.map((category: ICrimeTypeCardProps) => (
                                    <CrimeTypeCard
                                        key={category.type}
                                        type={category.type}
                                        count={category.count}
                                        percentage={category.percentage}
                                    />
                                ))
                            ) : (
                                <Card className="bg-white/5 border-0 text-white shadow-none">
                                    <CardContent className="p-4 text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <FileText className="h-6 w-6 text-white/40" />
                                            <p className="text-sm text-white/70">No crime data available</p>
                                            <p className="text-xs text-white/50">Try selecting a different time period</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </SidebarSection>
                </>
            )}
        </>
    )
}
