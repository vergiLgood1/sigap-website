import type React from "react"

import { useEffect, useMemo, useState, useCallback, useRef } from "react"
import { ChevronLeft, ChevronRight, Clock } from "lucide-react"
import { DayPicker } from "react-day-picker"
import { useVirtualizer } from "@tanstack/react-virtual"

import { cn } from "@/app/_lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/_components/ui/select"
import { Input } from "@/app/_components/ui/input"
import { Button } from "@/app/_components/ui/button"

// Custom calendar component with enhanced year and month navigation
export function DateTimePicker({
    selected,
    onSelect,
    disabled,
    fromYear = 1900,
    toYear = new Date().getFullYear() + 10,
    showTimePicker = true,
    className,
    minuteStep = 1,
    showSeconds = true,
}: {
        selected?: Date
        onSelect: (date?: Date) => void
        disabled?: (date: Date) => boolean
        fromYear?: number
        toYear?: number
        showTimePicker?: boolean
        className?: string
        minuteStep?: number
        showSeconds?: boolean
}) {
    // Initialize with selected date or current date
    const [date, setDate] = useState<Date>(() => {
        return selected ? new Date(selected) : new Date()
    })

    const [hours, setHours] = useState<string>(() => {
        return selected ? String(selected.getHours()).padStart(2, "0") : String(new Date().getHours()).padStart(2, "0")
    })

    const [minutes, setMinutes] = useState<string>(() => {
        if (selected) {
            return String(selected.getMinutes()).padStart(2, "0")
        }
        // Round current minutes to nearest step
        const currentMinutes = new Date().getMinutes()
        const roundedMinutes = Math.round(currentMinutes / minuteStep) * minuteStep
        return String(roundedMinutes % 60).padStart(2, "0")
    })

    const [seconds, setSeconds] = useState<string>(() => {
        return selected ? String(selected.getSeconds()).padStart(2, "0") : String(0).padStart(2, "0")
    })

    // Track if we're in the middle of an update to prevent loops
    const isUpdatingRef = useRef(false)

    // Generate valid minute options based on minuteStep
    const minuteOptions = useMemo(() => {
        const options = []
        for (let i = 0; i < 60; i += minuteStep) {
            options.push(String(i).padStart(2, "0"))
        }
        return options
    }, [minuteStep])

    // Generate valid hour options
    const hourOptions = useMemo(() => {
        return Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"))
    }, [])

    // Generate valid second options
    const secondOptions = useMemo(() => {
        return Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"))
    }, [])

    // Update the parent component when date or time changes
    useEffect(() => {
        if (isUpdatingRef.current) return

        if (date) {
            const newDate = new Date(date)
            newDate.setHours(Number.parseInt(hours, 10))
            newDate.setMinutes(Number.parseInt(minutes, 10))
            newDate.setSeconds(Number.parseInt(seconds, 10))
            newDate.setMilliseconds(0)

            // Only call onSelect if the date actually changed
            if (!selected || Math.abs(newDate.getTime() - (selected?.getTime() || 0)) > 100) {
                isUpdatingRef.current = true
                onSelect(newDate)
                setTimeout(() => {
                    isUpdatingRef.current = false
                }, 0)
            }
        } else {
            onSelect(undefined)
        }
    }, [date, hours, minutes, seconds, onSelect, selected])

    // Update internal state when selected prop changes
    useEffect(() => {
        if (isUpdatingRef.current) return

        if (selected) {
            setDate(new Date(selected))
            setHours(String(selected.getHours()).padStart(2, "0"))
            setMinutes(String(selected.getMinutes()).padStart(2, "0"))
            setSeconds(String(selected.getSeconds()).padStart(2, "0"))
        }
    }, [selected])

    // Generate years array from fromYear to toYear
    const years = useMemo(() => Array.from({ length: toYear - fromYear + 1 }, (_, i) => toYear - i), [fromYear, toYear])

    const months = useMemo(
        () => [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December",
        ],
        [],
    )

    // Handle time input changes
    const handleHoursChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, "")
        if (value === "") {
            setHours("00")
            return
        }

        const numValue = Number.parseInt(value, 10)
        if (numValue > 23) {
            value = "23"
        }
        setHours(value.padStart(2, "0"))
    }, [])

    const handleMinutesChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, "")
        if (value === "") {
            setMinutes("00")
            return
        }

        const numValue = Number.parseInt(value, 10)
        if (numValue > 59) {
            value = "59"
        }
        setMinutes(value.padStart(2, "0"))
    }, [])

    const handleSecondsChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, "")
        if (value === "") {
            setSeconds("00")
            return
        }

        const numValue = Number.parseInt(value, 10)
        if (numValue > 59) {
            value = "59"
        }
        setSeconds(value.padStart(2, "0"))
    }, [])

    // Clear date selection
    const handleClear = useCallback(() => {
        const now = new Date()
        setDate(now)
        setHours("00")
        setMinutes("00")
        setSeconds("00")
        onSelect(new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0))
    }, [onSelect])

    // Set date to now
    const handleSetNow = useCallback(() => {
        const now = new Date()
        setDate(now)
        setHours(String(now.getHours()).padStart(2, "0"))
        const roundedMinutes = Math.round(now.getMinutes() / minuteStep) * minuteStep
        setMinutes(String(roundedMinutes % 60).padStart(2, "0"))
        setSeconds(String(now.getSeconds()).padStart(2, "0"))
        onSelect(now)
    }, [minuteStep, onSelect])

    // Custom caption component with optimized year selection
    const CustomCaption = useCallback(
        ({ displayMonth }: { displayMonth: Date }) => {
            const month = displayMonth.getMonth()
            const year = displayMonth.getFullYear()

            const handleMonthChange = useCallback(
                (newMonth: string) => {
                    const monthIndex = months.findIndex((m) => m === newMonth)
                    const newDate = new Date(date)
                    newDate.setMonth(monthIndex)
                    setDate(newDate)
                },
                [date, months],
            )

            const handleYearChange = useCallback(
                (newYear: string) => {
                    const newDate = new Date(date)
                    newDate.setFullYear(Number.parseInt(newYear))
                    setDate(newDate)
                },
                [date],
            )

            return (
                <div className="flex items-center justify-center gap-2 py-2">
                    <Select value={months[month]} onValueChange={handleMonthChange}>
                        <SelectTrigger className="h-8 w-[110px] text-sm">
                            <SelectValue placeholder={months[month]} />
                        </SelectTrigger>
                        <SelectContent>
                            {months.map((monthName) => (
                                <SelectItem key={monthName} value={monthName} className="text-sm">
                                    {monthName}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={year.toString()} onValueChange={handleYearChange}>
                        <SelectTrigger className="h-8 w-[90px] text-sm">
                            <SelectValue placeholder={year.toString()} />
                        </SelectTrigger>
                        <SelectContent className="h-[200px] overflow-auto">
                            {years.map((yearValue) => (
                                <SelectItem key={yearValue} value={yearValue.toString()} className="text-sm">
                                    {yearValue}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )
        },
        [date, months, years],
    )

    return (
        <div className={cn("space-y-4 p-2 border rounded-md shadow-sm", className)}>
            <DayPicker
                mode="single"
                selected={date}
                onSelect={(newDate) => newDate && setDate(newDate)}
                disabled={disabled}
                month={date}
                onMonthChange={setDate}
                components={{
                    IconLeft: () => <ChevronLeft className="h-4 w-4" />,
                    IconRight: () => <ChevronRight className="h-4 w-4" />,
                    Caption: CustomCaption,
                }}
                classNames={{
                    caption: "flex justify-center relative items-center",
                    nav: "space-x-1 flex items-center",
                    nav_button: cn(
                        "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 hover:bg-muted rounded-md transition-colors",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    ),
                    nav_button_previous: "absolute left-1",
                    nav_button_next: "absolute right-1",
                    table: "w-full border-collapse space-y-1",
                    head_row: "flex",
                    head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
                    row: "flex w-full mt-2",
                    cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                    day: cn(
                        "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-accent hover:text-accent-foreground rounded-md transition-colors",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    ),
                    day_selected:
                        "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                    day_today: "bg-accent text-accent-foreground",
                    day_outside: "text-muted-foreground opacity-50",
                    day_disabled: "text-muted-foreground opacity-50",
                    day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
                    day_hidden: "invisible",
                }}
            />

            {showTimePicker && (
                <div className="border-t pt-3">
                    <div className="flex items-center justify-center space-x-1">
                        <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                        <div className="flex items-center">
                            <Select value={hours} onValueChange={setHours}>
                                <SelectTrigger className="h-8 w-16 text-center text-sm">
                                    <SelectValue placeholder={hours} />
                                </SelectTrigger>
                                <SelectContent className="max-h-60">
                                    {hourOptions.map((hour) => (
                                        <SelectItem key={hour} value={hour}>
                                            {hour}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <span className="mx-1 text-sm">:</span>
                            <Select value={minutes} onValueChange={setMinutes}>
                                <SelectTrigger className="h-8 w-16 text-center text-sm">
                                    <SelectValue placeholder={minutes} />
                                </SelectTrigger>
                                <SelectContent className="max-h-60">
                                    {minuteOptions.map((minute) => (
                                        <SelectItem key={minute} value={minute}>
                                            {minute}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {showSeconds && (
                                <>
                                    <span className="mx-1 text-sm">:</span>
                                    <Select value={seconds} onValueChange={setSeconds}>
                                        <SelectTrigger className="h-8 w-16 text-center text-sm">
                                            <SelectValue placeholder={seconds} />
                                        </SelectTrigger>
                                        <SelectContent className="max-h-60">
                                            {secondOptions.map((second) => (
                                                <SelectItem key={second} value={second}>
                                                    {second}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <div className="flex justify-between border-t pt-3">
                <Button variant="outline" size="sm" onClick={handleClear}>
                    Clear
                </Button>
                <Button variant="outline" size="sm" onClick={handleSetNow}>
                    Now
                </Button>
            </div>
        </div>
    )
}