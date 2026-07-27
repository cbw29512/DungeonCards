import { describe, expect, it, vi } from "vitest";
import {
  isSafeDndVaultBrowserKey,
  parseDndVaultSupabaseConfig
} from "./supabaseConfig";

const jwtForRole = (role: string): string => {
  const encode = (value: object) => btoa(JSON.stringify(value))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  return `${encode({ alg: "HS256", typ: "JWT" })}.${encode({ role })}.signature`;
};

describe("Character Vault Supabase configuration", () => {
  it("accepts a secure project URL and publishable key", () => {
    const key = "sb_publishable_1234567890abcdef";
    expect(parseDndVaultSupabaseConfig({
      VITE_SUPABASE_URL: "https://example.supabase.co/",
      VITE_SUPABASE_PUBLISHABLE_KEY: key
    }, "https://app.example.com/?system=dnd&page=pregens")).toEqual({
      url: "https://example.supabase.co",
      publishableKey: key,
      redirectUrl: "https://app.example.com/?system=dnd&page=pregens"
    });
  });

  it("supports a legacy anon JWT during migration", () => {
    const anonKey = jwtForRole("anon");
    expect(parseDndVaultSupabaseConfig({
      VITE_SUPABASE_URL: "http://localhost:54321",
      VITE_SUPABASE_ANON_KEY: anonKey
    }, "http://localhost:5173/")?.publishableKey).toBe(anonKey);
  });

  it("rejects secret and legacy service-role keys", () => {
    expect(isSafeDndVaultBrowserKey("sb_secret_1234567890abcdef")).toBe(false);
    expect(isSafeDndVaultBrowserKey(jwtForRole("service_role"))).toBe(false);
  });

  it("returns local-only mode when required values are missing", () => {
    expect(parseDndVaultSupabaseConfig({}, "https://app.example.com/")).toBeNull();
  });

  it("rejects insecure remote project and redirect URLs", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const key = "sb_publishable_1234567890abcdef";
    expect(parseDndVaultSupabaseConfig({
      VITE_SUPABASE_URL: "http://example.com",
      VITE_SUPABASE_PUBLISHABLE_KEY: key
    }, "https://app.example.com/")).toBeNull();
    expect(parseDndVaultSupabaseConfig({
      VITE_SUPABASE_URL: "https://example.supabase.co",
      VITE_SUPABASE_PUBLISHABLE_KEY: key
    }, "http://app.example.com/")).toBeNull();
    expect(consoleSpy).toHaveBeenCalledTimes(2);
    consoleSpy.mockRestore();
  });
});
