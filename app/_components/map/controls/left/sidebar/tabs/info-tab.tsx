import React from 'react'
import { Layers, Info, Eye, Filter, MapPin, AlertTriangle, AlertCircle, Clock, Flame, MapPinned, Users, Map, Box, Thermometer } from 'lucide-react'
import { Card, CardContent } from "@/app/_components/ui/card"
import { Separator } from "@/app/_components/ui/separator"
import { CRIME_RATE_COLORS } from "@/app/_utils/const/crime"
import { SidebarSection } from "../components/sidebar-section"

interface SidebarInfoTabProps {
    sourceType?: string
}

export function SidebarInfoTab({ sourceType = "cbt" }: SidebarInfoTabProps) {
    return (
        <>
            <SidebarSection title="Map Legend" icon={<Layers className="h-4 w-4 text-green-400" />}>
                <Card className="bg-gradient-to-r from-zinc-800/80 to-zinc-900/80 border border-white/10">
                    <CardContent className="p-4 text-xs space-y-3">
                        <div className="space-y-2">
                            <h4 className="font-medium mb-2 text-sm">Crime Severity</h4>
                            <div className="flex items-center gap-2 p-1.5 hover:bg-white/5 rounded-md transition-colors">
                                <div className="w-4 h-4 rounded" style={{ backgroundColor: CRIME_RATE_COLORS.low }}></div>
                                <span>Low Crime Rate</span>
                            </div>
                            <div className="flex items-center gap-2 p-1.5 hover:bg-white/5 rounded-md transition-colors">
                                <div className="w-4 h-4 rounded" style={{ backgroundColor: CRIME_RATE_COLORS.medium }}></div>
                                <span>Medium Crime Rate</span>
                            </div>
                            <div className="flex items-center gap-2 p-1.5 hover:bg-white/5 rounded-md transition-colors">
                                <div className="w-4 h-4 rounded" style={{ backgroundColor: CRIME_RATE_COLORS.high }}></div>
                                <span>High Crime Rate</span>
                            </div>
                        </div>

                        <Separator className="bg-white/20 my-3" />

                        {/* Show different map markers based on source type */}
                        <div className="space-y-2">
                            <h4 className="font-medium mb-2 text-sm">Map Markers</h4>
                            {sourceType === "cbt" ? (
                                // Detailed incidents for CBT
                                <>
                                    <div className="flex items-center gap-2 p-1.5 hover:bg-white/5 rounded-md transition-colors">
                                        <AlertCircle className="h-4 w-4 text-red-500" />
                                        <span>Individual Incident</span>
                                    </div>
                            <div className="flex items-center gap-2 p-1.5 hover:bg-white/5 rounded-md transition-colors">
                                <div className="w-5 h-5 rounded-full bg-pink-400 flex items-center justify-center text-[10px] text-white">5</div>
                                <span className="font-bold">Incident Cluster</span>
                            </div>
                                </>
                            ) : (
                                // Simplified view for CBU
                                <>
                                    <div className="flex items-center gap-2 p-1.5 hover:bg-white/5 rounded-md transition-colors">
                                        <div className="w-5 h-5 rounded-full bg-blue-400 flex items-center justify-center text-[10px] text-white">12</div>
                                        <span className="font-bold">District Crime Count</span>
                                    </div>
                                    <div className="p-1.5 text-white/70">
                                        Shows aggregated crime counts by district. Size indicates relative crime volume.
                                    </div>
                                </>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </SidebarSection>

            {/* Show layers info based on source type */}
            <SidebarSection title="Map Layers" icon={<Map className="h-4 w-4 text-blue-400" />}>
                <Card className="bg-gradient-to-r from-zinc-800/80 to-zinc-900/80 border border-white/10">
                    <CardContent className="p-4 text-xs space-y-4">
                        {sourceType === "cbt" ? (
                            // Show all layers for CBT
                            <>
                                <div className="space-y-2">
                                    <h4 className="flex items-center gap-2 font-medium text-sm">
                                        <AlertCircle className="h-4 w-4 text-cyan-400" />
                                        <span>Incidents Layer</span>
                                    </h4>
                                    <p className="text-white/70 pl-6">
                                        Shows individual crime incidents as map markers. Each marker represents a single crime report and is color-coded by category.
                                        Click on any marker to see detailed information about the incident.
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <h4 className="flex items-center gap-2 font-medium text-sm">
                                        <Box className="h-4 w-4 text-pink-400" />
                                        <span>Clusters Layer</span>
                                    </h4>
                                    <p className="text-white/70 pl-6">
                                        Groups nearby incidents into clusters for better visibility at lower zoom levels. Numbers show incident count in each cluster.
                                        Clusters are color-coded by size: blue (small), yellow (medium), pink (large).
                                        Click on a cluster to zoom in and see individual incidents.
                                    </p>
                                    <div className="flex items-center gap-6 pl-6 pt-1">
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 rounded-full bg-[#51bbd6]"></div>
                                            <span>1-5</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 rounded-full bg-[#f1f075]"></div>
                                            <span>6-15</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 rounded-full bg-[#f28cb1]"></div>
                                            <span>15+</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <h4 className="flex items-center gap-2 font-medium text-sm">
                                        <Thermometer className="h-4 w-4 text-orange-400" />
                                        <span>Heatmap Layer</span>
                                    </h4>
                                    <p className="text-white/70 pl-6">
                                        Shows crime density across regions, with warmer colors (red, orange) indicating higher crime concentration
                                        and cooler colors (blue) showing lower concentration. Useful for identifying crime hotspots.
                                    </p>
                                    <div className="pl-6 pt-1">
                                        <div className="h-2 w-full rounded-full bg-gradient-to-r from-blue-600   via-yellow-400 to-red-600"></div>
                                        <div className="flex justify-between text-[10px] mt-1 text-white/70">
                                            <span>Low</span>
                                            <span>Density</span>
                                            <span>High</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <h4 className="flex items-center gap-2 font-medium text-sm">
                                        <Users className="h-4 w-4 text-blue-400" />
                                        <span>Units Layer</span>
                                    </h4>
                                    <p className="text-white/70 pl-6">
                                        Displays police and security units as blue circles with connecting lines to nearby incidents.
                                        Units are labeled and can be clicked to show more information and related incident details.
                                    </p>
                                    <div className="flex items-center gap-2 pl-6 pt-1">
                                        <div className="w-4 h-4 rounded-full border-2 border-white bg-[#1e40af]"></div>
                                        <span>Police/Security Unit</span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <h4 className="flex items-center gap-2 font-medium text-sm">
                                        <Clock className="h-4 w-4 text-yellow-400" />
                                        <span>Timeline Layer</span>
                                    </h4>
                                    <p className="text-white/70 pl-6">
                                        Shows time patterns of crime incidents with color-coded circles representing average times of day when
                                        incidents occur in each district. Click for detailed time distribution analysis.
                                    </p>
                                    <div className="flex flex-wrap gap-x-5 gap-y-2 pl-6 pt-1">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full bg-[#FFEB3B]"></div>
                                            <span>Morning</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full bg-[#FF9800]"></div>
                                            <span>Afternoon</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full bg-[#3F51B5]"></div>
                                            <span>Evening</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full bg-[#263238]"></div>
                                            <span>Night</span>
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            // Show limited layers info for CBU
                            <div className="space-y-2">
                                <h4 className="flex items-center gap-2 font-medium text-sm">
                                    <Box className="h-4 w-4 text-blue-400" />
                                    <span>District Crime Data</span>
                                </h4>
                                <p className="text-white/70 pl-6">
                                    Shows aggregated crime statistics by district. Each point represents the total crime count for a district.
                                    Points are color-coded based on crime level: green (low), yellow (medium), red (high).
                                </p>
                                <p className="text-white/70 pl-6 mt-1">
                                    The size of each point indicates the relative number of crimes reported in that district.
                                </p>
                                <div className="flex items-center gap-6 pl-6 pt-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: CRIME_RATE_COLORS.low }}></div>
                                        <span>Low</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: CRIME_RATE_COLORS.medium }}></div>
                                        <span>Medium</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: CRIME_RATE_COLORS.high }}></div>
                                        <span>High</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </SidebarSection>

            <SidebarSection title="About" icon={<Info className="h-4 w-4 text-green-400" />}>
                <Card className="bg-gradient-to-r from-zinc-800/80 to-zinc-900/80 border border-white/10">
                    <CardContent className="p-4 text-xs">
                        <p className="mb-3">
                            SIGAP Crime Map provides real-time visualization and analysis
                            of crime incidents across Jember region.
                        </p>
                        <p>
                            Data is sourced from official police reports and updated
                            daily to ensure accurate information.
                        </p>
                        <div className="mt-3 p-2 bg-white/5 rounded-lg text-white/60">
                            <div className="flex justify-between">
                                <span>Version</span>
                                <span className="font-medium">1.2.4</span>
                            </div>
                            <div className="flex justify-between mt-1">
                                <span>Last Updated</span>
                                <span className="font-medium">June 18, 2024</span>
                            </div>
                            {sourceType && (
                                <div className="flex justify-between mt-1">
                                    <span>Data Source</span>
                                    <span className="font-medium">{sourceType.toUpperCase()}</span>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </SidebarSection>

            <SidebarSection title="How to Use" icon={<Eye className="h-4 w-4 text-green-400" />}>
                <Card className="bg-gradient-to-r from-zinc-800/80 to-zinc-900/80 border border-white/10">
                    <CardContent className="p-4 text-xs space-y-3">
                        <div className="flex gap-3 items-start">
                            <div className="bg-emerald-900/50 p-1.5 rounded-md">
                                <Filter className="h-3.5 w-3.5 text-emerald-400" />
                            </div>
                            <div>
                                <span className="font-medium">Filtering</span>
                                <p className="text-white/70 mt-1">
                                    Use the year, month, and category filters at the top to
                                    refine the data shown on the map.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3 items-start">
                            <div className="bg-emerald-900/50 p-1.5 rounded-md">
                                <MapPin className="h-3.5 w-3.5 text-emerald-400" />
                            </div>
                            <div>
                                <span className="font-medium">District Information</span>
                                <p className="text-white/70 mt-1">
                                    Click on any district to view detailed crime statistics for that area.
                                </p>
                            </div>
                        </div>

                        {/* Show incident details help only for CBT */}
                        {sourceType === "cbt" && (
                            <div className="flex gap-3 items-start">
                                <div className="bg-emerald-900/50 p-1.5 rounded-md">
                                    <AlertTriangle className="h-3.5 w-3.5 text-emerald-400" />
                                </div>
                                <div>
                                    <span className="font-medium">Incidents</span>
                                    <p className="text-white/70 mt-1">
                                        Click on incident markers to view details about specific crime reports.
                                    </p>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </SidebarSection>
        </>
    )
}
