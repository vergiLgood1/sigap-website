export default function RecentArrests() {
    const crimeTypes = ["Assault", "Theft", "DUI", "Drugs", "Trespassing", "Vandalism"]
  
    return (
      <div className="mt-4">
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold">14</div>
          <div className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">+3 from yesterday</div>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-4">
          {crimeTypes.map((crime) => (
            <div key={crime} className="px-2 py-1 rounded-md text-xs font-medium text-center">
              {crime}
            </div>
          ))}
        </div>
      </div>
    )
  }
  