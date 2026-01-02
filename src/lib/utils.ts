import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

/**
 * Formats a key (camelCase, snake_case or dotted) into a human-readable label.
 * Example: "pesoBruto" -> "Peso Bruto", "remitente.nombre" -> "Remitente Nombre"
 */
export function formatLabel(key: string): string {
    if (!key) return "";

    return key
        // Handle dots and underscores as spaces
        .replace(/[._]/g, ' ')
        // Add spaces before capital letters (camelCase)
        .replace(/([A-Z])/g, ' $1')
        // Trim and clean spaces
        .trim()
        .split(/\s+/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}
