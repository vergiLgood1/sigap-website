"use client"

import { BentoGrid, BentoGridItem } from "@/app/_components/ui/bento-grid"
import { Shield, Users, Calendar, Award, Clock, FileText, Briefcase } from "lucide-react"
import DepartmentHeader from "./_components/department-header"
import OfficerRoster from "./_components/officer-roster"
import ShiftSchedule from "./_components/shift-schedule"
import OfficerPerformance from "./_components/officer-performance"
import TrainingStatus from "./_components/training-status"
import EquipmentAssignments from "./_components/equipment-assignments"
import IncidentReports from "./_components/incident-reports"
import LeaveManagement from "./_components/leave-management"
import SpecializedUnits from "./_components/specialized-units"

export default function OfficerManagementPage() {
    return (
        <div className="container py-4 min-h-screen">
            <div className="max-w-7xl mx-auto">
                <DepartmentHeader />

                <BentoGrid>
                    <BentoGridItem
                        title="Officer Roster"
                        description="Active personnel and status"
                        icon={<Shield className="w-5 h-5" />}
                        colSpan="2"
                    >
                        <OfficerRoster />
                    </BentoGridItem>

                    <BentoGridItem
                        title="Shift Schedule"
                        description="Current and upcoming shifts"
                        icon={<Calendar className="w-5 h-5" />}
                        rowSpan="2"
                    >
                        <ShiftSchedule />
                    </BentoGridItem>

                    <BentoGridItem
                        title="Officer Performance"
                        description="Case clearance and metrics"
                        icon={<Award className="w-5 h-5" />}
                    >
                        <OfficerPerformance />
                    </BentoGridItem>

                    <BentoGridItem
                        title="Training Status"
                        description="Certifications and requirements"
                        icon={<Award className="w-5 h-5" />}
                    >
                        <TrainingStatus />
                    </BentoGridItem>

                    <BentoGridItem
                        title="Equipment Assignments"
                        description="Issued gear and vehicles"
                        icon={<Briefcase className="w-5 h-5" />}
                    >
                        <EquipmentAssignments />
                    </BentoGridItem>

                    <BentoGridItem
                        title="Incident Reports"
                        description="Recently filed reports"
                        icon={<FileText className="w-5 h-5" />}
                        colSpan="2"
                    >
                        <IncidentReports />
                    </BentoGridItem>

                    <BentoGridItem
                        title="Leave Management"
                        description="Time-off requests and approvals"
                        icon={<Clock className="w-5 h-5" />}
                    >
                        <LeaveManagement />
                    </BentoGridItem>

                    <BentoGridItem
                        title="Specialized Units"
                        description="Tactical teams and special operations"
                        icon={<Users className="w-5 h-5" />}
                    >
                        <SpecializedUnits />
                    </BentoGridItem>
                </BentoGrid>
            </div>
        </div>
    )
}
