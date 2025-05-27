import { CTexts } from "./const/texts";
import { CRegex } from "./const/regex";

/**
 * Validates if a given phone number starts with any of the predefined prefixes.
 *
 * @param number - The phone number to validate.
 * @returns A boolean indicating whether the phone number starts with a valid prefix.
 */
export const phonePrefixValidation = (number: string) => CTexts.PHONE_PREFIX.some(prefix => number.startsWith(prefix));


/**
 * Validates if a given phone number matches the predefined regex pattern.
 *  
 * @param number - The phone number to validate.
 * @returns A boolean indicating whether the phone number matches the regex pattern.
 */
export const phoneRegexValidation = (number: string) => CRegex.PHONE_REGEX.test(number);