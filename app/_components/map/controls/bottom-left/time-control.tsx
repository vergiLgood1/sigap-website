"use client"
import { Checkbox } from "@/app/_components/ui/checkbox"
import { Label } from "@/app/_components/ui/label"
import { Overlay } from "../../overlay"
import { ControlPosition } from "mapbox-gl"


interface TimeControlsProps {
    onTimeChange: (time: string) => void
    activeTime: string
    position?: ControlPosition
}

export default function TimeControls({ onTimeChange, activeTime, position = "bottom-left" }: TimeControlsProps) {
    const times = [
        { id: "today", label: "Hari ini" },
        { id: "yesterday", label: "Kemarin" },
        { id: "week", label: "Minggu" },
        { id: "month", label: "Bulan" },
    ]

    return (
        <Overlay position={position}>
            <div className="bg-black/75 rounded-md p-2 flex items-center space-x-4">
                <div className="text-white font-medium mr-2">Waktu</div>
                {times.map((time) => (
                    <div key={time.id} className="flex items-center space-x-2">
                        <Checkbox id={time.id} checked={activeTime === time.id} onCheckedChange={() => onTimeChange(time.id)} />
                        <Label htmlFor={time.id} className="text-white text-sm cursor-pointer">
                            {time.label}
                        </Label>
                    </div>
                ))}
            </div>
        </Overlay>
    )
}
