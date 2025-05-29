
import { CRIME_RATE_COLORS } from "@/app/_utils/const/crime";
import { Overlay } from "../overlay";
import { ControlPosition } from "mapbox-gl";

interface IClusterLegendProps {
  position?: ControlPosition
}

export default function ClusterLegend({ position = "bottom-right" }: IClusterLegendProps) {
  return (
    // <Overlay position={position}>
    <div className="flex flex-row text-xs font-semibold font-sans text-background z-0">
        <div className={`flex items-center gap-1.5 py-0 px-8 rounded-l-md border-y border-1 `} style={{ backgroundColor: `${CRIME_RATE_COLORS.low}` }}>
          <span>Low</span>
        </div>
        <div className={`flex items-center gap-1.5 py-0 px-8 border-y border-1 `} style={{ backgroundColor: `${CRIME_RATE_COLORS.medium}` }}>
          <span>Medium</span>
        </div>
        <div className={`flex items-center gap-1.5 py-0 px-8 rounded-r-md border-y border-1 `} style={{ backgroundColor: `${CRIME_RATE_COLORS.high}` }}>
          <span>High</span>
        </div>
      </div>
    // </Overlay>
  )
}