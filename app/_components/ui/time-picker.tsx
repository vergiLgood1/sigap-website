"use client"

import * as React from "react"
import { Clock } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/app/_lib/utils"
import { Button } from "@/app/_components/ui/button"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/app/_components/ui/popover"
import { Input } from "@/app/_components/ui/input"

interface TimePickerProps {
    value: Date
    onChange: (time: Date) => void
    className?: string
}

export function TimePicker({ value, onChange, className }: TimePickerProps) {
    function handleTimeChange(event: React.ChangeEvent<HTMLInputElement>) {
        const timeString = event.target.value
        const [hours, minutes] = timeString.split(':').map(Number)

        if (!isNaN(hours) && !isNaN(minutes)) {
            const newDate = new Date(value)
            newDate.setHours(hours)
            newDate.setMinutes(minutes)
            onChange(newDate)
        }
    }

    return (
        <div className={cn("grid gap-2", className)}>
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant={"outline"}
                        className={cn(
                            "w-full justify-start text-left font-normal",
                            !value && "text-muted-foreground"
                        )}
                    >
                        <Clock className="mr-2 h-4 w-4" />
                        {value ? format(value, "HH:mm") : <span>Select time</span>}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-4" align="start">
                    <div className="space-y-2">
                        <div className="grid gap-2">
                            <div className="grid grid-cols-2 items-center gap-2">
                                <Input
                                    type="time"
                                    value={format(value, "HH:mm")}
                                    onChange={handleTimeChange}
                                />
                            </div>
                        </div>
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    )
}
