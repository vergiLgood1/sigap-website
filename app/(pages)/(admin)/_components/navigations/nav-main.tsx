"use client";

import { ChevronRight } from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/app/_components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
} from "@/app/_components/ui/sidebar";

import type * as TablerIcons from "@tabler/icons-react";

import { useNavigations } from "@/app/_hooks/use-navigations";
import { formatUrl } from "@/app/_utils/common";

interface SubSubItem {
  title: string;
  url: string;
}

interface SubItem {
  title: string;
  url: string;
  icon?: TablerIcons.Icon;
  subSubItems?: SubSubItem[];
}

interface NavItem {
  title: string;
  url: string;
  icon?: TablerIcons.Icon;
  isActive?: boolean;
  subItems?: SubItem[];
}

function SubSubItemComponent({ item }: { item: SubSubItem }) {
  const router = useNavigations();
  const formattedUrl = formatUrl(item.url);
  const isActive = router.pathname === formattedUrl;

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        className={
          isActive
            ? "bg-muted active font-bold"
            : ""
        }
      >
        <a href={formattedUrl}>
          <span>{item.title}</span>
        </a>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

function SubItemComponent({ item }: { item: SubItem }) {
  const router = useNavigations();
  const formattedUrl = formatUrl(item.url);
  const isActive = router.pathname === formattedUrl;
  const hasSubSubItems = item.subSubItems && item.subSubItems.length > 0;

  if (!hasSubSubItems) {
    return (
      <SidebarMenuItem>
        <SidebarMenuButton
          asChild
          isActive={isActive}
        >
          <a href={formattedUrl}>
            {item.icon && (
              <item.icon />
            )}
            <span>{item.title}</span>
          </a>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }

  return (
    <Collapsible asChild className="group/collapsible">
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton
            isActive={isActive}
          >
            {item.icon && (
              <item.icon />
            )}
            <span>{item.title}</span>
            <ChevronRight
              className={`ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 ${isActive ? "text-primary" : ""}`}
            />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {item.subSubItems!.map((subSubItem) => (
              <SubSubItemComponent key={subSubItem.title} item={subSubItem} />
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
}

function RecursiveNavItem({ item, index }: { item: NavItem; index: number }) {
  const router = useNavigations();
  const formattedUrl = formatUrl(item.url);
  const isActive = router.pathname === formattedUrl;
  const hasSubItems = item.subItems && item.subItems.length > 0;

  if (!hasSubItems) {
    return (
      <SidebarMenuItem>
        <SidebarMenuButton
          tooltip={item.title}
          asChild
          isActive={isActive}
        >
          <a href={formattedUrl}>
            {item.icon && (
              <item.icon />
            )}
            <span>{item.title}</span>
          </a>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }

  return (
    <Collapsible
      key={item.title}
      asChild
      defaultOpen={index === 1}
      className="group/collapsible"
    >
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton
            tooltip={item.title}
            isActive={isActive}
          >
            {item.icon && (
              <item.icon />
            )}
            <span>{item.title}</span>
            {hasSubItems && (
              <ChevronRight
                className={`ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 ${isActive ? "text-primary" : ""}`}
              />
            )}
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {item.subItems!.map((subItem) => (
              <SubItemComponent key={subItem.title} item={subItem} />
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
}

export function NavMain({ items }: { items: NavItem[] }) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item, index) => (
          <RecursiveNavItem key={item.title} item={item} index={index} />
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
