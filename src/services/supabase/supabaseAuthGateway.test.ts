import { describe, expect, it, vi } from "vitest";
import { SupabaseDndVaultAuthGateway } from "./supabaseAuthGateway";
import {
  type DndVaultStorage,
  writeSupabaseStoredSession
} from "./supabaseSessionStore";

const memoryStorage = (): DndVaultStorage => {
  const values = new Map<string, string>();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => { values.set(key, value); },
    removeItem: (key) => { values.delete(key); }
  };
};

const config = {
  url: "https://project.supabase.co",
  publishableKey: "sb_publishable_test",
  redirectUrl: "https://app.example.com/?page=pregens"
};

describe("Supabase Character Vault authentication", () => {
  it("serializes concurrent refresh attempts", async () => {
    const storage = memoryStorage();
    writeSupabaseStoredSession(storage, {
      accessToken: "expired-access",
      refreshToken: "single-use-refresh",
      expiresAtMs: 1
    });
    const fetcher = vi.fn<typeof fetch>(async (input) => {
      const url = String(input);
      if (url.includes("grant_type=refresh_token")) {
        return new Response(JSON.stringify({
          access_token: "fresh-access",
          refresh_token: "rotated-refresh",
          expires_in: 3600
        }), { status: 200 });
      }
      if (url.endsWith("/auth/v1/user")) {
        return new Response(JSON.stringify({
          id: "owner-1",
          email: "arden@example.com",
          user_metadata: { full_name: "Arden" }
        }), { status: 200 });
      }
      throw new Error(`Unexpected request: ${url}`);
    });
    const gateway = new SupabaseDndVaultAuthGateway(config, {
      fetcher,
      storage,
      now: () => 10_000,
      getHash: () => "",
      clearHash: () => undefined,
      navigate: () => undefined
    });

    await expect(Promise.all([gateway.getAccessToken(), gateway.getAccessToken()]))
      .resolves.toEqual(["fresh-access", "fresh-access"]);
    expect(fetcher.mock.calls.filter(([url]) => String(url).includes("grant_type=refresh_token"))).toHaveLength(1);
  });

  it("sends magic links to the configured return URL", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(new Response("{}", { status: 200 }));
    const gateway = new SupabaseDndVaultAuthGateway(config, {
      fetcher,
      storage: memoryStorage(),
      now: () => 1,
      getHash: () => "",
      clearHash: () => undefined,
      navigate: () => undefined
    });
    await gateway.signInWithMagicLink("ARDEN@example.com ");
    const [url, init] = fetcher.mock.calls[0];
    expect(String(url)).toContain("/auth/v1/otp?redirect_to=");
    expect(init?.body).toBe(JSON.stringify({ email: "arden@example.com", create_user: true }));
  });
});
