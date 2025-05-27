"use client";

import { useState } from "react";
import { ChevronsUpDown, Loader2 } from "lucide-react";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/app/_components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/_components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/app/_components/ui/sidebar";
import { IconLogout, IconSettings, IconSparkles } from "@tabler/icons-react";
import type { IUserSchema } from "@/src/entities/models/users/users.model";
// import { signOut } from "@/app/(pages)/(auth)/action";
import { SettingsDialog } from "../settings/setting-dialog";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogTitle, AlertDialogDescription, AlertDialogCancel, AlertDialogAction } from "@/app/_components/ui/alert-dialog";
import { useSignOutHandler } from "@/app/(pages)/(auth)/_handlers/use-sign-out";
import { useGetCurrentUserQuery } from "../../dashboard/user-management/_queries/queries";


interface NavUserProps {
  user: IUserSchema | null;
  isPending: boolean;
}

export function NavUser() {

  const { data: user, isPending } = useGetCurrentUserQuery();

  const { isMobile } = useSidebar();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Use profile data with fallbacks
  const firstName = user?.profile?.first_name || "";
  const lastName = user?.profile?.last_name || "";
  const userEmail = user?.email || "";
  const userAvatar = user?.profile?.avatar || "";
  const username = user?.profile?.username || "";

  const getFullName = () => {
    return `${firstName} ${lastName}`.trim() || username || "User";
  };

  // Generate initials for avatar fallback
  const getInitials = () => {
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    if (firstName) {
      return firstName[0].toUpperCase();
    }
    if (userEmail) {
      return userEmail[0].toUpperCase();
    }
    return "U";
  };

  const { handleSignOut, isPending: isSignOutPending, errors, error: isSignOutError } = useSignOutHandler();

  function LogoutButton({ handleSignOut, isSignOutPending }: { handleSignOut: () => void; isSignOutPending: boolean }) {
    const [open, setOpen] = useState(false);

    return (
      <>
        {/* Dropdown Item */}
        <DropdownMenuItem
          onSelect={(e) => {
            e.preventDefault();
            setOpen(true); // Buka dialog saat diklik
          }}
          disabled={isSignOutPending}
          className="space-x-2"
        >
          {isSignOutPending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              <span>Logging out...</span>
            </>
          ) : (
            <>
                <IconLogout className="size-4" />
                <span>Log out</span>
            </>
          )}
        </DropdownMenuItem>

        {/* Alert Dialog */}
        <AlertDialog open={open} onOpenChange={setOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Log out</AlertDialogTitle>
            </AlertDialogHeader>
            <AlertDialogDescription>
              Are you sure you want to log out?
            </AlertDialogDescription>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setOpen(false)}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  handleSignOut();

                  if (!isSignOutPending) {
                    setOpen(false);
                  }
                }}
                className="btn btn-primary"
                disabled={isSignOutPending}
              >
                {isSignOutPending ? (
                  <>
                    <Loader2 className="size-4" />
                    <span>Logging You Out...</span>
                  </>
                ) : (
                  <span>Log out</span>
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              {isPending ? (
                <div className="flex items-center space-x-2 animate-pulse">
                  <div className="h-8 w-8 rounded-lg bg-muted" />
                  <div className="flex-1 space-y-1">
                    <div className="h-4 w-24 rounded bg-muted" />
                    <div className="h-3 w-16 rounded bg-muted" />
                  </div>
                </div>
              ) : (
                <>
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarImage src={userAvatar || ""} alt={username} />
                      <AvatarFallback className="rounded-lg">
                        {getInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">{username}</span>
                      <span className="truncate text-xs">{userEmail}</span>
                    </div>
                    <ChevronsUpDown className="ml-auto size-4" />
                </>
              )}
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          {!isPending && (
            <DropdownMenuContent
              className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
              side={isMobile ? "bottom" : "right"}
              align="end"
              sideOffset={4}
            >
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={userAvatar || ""} alt={username} />
                    <AvatarFallback className="rounded-lg">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">
                      {username}
                    </span>
                    <span className="truncate text-xs">{userEmail}</span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem className="space-x-2">
                  <IconSparkles className="size-4" />
                  <span>Upgrade to Pro</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <SettingsDialog
                  trigger={
                    <DropdownMenuItem
                      className="space-x-2"
                      onSelect={(e) => {
                        e.preventDefault();
                      }}
                    >
                      <IconSettings className="size-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                  }
                />
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <LogoutButton handleSignOut={handleSignOut} isSignOutPending={isSignOutPending} />
            </DropdownMenuContent>
          )}
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
