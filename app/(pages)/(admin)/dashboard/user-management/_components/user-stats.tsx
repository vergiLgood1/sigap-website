"use client";

import { Card, CardContent } from "@/app/_components/ui/card";
import { Users, UserCheck, UserX } from "lucide-react";
import { IUserSchema } from "@/src/entities/models/users/users.model";
import { useGetUsersQuery } from "../_queries/queries";
import { calculateUserStats } from "@/app/_utils/common";

export function UserStats() {
  const { data: users, isPending, error } = useGetUsersQuery();

  const stats = calculateUserStats(users);

  if (isPending) {
    return (
      <>
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="bg-background border-border">
            <CardContent className="p-6">
              <div className="space-y-4 animate-pulse">
                <div className="h-5 w-24 bg-muted rounded" />
                <div className="h-8 w-16 bg-muted rounded" />
                <div className="h-4 w-32 bg-muted rounded" />
              </div>
            </CardContent>
          </Card>
        ))}
      </>
    );
  }

  // Show error state if there's an error
  if (error) {
    return (
      <Card className="bg-background border-border">
        <CardContent className="p-6">
          <div className="text-destructive text-center">Error fetching data</div>
        </CardContent>
      </Card>
    );
  }

  const cards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      subtitle: 'Updated just now',
      icon: Users,
    },
    {
      title: 'Active Users',
      value: stats.activeUsers,
      subtitle: `${stats.activePercentage}% of total users`,
      icon: UserCheck,
    },
    {
      title: 'Inactive Users',
      value: stats.inactiveUsers,
      subtitle: `${stats.inactivePercentage}% of total users`,
      icon: UserX,
    },
  ];

  return (
    <>
      {cards.map((card, index) => (
        <Card key={index} className="bg-background border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="font-medium text-sm text-muted-foreground">
                {card.title}
              </div>
              <card.icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-3xl font-bold mb-2">{card.value}</div>
            <div className="text-sm text-muted-foreground">{card.subtitle}</div>
          </CardContent>
        </Card>
      ))}
    </>
  );
}