"use client"

import { BentoGrid, BentoGridItem } from "@/app/_components/ui/bento-grid"
import { Briefcase, FileText, Package, ImageIcon, Database, Clock, AlertTriangle, Search } from "lucide-react"

import EvidenceHeader from "./_components/evidence-header"
import EvidenceCatalog from "./_components/evidence-catalog"
import ChainOfCustody from "./_components/chain-of-custody"
import LabAnalysis from "./_components/lab-analysis"
import StorageLocations from "./_components/storage-locations"
import EvidenceByCase from "./_components/evidence-by-case"
import DigitalEvidence from "./_components/digital-evidence"
import EvidenceDisposal from "./_components/evidence-disposal"
import EvidenceSearch from "./_components/evidence-search"

export default function EvidenceManagementPage() {
  return (
    <div className="container py-4 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <EvidenceHeader />

        <BentoGrid>
          <BentoGridItem
            title="Evidence Catalog"
            description="Recently logged items"
            icon={<Briefcase className="w-5 h-5" />}
            colSpan="2"
          >
            <EvidenceCatalog />
          </BentoGridItem>

          <BentoGridItem
            title="Chain of Custody"
            description="Evidence handling records"
            icon={<Clock className="w-5 h-5" />}
          >
            <ChainOfCustody />
          </BentoGridItem>

          <BentoGridItem
            title="Lab Analysis"
            description="Processing status and results"
            icon={<FileText className="w-5 h-5" />}
            colSpan="2"
          >
            <LabAnalysis />
          </BentoGridItem>

          <BentoGridItem
            title="Storage Locations"
            description="Evidence storage management"
            icon={<Package className="w-5 h-5" />}
          >
            <StorageLocations />
          </BentoGridItem>

          <BentoGridItem
            title="Evidence by Case"
            description="Items grouped by case"
            icon={<Database className="w-5 h-5" />}
          >
            <EvidenceByCase />
          </BentoGridItem>

          <BentoGridItem
            title="Digital Evidence"
            description="Files, recordings, and media"
            icon={<ImageIcon className="w-5 h-5" />}
          >
            <DigitalEvidence />
          </BentoGridItem>

          <BentoGridItem
            title="Evidence Disposal"
            description="Scheduled for destruction or return"
            icon={<AlertTriangle className="w-5 h-5" />}
          >
            <EvidenceDisposal />
          </BentoGridItem>

          <BentoGridItem
            title="Evidence Search"
            description="Find items by ID, case, or type"
            icon={<Search className="w-5 h-5" />}
          >
            <EvidenceSearch />
          </BentoGridItem>
        </BentoGrid>
      </div>
    </div>
  )
}
