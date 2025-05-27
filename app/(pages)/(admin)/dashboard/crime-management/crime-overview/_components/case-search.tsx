import { Search } from "lucide-react"

export default function CaseSearch() {
  const recentSearches = ["CR-7823", "CR-7825", "John Doe", "Jane Smith"]

  return (
    <div className="mt-4">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <input
          type="search"
          placeholder="Search case number or name..."
          className="w-full rounded-md border border-input bg-background px-9 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>
      <div className="mt-3 text-xs text-muted-foreground">Recent searches: {recentSearches.join(", ")}</div>
    </div>
  )
}
