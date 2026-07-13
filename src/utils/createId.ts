let fallbackCounter = 0;

export const createClientId = (prefix: string): string => {
  try {
    if (typeof globalThis.crypto?.randomUUID === "function") {
      return `${prefix}-${globalThis.crypto.randomUUID()}`;
    }
  } catch (error) {
    console.error("Creating a secure client ID failed", { prefix, error });
  }

  fallbackCounter += 1;
  return `${prefix}-${Date.now()}-${fallbackCounter}`;
};