import type React from "react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/app/_components/ui/breadcrumb";
import { Button } from "@/app/_components/ui/button";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/app/_components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/app/_components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";

import { ThemeSwitcher } from "@/app/_components/theme-switcher";
import { Separator } from "@/app/_components/ui/separator";
import { InboxDrawer } from "@/app/_components/inbox-drawer";
import { FloatingActionSearchBar } from "@/app/_components/floating-action-search-bar";
import { AppSidebar } from "@/app/(pages)/(admin)/_components/app-sidebar";
import { createClient } from "@/app/_utils/supabase/server";
import { redirect } from "next/navigation";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return redirect("/sign-in");
  }

  return (
    <>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          {/* Navigation bar with SidebarTrigger and Breadcrumbs */}
          <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-16 shrink-0 items-center justify-end border-b px-4 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
              <div className="flex items-center gap-2 flex-1">
                <SidebarTrigger className="" />
                <Separator orientation="vertical" className="mr-2 h-4" />
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem>
                      <BreadcrumbLink href="#">Sigap - v</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbPage>Map</BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </div>
              <div className="flex items-center gap-2">
                <InboxDrawer showTitle={true} showAvatar={false} />
                <ThemeSwitcher showTitle={true} title="Theme" />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-5 w-5" />
                      <span className="sr-only">More options</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Settings</DropdownMenuItem>
                    <DropdownMenuItem>Help</DropdownMenuItem>
                    <DropdownMenuItem>About</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </nav>

          {/* Header with other controls */}
          <FloatingActionSearchBar />
          {children}
        </SidebarInset>
      </SidebarProvider>
    </>
  );
}
