import { apiClient } from "./api-client";

export interface LoginRequest {
  email: string;
  password: string;
  tenant_slug?: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: string;
  tenant_id: string;
  is_active: boolean;
}

export const authService = {
  async login(payload: LoginRequest): Promise<TokenResponse> {
    return apiClient<TokenResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async refreshToken(refreshToken: string): Promise<TokenResponse> {
    return apiClient<TokenResponse>("/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
  },

  async getMe(token: string): Promise<UserProfile> {
    return apiClient<UserProfile>("/auth/me", {
      method: "GET",
      token,
    });
  },

  async logout(token: string): Promise<void> {
    return apiClient<void>("/auth/logout", {
      method: "POST",
      token,
    });
  },
};
