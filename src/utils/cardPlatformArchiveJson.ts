import {
  MAX_ARCHIVE_JSON_DEPTH,
  MAX_ARCHIVE_STRING_LENGTH,
  MAX_CARD_PLATFORM_ARCHIVE_BYTES
} from "./cardPlatformArchiveLimits";

const forbiddenKeys = new Set(["__proto__", "prototype", "constructor"]);

export const isPlainArchiveRecord = (value: unknown): value is Record<string, unknown> => (
  typeof value === "object"
  && value !== null
  && !Array.isArray(value)
  && Object.getPrototypeOf(value) === Object.prototype
);

const scanJsonValue = (value: unknown, depth: number): void => {
  if (depth > MAX_ARCHIVE_JSON_DEPTH) throw new Error("Card Platform archive exceeds the maximum JSON depth.");
  if (typeof value === "string") {
    if (value.length > MAX_ARCHIVE_STRING_LENGTH) throw new Error("Card Platform archive contains an oversized string.");
    return;
  }
  if (value === null || typeof value === "number" || typeof value === "boolean") return;
  if (Array.isArray(value)) {
    value.forEach((item) => scanJsonValue(item, depth + 1));
    return;
  }
  if (!isPlainArchiveRecord(value)) throw new Error("Card Platform archive contains an unsupported value.");
  for (const [key, item] of Object.entries(value)) {
    if (forbiddenKeys.has(key)) throw new Error("Card Platform archive contains a forbidden object key.");
    scanJsonValue(item, depth + 1);
  }
};

export const parseSafeArchiveJson = (text: string): unknown => {
  if (new TextEncoder().encode(text).byteLength > MAX_CARD_PLATFORM_ARCHIVE_BYTES) {
    throw new Error("Card Platform archive exceeds the 5 MB import limit.");
  }
  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch {
    throw new Error("Card Platform archive is not valid JSON.");
  }
  scanJsonValue(value, 0);
  return value;
};
