"use client"
import { format } from "date-fns"
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/app/_lib/utils"

// UI Components
import { FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/app/_components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/_components/ui/select"
import { Input } from "@/app/_components/ui/input"
import { Button } from "@/app/_components/ui/button"
import { Textarea } from "@/app/_components/ui/textarea"
import { Popover, PopoverContent, PopoverTrigger } from "@/app/_components/ui/popover"
import { Switch } from "@/app/_components/ui/switch"
import { Checkbox } from "@/app/_components/ui/checkbox"
import { DayPicker } from "react-day-picker"
import { DateTimePicker } from "@/app/_components/date-time-picker"
import { DateTimePicker2 } from "./ui/date-picker"

// Reusable form field component to reduce repetition
interface FormFieldProps {
    name: string
    label: string
    type: string
    control: any
    placeholder?: string
    options?: { value: string; label: string }[]
    rows?: number
    isDate?: boolean
    isBoolean?: boolean
    description?: string
    booleanType?: "switch" | "checkbox" | "select"
    fromYear?: number
    toYear?: number
    disabled?: boolean // Ganti readonly menjadi disabled
}

export function FormFieldWrapper({
    name,
    label,
    type,
    control,
    placeholder,
    options,
    rows = 1,
    isDate,
    isBoolean,
    description,
    booleanType = "switch",
    fromYear = 1900,
    toYear = new Date().getFullYear(),
    disabled = false, // Default disabled adalah false
}: FormFieldProps) {
    // Default boolean options for select
    const booleanOptions = [
        { value: "false", label: "False" },
        { value: "true", label: "True" },
    ]

    return (
        <FormField
            control={control}
            name={name}
            render={({ field }) => (
                <FormItem
                    className={cn(
                        isBoolean && booleanType === "switch"
                            ? "flex items-start justify-between rounded-lg border p-4"
                            : "flex justify-between items-start gap-4",
                        disabled && "opacity-50 cursor-not-allowed" // Tambahkan gaya khusus untuk disabled
                    )}
                >
                    <div className={isBoolean && booleanType === "switch" ? "space-y-1" : "w-1/3"}>
                        <FormLabel className={isBoolean && booleanType === "switch" ? "text-base" : ""}>{label}</FormLabel>
                        <p className="text-xs text-muted-foreground">{type}</p>
                        {description && isBoolean && booleanType === "switch" && <FormDescription>{description}</FormDescription>}
                    </div>
                    <div className={isBoolean && booleanType === "switch" ? "" : "w-2/3"}>
                        <FormControl>
                            {isBoolean ? (
                                booleanType === "switch" ? (
                                    <Switch checked={field.value} onCheckedChange={field.onChange} disabled={disabled} />
                                ) : booleanType === "checkbox" ? (
                                        <Checkbox checked={field.value} onCheckedChange={field.onChange} disabled={disabled} />
                                ) : (
                                    <Select
                                        onValueChange={(value) => field.onChange(value === "true")}
                                        defaultValue={String(field.value)}
                                                disabled={disabled}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder={placeholder || `Select ${label.toLowerCase()}`} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {booleanOptions.map((option) => (
                                                <SelectItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )
                            ) : type.includes("select") && options ? (
                                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={disabled}>
                                    <SelectTrigger>
                                        <SelectValue placeholder={placeholder || `Select ${label.toLowerCase()}`} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {options.map((option) => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            ) : isDate ? (
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                                    className={cn(
                                                        "w-full pl-3 text-left font-normal",
                                                        !field.value && "text-muted-foreground"
                                                    )}
                                                    disabled={disabled}
                                        >
                                            {field.value ? format(field.value, "MM/dd/yyyy hh:mm:ss a") : <span>Pick a date and time</span>}
                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                            {!disabled && (
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <DateTimePicker
                                                        selected={field.value instanceof Date ? field.value : undefined}
                                                        onSelect={field.onChange}
                                                        disabled={(date) => date > new Date() || date < new Date(`${fromYear}-01-01`)}
                                                        fromYear={fromYear}
                                                        toYear={toYear}
                                                        showTimePicker
                                                    />
                                                </PopoverContent>
                                            )}
                                </Popover>
                            ) : rows > 1 ? (
                                <Textarea
                                    {...field}
                                    className="resize-none"
                                    rows={rows}
                                    value={field.value ?? ""}
                                    placeholder={placeholder}
                                                disabled={disabled}
                                />
                            ) : (
                                <Input
                                    {...field}
                                    type={type.includes("URL") ? "url" : type === "string" ? "text" : type}
                                    placeholder={placeholder}
                                    value={field.value ?? ""}
                                                    disabled={disabled}
                                />
                            )}
                        </FormControl>
                        {!(isBoolean && booleanType === "switch") && <FormMessage />}
                    </div>
                </FormItem>
            )}
        />
    )
}
