"use client";

import { faker } from "@faker-js/faker";
import { useGetActiveOfficers } from "../_queries/queries";
import { Skeleton } from "@/app/_components/ui/skeleton";

export default function ActiveOfficers() {
  const { data: officersData, isLoading, error } = useGetActiveOfficers();

  if (isLoading) {
    return (
      <>
        <div className="flex -space-x-2 mt-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="w-10 h-10 rounded-full" />
          ))}
          <Skeleton className="w-10 h-10 rounded-full" />
        </div>
        <div className="mt-4 flex justify-between text-sm">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-24" />
        </div>
      </>
    );
  }

  if (error) {
    return <div className="mt-4 text-red-500">Error loading officers data</div>;
  }

  const { totalOfficers = 0, onDutyCount = 0 } = officersData || {};

  // Generate faker avatars using personPortrait
  const generateAvatars = (count: number) => {
    const avatars = [];
    for (let i = 0; i < Math.min(count, 5); i++) {
      faker.seed(i); // Set seed for consistent results
      avatars.push({
        id: i,
        avatar: faker.image.personPortrait(),
        name: `Officer ${i + 1}`,
      });
    }
    return avatars;
  };

  const avatars = generateAvatars(onDutyCount);

  return (
    <>
      <div className="flex -space-x-2 mt-4">
        {avatars.slice(0, 5).map((officer) => (
          <div
            key={officer.id}
            className="w-10 h-10 rounded-full border-2 border-background bg-white overflow-hidden"
            title={officer.name}
          >
            <img
              src={officer.avatar}
              alt={officer.name}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
        {onDutyCount > 5 && (
          <div className="w-10 h-10 rounded-full border-2 border-background bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">
            +{onDutyCount - 5}
          </div>
        )}
      </div>
      <div className="mt-4 flex justify-between text-sm">
        <span className="text-muted-foreground">Total on duty:</span>
        <span className="font-medium">
          {onDutyCount}/{totalOfficers} officers
        </span>
      </div>
    </>
  );
}
