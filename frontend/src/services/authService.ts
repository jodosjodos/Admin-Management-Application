import apiClient from "./api";

export interface Admin {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: "SUPER_ADMIN" | "ADMIN" | "SUPPORT";
  status: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  admin: Admin;
}

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post("/auth/login", credentials);
    return response.data;
  },

  getProfile: async (): Promise<{ admin: Admin }> => {
    const response = await apiClient.get("/auth/me");
    return response.data;
  },

  logout: () => {
    localStorage.removeItem("adminAccessToken");
    localStorage.removeItem("admin");
  },
};
