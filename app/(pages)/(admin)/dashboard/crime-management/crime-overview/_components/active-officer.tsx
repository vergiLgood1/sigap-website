export default function ActiveOfficers() {
    return (
      <>
        <div className="flex -space-x-2 mt-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="w-10 h-10 rounded-full border-2 border-background bg-slate-200 flex items-center justify-center text-xs font-medium"
            >
              {i}
            </div>
          ))}
          <div className="w-10 h-10 rounded-full border-2 border-background bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">
            +12
          </div>
        </div>
        <div className="mt-4 flex justify-between text-sm">
          <span className="text-muted-foreground">Total on duty:</span>
          <span className="font-medium">18/24 officers</span>
        </div>
      </>
    )
  }
  