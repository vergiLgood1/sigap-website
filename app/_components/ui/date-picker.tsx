"use client"

import * as React from "react"
import { format, getMonth, getYear, setMonth, setYear, setHours, setMinutes, setSeconds } from "date-fns"
import { Calendar as CalendarIcon, Clock } from "lucide-react"

import { cn } from "@/app/_lib/utils"
import { Button } from "@/app/_components/ui/button"
import { Calendar } from "@/app/_components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/app/_components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/_components/ui/tabs"

interface DateTimePickerProps {
    startYear?: number;
    endYear?: number;
}

export function DateTimePicker2({
    startYear = getYear(new Date()) - 100,
    endYear = getYear(new Date()) + 100,
}: DateTimePickerProps) {
    const [date, setDate] = React.useState<Date>(new Date());

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December',
    ];

    const years = Array.from(
        { length: endYear - startYear + 1 },
        (_, i) => startYear + i
    );

    // Generate hours (0-23)
    const hours = Array.from({ length: 24 }, (_, i) => i);

    // Generate minutes and seconds (0-59)
    const minutesSeconds = Array.from({ length: 60 }, (_, i) => i);

    const handleMonthChange = (month: string) => {
        const newDate = setMonth(date, months.indexOf(month));
        setDate(newDate);
    }

    const handleYearChange = (year: string) => {
        const newDate = setYear(date, parseInt(year));
        setDate(newDate);
    }

    const handleHourChange = (hour: string) => {
        const newDate = setHours(date, parseInt(hour));
        setDate(newDate);
    }

    const handleMinuteChange = (minute: string) => {
        const newDate = setMinutes(date, parseInt(minute));
        setDate(newDate);
    }

    const handleSecondChange = (second: string) => {
        const newDate = setSeconds(date, parseInt(second));
        setDate(newDate);
    }

    const handleSelect = (selectedDate: Date | undefined) => {
        if (selectedDate) {
            // Preserve time when changing date
            const newDate = new Date(selectedDate);
            newDate.setHours(date.getHours(), date.getMinutes(), date.getSeconds());
            setDate(newDate);
        }
    }

    // Format number to always have 2 digits (e.g., 1 -> 01)
    const formatTwoDigits = (num: number) => num.toString().padStart(2, '0');

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant={"outline"}
                    className={cn(
                        "w-[280px] justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                    )}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") + " " + format(date, "HH:mm:ss") : <span>Pick a date and time</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
                <Tabs defaultValue="date">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="date">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            Date
                        </TabsTrigger>
                        <TabsTrigger value="time">
                            <Clock className="mr-2 h-4 w-4" />
                            Time
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="date" className="p-0">
                        <div className="flex justify-between p-2">
                            <Select
                                onValueChange={handleMonthChange}
                                value={months[getMonth(date)]}
                            >
                                <SelectTrigger className="w-[110px]">
                                    <SelectValue placeholder="Month" />
                                </SelectTrigger>
                                <SelectContent>
                                    {months.map(month => (
                                        <SelectItem key={month} value={month}>{month}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select
                                onValueChange={handleYearChange}
                                value={getYear(date).toString()}
                            >
                                <SelectTrigger className="w-[110px]">
                                    <SelectValue placeholder="Year" />
                                </SelectTrigger>
                                <SelectContent>
                                    {years.map(year => (
                                        <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={handleSelect}
                            initialFocus
                            month={date}
                            onMonthChange={setDate}
                        />
                    </TabsContent>

                    <TabsContent value="time" className="p-4">
                        <div className="flex flex-col space-y-4">
                            <div className="text-center text-lg font-medium">
                                {format(date, "HH:mm:ss")}
                            </div>

                            <div className="grid grid-cols-3 gap-2">
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Hour</label>
                                    <Select
                                        onValueChange={handleHourChange}
                                        value={date.getHours().toString()}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Hour" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {hours.map(hour => (
                                                <SelectItem key={hour} value={hour.toString()}>
                                                    {formatTwoDigits(hour)}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <label className="text-sm font-medium mb-1 block">Minute</label>
                                    <Select
                                        onValueChange={handleMinuteChange}
                                        value={date.getMinutes().toString()}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Minute" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {minutesSeconds.map(minute => (
                                                <SelectItem key={minute} value={minute.toString()}>
                                                    {formatTwoDigits(minute)}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <label className="text-sm font-medium mb-1 block">Second</label>
                                    <Select
                                        onValueChange={handleSecondChange}
                                        value={date.getSeconds().toString()}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Second" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {minutesSeconds.map(second => (
                                                <SelectItem key={second} value={second.toString()}>
                                                    {formatTwoDigits(second)}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </PopoverContent>
        </Popover>
    )
}

interface DatePickerProps {
    date: Date | undefined
    onSelect: (date: Date | undefined) => void
    disabled?: boolean
    className?: string
}

export function DatePicker({ date, onSelect, disabled, className }: DatePickerProps) {
    return (
        <div className={cn("grid gap-2", className)}>
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant={"outline"}
                        className={cn(
                            "w-full justify-start text-left font-normal",
                            !date && "text-muted-foreground"
                        )}
                        disabled={disabled}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : <span>Pick a date</span>}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={onSelect}
                        initialFocus
                    />
                </PopoverContent>
            </Popover>
        </div>
    )
}