/**
 * Validation utilities for common form fields
 */

export const calculateAge = (dob: Date | string): number => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
};

export const isValidAge = (dob: Date | string, minAge: number = 4, maxAge: number = 120): boolean => {
    const age = calculateAge(dob);
    return age >= minAge && age <= maxAge;
};

export const getAgeValidationError = (dob: string, minAge: number = 4, maxAge: number = 120): string | null => {
    if (!dob) return null;
    
    try {
        const age = calculateAge(dob);
        if (age < minAge) {
            return `Age must be at least ${minAge} years`;
        }
        if (age > maxAge) {
            return `Age must not exceed ${maxAge} years`;
        }
        return null;
    } catch {
        return "Invalid date of birth";
    }
};

export const getMaxDate = (minAge: number = 4): string => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - minAge);
    return date.toISOString().split('T')[0];
};

export const getMinDate = (maxAge: number = 120): string => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - maxAge);
    return date.toISOString().split('T')[0];
};

/**
 * Convert dd/mm/yyyy format to yyyy-mm-dd format
 */
export const convertDdMmYyyyToDate = (dateStr: string): string => {
    if (!dateStr) return "";
    const [dd, mm, yyyy] = dateStr.split('/');
    if (!dd || !mm || !yyyy) return "";
    return `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;
};

/**
 * Convert yyyy-mm-dd format to dd/mm/yyyy format
 */
export const convertDateToDdMmYyyy = (dateStr: string): string => {
    if (!dateStr) return "";
    const [yyyy, mm, dd] = dateStr.split('-');
    if (!yyyy || !mm || !dd) return "";
    return `${dd}/${mm}/${yyyy}`;
};

/**
 * Validate dd/mm/yyyy format
 */
export const validateDdMmYyyyFormat = (dateStr: string): boolean => {
    if (!dateStr) return false;
    const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    const match = dateStr.match(regex);
    if (!match) return false;
    
    const [, dd, mm, yyyy] = match;
    const day = parseInt(dd, 10);
    const month = parseInt(mm, 10);
    
    if (month < 1 || month > 12) return false;
    if (day < 1 || day > 31) return false;
    
    return true;
};
