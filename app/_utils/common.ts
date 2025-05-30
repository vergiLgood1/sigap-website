import { format } from 'date-fns';
import { redirect } from 'next/navigation';
import {
  DateFormatOptions,
  DateFormatPattern,
} from './types/date-format.interface';
import { toast } from 'sonner';
import { IUserSchema } from '@/src/entities/models/users/users.model';
import db from '../../prisma/db';
import { v4 as uuidv4 } from 'uuid';
import * as crypto from 'crypto';

import { districtsGeoJson } from '../../prisma/data/geojson/jember/districts-geojson';


// Used to track generated IDs
const usedIdRegistry = new Set<string>();

// Add type definitions for global counters
declare global {
  var __idCounter: number;
  var __idCounterRegistry: Record<string, number>;
}

/**
 * Redirects to a specified path with an encoded message as a query parameter.
 * @param {('error' | 'success')} type - The type of message, either 'error' or 'success'.
 * @param {string} path - The path to redirect to.
 * @param {string} message - The message to be encoded and added as a query parameter.
 * @returns {never} This function doesn't return as it triggers a redirect.
 */
export function encodedRedirect(
  type: 'error' | 'success',
  path: string,
  message: string
) {
  return redirect(`${path}?${type}=${encodeURIComponent(message)}`);
}

/**
 * Formats a URL by removing any trailing slashes.
 * @param {string} url - The URL to format.
 * @returns {string} The formatted URL.
 */
// Helper function to ensure URLs are properly formatted
export function formatUrl(url: string): string {
  // If URL starts with a slash, it's already absolute
  if (url.startsWith('/')) {
    return url;
  }

  // Otherwise, ensure it's properly formatted relative to root
  // Remove any potential duplicated '/dashboard' prefixes
  if (url.startsWith('dashboard/')) {
    return '/' + url;
  }

  return '/' + url;
}

/**
 * Creates a FormData object from the FormData object.
 * @returns {FormData} The FormData object.
 */
export function createFormData(): FormData {
  const data = new FormData();
  Object.entries(FormData).forEach(([key, value]) => {
    if (value) {
      data.append(key, value);
    }
  });
  return data;
}

/**
 * Generates a unique username based on the provided email address.
 *
 * The username is created by combining the local part of the email (before the '@' symbol)
 * with a randomly generated alphanumeric suffix.
 *
 * @param email - The email address to generate the username from.
 * @returns A string representing the generated username.
 *
 * @example
 * ```typescript
 * const username = generateUsername("example@gmail.com");
 * console.log(username); // Output: "example.abc123" (random suffix will vary)
 * ```
 */
export function generateUsername(email: string): string {
  const [localPart] = email.split('@');
  const randomSuffix = Math.random().toString(36).substring(2, 8); // Generate a random alphanumeric string
  return `${localPart}.${randomSuffix}`;
}

/**
 * Formats a date string to a human-readable format with type safety.
 * @param date - The date string to format.
 * @param options - Formatting options or a format string.
 * @returns The formatted date string.
 * @example
 * // Using default format
 * formatDate("2025-03-23")
 *
 * // Using a custom format string
 * formatDate("2025-03-23", "yyyy-MM-dd")
 *
 * // Using formatting options
 * formatDate("2025-03-23", { format: "MMMM do, yyyy", fallback: "Not available" })
 */
export const formatDate = (
  date: string | Date | undefined | null,
  options: DateFormatOptions | DateFormatPattern = { format: 'PPpp' }
): string => {
  if (!date) {
    return typeof options === 'string' ? '-' : options.fallback || '-';
  }

  const dateObj = date instanceof Date ? date : new Date(date);

  // Handle invalid dates
  if (isNaN(dateObj.getTime())) {
    return typeof options === 'string' ? '-' : options.fallback || '-';
  }

  if (typeof options === 'string') {
    return format(dateObj, options);
  }

  const { format: formatPattern = 'PPpp', locale } = options;

  return locale
    ? format(dateObj, formatPattern, { locale })
    : format(dateObj, formatPattern);
};

export const copyItem = (
  item: string,
  options?: {
    label?: string;
    onSuccess?: () => void;
    onError?: (error: unknown) => void;
  }
) => {
  if (!navigator.clipboard) {
    const error = new Error('Clipboard not supported');
    toast.error('Clipboard not supported');
    options?.onError?.(error);
    return;
  }

  if (!item) {
    const error = new Error('Nothing to copy');
    toast.error('Nothing to copy');
    options?.onError?.(error);
    return;
  }

  navigator.clipboard
    .writeText(item)
    .then(() => {
      const label = options?.label || item;
      toast.success(`${label} copied to clipboard`);
      options?.onSuccess?.();
    })
    .catch((error) => {
      toast.error('Failed to copy to clipboard');
      options?.onError?.(error);
    });
};

/**
 * Formats a date string to a human-readable format with type safety.
 * @param date - The date string to format.
 * @param options - Formatting options or a format string.
 * @returns The formatted date string.
 * @example
 * // Using default format
 * formatDate("2025-03-23")
 *
 * // Using a custom format string
 * formatDate("2025-03-23", "yyyy-MM-dd")
 *
 * // Using formatting options
 * formatDate("2025-03-23", { format: "MMMM do, yyyy", fallback: "Not available" })
 */
export const formatDateWithFallback = (
  date: string | Date | undefined | null,
  options: DateFormatOptions | DateFormatPattern = { format: 'PPpp' }
): string => {
  if (!date) {
    return typeof options === 'string' ? '-' : options.fallback || '-';
  }

  const dateObj = date instanceof Date ? date : new Date(date);

  // Handle invalid dates
  if (isNaN(dateObj.getTime())) {
    return typeof options === 'string' ? '-' : options.fallback || '-';
  }

  if (typeof options === 'string') {
    return format(dateObj, options);
  }

  const { format: formatPattern = 'PPpp', locale } = options;

  return locale
    ? format(dateObj, formatPattern, { locale })
    : format(dateObj, formatPattern);
};

export const formatDateWithLocale = (
  date: string | Date | undefined | null,
  options: DateFormatOptions | DateFormatPattern = { format: 'PPpp' }
): string => {
  if (!date) {
    return typeof options === 'string' ? '-' : options.fallback || '-';
  }

  const dateObj = date instanceof Date ? date : new Date(date);

  // Handle invalid dates
  if (isNaN(dateObj.getTime())) {
    return typeof options === 'string' ? '-' : options.fallback || '-';
  }

  if (typeof options === 'string') {
    return format(dateObj, options);
  }

  const { format: formatPattern = 'PPpp', locale } = options;

  return locale
    ? format(dateObj, formatPattern, { locale })
    : format(dateObj, formatPattern);
};

/**
 * Formats a date string to a human-readable format with type safety.
 * @param date - The date string to format.
 * @param options - Formatting options or a format string.
 * @returns The formatted date string.
 * @example
 * // Using default format
 * formatDate("2025-03-23")
 *
 * // Using a custom format string
 * formatDate("2025-03-23", "yyyy-MM-dd")
 *
 * // Using formatting options
 * formatDate("2025-03-23", { format: "MMMM do, yyyy", fallback: "Not available" })
 */
export const formatDateWithLocaleAndFallback = (
  date: string | Date | undefined | null,
  options: DateFormatOptions | DateFormatPattern = { format: 'PPpp' }
): string => {
  if (!date) {
    return typeof options === 'string' ? '-' : options.fallback || '-';
  }

  const dateObj = date instanceof Date ? date : new Date(date);

  // Handle invalid dates
  if (isNaN(dateObj.getTime())) {
    return typeof options === 'string' ? '-' : options.fallback || '-';
  }

  if (typeof options === 'string') {
    return format(dateObj, options);
  }

  const { format: formatPattern = 'PPpp', locale } = options;

  return locale
    ? format(dateObj, formatPattern, { locale })
    : format(dateObj, formatPattern);
};

/**
 * Generates a full name from first and last names.
 * @param firstName - The first name.
 * @param lastName - The last name.
 * @returns The full name or "User" if both names are empty.
 */
export const getFullName = (
  firstName: string | null | undefined,
  lastName: string | null | undefined
): string => {
  return `${firstName || ''} ${lastName || ''}`.trim() || 'User';
};

/**
 * Generates initials for a user based on their first and last names.
 * @param firstName - The first name.
 * @param lastName - The last name.
 * @param email - The email address.
 * @returns The initials or "U" if both names are empty.
 */
export const getInitials = (
  firstName: string,
  lastName: string,
  email: string
): string => {
  if (firstName && lastName) {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  }
  if (firstName) {
    return firstName[0].toUpperCase();
  }
  if (email) {
    return email[0].toUpperCase();
  }
  return 'U';
};

export function calculateUserStats(users: IUserSchema[] | undefined) {
  if (!users || !Array.isArray(users)) {
    return {
      totalUsers: 0,
      activeUsers: 0,
      inactiveUsers: 0,
      activePercentage: '0.0',
      inactivePercentage: '0.0',
    };
  }

  const totalUsers = users.length;
  const activeUsers = users.filter(
    (user) => !user.banned_until && user.email_confirmed_at
  ).length;
  const inactiveUsers = totalUsers - activeUsers;

  return {
    totalUsers,
    activeUsers,
    inactiveUsers,
    activePercentage:
      totalUsers > 0 ? ((activeUsers / totalUsers) * 100).toFixed(1) : '0.0',
    inactivePercentage:
      totalUsers > 0 ? ((inactiveUsers / totalUsers) * 100).toFixed(1) : '0.0',
  };
}

/**
 * Generate route with query parameters
 * @param baseRoute - The base route path
 * @param params - Object containing query parameters
 * @returns Formatted route with query parameters
 */
export const createRoute = (
  baseRoute: string,
  params?: Record<string, string>
): string => {
  if (!params || Object.keys(params).length === 0) {
    return baseRoute;
  }

  const queryString = Object.entries(params)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join('&');

  return `${baseRoute}?${queryString}`;
};

// Format date helper function
function formatDateV2(date: Date, formatStr: string): string {
  const pad = (num: number) => String(num).padStart(2, '0');

  return formatStr
    .replace('yyyy', String(date.getFullYear()))
    .replace('MM', pad(date.getMonth() + 1))
    .replace('dd', pad(date.getDate()))
    .replace('HH', pad(date.getHours()))
    .replace('mm', pad(date.getMinutes()))
    .replace('ss', pad(date.getSeconds()));
}

// /**
//  * Universal Custom ID Generator
//  * Creates structured, readable IDs for any system or entity
//  *
//  * @param {Object} options - Configuration options
//  * @param {string} options.prefix - Primary identifier prefix (e.g., "CRIME", "USER", "INVOICE")
//  * @param {Object} options.segments - Collection of ID segments to include
//  * @param {string[]} options.segments.codes - Array of short codes (e.g., region codes, department codes)
//  * @param {number} options.segments.year - Year to include in the ID
//  * @param {number} options.segments.sequentialDigits - Number of digits for sequential number
//  * @param {boolean} options.segments.includeDate - Whether to include current date
//  * @param {string} options.segments.dateFormat - Format for date (e.g., "yyyy-MM-dd", "dd/MM/yyyy")
//  * @param {boolean} options.segments.includeTime - Whether to include timestamp
//  * @param {string} options.format - Custom format string for ID structure
//  * @param {string} options.separator - Character to separate ID components
//  * @param {boolean} options.upperCase - Convert result to uppercase
//  * @returns {string} - Generated custom ID
//  */
// export function generateId(
//   options: {
//     prefix?: string;
//     segments?: {
//       codes?: string[];
//       year?: number | boolean; // Year diubah menjadi number | boolean
//       sequentialDigits?: number;
//       includeDate?: boolean;
//       dateFormat?: string;
//       includeTime?: boolean;
//       includeMilliseconds?: boolean;
//     };
//     format?: string | null;
//     separator?: string;
//     upperCase?: boolean;
//     randomSequence?: boolean;
//     uniquenessStrategy?: 'uuid' | 'timestamp' | 'counter' | 'hash';
//     retryOnCollision?: boolean;
//     maxRetries?: number;
//   } = {}
// ): string {
//   // Jika uniquenessStrategy tidak diatur dan randomSequence = false,
//   // gunakan counter sebagai strategi default
//   if (!options.uniquenessStrategy && options.randomSequence === false) {
//     options.uniquenessStrategy = 'counter';
//   }

//   const config = {
//     prefix: options.prefix || 'ID',
//     segments: {
//       codes: options.segments?.codes || [],
//       year: options.segments?.year, // Akan diproses secara kondisional nanti
//       sequentialDigits: options.segments?.sequentialDigits || 6,
//       includeDate: options.segments?.includeDate ?? false,
//       dateFormat: options.segments?.dateFormat || 'yyyyMMdd',
//       includeTime: options.segments?.includeTime ?? false,
//       includeMilliseconds: options.segments?.includeMilliseconds ?? false,
//     },
//     format: options.format || null,
//     separator: options.separator || '-',
//     upperCase: options.upperCase ?? false,
//     randomSequence: options.randomSequence ?? true,
//     uniquenessStrategy: options.uniquenessStrategy || 'timestamp',
//     retryOnCollision: options.retryOnCollision ?? true,
//     maxRetries: options.maxRetries || 10,
//   };

//   // Initialize global counter if not exists
//   if (typeof globalThis.__idCounter === 'undefined') {
//     globalThis.__idCounter = 0;
//   }

//   const now = new Date();

//   // Generate date string if needed
//   let dateString = '';
//   if (config.segments.includeDate) {
//     dateString = format(now, config.segments.dateFormat);
//   }

//   // Generate time string if needed
//   let timeString = '';
//   if (config.segments.includeTime) {
//     timeString = format(now, 'HHmmss');
//     if (config.segments.includeMilliseconds) {
//       timeString += now.getMilliseconds().toString().padStart(3, '0');
//     }
//   }

//   // Generate sequential number based on uniqueness strategy
//   let sequentialNum: string;
//   try {
//     switch (config.uniquenessStrategy) {
//       case 'uuid':
//         sequentialNum = uuidv4().split('-')[0];
//         break;
//       case 'timestamp':
//         sequentialNum = `${now.getTime()}${Math.floor(Math.random() * 1000)}`;
//         sequentialNum = sequentialNum.slice(-config.segments.sequentialDigits);
//         break;
//       case 'counter':
//         sequentialNum = (++globalThis.__idCounter)
//           .toString()
//           .padStart(config.segments.sequentialDigits, '0');
//         break;
//       case 'hash':
//         const hashSource = `${now.getTime()}-${JSON.stringify(options)}-${Math.random()}`;
//         const hash = crypto
//           .createHash('sha256')
//           .update(hashSource)
//           .digest('hex');
//         sequentialNum = hash.substring(0, config.segments.sequentialDigits);
//         break;
//       default:
//         if (config.randomSequence) {
//           const randomBytes = crypto.randomBytes(4);
//           const randomNum = parseInt(randomBytes.toString('hex'), 16);
//           sequentialNum = (
//             randomNum % Math.pow(10, config.segments.sequentialDigits)
//           )
//             .toString()
//             .padStart(config.segments.sequentialDigits, '0');
//         } else {
//           sequentialNum = (++globalThis.__idCounter)
//             .toString()
//             .padStart(config.segments.sequentialDigits, '0');
//         }
//     }
//   } catch (error) {
//     console.error('Error generating sequential number:', error);
//     // Fallback to timestamp strategy if other methods fail
//     sequentialNum = `${now.getTime()}`.slice(-config.segments.sequentialDigits);
//   }

//   // Determine if year should be included and what value to use
//   let yearValue = null;
//   if (config.segments.year !== undefined || config.segments.year != false) {
//     if (typeof config.segments.year === 'number') {
//       yearValue = String(config.segments.year);
//     } else if (config.segments.year === true) {
//       yearValue = format(now, 'yyyy');
//     }
//     // if year is false, yearValue remains null and won't be included
//   } else {
//     // Default behavior (backward compatibility)
//     yearValue = format(now, 'yyyy');
//   }

//   // Prepare components for ID assembly
//   const components = {
//     prefix: config.prefix,
//     codes:
//       config.segments.codes.length > 0
//         ? config.segments.codes.join(config.separator)
//         : '',
//     year: yearValue, // Added the year value to components
//     sequence: sequentialNum,
//     date: dateString,
//     time: timeString,
//   };

//   let result: string;

//   // Use custom format if provided
//   if (config.format) {
//     let customID = config.format;
//     for (const [key, value] of Object.entries(components)) {
//       if (value) {
//         const placeholder = `{${key}}`;
//         customID = customID.replace(
//           new RegExp(placeholder, 'g'),
//           String(value)
//         );
//       }
//     }
//     // Remove unused placeholders
//     customID = customID.replace(/{[^}]+}/g, '');

//     // Clean up separators
//     const escapedSeparator = config.separator.replace(
//       /[-\/\\^$*+?.()|[\]{}]/g,
//       '\\$&'
//     );
//     const separatorRegex = new RegExp(`${escapedSeparator}+`, 'g');
//     customID = customID.replace(separatorRegex, config.separator);
//     customID = customID.replace(
//       new RegExp(`^${escapedSeparator}|${escapedSeparator}$`, 'g'),
//       ''
//     );

//     result = config.upperCase ? customID.toUpperCase() : customID;
//   } else {
//     // Assemble ID from parts
//     const parts = [];
//     if (components.prefix) parts.push(components.prefix);
//     if (components.codes) parts.push(components.codes);
//     if (components.year) parts.push(components.year);
//     if (components.date) parts.push(components.date);
//     if (components.time) parts.push(components.time);
//     if (components.sequence) parts.push(components.sequence);

//     result = parts.join(config.separator);
//     if (config.upperCase) result = result.toUpperCase();
//   }

//   // Handle collisions if required
//   if (config.retryOnCollision) {
//     let retryCount = 0;
//     let originalResult = result;

//     while (usedIdRegistry.has(result) && retryCount < config.maxRetries) {
//       retryCount++;
//       try {
//         const suffix = crypto.randomBytes(2).toString('hex');
//         result = `${originalResult}${config.separator}${suffix}`;
//       } catch (error) {
//         console.error('Error generating collision suffix:', error);
//         // Simple fallback if crypto fails
//         result = `${originalResult}${config.separator}${Date.now().toString(36)}`;
//       }
//     }

//     if (retryCount >= config.maxRetries) {
//       console.warn(
//         `Warning: Max ID generation retries (${config.maxRetries}) reached for prefix ${config.prefix}`
//       );
//     }
//   }

//   // Register the ID and maintain registry size
//   usedIdRegistry.add(result);
//   if (usedIdRegistry.size > 10000) {
//     const entriesToKeep = Array.from(usedIdRegistry).slice(-5000);
//     usedIdRegistry.clear();
//     entriesToKeep.forEach((id) => usedIdRegistry.add(id));
//   }

//   return result.trim();
// }

/**
 * Gets the last ID from a specified table and column.
 * @param tableName - The name of the table to query.
 * @param columnName - The column containing the IDs.
 * @returns The last ID as a string, or null if no records exist.
 */
export async function getLastId(
  tableName: string,
  columnName: string
): Promise<string | null> {
  try {
    const result = await db.$queryRawUnsafe(
      `SELECT ${columnName} FROM ${tableName} ORDER BY ${columnName} DESC LIMIT 1`
    );

    if (Array.isArray(result) && result.length > 0) {
      return result[0][columnName];
    }
  } catch (error) {
    console.error('Error fetching last ID:', error);
  }

  return null;
}

/**
 * Generates a unique code based on the provided name.
 * @param name - The name to generate the code from.
 * @returns The generated code.
 */
export function generateCode(name: string): string {
  const words = name.toUpperCase().split(' ');
  let code = '';

  if (name.length <= 3) {
    code = name.toUpperCase();
  } else if (words.length > 1) {
    code = words
      .map((w) => w[0])
      .join('')
      .padEnd(3, 'X')
      .slice(0, 3);
  } else {
    const nameClean = name.replace(/[aeiou]/gi, '');
    code = (nameClean.slice(0, 3) || name.slice(0, 3)).toUpperCase();
  }

  return code;
}

/**
 * Generates a unique sequential ID based on a base string and existing codes.
 * @param base - The base string to generate the ID from.
 * @param existingCodes - A set of existing codes to check against.
 * @returns The generated unique sequential ID.
 */
export function getLatestSequentialId(
  base: string,
  existingCodes: Set<string>
): string {
  let attempt = 1;
  let newCode = base;

  while (existingCodes.has(newCode)) {
    newCode = base.slice(0, 2) + attempt;
    attempt++;
  }
  return newCode;
}

/**
 * Get color and text for a crime rate level
 */
export function getCrimeRateInfo(
  rate?: 'low' | 'medium' | 'high' | 'critical'
) {
  switch (rate) {
    case 'low':
      return { color: 'bg-green-100 text-green-800', text: 'Low' };
    case 'medium':
      return { color: 'bg-yellow-100 text-yellow-800', text: 'Medium' };
    case 'high':
      return { color: 'bg-orange-100 text-orange-800', text: 'High' };
    case 'critical':
      return { color: 'bg-red-100 text-red-800', text: 'Critical' };
    default:
      return { color: 'bg-gray-100 text-gray-800', text: 'Unknown' };
  }
}

/**
 * Get month name from month number (1-12)
 */
export function getMonthName(month: string | number): string {
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const monthNum = parseInt(month.toString());
  if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
    return 'Invalid Month';
  }

  return months[monthNum - 1];
}

/**
 * Format a date into a readable string
 */
export function formatDateString(date: Date | string): string {
  if (!date) return 'Unknown Date';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// Helper function to get district name from district ID
export const getDistrictName = (districtId: string): string => {
  const feature = districtsGeoJson.features.find(
    (f) => f.properties?.kode_kec === districtId
  );
  return (
    feature?.properties?.nama ||
    feature?.properties?.kecamatan ||
    'Unknown District'
  );
};

/**
 * Format number with commas or abbreviate large numbers
 */
export function formatNumber(num?: number): string {
  if (num === undefined || num === null) return 'N/A';

  // If number is in the thousands, abbreviate
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1) + 'M';
  }

  if (num >= 1_000) {
    return (num / 1_000).toFixed(1) + 'K';
  }

  // Otherwise, format with commas
  return num.toLocaleString();
}

export function getIncidentSeverity(
  incident: any
): 'Low' | 'Medium' | 'High' | 'Critical' {
  if (!incident) return 'Low';

  const category = incident.category || 'Unknown';

  const highSeverityCategories = [
    'Pembunuhan',
    'Perkosaan',
    'Penculikan',
    'Lahgun Senpi/Handak/Sajam',
    'PTPPO',
    'Trafficking In Person',
  ];

  const mediumSeverityCategories = [
    'Penganiayaan Berat',
    'Penganiayaan Ringan',
    'Pencurian Biasa',
    'Curat',
    'Curas',
    'Curanmor',
    'Pengeroyokan',
    'PKDRT',
    'Penggelapan',
    'Pengrusakan',
  ];

  if (highSeverityCategories.includes(category)) return 'High';
  if (mediumSeverityCategories.includes(category)) return 'Medium';

  if (incident.type === 'Pidana Tertentu') return 'Medium';
  return 'Low';
}

export function formatMonthKey(monthKey: string): string {
  const [year, month] = monthKey.split('-').map(Number);
  return `${getMonthName(month)} ${year}`;
}

export function getTimeAgo(timestamp: string | Date) {
  const now = new Date();
  const eventTime = new Date(timestamp);
  const diffMs = now.getTime() - eventTime.getTime();

  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffMins > 0) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  return 'just now';
}

/**
 * Helper function to extract numeric counter from an ID string
 * @param id The ID to extract counter from
 * @param pattern The pattern to identify the counter portion
 * @returns The numeric counter value
 */
function extractCounterFromId(id: string, pattern: RegExp): number {
  const match = id.match(pattern);
  if (match && match[1]) {
    return parseInt(match[1], 10);
  }
  return 0;
}

/**
 * Get the appropriate regex pattern based on table name and ID format
 * @param tableName Database table name
 * @param sampleId Optional sample ID to determine format
 */
function getCounterPatternForTable(tableName: string, sampleId?: string): RegExp {
  // Common patterns based on table name
  switch (tableName.toLowerCase()) {
    case 'crimes':
      // Handles both CR-3509-0001-2020 and CR-3509-2025 formats
      return /-(\d{4})-\d{4}$|(?<=-)\d{4}$/;

    case 'crime_incidents':
      // Handles CI-3509-0001-2025 format
      return /-(\d{4})-\d{4}$/;

    case 'evidence':
      // Handles EV-0001 format
      return /-(\d{4})$/;

    case 'crime_categories':
      // Handles CC-0010 format
      return /-(\d+)$/;

    case 'units':
      // Handles UT-0001 format
      return /-(\d+)$/;

    default:
      // If specific pattern can't be determined, use a general one
      if (sampleId) {
        // Try to infer pattern from sample ID
        if (sampleId.includes('-')) {
          const parts = sampleId.split('-');
          // If format looks like XX-####-####-####
          if (parts.length >= 3 && parts[2].length === 4 && /^\d+$/.test(parts[2])) {
            return new RegExp(`-([${parts[2].length}])(?:-|$)`);
          }
          // If format looks like XX-####
          if (parts.length >= 2 && /^\d+$/.test(parts[1])) {
            return /-(\d+)$/;
          }
        }
      }

      // Default pattern that works for most formats: extract numbers after last hyphen
      return /-(\d+)(?:-\d+)*$/;
  }
}

/**
 * Retrieves the last ID from a specific table and extracts its counter
 * @param tableName The table to query
 * @param counterPattern RegExp pattern to extract counter (with capture group)
 * @param idField Field containing the ID (usually 'id')
 * @returns The last used counter number
 */
export async function getLastIdCounter(
  tableName: string,
  counterPattern?: RegExp,
  idField: string = 'id'
): Promise<number> {
  try {
    // Query to get all IDs from the table
    const result = await db.$queryRawUnsafe(
      `SELECT "${idField}" FROM "${tableName}" ORDER BY "${idField}" DESC LIMIT 10`
    );

    // Process results - try to find the highest counter value from the IDs
    if (result && Array.isArray(result) && result.length > 0) {
      let maxCounter = 0;

      // If no pattern provided, determine appropriate pattern based on table
      const patternToUse = counterPattern || getCounterPatternForTable(tableName, result[0]?.[idField]);

      console.log(`[getLastIdCounter] Using pattern ${patternToUse} for table ${tableName}`);

      // Examine each ID to find the highest counter
      for (const row of result) {
        const id = row[idField];
        if (id && typeof id === 'string') {
          let counter = 0;

          // Try pattern match first with our table-specific pattern
          const match = id.match(patternToUse);
          if (match && match[1]) {
            counter = parseInt(match[1], 10);
            console.log(`[getLastIdCounter] Extracted counter ${counter} from ID ${id} using regex pattern`);
          } else {
            // Special case handling for different ID formats
            if (tableName.toLowerCase() === 'crimes' && id.match(/CR-\d+-\d+$/)) {
              // Handle CR-3509-2025 format (where the number after last hyphen is a year)
              const parts = id.split('-');
              if (parts.length === 3) {
                // For this format, use the year as counter
                counter = parseInt(parts[2], 10);
                console.log(`[getLastIdCounter] Extracted year counter ${counter} from ID ${id}`);
              }
            }
            else if (tableName.toLowerCase() === 'crimes' && id.match(/CR-\d+-\d+-\d+$/)) {
              // Handle CR-3509-0001-2020 format
              const parts = id.split('-');
              if (parts.length === 4) {
                counter = parseInt(parts[2], 10);
                console.log(`[getLastIdCounter] Extracted counter ${counter} from ID ${id} (4-part format)`);
              }
            }
            else {
              // Fallback: try to find any sequence of digits that looks like a counter
              const digitGroups = id.match(/\d+/g);
              if (digitGroups) {
                // Look for sequences with leading zeros (likely counters)
                const leadingZeros = digitGroups.filter(g => g.startsWith('0') && g.length > 1);

                if (leadingZeros.length > 0) {
                  // Take the first sequence with leading zeros
                  counter = parseInt(leadingZeros[0], 10);
                  console.log(`[getLastIdCounter] Found counter with leading zeros: ${counter} in ID ${id}`);
                } else {
                  // If no leading zeros, take the last numeric sequence
                  // For IDs like UT-0001, CC-0008, etc.
                  const lastGroup = digitGroups[digitGroups.length - 1];
                  counter = parseInt(lastGroup, 10);
                  console.log(`[getLastIdCounter] Using last numeric group: ${counter} from ID ${id}`);
                }
              }
            }
          }

          maxCounter = Math.max(maxCounter, counter);
        }
      }

      console.log(`[getLastIdCounter] Final max counter for ${tableName}: ${maxCounter}`);
      return maxCounter;
    }

    console.log(`[getLastIdCounter] No records found in ${tableName}, returning 0`);
    return 0; // No records found, start from 0
  } catch (error) {
    console.error(`Error fetching last ID counter from ${tableName}:`, error);
    return 0; // Return 0 on error (will start new sequence)
  }
}

/**
 * Generate an ID with counter continuation from database with robust duplication prevention
 * @param tableName Prisma table name to check for last ID
 * @param options ID generation options
 * @param counterPattern Optional RegExp pattern to extract counter
 * @returns Generated ID string
 */
export async function generateIdWithDbCounter(
  tableName: string,
  options: {
    prefix?: string;
    segments?: {
      codes?: string[];
      year?: number | boolean;
      sequentialDigits?: number;
      includeDate?: boolean;
      dateFormat?: string;
      includeTime?: boolean;
      includeMilliseconds?: boolean;
    };
    format?: string | null;
    separator?: string;
    upperCase?: boolean;
    uniquenessStrategy?: 'counter';
    retryOnCollision?: boolean;
    maxRetries?: number;
    useUuid?: boolean;
    uuidFormat?: 'standard' | 'short' | 'prefix-short' | 'no-dashes';
    uuidLength?: number;
    idField?: string; // Field to specify which column contains the IDs
  } = {}
): Promise<string> {
  // UUID generation handling remains unchanged
  if (options.useUuid) {
    const uuid = crypto.randomUUID();

    // Format the UUID based on the specified format
    switch (options.uuidFormat) {
      case 'standard':
        return uuid; // Standard UUID: 36 chars with dashes

      case 'short':
        // Return a shorter version of the UUID with specified length or 12 chars by default
        return uuid.replace(/-/g, '').substring(0, options.uuidLength || 12);

      case 'prefix-short':
        // Prefix + shortened UUID (useful for readable but unique IDs)
        const shortId = uuid.replace(/-/g, '').substring(0, options.uuidLength || 8);
        const prefix = options.prefix || tableName.substring(0, 2).toUpperCase();
        return `${prefix}-${shortId}`;

      case 'no-dashes':
        // UUID without dashes: 32 chars
        return uuid.replace(/-/g, '');

      default:
        return uuid;
    }
  }

  // Get table-specific pattern if none provided
  const counterPattern = getCounterPatternForTable(tableName);

  // Get the last counter from the database
  const lastCounter = await getLastIdCounter(
    tableName,
    counterPattern,
    options.idField || (tableName === 'units' ? 'code_unit' : 'id')
  );
  
  // Configure ID generation options to use the counter strategy with the last counter + 1
  const idOptions = {
    ...options,
    uniquenessStrategy: 'counter' as const,
    randomSequence: false
  };
  
  // Update global counter to start from the last DB counter
  globalThis.__idCounter = Math.max(globalThis.__idCounter || 0, lastCounter);
  
  // Generate the ID using the standard function
  return generateId(idOptions);
}

export function generateId(
  options: {
    prefix?: string;
    segments?: {
      codes?: string[];
      year?: number | boolean;
      sequentialDigits?: number;
      includeDate?: boolean;
      dateFormat?: string;
      includeTime?: boolean;
      includeMilliseconds?: boolean;
    };
    format?: string | null;
    separator?: string;
    upperCase?: boolean;
    randomSequence?: boolean;
    uniquenessStrategy?: 'uuid' | 'timestamp' | 'counter' | 'hash';
    retryOnCollision?: boolean;
    maxRetries?: number;
  } = {}
): string {
  // Jika uniquenessStrategy tidak diatur dan randomSequence = false,
  // gunakan counter sebagai strategi default
  if (!options.uniquenessStrategy && options.randomSequence === false) {
    options.uniquenessStrategy = 'counter';
  }

  const config = {
    prefix: options.prefix || 'ID',
    segments: {
      codes: options.segments?.codes || [],
      year: options.segments?.year, // Akan diproses secara kondisional nanti
      sequentialDigits: options.segments?.sequentialDigits || 6,
      includeDate: options.segments?.includeDate ?? false,
      dateFormat: options.segments?.dateFormat || 'yyyyMMdd',
      includeTime: options.segments?.includeTime ?? false,
      includeMilliseconds: options.segments?.includeMilliseconds ?? false,
    },
    format: options.format || null,
    separator: options.separator || '-',
    upperCase: options.upperCase ?? false,
    randomSequence: options.randomSequence ?? true,
    uniquenessStrategy: options.uniquenessStrategy || 'timestamp',
    retryOnCollision: options.retryOnCollision ?? true,
    maxRetries: options.maxRetries || 10,
  };

  // Initialize global counter if not exists
  if (typeof globalThis.__idCounter === 'undefined') {
    globalThis.__idCounter = 0;
  }

  const now = new Date();

  // Generate date string if needed
  let dateString = '';
  if (config.segments.includeDate) {
    dateString = format(now, config.segments.dateFormat);
  }

  // Generate time string if needed
  let timeString = '';
  if (config.segments.includeTime) {
    timeString = format(now, 'HHmmss');
    if (config.segments.includeMilliseconds) {
      timeString += now.getMilliseconds().toString().padStart(3, '0');
    }
  }

  // Generate sequential number based on uniqueness strategy
  let sequentialNum: string;
  try {
    switch (config.uniquenessStrategy) {
      case 'uuid':
        sequentialNum = crypto.randomUUID().split('-')[0];
        break;
      case 'timestamp':
        sequentialNum = `${now.getTime()}${Math.floor(Math.random() * 1000)}`;
        sequentialNum = sequentialNum.slice(-config.segments.sequentialDigits);
        break;
      case 'counter':
        sequentialNum = (++globalThis.__idCounter)
          .toString()
          .padStart(config.segments.sequentialDigits, '0');
        break;
      case 'hash':
        const hashSource = `${now.getTime()}-${JSON.stringify(options)}-${Math.random()}`;
        const hash = crypto
          .createHash('sha256')
          .update(hashSource)
          .digest('hex');
        sequentialNum = hash.substring(0, config.segments.sequentialDigits);
        break;
      default:
        if (config.randomSequence) {
          const randomBytes = crypto.randomBytes(4);
          const randomNum = parseInt(randomBytes.toString('hex'), 16);
          sequentialNum = (
            randomNum % Math.pow(10, config.segments.sequentialDigits)
          )
            .toString()
            .padStart(config.segments.sequentialDigits, '0');
        } else {
          sequentialNum = (++globalThis.__idCounter)
            .toString()
            .padStart(config.segments.sequentialDigits, '0');
        }
    }
  } catch (error) {
    console.error('Error generating sequential number:', error);
    // Fallback to timestamp strategy if other methods fail
    sequentialNum = `${now.getTime()}`.slice(-config.segments.sequentialDigits);
  }

  // Determine if year should be included and what value to use
  let yearValue = null;
  if (config.segments.year !== undefined && config.segments.year !== false) {
    if (typeof config.segments.year === 'number') {
      yearValue = String(config.segments.year);
    } else if (config.segments.year === true) {
      yearValue = format(now, 'yyyy');
    }
    // if year is false, yearValue remains null and won't be included
  } else {
    // Default behavior (backward compatibility)
    yearValue = format(now, 'yyyy');
  }

  // Prepare components for ID assembly
  const components = {
    prefix: config.prefix,
    codes:
      config.segments.codes.length > 0
        ? config.segments.codes.join(config.separator)
        : '',
    year: yearValue, // Added the year value to components
    sequence: sequentialNum,
    date: dateString,
    time: timeString,
  };

  let result: string;

  // Use custom format if provided
  if (config.format) {
    let customID = config.format;
    for (const [key, value] of Object.entries(components)) {
      if (value) {
        const placeholder = `{${key}}`;
        customID = customID.replace(
          new RegExp(placeholder, 'g'),
          String(value)
        );
      }
    }
    // Remove unused placeholders
    customID = customID.replace(/{[^}]+}/g, '');

    // Clean up separators
    const escapedSeparator = config.separator.replace(
      /[-\/\\^$*+?.()|[\]{}]/g,
      '\\$&'
    );
    const separatorRegex = new RegExp(`${escapedSeparator}+`, 'g');
    customID = customID.replace(separatorRegex, config.separator);
    customID = customID.replace(
      new RegExp(`^${escapedSeparator}|${escapedSeparator}$`, 'g'),
      ''
    );

    result = config.upperCase ? customID.toUpperCase() : customID;
  } else {
    // Assemble ID from parts
    const parts = [];
    if (components.prefix) parts.push(components.prefix);
    if (components.codes) parts.push(components.codes);
    if (components.year) parts.push(components.year);
    if (components.date) parts.push(components.date);
    if (components.time) parts.push(components.time);
    if (components.sequence) parts.push(components.sequence);

    result = parts.join(config.separator);
    if (config.upperCase) result = result.toUpperCase();
  }

  // Handle collisions if required
  if (config.retryOnCollision) {
    let retryCount = 0;
    let originalResult = result;

    while (usedIdRegistry.has(result) && retryCount < config.maxRetries) {
      retryCount++;
      try {
        const suffix = crypto.randomBytes(2).toString('hex');
        result = `${originalResult}${config.separator}${suffix}`;
      } catch (error) {
        console.error('Error generating collision suffix:', error);
        // Simple fallback if crypto fails
        result = `${originalResult}${config.separator}${Date.now().toString(36)}`;
      }
    }

    if (retryCount >= config.maxRetries) {
      console.warn(
        `Warning: Max ID generation retries (${config.maxRetries}) reached for prefix ${config.prefix}`
      );
    }
  }

  // Register the ID and maintain registry size
  usedIdRegistry.add(result);
  if (usedIdRegistry.size > 10000) {
    const entriesToKeep = Array.from(usedIdRegistry).slice(-5000);
    usedIdRegistry.clear();
    entriesToKeep.forEach((id) => usedIdRegistry.add(id));
  }

  return result.trim();
}

