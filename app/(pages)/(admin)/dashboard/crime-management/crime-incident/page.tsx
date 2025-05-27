"use client"

import { IncidentLogsTable, CrimeIncidentsTable, CrimesTable } from "./_components/crime-tables"
import { IncidentLogsStats, CrimeIncidentsStats, CrimesSummaryStats } from "./_components/stats-cards"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/_components/ui/tabs"
import { FileText, AlertCircle, BarChart3 } from "lucide-react"
import { useGetCrimes, useGetCrimeIncidents, useGetIncidentLogs } from "./_queries/queries"

export default function CrimeManagementPage() {
  // Fetch data for all tabs
  const { data: incidentLogs = [] } = useGetIncidentLogs();
  const { data: crimeIncidents = [] } = useGetCrimeIncidents();
  const { data: crimes = [] } = useGetCrimes();

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Crime Management</h1>
        <p className="text-muted-foreground">
          Manage incident reports, cases, and crime statistics
        </p>
      </div>

      <Tabs defaultValue="incident-logs" className="space-y-4">
        <TabsList>
          <TabsTrigger
            value="incident-logs"
            className="flex items-center gap-2"
          >
            <AlertCircle className="h-4 w-4" />
            <span>Incident Logs</span>
          </TabsTrigger>
          <TabsTrigger
            value="crime-incidents"
            className="flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            <span>Crime Incidents</span>
          </TabsTrigger>
          <TabsTrigger
            value="crime-summary"
            className="flex items-center gap-2"
          >
            <BarChart3 className="h-4 w-4" />
            <span>Crime Summary</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="incident-logs">
          <IncidentLogsStats incidentLogs={incidentLogs} />
          <IncidentLogsTable />
        </TabsContent>

        <TabsContent value="crime-incidents">
          <CrimeIncidentsStats crimeIncidents={crimeIncidents} />
          <CrimeIncidentsTable />
        </TabsContent>

        <TabsContent value="crime-summary">
          <CrimesSummaryStats crimes={crimes} />
          <CrimesTable />
        </TabsContent>
      </Tabs>
    </div>
  )
}
