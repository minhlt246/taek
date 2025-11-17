import http from "@/services/http";

export interface ForgotPasswordRequest {
  email: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role?: "admin" | "student" | "HLV" | "parent";
}

export const authApi = {
  async forgotPassword(email: string): Promise<void> {
    const response = await http.post("/auth/forgot-password", { email });
    return response.data;
  },

  async login(credentials: LoginRequest): Promise<{
    success: boolean;
    message: string;
    data: { user: any; token: string };
  }> {
    const response = await http.post("/auth/login", credentials);
    return response.data;
  },

  async register(userData: RegisterRequest): Promise<{
    success: boolean;
    message: string;
    data: { user: any };
  }> {
    const response = await http.post("/auth/register", userData);
    return response.data;
  },

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const response = await http.post("/auth/reset-password", {
      token,
      newPassword,
    });
    return response.data;
  },

  async verifyEmail(token: string): Promise<void> {
    const response = await http.post("/auth/verify-email", { token });
    return response.data;
  },

  async checkEmailExists(email: string): Promise<{ exists: boolean }> {
    const response = await http.post("/auth/check-email", { email });
    return response.data;
  },

  async changePassword(
    oldPassword: string,
    newPassword: string
  ): Promise<void> {
    const response = await http.post("/auth/change-password", {
      oldPassword,
      newPassword,
    });
    return response.data;
  },

  async updateProfile(userData: any): Promise<{ user: any }> {
    const response = await http.put("/auth/profile", userData);
    return response.data;
  },

  async uploadImage(file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append("file", file);
    const response = await http.post("/auth/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },
};
