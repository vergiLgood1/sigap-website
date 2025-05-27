import { ChevronDown, LucideIcon } from "lucide-react";

export type LanguageType = {
  value: string;
  prefix?: LucideIcon;
  label: string;
  subLabel: string;
  beta?: boolean;
};

export const languages = [
  {
    value: "en-US",
    prefix: ChevronDown,
    label: "English",
    subLabel: "English (US)",
    beta: true,
  },
  {
    value: "id-ID",
    prefix: ChevronDown,
    label: "Indonesian",
    subLabel: "Indonesia",
    beta: true,
  },
  {
    value: "ja-JP",
    prefix: ChevronDown,
    label: "日本語",
    subLabel: "Japanese",
    beta: true,
  },
  {
    value: "ko-KR",
    prefix: ChevronDown,
    label: "한국어",
    subLabel: "Korean",
    beta: true,
  },
  {
    value: "zh-CN",
    prefix: ChevronDown,
    label: "中文",
    subLabel: "Chinese (Simplified)",
    beta: true,
  },
  {
    value: "es-419",
    prefix: ChevronDown,
    label: "Español (Latinoamérica)",
    subLabel: "Spanish (Latin America)",
    beta: true,
  },
];
