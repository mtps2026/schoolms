import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URL_RE = /^(https?:\/\/|mailto:|ftp:\/\/)/i;
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}(T|$)/;
const FILE_PATH_RE = /^([a-zA-Z]:\\|\/)/;
const SKIP_KEY_RE = /^(?:role_name|email|password|.*_id|id|uuid|token|secret|hash|created_by|modified_at|created_at|updated_at|deleted_at|file_path|file|url|uri)$/i;

function isEmail(value: string) {
  return EMAIL_RE.test(value);
}

function isUrl(value: string) {
  return URL_RE.test(value);
}

function isDateString(value: string) {
  return ISO_DATE_RE.test(value) || /^\d{2}\/\d{2}\/\d{4}$/.test(value) || /^\d{2}-\d{2}-\d{4}$/.test(value);
}

function isFilePath(value: string) {
  return FILE_PATH_RE.test(value);
}

export function uppercaseTextFields<T>(value: T): T {
  if (value === null || value === undefined) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => uppercaseTextFields(item)) as unknown as T;
  }

  if (typeof value === "object") {
    const normalized: Record<string, unknown> = {};

    for (const [key, fieldValue] of Object.entries(value)) {
      if (typeof fieldValue === "string") {
        if (
          SKIP_KEY_RE.test(key) ||
          isEmail(fieldValue) ||
          isUrl(fieldValue) ||
          isDateString(fieldValue) ||
          isFilePath(fieldValue)
        ) {
          normalized[key] = fieldValue;
        } else {
          normalized[key] = fieldValue.toUpperCase();
        }
      } else if (typeof fieldValue === "object") {
        normalized[key] = uppercaseTextFields(fieldValue);
      } else {
        normalized[key] = fieldValue;
      }
    }

    return normalized as T;
  }

  return value;
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
