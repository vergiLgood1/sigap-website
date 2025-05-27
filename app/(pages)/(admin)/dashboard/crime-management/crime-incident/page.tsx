"use client"

import { ArrowLeft, Calendar, FileText, MessageSquare, Paperclip, Shield, User } from "lucide-react"
import { Button } from "@/app/_components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/_components/ui/tabs"
import CaseHeader from "./_components/case-header"
import CaseTimeline from "./_components/case-timeline"
import CaseEvidence from "./_components/case-evidence"
import CaseWitnesses from "./_components/case-witnesses"
import CaseDocuments from "./_components/case-documents"
import CaseNotes from "./_components/case-notes"
import CaseAssignees from "./_components/case-assignees"
import CaseRelated from "./_components/case-related"

export default function CrimeIncidentPage() {
  return (
    <div className="container py-4 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Cases
          </Button>

          <CaseHeader
            caseId="CR-7823"
            title="Homicide Investigation - Downtown District"
            status="Active"
            priority="Critical"
            dateOpened="2023-04-15"
            lastUpdated="2023-04-22"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Tabs defaultValue="timeline" className="w-full">
              <TabsList className="grid grid-cols-5 mb-4">
                <TabsTrigger value="timeline">
                  <Calendar className="h-4 w-4 mr-2" />
                  Timeline
                </TabsTrigger>
                <TabsTrigger value="evidence">
                  <Paperclip className="h-4 w-4 mr-2" />
                  Evidence
                </TabsTrigger>
                <TabsTrigger value="witnesses">
                  <User className="h-4 w-4 mr-2" />
                  Witnesses
                </TabsTrigger>
                <TabsTrigger value="documents">
                  <FileText className="h-4 w-4 mr-2" />
                  Documents
                </TabsTrigger>
                <TabsTrigger value="notes">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Notes
                </TabsTrigger>
              </TabsList>

              <TabsContent value="timeline" className="border rounded-lg p-4">
                <CaseTimeline />
              </TabsContent>

              <TabsContent value="evidence" className="border rounded-lg p-4">
                <CaseEvidence />
              </TabsContent>

              <TabsContent value="witnesses" className="border rounded-lg p-4">
                <CaseWitnesses />
              </TabsContent>

              <TabsContent value="documents" className="border rounded-lg p-4">
                <CaseDocuments />
              </TabsContent>

              <TabsContent value="notes" className="border rounded-lg p-4">
                <CaseNotes />
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-6">
            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Assigned Personnel
              </h3>
              <CaseAssignees />
            </div>

            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4">Related Cases</h3>
              <CaseRelated />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
