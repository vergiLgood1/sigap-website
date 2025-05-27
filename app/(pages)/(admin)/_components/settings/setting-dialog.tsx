"use client"

import type React from "react"

import { cn } from "@/app/_lib/utils"
import { Dialog, DialogContent, DialogTrigger } from "@/app/_components/ui/dialog"
import { ScrollArea } from "@/app/_components/ui/scroll-area"
import { Separator } from "@/app/_components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/app/_components/ui/avatar"
import { IconAdjustmentsHorizontal, IconBell, IconFileExport, IconFileImport, IconUser } from "@tabler/icons-react"
import { ProfileSettings } from "./profile-settings"
import { DialogTitle } from "@radix-ui/react-dialog"
import { useState } from "react"

import NotificationsSetting from "./notification-settings"
import PreferencesSettings from "./preference-settings"
import ImportData from "./import-data"

import { useGetCurrentUserQuery } from "../../dashboard/user-management/_queries/queries"

interface SettingsDialogProps {
  trigger: React.ReactNode
  defaultTab?: string
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

interface SettingsTab {
  id: string
  icon: typeof IconUser
  title: string
  content: React.ReactNode
}

interface SettingsSection {
  title: string
  tabs: SettingsTab[]
}

export function SettingsDialog({ trigger, defaultTab = "account", open, onOpenChange }: SettingsDialogProps) {
  const { data: user, isPending } = useGetCurrentUserQuery()

  const [selectedTab, setSelectedTab] = useState(defaultTab)

  if (!user || !user.profile) return <div className="text-red-500">User not found</div>

  // Get user display name
  const preferredName = user.profile.username || ""
  const userEmail = user.email || ""
  const displayName = preferredName || userEmail.split("@")[0] || "User"
  const userAvatar = user.profile.avatar || ""

  const sections: SettingsSection[] = [
    {
      title: "Account",
      tabs: [
        {
          id: "account",
          icon: IconUser,
          title: "My Account",
          content: <ProfileSettings />,
        },
        {
          id: "preferences",
          icon: IconAdjustmentsHorizontal,
          title: "Preferences",
          content: <PreferencesSettings />,
        },
        {
          id: "notifications",
          icon: IconBell,
          title: "Notifications",
          content: <NotificationsSetting />,
        },
      ],
    },
    {
      title: "Workspace",
      tabs: [
        {
          id: "import",
          icon: IconFileImport,
          title: "Import",
          content: <ImportData />,
        },
        {
          id: "export",
          icon: IconFileExport,
          title: "Export",
          content: <div>Export</div>,
        },
      ],
    },
  ]

  const currentTab = sections.flatMap((section) => section.tabs).find((tab) => tab.id === selectedTab)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTitle></DialogTitle>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-[1200px] gap-0 p-0 h-[600px]">
        <div className="grid h-[600px] grid-cols-[250px,1fr]">
          {/* Sidebar */}
          <div className="border-r bg-muted/50">
            <ScrollArea className="h-[600px]">
              <div className="p-2">
                <div className="flex items-center gap-2 px-3 py-2">
                  {isPending ? (
                    <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
                  ) : (
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={userAvatar} alt={displayName} />
                        <AvatarFallback>{displayName[0].toUpperCase()}</AvatarFallback>
                      </Avatar>
                  )}
                  <span className="text-sm font-medium">
                    {isPending ? <div className="h-4 w-24 rounded bg-muted animate-pulse" /> : displayName}
                  </span>
                </div>
                {sections.map((section, index) => (
                  <div key={section.title} className="py-2">
                    <div className="px-3 py-2">
                      <h3 className="text-sm font-medium text-muted-foreground">{section.title}</h3>
                    </div>
                    <div className="space-y-1">
                      {section.tabs.map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => setSelectedTab(tab.id)}
                          className={cn(
                            "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium",
                            tab.id === selectedTab
                              ? "bg-accent text-accent-foreground"
                              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                          )}
                        >
                          <tab.icon className="h-4 w-4" />
                          {tab.title}
                        </button>
                      ))}
                    </div>
                    {index < sections.length - 1 && <Separator className="mx-3 my-2" />}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Content */}
          <div className="flex flex-col h-full">
            {isPending ? (
              <div className="h-full w-full animate-pulse bg-muted" />
            ) : (
              <ScrollArea className="h-[600px]">
                <div className="p-6">{currentTab?.content}</div>
              </ScrollArea>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
