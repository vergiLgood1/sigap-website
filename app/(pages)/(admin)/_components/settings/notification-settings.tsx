"use client";

import { useState, useEffect, useRef } from "react";
import { Switch } from "@/app/_components/ui/switch";
import { Separator } from "@/app/_components/ui/separator";
import { ScrollArea } from "@/app/_components/ui/scroll-area";
import {
  type NotificationPreferences,
  defaultNotificationPreferences,
  getNotificationPreferences,
  saveNotificationPreferences,
  applyNotificationPreferences,
} from "@/app/_utils/cookies/notification-cookies-manager";
import { toast } from "sonner";

export default function NotificationsSetting() {
  const contentRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastToastTime, setLastToastTime] = useState(0);
  const [notificationPreferences, setNotificationPreferences] =
    useState<NotificationPreferences | null>(null);
  const [isScrollable, setIsScrollable] = useState(false);
  const scrollAreaHeight = "calc(100vh - 140px)";

  useEffect(() => {
    const checkScrollable = () => {
      if (contentRef.current) {
        const contentHeight = contentRef.current.scrollHeight;
        const viewportHeight = window.innerHeight - 140;

        setIsScrollable(contentHeight > viewportHeight);
      }
    };

    // Check initially
    checkScrollable();

    // Check on window resize
    window.addEventListener("resize", checkScrollable);

    // Clean up event listener
    return () => window.removeEventListener("resize", checkScrollable);
  }, []);

  // Show toast with debounce to prevent too many notifications
  const showSavedToast = () => {
    // const now = Date.now();
    // if (now - lastToastTime > 2000) {
    //   toast("Preferences saved");
    //   setLastToastTime(now);
    // }
  };

  // Load saved preferences on component mount
  useEffect(() => {
    try {
      const savedPreferences = getNotificationPreferences();
      setNotificationPreferences(savedPreferences);
    } catch (error) {
      console.error("Error loading notification preferences:", error);
      setNotificationPreferences(defaultNotificationPreferences);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Jika masih loading atau notificationPreferences masih null, tampilkan loading
  if (isLoading || !notificationPreferences) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-140px)]">
        Loading...
      </div>
    );
  }

  // Gunakan nilai default jika notificationPreferences belum ada
  const {
    mobilePushNotifications,
    emailNotifications,
    announcementNotifications,
  } = notificationPreferences || defaultNotificationPreferences;

  // Generic handler untuk update state dan menyimpan preferensi
  const updatePreference = (
    key: keyof NotificationPreferences,
    value: boolean
  ) => {
    const newPreferences = { ...notificationPreferences, [key]: value };
    setNotificationPreferences(newPreferences);
    saveNotificationPreferences(newPreferences);
    applyNotificationPreferences(newPreferences);
    showSavedToast();
  };

  return (
    <div className="space-y-14 w-full max-w-4xl mx-auto">
      <div className="space-y-14 p-8 max-w-4xl mx-auto">
        <div>
          <div className="space-y-4 mb-4">
            <h1 className="font-medium">Notifications</h1>
            <Separator />
          </div>

          {/* Mobile push notification Section */}
          <div>
            <div className="space-y-8">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-medium">
                    Mobile push notifications
                  </h3>
                  <p className="text-sm text-neutral-400">
                    Receive push notifications on your mobile device when you're
                    offline.
                  </p>
                </div>
                <Switch
                  checked={mobilePushNotifications}
                  onCheckedChange={(checked) =>
                    updatePreference("mobilePushNotifications", checked)
                  }
                />
              </div>
            </div>
          </div>
        </div>

        {/* Email notifications Section */}
        <div>
          <h2 className="font-medium">Email Notifications</h2>
          <Separator className="my-4" />
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-medium">
                  Always send email notifications
                </h3>
                <p className="text-sm text-neutral-400">
                  Receive emails about activity in your workspace, even when
                  you're active on the app.
                </p>
              </div>
              <Switch
                checked={emailNotifications}
                onCheckedChange={(checked) =>
                  updatePreference("emailNotifications", checked)
                }
              />
            </div>

            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-medium">
                  Announcements and Update Emails
                </h3>
                <p className="text-sm text-neutral-400">
                  Receive occasional emails about product launches and new
                  features from Notion.
                </p>
              </div>
              <Switch
                checked={announcementNotifications}
                onCheckedChange={(checked) =>
                  updatePreference("announcementNotifications", checked)
                }
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
