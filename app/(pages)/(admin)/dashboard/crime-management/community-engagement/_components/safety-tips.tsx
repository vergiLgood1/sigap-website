import { Home, Car, Smartphone } from "lucide-react"

export default function SafetyTips() {
  const categories = [
    {
      name: "Home Security",
      icon: Home,
      tips: ["Lock all doors and windows when away", "Install motion-sensor lighting", "Consider a security system"],
    },
    {
      name: "Vehicle Protection",
      icon: Car,
      tips: ["Always lock your vehicle", "Don't leave valuables visible", "Park in well-lit areas"],
    },
    {
      name: "Digital Safety",
      icon: Smartphone,
      tips: ["Use strong, unique passwords", "Be cautious of suspicious emails", "Keep software updated"],
    },
  ]

  return (
    <div className="mt-4 space-y-3">
      {categories.map((category) => (
        <div key={category.name} className="border rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
              <category.icon className="h-4 w-4" />
            </div>
            <h4 className="font-medium text-sm">{category.name}</h4>
          </div>

          <ul className="space-y-1 pl-10">
            {category.tips.map((tip, index) => (
              <li key={index} className="text-xs list-disc">
                {tip}
              </li>
            ))}
          </ul>
        </div>
      ))}

      <button className="w-full text-sm text-primary mt-2 py-1">View All Safety Tips</button>
    </div>
  )
}
