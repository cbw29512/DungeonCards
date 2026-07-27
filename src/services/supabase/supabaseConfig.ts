export type DndVaultSupabaseConfig = {
  url: string;
  publishableKey: string;
  redirectUrl: string;
};

const trimTrailingSlash = (value: string): string => value.replace(/\/+$/, "");

export const parseDndVaultSupabaseConfig = (
  values: Record<string, string | undefined>,
  redirectUrl: string
): DndVaultSupabaseConfig | null => {
  try {
    const rawUrl = values.VITE_SUPABASE_URL?.trim();
    const publishableKey = values.VITE_SUPABASE_PUBLISHABLE_KEY?.trim()
      || values.VITE_SUPABASE_ANON_KEY?.trim();
    if (!rawUrl || !publishableKey) return null;

    const url = new URL(rawUrl);
    if (url.protocol !== "https:" && url.hostname !== "localhost" && url.hostname !== "127.0.0.1") {
      throw new Error("Supabase URL must use HTTPS outside local development.");
    }

    return {
      url: trimTrailingSlash(url.toString()),
      publishableKey,
      redirectUrl
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
