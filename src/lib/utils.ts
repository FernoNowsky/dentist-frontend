import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"


export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function getBirthDateFromPesel(pesel: string): string | null {
    if (!/^\d{11}$/.test(pesel)) return null;

    const yearPart = parseInt(pesel.substring(0, 2), 10);
    const monthPart = parseInt(pesel.substring(2, 4), 10);
    const dayPart = parseInt(pesel.substring(4, 6), 10);

    let year = 1900 + yearPart;
    let month = monthPart;

    if (monthPart >= 81 && monthPart <= 92) {
        year = 1800 + yearPart;
        month = monthPart - 80;
    } else if (monthPart >= 1 && monthPart <= 12) {
        year = 1900 + yearPart;
    } else if (monthPart >= 21 && monthPart <= 32) {
        year = 2000 + yearPart;
        month = monthPart - 20;
    } else if (monthPart >= 41 && monthPart <= 52) {
        year = 2100 + yearPart;
        month = monthPart - 40;
    } else if (monthPart >= 61 && monthPart <= 72) {
        year = 2200 + yearPart;
        month = monthPart - 60;
    } else {
        return null;
    }

    const monthStr = month.toString().padStart(2, '0');
    const dayStr = dayPart.toString().padStart(2, '0');

    const date = new Date(`${year}-${monthStr}-${dayStr}`);
    if (isNaN(date.getTime())) return null;

    return `${year}-${monthStr}-${dayStr}`;
}

export function getGenderFromPesel(pesel: string): "Mężczyzna" | "Kobieta" | null {
    if (!/^\d{11}$/.test(pesel)) return null;

    const genderDigit = parseInt(pesel.substring(9, 10), 10);
    return genderDigit % 2 === 0 ? "Kobieta" : "Mężczyzna";
}
