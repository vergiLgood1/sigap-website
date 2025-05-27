"use client";

import type React from "react";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/app/_components/ui/sidebar";
import { useNavigations } from "@/app/_hooks/use-navigations";
import { Search, Bot, Home } from "lucide-react";
import { IconHome, IconRobot, IconSearch } from "@tabler/icons-react";

interface NavItem {
  title: string;
  url: string;
  icon: React.ElementType;
  items?: NavItem[];
}

function NavItemComponent({ item }: { item: NavItem }) {
  const router = useNavigations();
  const isActive = router.pathname === item.url;

  return (
    <SidebarMenuItem>
      <SidebarMenuButton className={isActive ? "bg-primary/10 text-primary" : ""} tooltip={item.title} asChild>
        <a href={item.url}>
          <item.icon className="h-4 w-4" />
          <span>{item.title}</span>
        </a>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

interface NavPreMainProps {
  items: NavItem[];
}

export function NavPreMain({ items }: NavPreMainProps) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Quick Access</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <NavItemComponent key={item.title} item={item} />
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
