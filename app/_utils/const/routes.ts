// src/constants/routes.ts

/**
 * Application route constants for better maintainability
 * Use these constants instead of hard-coded strings throughout the app
 */
export const ROUTES = {
    // Auth routes
    AUTH: {
        SIGN_IN_PASSWORDLESS: '/sign-in',
        SIGN_IN_WITH_PASSWORD: '/sign-in-password',
        SIGN_UP: '/sign-up',
        VERIFY_OTP: '/verify-otp',
        RESET_PASSWORD: '/reset-password',
        FORGOT_PASSWORD: '/forgot-password',
    },

    // Main application routes
    APP: {
        DASHBOARD: '/dashboard',
        PROFILE: '/profile',
        SETTINGS: '/settings',
        USER_MANAGEMENT: '/dashboard/user-management',
    },

    // Public routes
    PUBLIC: {
        HOME: '/',
        CONTACT: '/contact-us',
        ABOUT: '/about',
        TERMS: '/terms',
        PRIVACY: '/privacy',
    }
};