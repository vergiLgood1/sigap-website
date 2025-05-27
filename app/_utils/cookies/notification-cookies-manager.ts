// Notification preferences cookie management

// Notification preferences type
export type NotificationPreferences = {
  mobilePushNotifications: boolean;
  emailNotifications: boolean;
  announcementNotifications: boolean;
};

// Default notification preferences
export const defaultNotificationPreferences: NotificationPreferences = {
  mobilePushNotifications: true,
  emailNotifications: true,
  announcementNotifications: false,
};

// Cookie names
const NOTIFICATION_PREFERENCES_KEY = "notification-preferences";

// Helper to set a cookie with expiration
export const setCookie = (name: string, value: string, days = 365): void => {
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

// Save notification preferences
export const saveNotificationPreferences = (
  preferences: NotificationPreferences
): void => {
  setCookie(NOTIFICATION_PREFERENCES_KEY, JSON.stringify(preferences));
};

// Get notification preferences
export const getNotificationPreferences = (): NotificationPreferences => {
  try {
    const preferences = getCookie(NOTIFICATION_PREFERENCES_KEY);
    if (preferences) {
      return { ...defaultNotificationPreferences, ...JSON.parse(preferences) };
    }
  } catch (error) {
    console.error("Error parsing notification preferences:", error);
  }

  return defaultNotificationPreferences;
};

// Apply notification preferences to the application
export const applyNotificationPreferences = (
  preferences: NotificationPreferences
): void => {
  // This function would implement the actual notification settings
  // For example, enabling/disabling push notifications

  if (preferences.mobilePushNotifications) {
    // Enable push notifications
    console.log("Push notifications enabled");
    // Example: requestPushPermission();
  } else {
    // Disable push notifications
    console.log("Push notifications disabled");
    // Example: disablePushNotifications();
  }

  if (preferences.emailNotifications) {
    // Enable email notifications
    console.log("Email notifications enabled");
    // Example: enableEmailNotifications();
  } else {
    // Disable email notifications
    console.log("Email notifications disabled");
    // Example: disableEmailNotifications();
  }

  if (preferences.announcementNotifications) {
    // Enable announcement notifications
    console.log("Announcement notifications enabled");
    // Example: subscribeToAnnouncementEmails();
  } else {
    // Disable announcement notifications
    console.log("Announcement notifications disabled");
    // Example: unsubscribeFromAnnouncementEmails();
  }
};
