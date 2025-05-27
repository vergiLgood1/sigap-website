"use client";

import { Button } from "@/app/_components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/app/_components/ui/tooltip";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/app/_components/ui/popover";
import { ChevronDown, Siren } from "lucide-react";
import { IconMessage } from "@tabler/icons-react";

import { useEffect, useRef, useState } from "react";
import type { ITooltipsControl } from "./tooltips";
import MonthSelector from "../month-selector";
import YearSelector from "../year-selector";
import CategorySelector from "../category-selector";
import SourceTypeSelector from "../source-type-selector";
import { ICrimeSourceTypes } from "@/app/_utils/types/map";

// Define the additional tools and features
const additionalTooltips = [
    {
        id: "reports" as ITooltipsControl,
        icon: <IconMessage size={20} />,
        label: "Police Report",
    },
    {
        id: "recents" as ITooltipsControl,
        icon: <Siren size={20} />,
        label: "Recent incidents",
    },
];

interface AdditionalTooltipsProps {
    activeControl?: string;
    onControlChange?: (controlId: ITooltipsControl) => void;
    selectedYear: number | "all";
    setSelectedYear: (year: number | "all") => void;
    selectedMonth: number | "all";
    setSelectedMonth: (month: number | "all") => void;
    selectedCategory: string | "all";
    setSelectedCategory: (category: string | "all") => void;
    selectedSourceType: ICrimeSourceTypes;
    setSelectedSourceType: (sourceType: ICrimeSourceTypes) => void;
    availableYears?: (number | null)[];
    availableSourceTypes?: string[];
    categories?: string[];
    panicButtonTriggered?: boolean;
    disableYearMonth?: boolean;
}

export default function AdditionalTooltips({
    activeControl,
    onControlChange,
    selectedYear,
    setSelectedYear,
    selectedMonth,
    setSelectedMonth,
    selectedCategory,
    setSelectedCategory,
    selectedSourceType = "cbu",
    setSelectedSourceType,
    availableYears = [],
    availableSourceTypes = [],
    categories = [],
    panicButtonTriggered = false,
    disableYearMonth = false,
}: AdditionalTooltipsProps) {
    const [showSelectors, setShowSelectors] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isClient, setIsClient] = useState(false);

    const container = isClient ? document.getElementById("root") : null;

    useEffect(() => {
        if (
            panicButtonTriggered && activeControl !== "alerts" &&
            onControlChange
        ) {
            onControlChange("alerts");
        }
    }, [panicButtonTriggered, activeControl, onControlChange]);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const isControlDisabled = (controlId: ITooltipsControl) => {
        // When source type is CBU, disable all controls except for layers
        return selectedSourceType === "cbu" && controlId !== "layers";
    };

    return (
        <>
            <div
                ref={containerRef}
                className="z-10 bg-background rounded-md p-1 flex items-center space-x-1"
            >
                <TooltipProvider>
                    {additionalTooltips.map((control) => {
                        const isButtonDisabled = isControlDisabled(control.id);

                        return (
                            <Tooltip key={control.id}>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant={activeControl === control.id
                                            ? "default"
                                            : "ghost"}
                                        size="medium"
                                        className={`h-8 w-8 rounded-md ${
                                            isButtonDisabled
                                                ? "opacity-40 cursor-not-allowed bg-gray-700/30 text-gray-400 border-gray-600 hover:bg-gray-700/30 hover:text-gray-400"
                                                : activeControl === control.id
                                                ? "bg-emerald-500 text-black hover:bg-emerald-500/90"
                                                : "text-white hover:bg-emerald-500/90 hover:text-background"
                                        } ${
                                            control.id === "alerts" &&
                                                panicButtonTriggered
                                                ? "animate-pulse ring-2 ring-red-500"
                                                : ""
                                        }`}
                                        onClick={() =>
                                            onControlChange?.(control.id)}
                                        disabled={isButtonDisabled}
                                        aria-disabled={isButtonDisabled}
                                    >
                                        {control.icon}
                                        <span className="sr-only">
                                            {control.label}
                                        </span>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent side="bottom">
                                    <p>
                                        {isButtonDisabled
                                            ? "Not available for CBU data"
                                            : control.label}
                                    </p>
                                </TooltipContent>
                            </Tooltip>
                        );
                    })}

                    <Tooltip>
                        <Popover
                            open={showSelectors}
                            onOpenChange={setShowSelectors}
                        >
                            <PopoverTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 rounded-md text-white hover:bg-emerald-500/90 hover:text-background"
                                    onClick={() =>
                                        setShowSelectors(!showSelectors)}
                                >
                                    <ChevronDown size={20} />
                                    <span className="sr-only">Filters</span>
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent
                                container={containerRef.current || container ||
                                    undefined}
                                className="w-auto p-3 bg-black/90 border-gray-700 text-white"
                                align="end"
                                style={{ zIndex: 2000 }}
                            >
                                <div className="flex flex-col gap-3">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs w-16">
                                            Source:
                                        </span>
                                        <SourceTypeSelector
                                            availableSourceTypes={availableSourceTypes}
                                            selectedSourceType={selectedSourceType}
                                            onSourceTypeChange={setSelectedSourceType}
                                            className="w-[180px]"
                                        />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs w-16">
                                            Year:
                                        </span>
                                        <YearSelector
                                            availableYears={availableYears}
                                            selectedYear={selectedYear}
                                            onYearChange={setSelectedYear}
                                            className="w-[180px]"
                                            disabled={disableYearMonth}
                                        />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs w-16">
                                            Month:
                                        </span>
                                        <MonthSelector
                                            selectedMonth={selectedMonth}
                                            onMonthChange={setSelectedMonth}
                                            className="w-[180px]"
                                            disabled={disableYearMonth}
                                        />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs w-16">
                                            Category:
                                        </span>
                                        <CategorySelector
                                            categories={categories}
                                            selectedCategory={selectedCategory}
                                            onCategoryChange={setSelectedCategory}
                                            className="w-[180px]"
                                        />
                                    </div>
                                </div>
                            </PopoverContent>
                        </Popover>
                    </Tooltip>
                </TooltipProvider>
            </div>

            {showSelectors && (
                <div className="z-10 bg-background rounded-md p-2 flex items-center gap-2 md:hidden">
                    <SourceTypeSelector
                        availableSourceTypes={availableSourceTypes}
                        selectedSourceType={selectedSourceType}
                        onSourceTypeChange={setSelectedSourceType}
                        className="w-[80px]"
                    />
                    <YearSelector
                        availableYears={availableYears}
                        selectedYear={selectedYear}
                        onYearChange={setSelectedYear}
                        className="w-[80px]"
                    />
                    <MonthSelector
                        selectedMonth={selectedMonth}
                        onMonthChange={setSelectedMonth}
                        className="w-[80px]"
                    />
                    <CategorySelector
                        categories={categories}
                        selectedCategory={selectedCategory}
                        onCategoryChange={setSelectedCategory}
                        className="w-[80px]"
                    />
                </div>
            )}
        </>
    );
}
