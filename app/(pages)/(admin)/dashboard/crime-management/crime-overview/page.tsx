

import { AlertTriangle, BarChart3, Briefcase, Clock, MapPin, Search, Shield, User, Users } from "lucide-react"
import { BentoGrid, BentoGridItem, BentoGridItemProps, GridSpan } from "@/app/_components/ui/bento-grid"

import CrimeMap from "@/app/_components/map/crime-map"
import YearSelector from "@/app/_components/map/controls/year-selector"
import DashboardHeader from "./_components/dashboard-header"
import CrimeStatistics from "./_components/crime-stats"
import ActiveOfficers from "./_components/active-officer"
import HighPriorityCases from "./_components/high-priority-case"
import EvidenceTracking from "./_components/evidence-tracking"
import PersonsOfInterest from "./_components/person-interest"
import DepartmentPerformance from "./_components/departement-performance"
import RecentArrests from "./_components/recent-arrest"
import EmergencyCalls from "./_components/emergency-call"
import CaseSearch from "./_components/case-search"

const bentoGridItems: BentoGridItemProps[] = [
    {
        colSpan: "2",
        rowSpan: "2",
        // suffixMenu: <YearSelector years={["2020", "2021", "2022", "2023", "2024"]} selectedYear="" onChange={() => { }} />,
        component: <CrimeMap />,
        className: "p-0"
    },
    {
        title: "Crime Statistics",
        description: "Monthly crime rate analysis",
        icon: <BarChart3 className="w-5 h-5" />,
        component: <CrimeStatistics />,
    },
    {
        title: "Active Officers",
        description: "Personnel currently on duty",
        icon: <Shield className="w-5 h-5" />,
        component: <ActiveOfficers />,
    },
    {
        title: "High Priority Cases",
        description: "Cases requiring immediate attention",
        icon: <AlertTriangle className="w-5 h-5 text-red-500" />,
        colSpan: "2",
        component: <HighPriorityCases />,
    },
    {
        title: "Evidence Tracking",
        description: "Recently logged evidence items",
        icon: <Briefcase className="w-5 h-5" />,
        component: <EvidenceTracking />,
    },
    {
        title: "User Reported Incidents",
        description: "Reports from the community",
        icon: <User className="w-5 h-5" />,
        component: <PersonsOfInterest />,
    },
    {
        title: "Department Performance",
        description: "Case resolution metrics",
        icon: <BarChart3 className="w-5 h-5" />,
        component: <DepartmentPerformance />,
    },
    {
        title: "Recent Incidents by Category",
        description: "Last 24 hours",
        icon: <Users className="w-5 h-5" />,
        component: <RecentArrests />,
    },
    {
        title: "Emergency Calls",
        description: "911 call volume",
        icon: <Clock className="w-5 h-5" />,
        component: <EmergencyCalls />,
    },
    {
        title: "Case Search",
        description: "Quick access to case files",
        icon: <Search className="w-5 h-5" />,
        component: <CaseSearch />,
    },
];

export default function CrimeManagement() {
    return (
        <div className="container py-4 min-h-screen">
            <div className="max-w-7xl mx-auto">
                <DashboardHeader />

                <BentoGrid>
                    {bentoGridItems.map((item, index) => (
                        <BentoGridItem
                            key={index}
                            title={item.title}
                            description={item.description}
                            icon={item.icon}
                            colSpan={item.colSpan}
                            rowSpan={item.rowSpan}
                            suffixMenu={item.suffixMenu}
                        >
                            {item.component}
                        </BentoGridItem>
                    ))}
                </BentoGrid>
            </div>
        </div>
    );
}
