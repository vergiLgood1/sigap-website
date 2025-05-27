"use client";

import { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { Switch } from "@/app/_components/ui/switch";
import { Separator } from "@/app/_components/ui/separator";
import { ScrollArea } from "@/app/_components/ui/scroll-area";
import { ThemeSwitcher } from "../../../../_components/theme-switcher";
import DropdownSwitcher from "../../../../_components/custom-dropdown-switcher";
import {
  type CookiePreferences,
  defaultCookiePreferences,
  getCookiePreferences,
  saveCookiePreferences,
  getLanguagePreference,
  saveLanguagePreference,
  getTimezonePreference,
  saveTimezonePreference,
  getWeekStartPreference,
  saveWeekStartPreference,
  getAutoTimezonePreference,
  saveAutoTimezonePreference,
  applyCookiePreferences,
} from "@/app/_utils/cookies/cookies-manager";
import { toast } from "sonner";
import { initialTimezones, TimezoneType } from "@/prisma/data/jsons/timezones";
import { languages, LanguageType } from "@/prisma/data/jsons/languages";

export default function PreferencesSettings() {
  const [language, setLanguage] = useState("en-US");
  const [languageLabel, setLanguageLabel] = useState("English");
  const [startWeekOnMonday, setStartWeekOnMonday] = useState(false);
  const [autoTimezone, setAutoTimezone] = useState(true);
  const [timezone, setTimezone] = useState("Asia/Jakarta");
  const [timezoneLabel, setTimezoneLabel] = useState("(GMT+7:00) Jakarta");
  const [timezones, setTimezones] = useState<LanguageType[]>([]);
  const [availableLanguages, setAvailableLanguages] = useState<TimezoneType[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [cookiePreferences, setCookiePreferences] = useState<CookiePreferences>(
    defaultCookiePreferences
  );
  const [lastToastTime, setLastToastTime] = useState(0);

  // Show toast with debounce to prevent too many notifications
  const showSavedToast = () => {
    const now = Date.now();
    // Only show toast if it's been at least 2 seconds since the last one
    // if (now - lastToastTime > 2000) {
    //   toast("Preferences saved");
    //   setLastToastTime(now);
    // }
  };

  // Load data when component mounts
  useEffect(() => {
    try {
      // Load cookie preferences
      const savedCookiePreferences = getCookiePreferences();
      setCookiePreferences(savedCookiePreferences);

      // Load language preference
      const savedLanguage = getLanguagePreference();
      if (savedLanguage) {
        setLanguage(savedLanguage);
      }

      // Load week start preference
      const savedWeekStart = getWeekStartPreference();
      setStartWeekOnMonday(savedWeekStart);

      // Load auto timezone preference
      const savedAutoTimezone = getAutoTimezonePreference();
      setAutoTimezone(savedAutoTimezone);

      // Load timezone preference
      const savedTimezone = getTimezonePreference();
      if (savedTimezone) {
        setTimezone(savedTimezone);
      }

      // Load timezone and language data
      if (Array.isArray(initialTimezones)) {
        setTimezones(initialTimezones);
      } else {
        console.warn("Using fallback timezone data");
        setTimezones([
          {
            value: "Asia/Jakarta",
            prefix: ChevronDown,
            label: "Jakarta",
            subLabel: "(GMT+7:00)",
          },
        ]);
      }

      if (Array.isArray(languages)) {
        setAvailableLanguages(languages);
      } else {
        console.warn("Using fallback language data");
        setAvailableLanguages([
          {
            value: "en-US",
            prefix: ChevronDown,
            label: "English",
            subLabel: "English (US)",
          },
        ]);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      setTimezones([
        {
          value: "Asia/Jakarta",
          prefix: ChevronDown,
          label: "Jakarta",
          subLabel: "(GMT+7:00)",
        },
      ]);
      setAvailableLanguages([
        {
          value: "en-US",
          prefix: ChevronDown,
          label: "English",
          subLabel: "English (US)",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update labels when data is loaded
  useEffect(() => {
    if (!isLoading) {
      // Set language label
      const selectedLanguage = availableLanguages.find(
        (lang) => lang.value === language
      );
      if (selectedLanguage) {
        setLanguageLabel(selectedLanguage.label);
      }

      // Set timezone label
      const selectedTimezone = timezones.find((tz) => tz.value === timezone);
      if (selectedTimezone) {
        setTimezoneLabel(
          selectedTimezone.subLabel + " " + selectedTimezone.label
        );
      }
    }
  }, [isLoading, language, timezone, availableLanguages, timezones]);

  // Detect browser language
  useEffect(() => {
    if (
      !isLoading &&
      availableLanguages.length > 0 &&
      !getLanguagePreference()
    ) {
      const browserLang = navigator.language;
      const matchedLang = availableLanguages.find(
        (lang) =>
          lang.value === browserLang ||
          lang.value.split("-")[0] === browserLang.split("-")[0]
      );

      if (matchedLang) {
        setLanguage(matchedLang.value);
        setLanguageLabel(matchedLang.label);
        // Save the detected language
        saveLanguagePreference(matchedLang.value);
      }
    }
  }, [isLoading, availableLanguages]);

  // Handle language change
  const handleLanguageChange = (value: string) => {
    setLanguage(value);
    const selectedLanguage = availableLanguages.find(
      (lang) => lang.value === value
    );
    if (selectedLanguage) {
      setLanguageLabel(selectedLanguage.label);
    }
    // Save immediately
    saveLanguagePreference(value);
    showSavedToast();
  };

  // Handle timezone change
  const handleTimezoneChange = (value: string) => {
    setTimezone(value);
    const selectedTimezone = timezones.find((tz) => tz.value === value);
    if (selectedTimezone) {
      setTimezoneLabel(
        selectedTimezone.subLabel + " " + selectedTimezone.label
      );
    }
    // Save immediately
    saveTimezonePreference(value);
    showSavedToast();
  };

  // Handle week start change
  const handleWeekStartChange = (value: boolean) => {
    setStartWeekOnMonday(value);
    // Save immediately
    saveWeekStartPreference(value);
    showSavedToast();
  };

  // Handle auto timezone change
  const handleAutoTimezoneChange = (value: boolean) => {
    setAutoTimezone(value);
    // Save immediately
    saveAutoTimezonePreference(value);
    showSavedToast();
  };

  // Handle cookie preference changes
  const handleCookiePreferenceChange = (
    type: keyof CookiePreferences,
    value: boolean
  ) => {
    const newPreferences = { ...cookiePreferences, [type]: value };
    setCookiePreferences(newPreferences);
    // Save and apply immediately
    saveCookiePreferences(newPreferences);
    applyCookiePreferences(newPreferences);
    showSavedToast();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-140px)]">
        Loading...
      </div>
    );
  }

  return (
    <div className="space-y-14 w-full max-w-4xl mx-auto">
      <div className="space-y-14 p-8 max-w-4xl mx-auto">
        <div>
          <div className="space-y-4 mb-4">
            <h1 className="font-medium">Preferences</h1>
            <Separator className="" />
          </div>

          {/* Appearance Section */}
          <div className="">
            <div className="flex justify-between items-center">
              <h2 className="font-medium">Appearance</h2>
              <div className="flex items-center cursor-pointer">
                <ThemeSwitcher
                  showTitle={true}
                  prefix={false}
                  suffix={ChevronDown}
                  variant={"ghost"}
                />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Customize how the application looks on your device.
            </p>
          </div>
        </div>

        {/* Language & Time Section */}
        <div className="">
          <div className="space-y-4 mb-4">
            <h2 className="font-medium">Language & Time</h2>
            <Separator className="my-4" />
          </div>

          <div className="space-y-8">
            {/* Language Subsection */}
            <div className="flex justify-between items-center mb-2">
              <div>
                <h3 className="text-sm font-medium">Language</h3>
                <p className="text-sm text-muted-foreground">
                  Change the language used in the user interface.
                </p>
              </div>
              <DropdownSwitcher
                key={language}
                options={availableLanguages}
                prefix={false}
                suffix={ChevronDown}
                showTitle={true}
                variant="ghost"
                title={languageLabel}
                selectedValue={language}
                searchable={true}
                searchPlaceholder="Search languages..."
                onChange={handleLanguageChange}
                currentLabel="Current language"
                selectLabel="Select a language"
              />
            </div>

            {/* Start week on Monday Subsection */}
            <div className="flex justify-between items-center mb-2">
              <div>
                <h3 className="text-sm font-medium">Start week on Monday</h3>
                <p className="text-sm text-muted-foreground">
                  This will change how all calendars in your app look.
                </p>
              </div>
              <Switch
                checked={startWeekOnMonday}
                onCheckedChange={handleWeekStartChange}
              />
            </div>

            {/* Auto Timezone Subsection */}
            <div className="flex justify-between items-center mb-2">
              <div>
                <h3 className="text-sm font-medium">
                  Set timezone automatically using your location
                </h3>
                <p className="text-sm text-muted-foreground">
                  Reminders, notifications and emails are delivered based on
                  your time zone.
                </p>
              </div>
              <Switch
                checked={autoTimezone}
                onCheckedChange={handleAutoTimezoneChange}
              />
            </div>

            {/* Timezone Subsection */}
            <div className="flex justify-between items-center mb-2">
              <div>
                <h3 className="text-sm font-medium">Timezone</h3>
                <p className="text-sm text-muted-foreground">
                  Current timezone setting.
                </p>
              </div>
              <DropdownSwitcher
                key={timezone}
                options={timezones}
                prefix={false}
                suffix={ChevronDown}
                showTitle={true}
                variant="ghost"
                title={timezoneLabel}
                selectedValue={timezone}
                searchable={true}
                searchPlaceholder="Search for a timezone..."
                onChange={handleTimezoneChange}
                currentLabel="Current timezone"
                selectLabel="Select a timezone"
                disabled={autoTimezone}
              />
            </div>
          </div>
        </div>

        {/* Privacy Section */}
        <div className="">
          <div className="space-y-4 mb-4">
            <h2 className="font-medium">Privacy</h2>
            <Separator className="" />
          </div>
          <div className="space-y-8">
            {/* Cookies Settings */}
            <div className="flex justify-between items-center mb-2">
              <div>
                <h3 className="text-sm font-medium">Necessary Cookies</h3>
                <p className="text-sm text-muted-foreground">
                  Required for the website to function properly. Cannot be
                  disabled.
                </p>
              </div>
              <Switch checked={true} disabled className="opacity-50" />
            </div>

            <div className="flex justify-between items-center mb-2">
              <div>
                <h3 className="text-sm font-medium">Functional Cookies</h3>
                <p className="text-sm text-muted-foreground">
                  Enable enhanced functionality and personalization.
                </p>
              </div>
              <Switch
                checked={cookiePreferences.functional}
                onCheckedChange={(checked) =>
                  handleCookiePreferenceChange("functional", checked)
                }
              />
            </div>

            <div className="flex justify-between items-center mb-2">
              <div>
                <h3 className="text-sm font-medium">Analytics Cookies</h3>
                <p className="text-sm text-muted-foreground">
                  Help us improve by collecting anonymous information about how
                  you use the site.
                </p>
              </div>
              <Switch
                checked={cookiePreferences.analytics}
                onCheckedChange={(checked) =>
                  handleCookiePreferenceChange("analytics", checked)
                }
              />
            </div>

            <div className="flex justify-between items-center mb-2">
              <div>
                <h3 className="text-sm font-medium">Marketing Cookies</h3>
                <p className="text-sm text-muted-foreground">
                  Used to display personalized advertisements based on your
                  browsing habits.
                </p>
              </div>
              <Switch
                checked={cookiePreferences.marketing || false}
                onCheckedChange={(checked) =>
                  handleCookiePreferenceChange("marketing", checked)
                }
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
