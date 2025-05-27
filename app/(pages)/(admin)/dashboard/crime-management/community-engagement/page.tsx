"use client"

import { BentoGrid, BentoGridItem } from "@/app/_components/ui/bento-grid"
import { Bell, Calendar, FileText, MapPin, MessageSquare, Phone, Users, HelpCircle, BarChart3 } from "lucide-react"
import CommunityHeader from "./_components/community-header"
import CrimeAlerts from "./_components/crime-alerts"
import SafetyTips from "./_components/safety-tips"
import CommunityEvents from "./_components/community-events"
import NeighborhoodWatch from "./_components/neighborhood-watch"
import ReportIncident from "./_components/report-incident"
import CrimeStatistics from "./_components/crime-statistics"
import ResourceDirectory from "./_components/resource-directory"
import FAQSection from "./_components/faq-section"
import CommunityFeedback from "./_components/community-feedback"
import CommunityMap from "./_components/community-map"

export default function CommunityEngagementPage() {
  return (
    <div className="container py-4 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <CommunityHeader />

        <BentoGrid>
          <BentoGridItem
            title="Crime Alerts"
            description="Recent incidents in your area"
            icon={<Bell className="w-5 h-5" />}
            colSpan="2"
          >
            <CrimeAlerts />
          </BentoGridItem>

          <BentoGridItem
            title="Community Map"
            description="Explore your neighborhood"
            icon={<MapPin className="w-5 h-5" />}
            rowSpan="2"
          >
            <CommunityMap />
          </BentoGridItem>

          <BentoGridItem
            title="Safety Tips"
            description="Protect yourself and your property"
            icon={<HelpCircle className="w-5 h-5" />}
          >
            <SafetyTips />
          </BentoGridItem>

          <BentoGridItem
            title="Community Events"
            description="Upcoming meetings and activities"
            icon={<Calendar className="w-5 h-5" />}
          >
            <CommunityEvents />
          </BentoGridItem>

          <BentoGridItem
            title="Neighborhood Watch"
            description="Local groups and coordinators"
            icon={<Users className="w-5 h-5" />}
          >
            <NeighborhoodWatch />
          </BentoGridItem>

          <BentoGridItem
            title="Report an Incident"
            description="Submit non-emergency reports"
            icon={<FileText className="w-5 h-5" />}
          >
            <ReportIncident />
          </BentoGridItem>

          <BentoGridItem
            title="Crime Statistics"
            description="Data and trends for your area"
            icon={<BarChart3 className="w-5 h-5" />}
            colSpan="2"
          >
            <CrimeStatistics />
          </BentoGridItem>

          <BentoGridItem
            title="Resource Directory"
            description="Community services and contacts"
            icon={<Phone className="w-5 h-5" />}
          >
            <ResourceDirectory />
          </BentoGridItem>

          <BentoGridItem
            title="FAQ"
            description="Common questions and answers"
            icon={<HelpCircle className="w-5 h-5" />}
          >
            <FAQSection />
          </BentoGridItem>

          <BentoGridItem
            title="Community Feedback"
            description="Share your thoughts and suggestions"
            icon={<MessageSquare className="w-5 h-5" />}
          >
            <CommunityFeedback />
          </BentoGridItem>
        </BentoGrid>
      </div>
    </div>
  )
}
