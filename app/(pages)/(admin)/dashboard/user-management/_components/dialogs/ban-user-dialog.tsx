import { useState, useEffect } from "react"
import { Loader2, ShieldAlert } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/app/_components/ui/dialog"
import { Button } from "@/app/_components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/app/_components/ui/radio-group"
import { Label } from "@/app/_components/ui/label"
import { Input } from "@/app/_components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/_components/ui/select"
import { ValidBanDuration } from "@/app/_utils/types/ban-duration"
import { toast } from "sonner"

interface BanUserDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onConfirm: (duration: ValidBanDuration) => void
    isPending?: boolean
}

type BanDurationType = "preset" | "custom"

export function BanUserDialog({
    open,
    onOpenChange,
    onConfirm,
    isPending = false,
}: BanUserDialogProps) {
    const [durationType, setDurationType] = useState<BanDurationType>("preset")
    const [presetDuration, setPresetDuration] = useState("24h")
    const [customValue, setCustomValue] = useState("1")
    const [customUnit, setCustomUnit] = useState("days")

    useEffect(() => {
        if (!open) {
            // Reset form when dialog closes
            setDurationType("preset")
            setPresetDuration("24h")
            setCustomValue("1")
            setCustomUnit("days")
        }
    }, [open])

    const handleConfirm = () => {
        let duration = "24h"

        if (durationType === "preset") {
            duration = presetDuration
        } else {
            const value = parseInt(customValue)
            if (isNaN(value) || value < 1) return toast.error("Invalid duration")

            switch (customUnit) {
                case "hours":
                    duration = `${value}h`
                    break
                case "days":
                    duration = `${value * 24}h`
                    break
                case "weeks":
                    duration = `${value * 24 * 7}h`
                    break
                case "months":
                    duration = `${value * 24 * 30}h`
                    break
            }
        }

        onConfirm(duration as ValidBanDuration)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md border-0">
                <DialogHeader>
                    <DialogTitle>Ban User</DialogTitle>
                    <DialogDescription>
                        This will prevent the user from accessing the system until the ban expires.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4 space-y-4">
                    <RadioGroup
                        value={durationType}
                        onValueChange={(v) => setDurationType(v as BanDurationType)}
                        className="space-y-4"
                    >
                        <div className="flex items-start space-x-2">
                            <RadioGroupItem value="preset" id="preset" disabled={isPending} />
                            <div className="grid gap-2.5 w-full">
                                <Label htmlFor="preset">Use preset duration</Label>
                                <Select
                                    value={presetDuration}
                                    onValueChange={setPresetDuration}
                                    disabled={durationType !== "preset" || isPending}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select duration" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1h">1 hour</SelectItem>
                                        <SelectItem value="12h">12 hours</SelectItem>
                                        <SelectItem value="24h">24 hours</SelectItem>
                                        <SelectItem value="72h">3 days</SelectItem>
                                        <SelectItem value="168h">1 week</SelectItem>
                                        <SelectItem value="720h">30 days</SelectItem>
                                        <SelectItem value="10000h">Permanent</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="flex items-start space-x-2">
                            <RadioGroupItem value="custom" id="custom" disabled={isPending} />
                            <div className="grid gap-2.5 w-full">
                                <Label htmlFor="custom">Custom duration</Label>
                                <div className="flex gap-2">
                                    <Input
                                        type="number"
                                        min="1"
                                        value={customValue}
                                        onChange={(e) => setCustomValue(e.target.value)}
                                        disabled={durationType !== "custom" || isPending}
                                        className="w-20"
                                    />
                                    <Select
                                        value={customUnit}
                                        onValueChange={setCustomUnit}
                                        disabled={durationType !== "custom" || isPending}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="hours">Hours</SelectItem>
                                            <SelectItem value="days">Days</SelectItem>
                                            <SelectItem value="weeks">Weeks</SelectItem>
                                            <SelectItem value="months">Months</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    </RadioGroup>
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isPending}
                    >
                        Cancel
                    </Button>
                    <Button
                        className="bg-yellow-500 text-white hover:bg-yellow-600"
                        onClick={handleConfirm}
                        disabled={isPending}
                        type="submit"
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Banning...
                            </>
                        ) : (
                            <>
                                    <ShieldAlert className="h-4 w-4" />
                                Ban User
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

