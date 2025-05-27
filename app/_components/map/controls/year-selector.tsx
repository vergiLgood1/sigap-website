"use client";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/app/_components/ui/select";
import { createRoot } from "react-dom/client";
import { useEffect, useRef, useState } from "react";
import { Skeleton } from "../../ui/skeleton";

interface YearSelectorProps {
    availableYears?: (number | null)[];
    selectedYear: number | "all";
    onYearChange: (year: number | "all") => void;
    includeAllOption?: boolean;
    isLoading?: boolean;
    className?: string;
    disabled?: boolean;
}

// React component for the year selector UI
function YearSelectorUI({
    availableYears = [],
    selectedYear,
    onYearChange,
    includeAllOption = true,
    isLoading = false,
    className = "w-[120px]",
    disabled = false,
}: YearSelectorProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        // This will ensure that the document is only used in the client-side context
        setIsClient(true);
    }, []);

    // Conditionally access the document only when running on the client
    const container = isClient ? document.getElementById("root") : null;

    return (
        <div ref={containerRef} className="mapboxgl-month-selector">
            {isLoading
                ? (
                    <div className="flex items-center justify-center h-8">
                        <Skeleton className="h-full w-full rounded-md" />
                    </div>
                )
                : (
                    <Select
                        value={selectedYear.toString()}
                        onValueChange={(value) =>
                            onYearChange(
                                value === "all" ? "all" : Number(value),
                            )}
                        disabled={disabled}
                    >
                        <SelectTrigger
                            className={`${className} ${
                                disabled
                                    ? "opacity-60 cursor-not-allowed bg-muted"
                                    : ""
                            }`}
                        >
                            <SelectValue placeholder="Month" />
                        </SelectTrigger>
                        <SelectContent
                            container={containerRef.current || container ||
                                undefined}
                            style={{ zIndex: 2000 }}
                            className={`${className}`}
                        >
                            {includeAllOption && (
                                <SelectItem value="all">All Years</SelectItem>
                            )}

                            {availableYears.map((year) => (
                                year !== null && (
                                    <SelectItem
                                        key={year}
                                        value={year.toString()}
                                    >
                                        {year}
                                    </SelectItem>
                                )
                            ))}
                        </SelectContent>
                    </Select>
                )}
        </div>
    );
}

// Mapbox GL control class implementation
export class YearSelectorControl {
    private _map: any;
    private _container!: HTMLElement;
    private _root: any;
    private props: YearSelectorProps;

    constructor(props: YearSelectorProps) {
        this.props = props;
    }

    onAdd(map: any) {
        this._map = map;
        this._container = document.createElement("div");
        this._container.className = "mapboxgl-ctrl mapboxgl-ctrl-group";
        this._container.style.padding = "5px";

        // Set position to relative to keep dropdown content in context
        this._container.style.position = "relative";
        // Higher z-index to ensure dropdown appears above map elements
        this._container.style.zIndex = "50";

        // Create React root for rendering our component
        this._root = createRoot(this._container);
        this._root.render(<YearSelectorUI {...this.props} />);

        return this._container;
    }

    onRemove() {
        if (this._container && this._container.parentNode) {
            this._container.parentNode.removeChild(this._container);
        }

        // Unmount React component properly
        if (this._root) {
            this._root.unmount();
        }

        this._map = undefined;
    }
}

// Export original React component as default for backward compatibility
export default function YearSelector(props: YearSelectorProps) {
    // This wrapper allows the component to be used both as a React component
    // and to help create a MapboxGL control
    return <YearSelectorUI {...props} />;
}
