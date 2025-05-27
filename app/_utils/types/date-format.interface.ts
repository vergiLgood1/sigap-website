import { Locale } from "date-fns";

/**
 * Available date format patterns for the formatDate function.
 * See date-fns format documentation for more details on each pattern.
 */
export type DateFormatPattern =
    // Year formats
    | "yyyy" // 2025
    | "yy" // 25
    | "y" // 2025

    // Month formats
    | "MMMM" // March
    | "MMM" // Mar
    | "MM" // 03
    | "M" // 3

    // Day formats
    | "dd" // 01-31
    | "d" // 1-31
    | "Do" // 1st, 2nd, etc.
    | "EEEE" // Monday, Tuesday, etc.
    | "EEE" // Mon, Tue, etc.
    | "EE" // Mo, Tu, etc.
    | "E" // M, T, etc.

    // Hour formats
    | "HH" // 00-23
    | "H" // 0-23
    | "hh" // 01-12
    | "h" // 1-12

    // Minute and second formats
    | "mm" // 00-59
    | "m" // 0-59
    | "ss" // 00-59
    | "s" // 0-59

    // AM/PM
    | "a" // am/pm
    | "aa" // AM/PM

    // Combined common formats
    | "PPpp" // Mar 23, 2025, 12:00 AM
    | "Pp" // 03/23/2025, 12:00 AM
    | "PP" // Mar 23, 2025
    | "p" // 12:00 AM

    // Custom combined patterns (allow any string)
    | string;

/**
 * Custom formatting options for dates.
 */
export interface DateFormatOptions {
    /**
     * The format pattern to use when formatting the date.
     * @default "PPpp"
     */
    format?: DateFormatPattern;

    /**
     * The value to display when the date is null or undefined.
     * @default "-"
     */
    fallback?: string;

    /**
     * The locale to use for formatting.
     * @default undefined (uses system locale)
     */
    locale?: Locale;
}