"use client"

import { BentoGrid, BentoGridItem } from "@/app/_components/ui/bento-grid"
import { BarChart3, TrendingUp, Map, Calendar, Clock, FileText, AlertTriangle, Filter } from "lucide-react"
import AnalyticsHeader from "./_components/analytics-header"
import CrimeTrends from "./_components/crime-trends"
import GeographicalAnalysis from "./_components/geographical-analysis"
import ResponseTimeMetrics from "./_components/response-time-metrics"
import CaseResolutionRates from "./_components/case-resolution-rates"
import IncidentTypeBreakdown from "./_components/incident-type-breakdown"
import OfficerPerformanceMetrics from "./_components/officer-performance-metrics"
import TimeOfDayAnalysis from "./_components/time-of-day-analysis"
import CustomReportBuilder from "./_components/custom-report-builder"
import PredictiveAnalytics from "./_components/predictive-analytics"

export default function AnalyticsReportingPage() {
  return (
    <div className="container py-4 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <AnalyticsHeader />

        <BentoGrid>
          <BentoGridItem
            title="Crime Trends"
            description="Monthly and yearly crime statistics"
            icon={<TrendingUp className="w-5 h-5" />}
            colSpan="2"
          >
            <CrimeTrends />
          </BentoGridItem>

          <BentoGridItem
            title="Geographical Analysis"
            description="Crime hotspots and patterns"
            icon={<Map className="w-5 h-5" />}
            rowSpan="2"
          >
            <GeographicalAnalysis />
          </BentoGridItem>

          <BentoGridItem
            title="Response Time Metrics"
            description="Emergency response efficiency"
            icon={<Clock className="w-5 h-5" />}
          >
            <ResponseTimeMetrics />
          </BentoGridItem>

          <BentoGridItem
            title="Case Resolution Rates"
            description="Clearance rates by crime type"
            icon={<FileText className="w-5 h-5" />}
          >
            <CaseResolutionRates />
          </BentoGridItem>

          <BentoGridItem
            title="Incident Type Breakdown"
            description="Distribution of crime categories"
            icon={<BarChart3 className="w-5 h-5" />}
            colSpan="2"
          >
            <IncidentTypeBreakdown />
          </BentoGridItem>

          <BentoGridItem
            title="Officer Performance Metrics"
            description="Productivity and efficiency analysis"
            icon={<BarChart3 className="w-5 h-5" />}
          >
            <OfficerPerformanceMetrics />
          </BentoGridItem>

          <BentoGridItem
            title="Time of Day Analysis"
            description="Crime patterns by hour and day"
            icon={<Calendar className="w-5 h-5" />}
          >
            <TimeOfDayAnalysis />
          </BentoGridItem>

          <BentoGridItem
            title="Predictive Analytics"
            description="Crime forecasting and risk assessment"
            icon={<AlertTriangle className="w-5 h-5" />}
          >
            <PredictiveAnalytics />
          </BentoGridItem>

          <BentoGridItem
            title="Custom Report Builder"
            description="Generate tailored reports"
            icon={<Filter className="w-5 h-5" />}
          >
            <CustomReportBuilder />
          </BentoGridItem>
        </BentoGrid>
      </div>
    </div>
  )
}
