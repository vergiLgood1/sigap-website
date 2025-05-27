import { IGeoJSONPolygon } from "./map"

export type IDistrictGeoData = {
    id: string
    name: string
    cityName: string
    code: string
    polygon: IGeoJSONPolygon
    crimeRate: "low" | "medium" | "high" | "empty"
    crimeCount: number
    year: number
}