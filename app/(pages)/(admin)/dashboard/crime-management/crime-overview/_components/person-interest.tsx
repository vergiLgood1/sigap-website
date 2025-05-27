'use client';

import { User, Phone, Mail } from "lucide-react"
import { Badge } from "@/app/_components/ui/badge"
import { Skeleton } from "@/app/_components/ui/skeleton"
import { useGetPersonsOfInterest } from "../_queries/queries"
import { PlaceholderImage } from "@/app/_components/ui/placeholder-image"
import { faker } from "@faker-js/faker";
import { format } from "date-fns";

export default function RecentReporters() {
  const { data: reportersData, isLoading, error } = useGetPersonsOfInterest()

  if (isLoading) {
    return (
      <div className="space-y-2 mt-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-2 rounded-lg p-2">
            <Skeleton className="w-8 h-8 rounded-full" />
            <div className="flex-1 min-w-0">
              <Skeleton className="h-4 w-24 mb-1" />
              <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="h-6 w-16" />
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return <div className="mt-4 text-red-500">Error loading reporter data</div>
  }

  const reporters = reportersData || []

  // Generate placeholder images for reporters without avatars
  const reportersWithImages = reporters.map((reporter, index) => {
    if (reporter.avatar) return reporter;

    // Use consistent seed for same user
    faker.seed(parseInt(reporter.userId.replace(/\D/g, '')) || index);
    return {
      ...reporter,
      avatar: faker.image.personPortrait(),
    };
  });

  const getStatusClass = (status: string) => {
    switch (status) {
      case "Confirmed":
        return "bg-green-100 text-green-800"
      case "Reviewing":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-slate-100 text-slate-800"
    }
  }

  return (
    <div className="space-y-2 mt-4">
      {reportersWithImages.map((reporter: any) => (
        <div key={reporter.id} className="flex items-center gap-2 rounded-lg p-2 ">
          <div className="w-8 h-8 rounded-full overflow-hidden">
            <PlaceholderImage
              src={reporter.avatar}
              alt={reporter.name}
              className="w-full h-full"
              fallbackClassName="rounded-full"
              icon={<User className="h-4 w-4" />}
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{reporter.name}</p>
            <p className="text-xs text-muted-foreground truncate flex items-center">
              <span className="mr-2">{reporter.reportType}</span>
              <span className="text-xs opacity-60">{format(new Date(reporter.reportDate), 'MMM d, h:mm a')}</span>
            </p>
          </div>
          <Badge variant="outline" className={getStatusClass(reporter.status)}>
            {reporter.status}
          </Badge>
        </div>
      ))}
      {reportersWithImages.length === 0 && (
        <div className="text-center text-muted-foreground py-4">
          No recent reports
        </div>
      )}
    </div>
  )
}
