import http from "@/services/http";

/**
 * User/Võ sinh interface
 */
export interface User {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  date_of_birth?: string;
  gender?: "male" | "female";
  address?: string;
  belt_level_id?: number;
  belt_level?: {
    id: number;
    name: string;
    color?: string;
  };
  club_id?: number;
  club?: {
    id: number;
    name: string;
  };
  branch_id?: number;
  branch?: {
    id: number;
    name: string;
  };
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

/**
 * Helper to handle API responses
 */
const handleResponse = <T>(response: any): T => {
  if (Array.isArray(response)) {
    return response as T;
  }
  if (response?.data) {
    return Array.isArray(response.data) ? response.data : response.data;
  }
  return response as T;
};

/**
 * API service for users/võ sinh
 */
export const usersApi = {
  /**
   * Get all users
   * @returns Promise<User[]>
   */
  getAll: async (): Promise<User[]> => {
    try {
      const response = await http.get("/users");
      return handleResponse<User[]>(response.data);
    } catch (error: any) {
      console.error("Error fetching users:", error);
      return [];
    }
  },

  /**
   * Get user by ID
   * @param id - User ID
   * @returns Promise<User | null>
   */
  getById: async (id: number): Promise<User | null> => {
    try {
      const response = await http.get(`/users/${id}`);
      return handleResponse<User>(response.data);
    } catch (error: any) {
      console.error(`Error fetching user ${id}:`, error);
      return null;
    }
  },

  /**
   * Create a new user (Admin only)
   * @param data - User data
   * @returns Promise<User>
   */
  create: async (data: any): Promise<User> => {
    try {
      const response = await http.post<User | { success: boolean; message: string; data: User }>("/users", data);
      console.log("[UsersApi] Create response:", response.data);
      if (response.data && "id" in response.data && !("success" in response.data)) {
        return response.data as User;
      }
      return (response.data as { data: User })?.data || response.data as User;
    } catch (error: any) {
      console.error("Error creating user:", error);
      throw error;
    }
  },

  /**
   * Update an existing user (Admin only)
   * @param id - User ID
   * @param data - User data to update
   * @returns Promise<User>
   */
  update: async (id: number, data: any): Promise<User> => {
    try {
      const response = await http.patch<User | { success: boolean; message: string; data: User }>(`/users/${id}`, data);
      console.log("[UsersApi] Update response:", response.data);
      if (response.data && "id" in response.data && !("success" in response.data)) {
        return response.data as User;
      }
      return (response.data as { data: User })?.data || response.data as User;
    } catch (error: any) {
      console.error(`Error updating user ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete a user (Admin only)
   * @param id - User ID
   * @returns Promise<boolean>
   */
  delete: async (id: number): Promise<boolean> => {
    try {
      await http.delete(`/users/${id}`);
      return true;
    } catch (error: any) {
      console.error(`Error deleting user ${id}:`, error);
      throw error;
    }
  },

  /**
   * Get user profile
   * @returns Promise<User | null>
   */
  getProfile: async (): Promise<User | null> => {
    try {
      const response = await http.get("/users/profile");
      return handleResponse<User>(response.data);
    } catch (error: any) {
      console.error("Error fetching user profile:", error);
      return null;
    }
  },

  /**
   * Update user profile
   * @param data - Profile data
   * @returns Promise<User>
   */
  updateProfile: async (data: any): Promise<User> => {
    try {
      const response = await http.patch<User | { success: boolean; message: string; data: User }>("/users/profile", data);
      if (response.data && "id" in response.data && !("success" in response.data)) {
        return response.data as User;
      }
      return (response.data as { data: User })?.data || response.data as User;
    } catch (error: any) {
      console.error("Error updating profile:", error);
      throw error;
    }
  },

  /**
   * Update user profile with avatar
   * @param formData - FormData with profile and avatar
   * @returns Promise<User>
   */
  updateProfileWithAvatar: async (formData: FormData): Promise<User> => {
    try {
      const response = await http.post<User | { success: boolean; message: string; data: User }>("/users/profile/avatar", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      if (response.data && "id" in response.data && !("success" in response.data)) {
        return response.data as User;
      }
      return (response.data as { data: User })?.data || response.data as User;
    } catch (error: any) {
      console.error("Error updating profile with avatar:", error);
      throw error;
    }
  },

  /**
   * Change user password
   * @param data - Password change data
   * @returns Promise<boolean>
   */
  changePassword: async (data: { oldPassword: string; newPassword: string }): Promise<boolean> => {
    try {
      await http.post("/users/change-password", data);
      return true;
    } catch (error: any) {
      console.error("Error changing password:", error);
      throw error;
    }
  },
};

export default usersApi;

