import type { DndVaultUser } from "../dndCharacterVaultGateway";
import type { DndVaultSupabaseConfig } from "./supabaseConfig";

export type SupabaseTokenPayload = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
};

type AuthUserPayload = {
  id: string;
  email?: string;
  user_metadata?: { full_name?: string; name?: string; avatar_url?: string };
};

export class SupabaseAuthTransport {
  constructor(
    private readonly config: DndVaultSupabaseConfig,
    private readonly fetcher: typeof fetch
  ) {}

  private headers(accessToken?: string): HeadersInit {
    return {
      apikey: this.config.publishableKey,
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {})
    };
  }

  private async request<T>(path: string, init: RequestInit): Promise<T> {
    try {
      const response = await this.fetcher(`${this.config.url}${path}`, init);
      const raw = await response.text();
      const payload = raw
        ? JSON.parse(raw) as T & { message?: string; msg?: string; error_description?: string }
        : {} as T;
      if (!response.ok) {
        const detail = payload.error_description || payload.message || payload.msg || `HTTP ${response.status}`;
        throw new Error(detail);
      }
      return payload;
    } catch (error) {
      console.error("Supabase Auth request failed", { path, error });
      throw error;
    }
  }

  async getUser(accessToken: string): Promise<DndVaultUser> {
    const payload = await this.request<AuthUserPayload>("/auth/v1/user", {
      headers: this.headers(accessToken)
    });
    const displayName = payload.user_metadata?.full_name
      || payload.user_metadata?.name
      || payload.email?.split("@")[0]
      || "Adventurer";
    return {
      id: payload.id,
      email: payload.email,
      displayName,
      avatarUrl: payload.user_metadata?.avatar_url
    };
  }

  async refresh(refreshToken: string): Promise<SupabaseTokenPayload> {
    return this.request<SupabaseTokenPayload>("/auth/v1/token?grant_type=refresh_token", {
      method: "POST",
      headers: this.headers(),
      body: JSON.stringify({ refresh_token: refreshToken })
    });
  }

  async sendMagicLink(email: string): Promise<void> {
    const redirect = encodeURIComponent(this.config.redirectUrl);
    await this.request(`/auth/v1/otp?redirect_to=${redirect}`, {
      method: "POST",
      headers: this.headers(),
      body: JSON.stringify({ email, create_user: true })
    });
  }

  googleAuthorizationUrl(): string {
    const redirect = encodeURIComponent(this.config.redirectUrl);
    return `${this.config.url}/auth/v1/authorize?provider=google&redirect_to=${redirect}`;
  }

  async signOut(accessToken: string): Promise<void> {
    await this.request("/auth/v1/logout", {
      method: "POST",
      headers: this.headers(accessToken)
    });
  }
}
