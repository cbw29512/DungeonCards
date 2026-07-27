import { describe, expect, it, vi } from "vitest";
import type { DndVaultAuthenticatedClient } from "./supabaseAuthGateway";
import { SupabaseDndCharacterRepository } from "./supabaseCharacterRepository";

const authClient = (ownerId = "owner-1"): DndVaultAuthenticatedClient => ({
  getSession: async () => ({ user: { id: ownerId, displayName: "Arden" } }),
  getAccessToken: async () => "user-jwt",
  getCurrentUserId: async () => ownerId,
  signInWithMagicLink: async () => undefined,
  signInWithGoogle: async () => undefined,
  signOut: async () => undefined,
  onSessionChanged: () => () => undefined
});

const config = {
  url: "https://project.supabase.co",
  publishableKey: "sb_publishable_test",
  redirectUrl: "https://app.example.com/"
};

describe("Supabase saved character repository", () => {
  it("rejects a mismatched owner before making a request", async () => {
    const fetcher = vi.fn<typeof fetch>();
    const repository = new SupabaseDndCharacterRepository(config, authClient(), fetcher);
    await expect(repository.list("different-owner")).rejects.toThrow("owner does not match");
    expect(fetcher).not.toHaveBeenCalled();
  });

  it("sends the publishable key and signed-in user token", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(new Response("[]", { status: 200 }));
    const repository = new SupabaseDndCharacterRepository(config, authClient(), fetcher);
    await expect(repository.list("owner-1")).resolves.toEqual([]);
    const [url, init] = fetcher.mock.calls[0];
    expect(String(url)).toContain("owner_id=eq.owner-1");
    expect(init?.headers).toMatchObject({
      apikey: "sb_publishable_test",
      Authorization: "Bearer user-jwt"
    });
  });
});
