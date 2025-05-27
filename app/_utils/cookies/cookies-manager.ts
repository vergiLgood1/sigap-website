// Cookie management utility functions

// Cookie types
export type CookiePreferences = {
  necessary: boolean;
  functional: boolean;
  analytics: boolean;
  marketing?: boolean;
};

// Default cookie preferences
export const defaultCookiePreferences: CookiePreferences = {
  necessary: true, // Always true, cannot be disabled
  functional: false,
  analytics: false,
  marketing: false,
};

// Cookie names
const COOKIE_PREFERENCES_KEY = "cookie-preferences";
const LANGUAGE_PREFERENCE_KEY = "language-preference";
const TIMEZONE_PREFERENCE_KEY = "timezone-preference";
const WEEK_START_PREFERENCE_KEY = "week-start-preference";
const AUTO_TIMEZONE_PREFERENCE_KEY = "auto-timezone-preference";

// Helper to set a cookie with expiration
export const setCookie = (
  name: string,
  value: string,
  days: number = 365
): void => {
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = `; expires=${date.toUTCString()}`;
  document.cookie = `${name}=${value}${expires}; path=/; SameSite=Lax`;
};

// Helper to get a cookie by name
export const getCookie = (name: string): string | null => {
  if (typeof document === "undefined") return null;

  const nameEQ = `${name}=`;
  const ca = document.cookie.split(";");

  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === " ") c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }

  return null;
};

// Helper to delete a cookie
export const deleteCookie = (name: string): void => {
  setCookie(name, "", -1);
};

// Save cookie preferences
export const saveCookiePreferences = (preferences: CookiePreferences): void => {
  // Always ensure necessary cookies are enabled
  const prefsToSave = {
    ...preferences,
    necessary: true,
  };

  setCookie(COOKIE_PREFERENCES_KEY, JSON.stringify(prefsToSave));
};

// Get cookie preferences
export const getCookiePreferences = (): CookiePreferences => {
  try {
    const preferences = getCookie(COOKIE_PREFERENCES_KEY);
    if (preferences) {
      return { ...defaultCookiePreferences, ...JSON.parse(preferences) };
    }
  } catch (error) {
    console.error("Error parsing cookie preferences:", error);
  }

  return defaultCookiePreferences;
};

// Save language preference
export const saveLanguagePreference = (language: string): void => {
  setCookie(LANGUAGE_PREFERENCE_KEY, language);
};

// Get language preference
export const getLanguagePreference = (): string | null => {
  return getCookie(LANGUAGE_PREFERENCE_KEY);
};

// Save timezone preference
export const saveTimezonePreference = (timezone: string): void => {
  setCookie(TIMEZONE_PREFERENCE_KEY, timezone);
};

// Get timezone preference
export const getTimezonePreference = (): string | null => {
  return getCookie(TIMEZONE_PREFERENCE_KEY);
};

// Save week start preference
export const saveWeekStartPreference = (startOnMonday: boolean): void => {
  setCookie(WEEK_START_PREFERENCE_KEY, startOnMonday ? "monday" : "sunday");
};

// Get week start preference
export const getWeekStartPreference = (): boolean => {
  const pref = getCookie(WEEK_START_PREFERENCE_KEY);
  return pref === "monday";
};

// Save auto timezone preference
export const saveAutoTimezonePreference = (auto: boolean): void => {
  setCookie(AUTO_TIMEZONE_PREFERENCE_KEY, auto ? "true" : "false");
};

// Get auto timezone preference
export const getAutoTimezonePreference = (): boolean => {
  const pref = getCookie(AUTO_TIMEZONE_PREFERENCE_KEY);
  return pref === "true";
};

// Apply cookie preferences to the application
export const applyCookiePreferences = (
  preferences: CookiePreferences
): void => {
  // This function would implement the actual cookie policy enforcement
  // For example, enabling/disabling analytics scripts based on preferences

  if (preferences.analytics) {
    // Enable analytics scripts
    console.log("Analytics cookies enabled");
    // Example: initAnalytics();
  } else {
    // Disable analytics scripts
    console.log("Analytics cookies disabled");
    // Example: disableAnalytics();
  }

  if (preferences.functional) {
    // Enable functional cookies
    console.log("Functional cookies enabled");
    // Example: enableFunctionalFeatures();
  } else {
    // Disable functional cookies
    console.log("Functional cookies disabled");
    // Example: disableFunctionalFeatures();
  }

  if (preferences.marketing) {
    // Enable marketing cookies
    console.log("Marketing cookies enabled");
    // Example: enableMarketingFeatures();
  } else {
    // Disable marketing cookies
    console.log("Marketing cookies disabled");
    // Example: disableMarketingFeatures();
  }
};
