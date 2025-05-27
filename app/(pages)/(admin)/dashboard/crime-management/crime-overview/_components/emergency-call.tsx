export default function EmergencyCalls() {
    const callMetrics = [
      {
        label: "Current Hour",
        value: "24",
        badge: { text: "High", className: "bg-yellow-100 text-yellow-800" },
      },
      {
        label: "Average Wait",
        value: "1:42",
      },
      {
        label: "Operators Available",
        value: "4/6",
        badge: { text: "Understaffed", className: "bg-red-100 text-red-800" },
      },
    ]
  
    return (
      <div className="space-y-2 mt-4">
        {callMetrics.map((metric) => (
          <div key={metric.label} className="flex justify-between items-center">
            <span className="text-sm">{metric.label}</span>
            <div className="flex items-center">
              <span className="text-lg font-bold mr-1">{metric.value}</span>
              {metric.badge && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${metric.badge.className}`}>
                  {metric.badge.text}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    )
  }
  