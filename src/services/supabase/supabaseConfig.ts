export type DndVaultSupabaseConfig = {
  url: string;
  publishableKey: string;
  redirectUrl: string;
};

const trimTrailingSlash = (value: string): string => value.replace(/\/+$/, "");

const isLocalHost = (hostname: string): boolean =>
  hostname === "localhost" || hostname === "127.0.0.1" || hostname === "[::1]";

const parsePublicUrl = (value: string, label: string): URL => {
  const url = new URL(value);
  if (url.protocol !== "https:" && !isLocalHost(url.hostname)) {
    throw new Error(`${label} must use HTTPS outside local development.`);
  }
  return url;
};

const decodeJwtRole = (key: string): string | null => {
  try {
    const parts = key.split(".");
    if (parts.length !== 3) return null;
    const normalized = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    const payload: unknown = JSON.parse(globalThis.atob(padded));
    if (!payload || typeof payload !== "object") return null;
    const role = (payload as { role?: unknown }).role;
    return typeof role === "string" ? role : null;
  } catch {
    return null;
  }
};

export const isSafeDndVaultBrowserKey = (key: string): boolean => {
  if (key.startsWith("sb_secret_")) return false;
  if (key.startsWith("sb_publishable_")) return key.length > "sb_publishable_".length + 10;
  return decodeJwtRole(key) === "anon";
};

export const parseDndVaultSupabaseConfig = (
  values: Record<string, string | undefined>,
  redirectUrl: string
): DndVaultSupabaseConfig | null => {
  try {
    const rawUrl = values.VITE_SUPABASE_URL?.trim();
    const publishableKey = values.VITE_SUPABASE_PUBLISHABLE_KEY?.trim()
      || values.VITE_SUPABASE_ANON_KEY?.trim();
    if (!rawUrl || !publishableKey) return null;
    if (!isSafeDndVaultBrowserKey(publishableKey)) {
      throw new Error("Character Vault browser configuration requires a publishable or legacy anon key.");
    }

    const url = parsePublicUrl(rawUrl, "Supabase URL");
    const redirect = parsePublicUrl(redirectUrl, "Supabase redirect URL");
    return {
      url: trimTrailingSlash(url.toString()),
      publishableKey,
      redirectUrl: redirect.toString()
    };
  } catch (error) {
    console.error("Invalid Character Vault Supabase configuration", { error });
    return null;
  }
};

export const getDndVaultSupabaseConfig = (): DndVaultSupabaseConfig | null => {
  const values = import.meta.env as Record<string, string | undefined>;
  const redirectUrl = typeof window === "undefined"
    ? "http://localhost/"
    : `${window.location.origin}${window.location.pathname}${window.location.search}`;
  return parseDndVaultSupabaseConfig(values, redirectUrl);
};
