"use client";

import { useEffect } from "react";

import { NavMain } from "@/app/(pages)/(admin)/_components/navigations/nav-main";
import { NavReports } from "@/app/(pages)/(admin)/_components/navigations/nav-report";
import { NavUser } from "@/app/(pages)/(admin)/_components/navigations/nav-user";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/app/_components/ui/sidebar";
import { NavPreMain } from "./navigations/nav-pre-main";
import { navData } from "@/prisma/data/jsons/nav";
import { TeamSwitcher } from "../../../_components/team-switcher";
import { useGetCurrentUserQuery } from "../dashboard/user-management/_queries/queries";

import { useUserActionsHandler } from "../dashboard/user-management/_handlers/actions/use-user-actions";


export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={navData.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavPreMain items={navData.NavPreMain} />
        <NavMain items={navData.navMain} />
        <NavReports reports={navData.reports} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
