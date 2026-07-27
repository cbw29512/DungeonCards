import { describe, expect, it, vi } from "vitest";
import { parseDndVaultSupabaseConfig } from "./supabaseConfig";

describe("Character Vault Supabase configuration", () => {
  it("accepts a secure project URL and publishable key", () => {
    expect(parseDndVaultSupabaseConfig({
      VITE_SUPABASE_URL: "https://example.supabase.co/",
      VITE_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_test"
    }, "https://app.example.com/?system=dnd&page=pregens")).toEqual({
      url: "https://example.supabase.co",
      publishableKey: "sb_publishable_test",
      redirectUrl: "https://app.example.com/?system=dnd&page=pregens"
    });
  });

  it("supports the legacy anon-key variable during migration", () => {
    expect(parseDndVaultSupabaseConfig({
      VITE_SUPABASE_URL: "http://localhost:54321",
      VITE_SUPABASE_ANON_KEY: "legacy-anon"
    }, "http://localhost:5173/")?.publishableKey).toBe("legacy-anon");
  });

  it("returns local-only mode when required values are missing", () => {
    expect(parseDndVaultSupabaseConfig({}, "https://app.example.com/")).toBeNull();
  });

  it("rejects insecure remote URLs", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    expect(parseDndVaultSupabaseConfig({
      VITE_SUPABASE_URL: "http://example.com",
      VITE_SUPABASE_PUBLISHABLE_KEY: "public"
    }, "https://app.example.com/")).toBeNull();
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
