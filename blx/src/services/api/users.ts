import http from "@/services/http";

/**
 * User/Võ sinh interface
 *
 * ⚠️ LƯU Ý VỀ FIELD MAPPING VỚI BACKEND:
 * Frontend dùng field names khác với Backend. Cần map khi gửi/nhận data:
 *
 * Frontend -> Backend mapping:
 * - name -> ho_va_ten
 * - date_of_birth -> ngay_thang_nam_sinh (format: YYYY-MM-DD)
 * - gender -> gioi_tinh ('male'/'female' -> 'Nam'/'Nữ')
 * - belt_level_id -> cap_dai_id
 * - club_id -> ma_clb (backend dùng string, không phải number)
 * - branch_id -> ma_don_vi (backend dùng string, không phải number)
 * - is_active -> active_status
 *
 * Backend -> Frontend mapping:
 * - ho_va_ten -> name
 * - ngay_thang_nam_sinh -> date_of_birth
 * - gioi_tinh -> gender ('Nam'/'Nữ' -> 'male'/'female')
 * - cap_dai_id -> belt_level_id
 * - ma_clb -> club_id (cần convert string -> number nếu cần)
 * - ma_don_vi -> branch_id (cần convert string -> number nếu cần)
 * - active_status -> is_active
 */
export interface User {
  id: number;
  name: string; // Backend: ho_va_ten
  email?: string;
  phone?: string;
  date_of_birth?: string; // Backend: ngay_thang_nam_sinh (format: YYYY-MM-DD)
  gender?: "male" | "female"; // Backend: gioi_tinh ('Nam' | 'Nữ')
  address?: string;
  belt_level_id?: number; // Backend: cap_dai_id
  belt_level?: {
    id: number;
    name: string;
    color?: string;
  };
  club_id?: number; // Backend: ma_clb (string)
  club?: {
    id: number;
    name: string;
  };
  branch_id?: number; // Backend: ma_don_vi (string)
  branch?: {
    id: number;
    name: string;
  };
  is_active?: boolean; // Backend: active_status
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
      const response = await http.post<
        User | { success: boolean; message: string; data: User }
      >("/users", data);
      if (
        response.data &&
        "id" in response.data &&
        !("success" in response.data)
      ) {
        return response.data as User;
      }
      return (response.data as { data: User })?.data || (response.data as User);
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
      const response = await http.patch<
        User | { success: boolean; message: string; data: User }
      >(`/users/${id}`, data);
      if (
        response.data &&
        "id" in response.data &&
        !("success" in response.data)
      ) {
        return response.data as User;
      }
      return (response.data as { data: User })?.data || (response.data as User);
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
   * @param userId - User ID (optional, can be passed via query param)
   * @returns Promise<User | null>
   */
  getProfile: async (userId?: number): Promise<User | null> => {
    try {
      const params = userId ? { userId: userId.toString() } : {};
      const response = await http.get("/users/profile", { params });
      return handleResponse<User>(response.data);
    } catch (error: any) {
      console.error("Error fetching user profile:", error);
      return null;
    }
  },

  /**
   * Update user profile
   * @param data - Profile data (should include userId in data or as second param)
   * @param userId - Optional user ID (if not provided, should be in data)
   * @returns Promise<User>
   */
  updateProfile: async (data: any, userId?: number): Promise<User> => {
    try {
      // Thêm userId vào data nếu có
      const requestData = userId ? { ...data, userId: userId.toString() } : data;
      const response = await http.patch<
        User | { success: boolean; message: string; data: User }
      >("/users/profile", requestData);
      if (
        response.data &&
        "id" in response.data &&
        !("success" in response.data)
      ) {
        return response.data as User;
      }
      return (response.data as { data: User })?.data || (response.data as User);
    } catch (error: any) {
      console.error("Error updating profile:", error);
      throw error;
    }
  },

  /**
   * Update user profile with avatar
   * @param formData - FormData with profile and avatar
   * @param token - Optional auth token
   * @returns Promise with avatar URL
   */
  updateProfileWithAvatar: async (formData: FormData, token?: string): Promise<{ success: boolean; message: string; data: any }> => {
    try {
      // Kiểm tra FormData có file không
      const hasFile = Array.from(formData.entries()).some(([key, value]) => value instanceof File);
      if (!hasFile) {
        throw new Error("FormData không chứa file. Vui lòng chọn ảnh trước khi upload.");
      }

      // Upload avatar

      // Sử dụng endpoint /auth/profile/avatar
      // Axios sẽ tự động detect FormData và set Content-Type với boundary
      // Không set Content-Type header trong headers để axios tự động xử lý
      const config: any = {
        headers: {},
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      };

      // Thêm Authorization header nếu có token
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Đảm bảo không set Content-Type để axios tự động set multipart/form-data với boundary
      // Axios sẽ tự động detect FormData và set header đúng
      
      const response = await http.post<
        { success: boolean; message: string; data: any }
      >("/auth/profile/avatar", formData, config);
      
      return response.data;
    } catch (error: any) {
      console.error("Error updating profile with avatar:", error);
      console.error("Error details:", {
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status,
        requestHeaders: error?.config?.headers,
      });
      throw error;
    }
  },

  /**
   * Change user password
   * TODO: Backend chưa có endpoint này. Cần implement POST /users/change-password trong backend.
   * @param data - Password change data
   * @returns Promise<boolean>
   */
  changePassword: async (data: {
    oldPassword: string;
    newPassword: string;
  }): Promise<boolean> => {
    try {
      // TODO: Endpoint này chưa tồn tại trong backend
      // Cần implement POST /users/change-password trong users.controller.ts
      await http.post("/users/change-password", data);
      return true;
    } catch (error: any) {
      console.error("Error changing password:", error);
      console.warn(
        "[UsersApi] POST /users/change-password endpoint không tồn tại trong backend. Cần implement."
      );
      throw error;
    }
  },
};

export default usersApi;
