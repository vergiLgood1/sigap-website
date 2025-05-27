"use client";

import { FileText, Image, FileArchive, FileCode } from "lucide-react";
import { Badge } from "@/app/_components/ui/badge";
import { Skeleton } from "@/app/_components/ui/skeleton";
import { useGetEvidenceTracking } from "../_queries/queries";
import { PlaceholderImage } from "@/app/_components/ui/placeholder-image";
import { faker } from "@faker-js/faker";

export default function EvidenceTracking() {
  const { data: evidenceData, isLoading, error } = useGetEvidenceTracking();

  if (isLoading) {
    return (
      <div className="space-y-2 mt-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-2 rounded-lg p-2">
            <Skeleton className="w-8 h-8 rounded" />
            <div className="flex-1 min-w-0">
              <Skeleton className="h-4 w-20 mb-1" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-6 w-16" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return <div className="mt-4 text-red-500">Error loading evidence data</div>;
  }

  const evidenceItems = evidenceData || [];

  // Add images based on evidence type
  const evidenceWithImages = evidenceItems.map((item: any, index: number) => {
    // Use consistent seed for same evidence
    faker.seed(parseInt(item.id.replace(/\D/g, "")) || index);

    const getEvidenceImage = (type: string) => {
      switch (type.toLowerCase()) {
        case "photo":
        case "image":
          return faker.image.url();
        case "document":
          return faker.image.url();
        case "audio":
        case "video":
          return null; // No image for audio/video
        default:
          return faker.image.url();
      }
    };

    const getEvidenceIcon = (type: string) => {
      switch (type.toLowerCase()) {
        case "photo":
        case "image":
          return <Image className="h-4 w-4 text-accent" />;
        case "document":
          return <FileText className="h-4 w-4 text-accent" />;
        case "audio":
        case "video":
          return <FileCode className="h-4 w-4 text-accent" />;
        default:
          return <FileArchive className="h-4 w-4 text-accent" />;
      }
    };

    return {
      ...item,
      image: getEvidenceImage(item.type),
      icon: getEvidenceIcon(item.type),
    };
  });

  const getStatusClass = (status: string) => {
    switch (status) {
      case "Processing":
        return "bg-yellow-100 text-yellow-800";
      case "Secured":
        return "bg-green-100 text-green-800";
      case "Lab Analysis":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-2 mt-4">
      {evidenceWithImages.map((evidence: any) => (
        <div
          key={evidence.id}
          className="flex items-center gap-2 rounded-lg p-2"
        >
          <div className="w-8 h-8 rounded bg-slate-100 overflow-hidden">
            <PlaceholderImage
              // src={evidence.image}
              alt={evidence.type}
              className="w-full h-full"
              fallbackClassName="rounded"
              icon={evidence.icon}
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{evidence.id}</p>
            <p className="text-xs text-muted-foreground">
              {evidence.type} • Case #{evidence.case}
            </p>
          </div>
          <Badge
            variant="outline"
            className={`text-xs ${getStatusClass(evidence.status)}`}
          >
            {evidence.status}
          </Badge>
        </div>
      ))}
    </div>
  );
}
