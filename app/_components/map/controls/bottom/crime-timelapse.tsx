import { useState, useEffect, useRef } from "react"
import { Pause, Play } from "lucide-react"
import { Button } from "@/app/_components/ui/button"
import { cn } from "@/app/_lib/utils"
import { Slider } from "@/app/_components/ui/slider"
import { getMonthName } from "@/app/_utils/common"

interface CrimeTimelapseProps {
    startYear: number
    endYear: number
    onChange?: (year: number, month: number, progress: number) => void
    onPlayingChange?: (isPlaying: boolean) => void
    className?: string
    autoPlay?: boolean
    autoPlaySpeed?: number // Time to progress through one month in ms
}

export function CrimeTimelapse({
    startYear = 2020,
    endYear = 2024,
    onChange,
    onPlayingChange,
    className,
    autoPlay = true,
    autoPlaySpeed = 1000, // Speed of month progress
}: CrimeTimelapseProps) {
    const [currentYear, setCurrentYear] = useState<number>(startYear)
    const [currentMonth, setCurrentMonth] = useState<number>(1) // Start at January (1)
    const [progress, setProgress] = useState<number>(0) // Progress within the current month
    const [isPlaying, setIsPlaying] = useState<boolean>(autoPlay)
    const [isDragging, setIsDragging] = useState<boolean>(false)
    const animationRef = useRef<number | null>(null)
    const lastUpdateTimeRef = useRef<number>(0)

    // Notify parent about playing state changes
    useEffect(() => {
        if (onPlayingChange) {
            onPlayingChange(isPlaying || isDragging)
        }
    }, [isPlaying, isDragging, onPlayingChange])

    // Calculate total months from start to end year
    const totalMonths = ((endYear - startYear) * 12) + 12 // +12 to include all months of end year

    const calculateOverallProgress = (): number => {
        const yearDiff = currentYear - startYear
        const monthProgress = (yearDiff * 12) + (currentMonth - 1)
        return ((monthProgress + progress) / (totalMonths - 1)) * 100
    }

    const calculateTimeFromProgress = (overallProgress: number): { year: number; month: number; progress: number } => {
        const totalProgress = (overallProgress * (totalMonths - 1)) / 100
        const monthsFromStart = Math.floor(totalProgress)

        const year = startYear + Math.floor(monthsFromStart / 12)
        const month = (monthsFromStart % 12) + 1 // 1-12 for months
        const monthProgress = totalProgress - Math.floor(totalProgress)

        return {
            year: Math.min(year, endYear),
            month: Math.min(month, 12),
            progress: monthProgress
        }
    }

    // Calculate the current position for the active marker
    const calculateMarkerPosition = (): string => {
        const overallProgress = calculateOverallProgress()
        return `${overallProgress}%`
    }

    const animate = (timestamp: number) => {
        if (!lastUpdateTimeRef.current) {
            lastUpdateTimeRef.current = timestamp
        }

        if (!isDragging) {
            const elapsed = timestamp - lastUpdateTimeRef.current
            const progressIncrement = elapsed / autoPlaySpeed

            let newProgress = progress + progressIncrement
            let newMonth = currentMonth
            let newYear = currentYear

            if (newProgress >= 1) {
                newProgress = 0
                newMonth = currentMonth + 1

                if (newMonth > 12) {
                    newMonth = 1
                    newYear = currentYear + 1

                    if (newYear > endYear) {
                        newYear = startYear
                        newMonth = 1
                    }
                }

                setCurrentMonth(newMonth)
                setCurrentYear(newYear)
            }

            setProgress(newProgress)
            if (onChange) {
                onChange(newYear, newMonth, newProgress)
            }

            lastUpdateTimeRef.current = timestamp
        }

        if (isPlaying) {
            animationRef.current = requestAnimationFrame(animate)
        }
    }

    useEffect(() => {
        if (isPlaying) {
            lastUpdateTimeRef.current = 0
            animationRef.current = requestAnimationFrame(animate)
        } else if (animationRef.current) {
            cancelAnimationFrame(animationRef.current)
        }

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current)
            }
        }
    }, [isPlaying, currentYear, currentMonth, progress, isDragging])

    const handlePlayPause = () => {
        const newPlayingState = !isPlaying
        setIsPlaying(newPlayingState)
        if (onPlayingChange) {
            onPlayingChange(newPlayingState)
        }
    }

    const handleSliderChange = (value: number[]) => {
        const overallProgress = value[0]
        const { year, month, progress } = calculateTimeFromProgress(overallProgress)

        setCurrentYear(year)
        setCurrentMonth(month)
        setProgress(progress)

        if (onChange) {
            onChange(year, month, progress)
        }
    }

    const handleSliderDragStart = () => {
        setIsDragging(true)
        if (onPlayingChange) {
            onPlayingChange(true) // Treat dragging as a form of "playing" for performance optimization
        }
    }

    const handleSliderDragEnd = () => {
        setIsDragging(false)
        if (onPlayingChange) {
            onPlayingChange(isPlaying) // Restore to actual playing state
        }
    }

    // Create year markers
    const yearMarkers = []
    for (let year = startYear; year <= endYear; year++) {
        yearMarkers.push(year)
    }

    return (
        <div className={cn("w-full bg-transparent text-emerald-500", className)}>
            <div className="relative">

                {isPlaying && (
                <div
                    className={cn(
                        "absolute bottom-full mb-2 transform -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold z-20 transition-colors duration-300 bg-emerald-500 text-background",
                    )}
                    style={{ left: calculateMarkerPosition() }}
                >
                        {getMonthName(currentMonth)} {currentYear}
                </div>
                )}

                {/* Wrap button and slider in their container */}
                <div className="px-2 flex gap-x-2">
                    {/* Play/Pause button */}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handlePlayPause}
                        className={cn(
                            "text-background rounded-full hover:text-background h-10 w-10 z-10 transition-colors duration-300 bg-emerald-500 hover:bg-emerald-500/50",
                        )}
                    >
                        {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                    </Button>

                    {/* Slider */}
                    <Slider
                        value={[calculateOverallProgress()]}
                        min={0}
                        max={100}
                        step={0.01}
                        onValueChange={handleSliderChange}
                        onValueCommit={handleSliderDragEnd}
                        onPointerDown={handleSliderDragStart}
                        className="w-full [&>span:first-child]:h-1.5 [&>span:first-child]:bg-white/30 [&_[role=slider]]:bg-emerald-500 [&_[role=slider]]:w-3 [&_[role=slider]]:h-3 [&_[role=slider]]:border-0 [&>span:first-child_span]:bg-emerald-500 [&_[role=slider]:focus-visible]:ring-0 [&_[role=slider]:focus-visible]:ring-offset-0 [&_[role=slider]:focus-visible]:scale-105 [&_[role=slider]:focus-visible]:transition-transform"
                    />
                </div>

                {/* Year markers */}
                <div className="flex items-center relative h-10">
                    <div className="absolute inset-0 h-full flex">
                        {yearMarkers.map((year, index) => (
                            <div
                                key={year}
                                className={cn(
                                    "flex-1 h-full flex items-center justify-center relative",
                                    index < yearMarkers.length - 1 && ""
                                )}
                            >
                                <div
                                    className={cn(
                                        "text-sm transition-colors font-medium",
                                        year === currentYear ? "text-emerald-500 font-bold text-lg" : "text-white/50"
                                    )}
                                >
                                    {year}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
