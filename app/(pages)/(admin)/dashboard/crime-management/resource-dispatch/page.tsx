"use client"

import { BentoGrid, BentoGridItem } from "@/app/_components/ui/bento-grid"
import { MapPin, Phone, Users, Car, Clock, AlertTriangle, Radio, Calendar, MessageSquare } from "lucide-react"
import DispatchHeader from "./_components/dispatch-header"
import ActiveIncidents from "./_components/active-incidents"
import DispatchMap from "./_components/dispatch-map"
import UnitStatus from "./_components/unit-status"
import ResponseTimes from "./_components/response-times"
import PriorityQueue from "./_components/priority-queue"
import ResourceAvailability from "./_components/resource-availability"
import ShiftSchedule from "./_components/shift-schedule"
import DispatchCommunications from "./_components/dispatch-communications"
import IncidentHistory from "./_components/incident-history"

export default function ResourceDispatchPage() {
  return (
    <div className="container py-4 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <DispatchHeader />

        <BentoGrid>
          <BentoGridItem
            title="Active Incidents"
            description="Currently responding calls"
            icon={<AlertTriangle className="w-5 h-5" />}
            colSpan="2"
          >
            <ActiveIncidents />
          </BentoGridItem>

          <BentoGridItem
            title="Dispatch Map"
            description="Real-time unit locations"
            icon={<MapPin className="w-5 h-5" />}
            rowSpan="2"
            colSpan="2"
          >
            <DispatchMap />
          </BentoGridItem>

          <BentoGridItem
            title="Unit Status"
            description="Available and assigned units"
            icon={<Users className="w-5 h-5" />}
          >
            <UnitStatus />
          </BentoGridItem>

          <BentoGridItem
            title="Response Times"
            description="Current performance metrics"
            icon={<Clock className="w-5 h-5" />}
          >
            <ResponseTimes />
          </BentoGridItem>

          <BentoGridItem
            title="Priority Queue"
            description="Pending dispatch requests"
            icon={<Phone className="w-5 h-5" />}
          >
            <PriorityQueue />
          </BentoGridItem>

          <BentoGridItem
            title="Resource Availability"
            description="Vehicles and specialized equipment"
            icon={<Car className="w-5 h-5" />}
          >
            <ResourceAvailability />
          </BentoGridItem>

          <BentoGridItem
            title="Shift Schedule"
            description="Current and upcoming shifts"
            icon={<Calendar className="w-5 h-5" />}
          >
            <ShiftSchedule />
          </BentoGridItem>

          <BentoGridItem
            title="Dispatch Communications"
            description="Recent radio traffic and messages"
            icon={<Radio className="w-5 h-5" />}
          >
            <DispatchCommunications />
          </BentoGridItem>

          <BentoGridItem
            title="Incident History"
            description="Recently closed calls"
            icon={<MessageSquare className="w-5 h-5" />}
          >
            <IncidentHistory />
          </BentoGridItem>
        </BentoGrid>
      </div>
    </div>
  )
}
