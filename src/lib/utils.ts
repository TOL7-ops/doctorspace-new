import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Safe logging utility that only works on the client side
export const safeLog = {
  error: (...args: unknown[]) => {
    if (typeof window !== 'undefined') {
      console.error(...args);
    }
  },
  log: (...args: unknown[]) => {
    if (typeof window !== 'undefined') {
      console.log(...args);
    }
  },
  warn: (...args: unknown[]) => {
    if (typeof window !== 'undefined') {
      console.warn(...args);
    }
  }
};

// Check if we're on the client side
export const isClient = typeof window !== 'undefined'; 