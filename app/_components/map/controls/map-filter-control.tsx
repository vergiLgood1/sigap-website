// "use client"

// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/_components/ui/select"
// import { Button } from "@/app/_components/ui/button"
// import { FilterX } from "lucide-react"
// import { useCallback } from "react"

// interface MapFilterControlProps {
//     selectedYear: number
//     selectedMonth: number | "all"
//     availableYears: (number | null)[]
//     yearsLoading: boolean
//     onYearChange: (year: number) => void
//     onMonthChange: (month: number | "all") => void
//     onApplyFilters: () => void
//     onResetFilters: () => void
// }

// const months = [
//     { value: "1", label: "January" },
//     { value: "2", label: "February" },
//     { value: "3", label: "March" },
//     { value: "4", label: "April" },
//     { value: "5", label: "May" },
//     { value: "6", label: "June" },
//     { value: "7", label: "July" },
//     { value: "8", label: "August" },
//     { value: "9", label: "September" },
//     { value: "10", label: "October" },
//     { value: "11", label: "November" },
//     { value: "12", label: "December" },
// ]

// export default function MapFilterControl({
//     selectedYear,
//     selectedMonth,
//     availableYears,
//     yearsLoading,
//     onYearChange,
//     onMonthChange,
//     onApplyFilters,
//     onResetFilters,
// }: MapFilterControlProps) {
//     const handleYearChange = useCallback(
//         (value: string) => {
//             onYearChange(Number(value))
//         },
//         [onYearChange],
//     )

//     const handleMonthChange = useCallback(
//         (value: string) => {
//             onMonthChange(value === "all" ? "all" : Number(value))
//         },
//         [onMonthChange],
//     )

//     const isDefaultFilter = selectedYear === 2024 && selectedMonth === "all"

//     return (
//         <div className="absolute top-20 right-2 z-10 bg-white bg-opacity-90 p-2 rounded-md shadow-lg flex flex-col gap-2 max-w-[220px]">
//             <div className="text-sm font-medium mb-1">Map Filters</div>

//             <div className="grid grid-cols-1 gap-2">
//                 <Select value={selectedYear.toString()} onValueChange={handleYearChange}>
//                     <SelectTrigger className="h-8 w-full">
//                         <SelectValue placeholder="Year" />
//                     </SelectTrigger>
//                     <SelectContent>
//                         {!yearsLoading &&
//                             availableYears
//                                 ?.filter((year) => year !== null)
//                                 .map((year) => (
//                                     <SelectItem key={year} value={year!.toString()}>
//                                         {year}
//                                     </SelectItem>
//                                 ))}
//                     </SelectContent>
//                 </Select>

//                 <Select value={selectedMonth.toString()} onValueChange={handleMonthChange}>
//                     <SelectTrigger className="h-8 w-full">
//                         <SelectValue placeholder="Month" />
//                     </SelectTrigger>
//                     <SelectContent>
//                         <SelectItem value="all">All Months</SelectItem>
//                         {months.map((month) => (
//                             <SelectItem key={month.value} value={month.value}>
//                                 {month.label}
//                             </SelectItem>
//                         ))}
//                     </SelectContent>
//                 </Select>

//                 <div className="flex gap-1">
//                     <Button className="h-8 text-xs flex-1" variant="default" onClick={onApplyFilters}>
//                         Apply
//                     </Button>
//                     <Button className="h-8 text-xs" variant="ghost" onClick={onResetFilters} disabled={isDefaultFilter}>
//                         <FilterX className="h-3 w-3 mr-1" />
//                         Reset
//                     </Button>
//                 </div>
//             </div>
//         </div>
//     )
// }
