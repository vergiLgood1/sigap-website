import { BentoGrid, BentoGridItem } from "@/app/_components/ui/bento-grid";
import { DateTimePicker2 } from "@/app/_components/ui/date-picker";
import { createClient } from "@/app/_utils/supabase/server";
import { redirect } from "next/navigation";

import {
  BarChart3,
  Calendar,
  CreditCard,
  Globe,
  LineChart,
  MessageSquare,
  Settings,
  ShoppingCart,
  Users,
} from "lucide-react";

export default async function DashboardPage() {
  // const supabase = await createClient();

  // const {
  //   data: { user },
  // } = await supabase.auth.getUser();

  // if (!user) {
  //   return redirect("/sign-in");
  // }

  // console.log("user", user);

  return (
    <div className="container py-4">
      {/* <h2 className="text-3xl font-bold tracking-tight mb-8">Dashboard Overview</h2> */}
      <BentoGrid className="max-w-full mx-auto">
        <BentoGridItem
          title="Sales Analytics"
          description="Monthly revenue and transaction data"
          icon={<BarChart3 className="w-5 h-5" />}
          colSpan="2"
          rowSpan="2"
        >
          <div className="h-[200px] mt-4 rounded-md bg-muted flex items-center justify-center">
            <LineChart className="h-8 w-8 text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Chart Visualization</span>
          </div>
        </BentoGridItem>

        <BentoGridItem
          title="Recent Orders"
          description="Latest customer purchases"
          icon={<ShoppingCart className="w-5 h-5" />}
        >
          <div className="space-y-2 mt-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-2 rounded-lg p-2 bg-muted/50">
                <div className="w-8 h-8 rounded bg-muted"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">Order #{i}0234</p>
                  <p className="text-xs text-muted-foreground">2 mins ago</p>
                </div>
                <div className="text-sm font-medium">$149.99</div>
              </div>
            ))}
          </div>
        </BentoGridItem>

        <BentoGridItem title="Team Members" description="Active users this month" icon={<Users className="w-5 h-5" />}>
          <div className="flex -space-x-2 mt-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="w-8 h-8 rounded-full border-2 border-background bg-muted flex items-center justify-center text-xs font-medium"
              >
                {i}
              </div>
            ))}
            <div className="w-8 h-8 rounded-full border-2 border-background bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">
              +3
            </div>
          </div>
        </BentoGridItem>

        <BentoGridItem
          title="Global Reach"
          description="Customer distribution worldwide"
          icon={<Globe className="w-5 h-5" />}
          colSpan="2"
        >
          <div className="h-[150px] mt-4 rounded-md bg-muted flex items-center justify-center">
            <Globe className="h-8 w-8 text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">World Map Visualization</span>
          </div>
        </BentoGridItem>

        <BentoGridItem
          title="Upcoming Events"
          description="Scheduled meetings and deadlines"
          icon={<Calendar className="w-5 h-5" />}
        >
          <div className="space-y-2 mt-4">
            {[1, 2].map((i) => (
              <div key={i} className="flex items-center gap-2 rounded-lg p-2 bg-muted/50">
                <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">Team Meeting</p>
                  <p className="text-xs text-muted-foreground">Tomorrow, 10:00 AM</p>
                </div>
              </div>
            ))}
          </div>
        </BentoGridItem>

        <BentoGridItem
          title="Support Tickets"
          description="Customer inquiries and issues"
          icon={<MessageSquare className="w-5 h-5" />}
        >
          <div className="flex items-center justify-between mt-4">
            <div className="text-2xl font-bold">24</div>
            <div className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">-12% from last week</div>
          </div>
          <div className="h-1 w-full bg-muted mt-2 rounded-full overflow-hidden">
            <div className="bg-green-500 h-full w-[65%]" />
          </div>
        </BentoGridItem>

        <BentoGridItem
          title="Payment Methods"
          description="Active payment options"
          icon={<CreditCard className="w-5 h-5" />}
        >
          <div className="flex gap-2 mt-4">
            {["Visa", "Mastercard", "PayPal"].map((method) => (
              <div key={method} className="px-3 py-1 rounded-full bg-muted text-xs font-medium">
                {method}
              </div>
            ))}
          </div>
        </BentoGridItem>

        <BentoGridItem
          title="System Status"
          description="Server and application health"
          icon={<Settings className="w-5 h-5" />}
        >
          <div className="space-y-2 mt-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">API</span>
              <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">Operational</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Database</span>
              <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">Operational</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Storage</span>
              <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-800">Degraded</span>
            </div>
          </div>
        </BentoGridItem>
      </BentoGrid>
    </div>
  )
}
