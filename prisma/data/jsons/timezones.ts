import { ChevronDown, LucideIcon } from "lucide-react";

export type TimezoneType = {
  value: string;
  prefix?: LucideIcon;
  label: string;
  subLabel: string;
};

// Initial timezone options
export const initialTimezones = [
  {
    value: "Asia/Jakarta",
    prefix: ChevronDown,
    label: "Jakarta",
    subLabel: "(GMT+7:00)",
  },
  {
    value: "Asia/Singapore",
    prefix: ChevronDown,
    label: "Singapore",
    subLabel: "(GMT+8:00)",
  },
  {
    value: "Asia/Tokyo",
    prefix: ChevronDown,
    label: "Tokyo",
    subLabel: "(GMT+9:00)",
  },
  {
    value: "Australia/Adelaide",
    prefix: ChevronDown,
    label: "Adelaide",
    subLabel: "(GMT+9:30)",
  },
  {
    value: "Australia/Sydney",
    prefix: ChevronDown,
    label: "Sydney",
    subLabel: "(GMT+10:00)",
  },
];
