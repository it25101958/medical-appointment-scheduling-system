import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getErrorMessage(error: unknown, fallback = "Something went wrong") {
  if (error instanceof Error) return error.message
  if (typeof error === "string") return error
  return fallback
}

export function formatValidationErrors(errors: unknown[]) {
  return errors
    .map((error) =>
      typeof error === "object" && error !== null && "message" in error
        ? String(error.message)
        : String(error),
    )
    .join(", ")
}
