"use client"


import { Play } from "lucide-react"
import { Button } from "../../ui/button"

interface TimeSliderProps {
    selectedTime: string
    onTimeChange: (time: string) => void
}

export function TimeSlider({ selectedTime, onTimeChange }: TimeSliderProps) {
    const times = ["19:00", "19:30", "20:00", "20:30", "21:00", "21:30", "22:00", "22:30", "23:00", "23:30", "00:00"]

    const currentDate = new Date()
    const formattedDate = `${currentDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
    })}, ${currentDate.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
    })} GMT+7`

    return (
        <div className="absolute bottom-0 left-0 right-0 z-20 bg-black/80 text-white">
            <div className="flex items-center justify-between px-4 py-1">
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 rounded-full">
                    <Play className="h-5 w-5" />
                </Button>
                <div className="text-xs text-center">{formattedDate}</div>
            </div>

            <div className="relative h-8 border-t border-gray-700">
                {/* Current time indicator */}
                <div
                    className="absolute top-0 bottom-0 w-0.5 bg-yellow-400 z-10"
                    style={{ left: `${(times.indexOf(selectedTime) / (times.length - 1)) * 100}%` }}
                ></div>

                {/* Time slots */}
                <div className="flex h-full">
                    {times.map((time, index) => (
                        <div
                            key={time}
                            className={`flex-1 border-r border-gray-700 flex items-center justify-center cursor-pointer hover:bg-gray-800 ${time === selectedTime ? "bg-gray-800" : ""
                                }`}
                            onClick={() => onTimeChange(time)}
                        >
                            <span className="text-xs">{time}</span>
                        </div>
                    ))}
                </div>

                {/* Legend at the bottom */}
                <div className="flex justify-end px-4 py-1 bg-gray-900">
                    <div className="flex items-center gap-4">
                        <div className="text-xs">Tinggi</div>
                        <div className="flex">
                            <div className="w-16 h-4 bg-purple-600 text-xs text-center text-white">0-30 mnt</div>
                            <div className="w-16 h-4 bg-pink-600 text-xs text-center text-white">30-60 mnt</div>
                            <div className="w-16 h-4 bg-red-600 text-xs text-center text-white">60-90 mnt</div>
                            <div className="w-16 h-4 bg-orange-600 text-xs text-center text-white">90-120 mnt</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
