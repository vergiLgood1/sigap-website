"use client";

import { Skeleton } from "@/app/_components/ui/skeleton";
import { useGetEmergencyCallsMetrics } from "../_queries/queries";

export default function EmergencyCalls() {
  const { data: callsData, isLoading, error } = useGetEmergencyCallsMetrics();

  if (isLoading) {
    return (
      <div className="space-y-2 mt-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex justify-between items-center">
            <Skeleton className="h-4 w-20" />
            <div className="flex items-center">
              <Skeleton className="h-5 w-8 mr-1" />
              <Skeleton className="h-4 w-12" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return <div className="mt-4 text-red-500">Error loading calls data</div>;
  }

  const {
    callsThisHour = 0,
    averageWait = "0:00",
    operatorsAvailable = 0,
    totalOperators = 0,
  } = callsData || {};

  const getCallVolumeStatus = (calls: number) => {
    if (calls > 20)
      return { text: "High", className: "bg-red-100 text-red-800" };
    if (calls > 10)
      return { text: "Medium", className: "bg-yellow-100 text-yellow-800" };
    return { text: "Low", className: "bg-green-100 text-green-800" };
  };

  const getStaffingStatus = (available: number, total: number) => {
    const ratio = available / total;
    if (ratio < 0.5)
      return { text: "Understaffed", className: "bg-red-100 text-red-800" };
    if (ratio < 0.8)
      return { text: "Low Staff", className: "bg-yellow-100 text-yellow-800" };
    return { text: "Adequate", className: "bg-green-100 text-green-800" };
  };

  const callVolumeStatus = getCallVolumeStatus(callsThisHour);
  const staffingStatus = getStaffingStatus(operatorsAvailable, totalOperators);

  const callMetrics = [
    {
      label: "Calls This Hour",
      value: callsThisHour.toString(),
      badge: callVolumeStatus,
    },
    {
      label: "Avg. Processing Time",
      value: averageWait,
    },
    {
      label: "Active Units",
      value: `${operatorsAvailable}/${totalOperators}`,
      badge: staffingStatus,
    },
  ];

  return (
    <div className="space-y-2 mt-4">
      {callMetrics.map((metric) => (
        <div key={metric.label} className="flex justify-between items-center">
          <span className="text-sm">{metric.label}</span>
          <div className="flex items-center">
            <span className="text-lg font-bold mr-1">{metric.value}</span>
            {metric.badge && (
              <span
                className={`text-xs px-1.5 py-0.5 rounded-full ${metric.badge.className}`}
              >
                {metric.badge.text}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
