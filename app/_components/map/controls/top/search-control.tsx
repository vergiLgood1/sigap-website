"use client"

import { Button } from "@/app/_components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/app/_components/ui/tooltip"
import {
    Search,
    XCircle,
    Info,
    ExternalLink,
    Calendar,
    MapPin,
    MessageSquare,
    FileText,
    Map,
    FolderOpen,
} from "lucide-react"

import { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import ActionSearchBar from "@/app/_components/action-search-bar"
import { Card } from "@/app/_components/ui/card"
import { format } from "date-fns"
import type { ITooltipsControl } from "./tooltips"

// Define types based on the crime data structure
interface ICrimeIncident {
    id: string
    timestamp: Date
    description: string
    status: string
    locations: {
      address: string
      longitude: number
      latitude: number
  }
    crime_categories: {
        id: string
        name: string
    }
}

interface ICrime {
    id: string
    district_id: string
    month: number
    year: number
    crime_incidents: ICrimeIncident[]
    districts: {
        name: string
    }
}

// Actions for the search bar
const ACTIONS = [
    {
        id: "incident_id",
        label: "Search by Incident ID",
        icon: <FileText className="h-4 w-4 text-orange-500" />,
        description: "e.g., CI-789",
        category: "Search",
        prefix: "CI-",
        regex: /^CI-\d+(-\d{4})?$/,
        placeholder: "CI-7890-2023",
    },
    {
        id: "coordinates",
        label: "Search by Coordinates",
        icon: <Map className="h-4 w-4 text-green-500" />,
        description: "e.g., -6.2, 106.8",
        category: "Search",
        prefix: "",
        regex: /^-?\d+(\.\d+)?,\s*-?\d+(\.\d+)?$/,
        placeholder: "-6.2, 106.8",
    },
    {
        id: "description",
        label: "Search by Description",
        icon: <MessageSquare className="h-4 w-4 text-purple-500" />,
        description: "e.g., robbery",
        category: "Search",
        prefix: "",
        regex: /.+/,
        placeholder: "Enter crime description",
    },
    {
        id: "locations.address",
        label: "Search by locations.Address",
        icon: <FolderOpen className="h-4 w-4 text-amber-500" />,
        description: "e.g., Jalan Sudirman",
        category: "Search",
        prefix: "",
        regex: /.+/,
        placeholder: "Enter location or locations.address",
    },
]

interface SearchTooltipProps {
    onControlChange?: (controlId: ITooltipsControl) => void
    activeControl?: string
    crimes?: ICrime[]
    sourceType?: string
}

export default function SearchTooltip({
    onControlChange,
    activeControl,
    crimes = [],
    sourceType = "cbt",
}: SearchTooltipProps) {
    const [showSearch, setShowSearch] = useState(false)
    const searchInputRef = useRef<HTMLInputElement>(null)
    const [selectedSearchType, setSelectedSearchType] = useState<string | null>(null)
    const [searchValue, setSearchValue] = useState("")
    const [suggestions, setSuggestions] = useState<ICrimeIncident[]>([])
    const [isInputValid, setIsInputValid] = useState(true)
    const [selectedSuggestion, setSelectedSuggestion] = useState<ICrimeIncident | null>(null)
    const [showInfoBox, setShowInfoBox] = useState(false)

    // Check if search is disabled based on source type
    const isSearchDisabled = sourceType === "cbu"

    // Limit results to prevent performance issues
    const MAX_RESULTS = 50

    // Extract all incidents from crimes data
    const allIncidents = crimes.flatMap((crime) =>
        crime.crime_incidents.map((incident) => ({
            ...incident,
        district: crime.districts?.name || "",
        year: crime.year,
        month: crime.month,
    })),
  )

    useEffect(() => {
        if (showSearch && searchInputRef.current) {
            setTimeout(() => {
          searchInputRef.current?.focus()
      }, 100)
    }
  }, [showSearch])

    const handleSearchTypeSelect = (actionId: string) => {
      const selectedAction = ACTIONS.find((action) => action.id === actionId)
      if (selectedAction) {
        setSelectedSearchType(actionId)

        const prefix = selectedAction.prefix || ""
        setSearchValue(prefix)
        setIsInputValid(true)

        // Initial suggestions based on the selected search type
        let initialSuggestions: ICrimeIncident[] = []

        if (actionId === "incident_id") {
            initialSuggestions = allIncidents.slice(0, MAX_RESULTS) // Limit to 50 results initially
        } else if (actionId === "description" || actionId === "locations.address") {
            initialSuggestions = allIncidents.slice(0, MAX_RESULTS)
        }

        // Set suggestions in the next tick
        setTimeout(() => {
          setSuggestions(initialSuggestions)
      }, 0)

        // Focus and position cursor after prefix
        setTimeout(() => {
            if (searchInputRef.current) {
            searchInputRef.current.focus()
            searchInputRef.current.selectionStart = prefix.length
            searchInputRef.current.selectionEnd = prefix.length
        }
      }, 50)
      }
  }

    // Filter suggestions based on search type and search text
    const filterSuggestions = (searchType: string, searchText: string): ICrimeIncident[] => {
      let filtered: ICrimeIncident[] = []

      if (searchType === "incident_id") {
          if (!searchText || searchText === "CI-") {
              filtered = allIncidents.slice(0, MAX_RESULTS)
          } else {
          filtered = allIncidents
              .filter((item) => item.id.toLowerCase().includes(searchText.toLowerCase()))
              .slice(0, MAX_RESULTS)
      }
    } else if (searchType === "description") {
        if (!searchText) {
          filtered = allIncidents.slice(0, MAX_RESULTS)
      } else {
          filtered = allIncidents
              .filter((item) => item.description.toLowerCase().includes(searchText.toLowerCase()))
              .slice(0, MAX_RESULTS)
      }
    } else if (searchType === "locations.address") {
        if (!searchText) {
          filtered = allIncidents.slice(0, MAX_RESULTS)
      } else {
          filtered = allIncidents
              .filter(
                  (item) => item.locations.address && item.locations.address.toLowerCase().includes(searchText.toLowerCase()),
              )
              .slice(0, MAX_RESULTS)
      }
    } else if (searchType === "coordinates") {
        if (!searchText) {
          filtered = allIncidents
              .filter((item) => item.locations.latitude !== undefined && item.locations.longitude !== undefined)
              .slice(0, MAX_RESULTS)
      } else {
          // For coordinates, we'd typically do a proximity search
          // This is a simple implementation for demo purposes
          filtered = allIncidents
              .filter(
                  (item) =>
                      item.locations.latitude !== undefined &&
                      item.locations.longitude !== undefined &&
                  `${item.locations.latitude}, ${item.locations.longitude}`.includes(searchText),
          )
                .slice(0, MAX_RESULTS)
        }
    }

      return filtered
  }

    const handleSearchChange = (value: string) => {
      const currentSearchType = selectedSearchType ? ACTIONS.find((action) => action.id === selectedSearchType) : null

      if (currentSearchType?.prefix && currentSearchType.prefix.length > 0) {
          if (!value.startsWith(currentSearchType.prefix)) {
            value = currentSearchType.prefix
        }
    }

      setSearchValue(value)

      if (currentSearchType?.regex) {
          if (!value || value === currentSearchType.prefix) {
          setIsInputValid(true)
      } else {
            setIsInputValid(currentSearchType.regex.test(value))
        }
    } else {
        setIsInputValid(true)
    }

      if (!selectedSearchType) {
        setSuggestions([])
        return
    }

      // Filter suggestions based on search input
      setSuggestions(filterSuggestions(selectedSearchType, value))
  }

    const handleClearSearchType = () => {
      setSelectedSearchType(null)
      setSearchValue("")
      setSuggestions([])
      if (searchInputRef.current) {
          setTimeout(() => {
          searchInputRef.current?.focus()
      }, 50)
    }
  }

    const handleSuggestionSelect = (incident: ICrimeIncident) => {
      setSearchValue(incident.id)
      setSuggestions([])
      setSelectedSuggestion(incident)
      setShowInfoBox(true)
  }

    const handleFlyToIncident = () => {
      if (!selectedSuggestion || !selectedSuggestion.locations.latitude || !selectedSuggestion.locations.longitude) return

        // Create a custom event to trigger map flying to the incident location
      const flyToMapEvent = new CustomEvent("mapbox_fly_to", {
          detail: {
              longitude: selectedSuggestion.locations.longitude,
              latitude: selectedSuggestion.locations.latitude,
              zoom: 15,
              bearing: 0,
              pitch: 45,
              duration: 2000,
          },
        bubbles: true,
      })

      // Find the main map canvas and dispatch event there
      const mapCanvas = document.querySelector(".mapboxgl-canvas")
      if (mapCanvas) {
        mapCanvas.dispatchEvent(flyToMapEvent)
      }

        // Store incident details for popup display
        const incidentDetails = {
            id: selectedSuggestion.id,
            longitude: selectedSuggestion.locations.longitude,
            latitude: selectedSuggestion.locations.latitude,
            description: selectedSuggestion.description || "No description",
            category: selectedSuggestion.crime_categories?.name || "Unknown",
            status: selectedSuggestion.status || "Unknown",
            timestamp: selectedSuggestion.timestamp,
            address: selectedSuggestion.locations.address || null,
        }

        // Wait for the fly animation to complete before creating and dispatching the incident popup event
        setTimeout(() => {
            // Create a custom event for showing the incident popup
            const showPopupEvent = new CustomEvent("show-incident-popup", {
                detail: incidentDetails,
          bubbles: true,
            })

            // Dispatch the event to the document
            document.dispatchEvent(showPopupEvent)

            // Also set activeControl to "incidents" to ensure layer visibility
            if (onControlChange) {
                onControlChange("incidents" as ITooltipsControl)
            }
        }, 2100) // Slightly longer than the fly animation duration

      setShowInfoBox(false)
      setSelectedSuggestion(null)
      toggleSearch()
  }

    const handleCloseInfoBox = () => {
      setShowInfoBox(false)
      setSelectedSuggestion(null)

      // Restore original suggestions
      if (selectedSearchType) {
        const initialSuggestions = filterSuggestions(selectedSearchType, searchValue)
        setSuggestions(initialSuggestions)
    }
  }

    const toggleSearch = () => {
      if (isSearchDisabled) return

      setShowSearch(!showSearch)
      if (!showSearch && onControlChange) {
          onControlChange("search" as ITooltipsControl)
          setSelectedSearchType(null)
          setSearchValue("")
          setSuggestions([])
      }
  }

    // Format date for display
    const formatIncidentDate = (incident: ICrimeIncident) => {
        try {
            if (incident.timestamp) {
          return format(new Date(incident.timestamp), "PPP p")
      }
        return "N/A"
    } catch (error) {
        return "Invalid date"
    }
  }

    return (
        <>
            <div className="z-10 bg-background rounded-md p-1 flex items-center space-x-1">
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant={showSearch ? "default" : "ghost"}
                                size="medium"
                              className={`h-8 w-8 rounded-md ${isSearchDisabled
                                      ? "opacity-40 cursor-not-allowed bg-gray-700/30 text-gray-400 border-gray-600 hover:bg-gray-700/30 hover:text-gray-400"
                                      : showSearch
                                          ? "bg-emerald-500 text-black hover:bg-emerald-500/90"
                                          : "text-white hover:bg-emerald-500/90 hover:text-background"
                                  }`}
                              onClick={toggleSearch}
                              disabled={isSearchDisabled}
                              aria-disabled={isSearchDisabled}
                          >
                              <Search size={20} />
                              <span className="sr-only">Search Incidents</span>
                          </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                          <p>{isSearchDisabled ? "Not available for CBU data" : "Search Incidents"}</p>
                      </TooltipContent>
                  </Tooltip>
              </TooltipProvider>
          </div>

          <AnimatePresence>
              {showSearch && (
                  <>
                      <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center"
                          onClick={toggleSearch}
                      />

                      <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className="fixed top-1/4 left-1/4 transform -translate-x-1/4 -translate-y-1/4 z-50 w-full max-w-lg sm:max-w-xl md:max-w-3xl"
                      >
                          <div className="bg-background border border-border rounded-lg shadow-xl p-4">
                              <div className="flex justify-between items-center mb-3">
                                  <h3 className="text-lg font-medium">Search Incidents</h3>
                                  <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7 rounded-full hover:bg-emerald-500/90 hover:text-background"
                                      onClick={toggleSearch}
                                  >
                                      <XCircle size={18} />
                                  </Button>
                              </div>

                              {!showInfoBox ? (
                                  <>
                                      <ActionSearchBar
                                          ref={searchInputRef}
                                          autoFocus
                                          isFloating
                                          defaultActions={false}
                                          actions={ACTIONS}
                                          onActionSelect={handleSearchTypeSelect}
                                          onClearAction={handleClearSearchType}
                                          activeActionId={selectedSearchType}
                                          value={searchValue}
                                          onChange={handleSearchChange}
                                          placeholder={
                                              selectedSearchType
                                                  ? ACTIONS.find((a) => a.id === selectedSearchType)?.placeholder
                                                  : "Select a search type..."
                                          }
                                          inputClassName={
                                              !isInputValid ? "border-destructive focus-visible:ring-destructive bg-destructive/50" : ""
                                          }
                                      />

                                      {!isInputValid && selectedSearchType && (
                                          <div className="mt-1 text-xs text-destructive">
                                              Invalid format. {ACTIONS.find((a) => a.id === selectedSearchType)?.description}
                                          </div>
                                      )}

                                      {suggestions.length > 0 && selectedSearchType && (
                                          <div className="mt-2 max-h-[300px] overflow-y-auto border border-border rounded-md bg-background/80 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                                              <div className="sticky top-0 bg-muted/70 backdrop-blur-sm px-3 py-2 border-b border-border">
                                                  <p className="text-xs text-muted-foreground">
                                                      {suggestions.length} results found
                                                      {suggestions.length === 50 && " (showing top 50)"}
                                                  </p>
                                              </div>
                                              <ul className="py-1">
                                                  {suggestions.map((incident, index) => (
                                                      <li
                                                          key={index}
                                                          className="px-3 py-2 hover:bg-muted cursor-pointer flex items-center justify-between"
                                                          onClick={() => handleSuggestionSelect(incident)}
                                                      >
                                                          <span className="font-medium">{incident.id}</span>
                                                          <div className="flex items-center gap-2">
                                      {selectedSearchType === "incident_id" ? (
                                          <span className="text-muted-foreground text-sm truncate max-w-[300px]">
                                              {incident.description}
                                          </span>
                                      ) : selectedSearchType === "coordinates" ? (
                                          <span className="text-muted-foreground text-sm truncate max-w-[300px]">
                                                  {incident.locations.latitude}, {incident.locations.longitude} -{" "}
                                                  {incident.description}
                                              </span>
                                          ) : selectedSearchType === "locations.address" ? (
                                              <span className="text-muted-foreground text-sm truncate max-w-[300px]">
                                              {incident.locations.address || "N/A"}
                                          </span>
                                      ) : (
                                          <span className="text-muted-foreground text-sm truncate max-w-[300px]">
                                              {incident.description}
                                          </span>
                                      )}
                                      <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-6 w-6 p-0 rounded-full hover:bg-muted"
                                          onClick={(e) => {
                                              e.stopPropagation()
                                              handleSuggestionSelect(incident)
                                          }}
                                      >
                                          <Info className="h-3.5 w-3.5 text-muted-foreground" />
                                      </Button>
                                  </div>
                              </li>
                          ))}
                                              </ul>
                                          </div>
                                      )}

                                      {selectedSearchType &&
                                          searchValue.length > (ACTIONS.find((a) => a.id === selectedSearchType)?.prefix?.length || 0) &&
                                          suggestions.length === 0 && (
                                              <div className="mt-2 p-3 border border-border rounded-md bg-background/80 text-center">
                                                  <p className="text-sm text-muted-foreground">No matching incidents found</p>
                                              </div>
                                          )}

                                      <div className="mt-3 px-3 py-2 border-t border-border bg-muted/30 rounded-b-md">
                                          <p className="flex items-center text-sm text-muted-foreground">
                                              {selectedSearchType ? (
                                                  <>
                                                      <span className="mr-1">{ACTIONS.find((a) => a.id === selectedSearchType)?.icon}</span>
                                                      <span>{ACTIONS.find((a) => a.id === selectedSearchType)?.description}</span>
                                                  </>
                                              ) : (
                                                  <span>Select a search type and enter your search criteria</span>
                                              )}
                                          </p>
                                      </div>
                                  </>
                              ) : (
                                  <Card className="p-4 border border-border">
                                      <div className="flex justify-between items-start mb-4">
                                          <h3 className="text-lg font-semibold">{selectedSuggestion?.id}</h3>
                                      </div>

                                          {selectedSuggestion && (
                                              <div className="space-y-3">
                                                  <div className="grid grid-cols-[20px_1fr] gap-2 items-start">
                                                      <Info className="h-4 w-4 mt-1 text-muted-foreground" />
                                                      <p className="text-sm">{selectedSuggestion.description}</p>
                                                  </div>

                                                  {selectedSuggestion.timestamp && (
                                                      <div className="grid grid-cols-[20px_1fr] gap-2 items-start">
                                                          <Calendar className="h-4 w-4 mt-1 text-muted-foreground" />
                                                          <p className="text-sm">{formatIncidentDate(selectedSuggestion)}</p>
                                                      </div>
                                                  )}

                                                  {selectedSuggestion.locations.address && (
                                                      <div className="grid grid-cols-[20px_1fr] gap-2 items-start">
                                                          <MapPin className="h-4 w-4 mt-1 text-muted-foreground" />
                                                          <p className="text-sm">{selectedSuggestion.locations.address}</p>
                                                      </div>
                                                  )}

                                                  <div className="grid grid-cols-2 gap-2 mt-2">
                                                      <div className="bg-muted/50 rounded p-2">
                                                          <p className="text-xs text-muted-foreground font-medium">Category</p>
                                                          <p className="text-sm">{selectedSuggestion.crime_categories?.name || "N/A"}</p>
                                                      </div>
                                                      <div className="bg-muted/50 rounded p-2">
                                                          <p className="text-xs text-muted-foreground font-medium">Status</p>
                                                          <p className="text-sm">{selectedSuggestion.status || "N/A"}</p>
                                                      </div>
                                                  </div>

                                                  <div className="flex justify-between items-center pt-3 border-t border-border mt-3">
                                                  <Button variant="outline" size="sm" onClick={handleCloseInfoBox}>
                                                      Close
                                                  </Button>
                                                  <Button
                                                      variant="default"
                                                      size="sm"
                                                      onClick={handleFlyToIncident}
                                                      disabled={!selectedSuggestion.locations.latitude || !selectedSuggestion.locations.longitude}
                                                      className="flex items-center gap-2"
                                                  >
                                                      <span>Fly to Incident</span>
                                                      <ExternalLink className="h-3.5 w-3.5" />
                                                  </Button>
                                              </div>
                                          </div>
                                      )}
                                  </Card>
                              )}
                          </div>
                      </motion.div>
                  </>
              )}
          </AnimatePresence>
      </>
  )
}
