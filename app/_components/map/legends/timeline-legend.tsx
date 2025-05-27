"use client"

import { Card } from "@/app/_components/ui/card"
import { Clock, Moon, Sun, Sunset } from "lucide-react"

interface TimelineLegendProps {
    position?: "top-right" | "top-left" | "bottom-right" | "bottom-left"
}

export default function TimelineLegend({
    position = "bottom-right"
}: TimelineLegendProps) {
    const positionClasses = {
        "top-right": "top-4 right-4",
        "top-left": "top-4 left-4",
        "bottom-right": "bottom-4 right-4",
        "bottom-left": "bottom-4 left-4"
    }

    return (
        <Card className={`flex z-10 bg-black/80 border-gray-700 shadow-lg p-4 ${positionClasses[position]}`}>
            <div className="flex flex-col gap-3">
                <h3 className="text-sm font-medium text-white flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>Incident Time Patterns</span>
                </h3>

                <div className="grid grid-cols-2 gap-y-3">
                    <div className="flex items-center gap-2">
                        <Sun className="h-4 w-4 text-[#FFEB3B]" />
                        <div className="w-3 h-3 rounded-full bg-[#FFEB3B]"></div>
                        <span className="text-xs text-white">Morning (5am-12pm)</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <Sun className="h-4 w-4 text-[#FF9800]" />
                        <div className="w-3 h-3 rounded-full bg-[#FF9800]"></div>
                        <span className="text-xs text-white">Afternoon (12pm-5pm)</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <Sunset className="h-4 w-4 text-[#3F51B5]" />
                        <div className="w-3 h-3 rounded-full bg-[#3F51B5]"></div>
                        <span className="text-xs text-white">Evening (5pm-9pm)</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <Moon className="h-4 w-4 text-gray-400" />
                        <div className="w-3 h-3 rounded-full bg-[#263238]"></div>
                        <span className="text-xs text-white">Night (9pm-5am)</span>
                    </div>
                </div>

                <div className="text-xs text-gray-300 mt-1 border-t border-gray-700 pt-2">
                    Circles show average incident time. Click for details.
                </div>
            </div>
        </Card>
    )
}
