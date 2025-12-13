/**
 * Phone Number Utilities
 * Handles phone number normalization, validation, and formatting
 * Default country: Bahrain (+973)
 */

/**
 * Extracts only digits from a phone number
 * @param phone - Phone number in any format
 * @returns String containing only digits
 */
export const extractPhoneDigits = (phone: string): string => {
    return phone.replace(/\D/g, '');
};

/**
 * Normalizes a phone number to a consistent format (digits only, no country code)
 * Examples:
 *   "+97335140480" -> "35140480"
 *   "973 3514 0480" -> "35140480"
 *   "35140480" -> "35140480"
 *   "+973 3514 0480" -> "35140480"
 * 
 * @param phone - Phone number in any format
 * @param defaultCountryCode - Country code to strip (default: '973' for Bahrain)
 * @returns Normalized phone number (digits only, no country code)
 */
export const normalizePhoneNumber = (
    phone: string,
    defaultCountryCode: string = '973'
): string => {
    if (!phone) {
        throw new Error('Phone number is required');
    }

    // Extract only digits
    let digits = extractPhoneDigits(phone);

    // Remove country code if present
    if (digits.startsWith(defaultCountryCode)) {
        digits = digits.substring(defaultCountryCode.length);
    }

    return digits;
};

/**
 * Validates a Bahrain phone number
 * Bahrain phone numbers are 8 digits (after country code)
 * 
 * @param phone - Phone number to validate
 * @returns true if valid, false otherwise
 */
export const validatePhoneNumber = (phone: string): boolean => {
    try {
        const normalized = normalizePhoneNumber(phone);

        // Bahrain phone numbers should be 8 digits
        if (normalized.length !== 8) {
            return false;
        }

        // Should start with 3 (mobile numbers)
        // Note: Landlines can start with other digits, but most users will be mobile
        // You can adjust this validation based on your requirements
        return /^[0-9]{8}$/.test(normalized);
    } catch {
        return false;
    }
};

/**
 * Formats phone number for display purposes
 * @param phone - Phone number to format
 * @param includeCountryCode - Whether to include country code (default: true)
 * @returns Formatted phone number (e.g., "+973 3514 0480")
 */
export const formatPhoneForDisplay = (
    phone: string,
    includeCountryCode: boolean = true
): string => {
    try {
        const normalized = normalizePhoneNumber(phone);

        if (!validatePhoneNumber(phone)) {
            return phone; // Return original if invalid
        }

        // Format as: +973 3514 0480
        const formatted = `${normalized.slice(0, 4)} ${normalized.slice(4)}`;

        return includeCountryCode ? `+973 ${formatted}` : formatted;
    } catch {
        return phone; // Return original if error
    }
};

/**
 * Adds country code to a phone number
 * @param phone - Phone number
 * @param countryCode - Country code (default: '+973')
 * @returns Phone number with country code
 */
export const addCountryCode = (
    phone: string,
    countryCode: string = '+973'
): string => {
    const normalized = normalizePhoneNumber(phone);
    const code = countryCode.startsWith('+') ? countryCode : `+${countryCode}`;
    return `${code}${normalized}`;
};

/**
 * Checks if two phone numbers are equivalent (same number, different formats)
 * @param phone1 - First phone number
 * @param phone2 - Second phone number
 * @returns true if phones are equivalent
 */
export const arePhoneNumbersEquivalent = (
    phone1: string,
    phone2: string
): boolean => {
    try {
        const normalized1 = normalizePhoneNumber(phone1);
        const normalized2 = normalizePhoneNumber(phone2);
        return normalized1 === normalized2;
    } catch {
        return false;
    }
};
