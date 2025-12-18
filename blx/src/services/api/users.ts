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
  ma_hoi_vien?: string; // Backend: ma_hoi_vien - Mã hội viên
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
   * Get all users with pagination
   * @param page - Page number (default: 1)
   * @param limit - Items per page (default: 25)
   * @returns Promise with paginated users
   */
  getAll: async (
    page: number = 1,
    limit: number = 25
  ): Promise<{
    docs: User[];
    totalDocs: number;
    limit: number;
    page: number;
    totalPages: number;
  }> => {
    try {
      const response = await http.get("/users", {
        params: { page, limit },
      });
      return handleResponse<{
        docs: User[];
        totalDocs: number;
        limit: number;
        page: number;
        totalPages: number;
      }>(response.data);
    } catch (error: any) {
      console.error("Error fetching users:", error);
      return {
        docs: [],
        totalDocs: 0,
        limit,
        page,
        totalPages: 0,
      };
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
   * @param userId - User ID (optional, can be passed via query param or auto-fetched from account store)
   * @returns Promise<User | null>
   */
  getProfile: async (userId?: number): Promise<User | null> => {
    try {
      // Lấy userId từ account store nếu không được truyền vào
      let finalUserId = userId;
      if (!finalUserId) {
        try {
          const { useAccountStore } = await import("@/stores/account");
          const { account } = useAccountStore.getState();
          if (account?.id) {
            finalUserId = Number(account.id);
          }
        } catch (e) {
          console.warn("Could not get userId from account store:", e);
        }
      }

      // Backend yêu cầu userId, nếu không có thì throw error
      if (!finalUserId) {
        console.error(
          "User ID is required for getProfile. Please login again."
        );
        return null;
      }

      const params = { userId: finalUserId.toString() };
      const response = await http.get("/users/profile", { params });

      // Debug: Log raw response từ backend
      console.log("[Users API] Raw response from /users/profile:", {
        responseData: response.data,
        ma_hoi_vien: response.data?.ma_hoi_vien,
        ma_hoi_vien_type: typeof response.data?.ma_hoi_vien,
      });

      const user = handleResponse<User>(response.data);

      // Debug: Log sau khi handle response
      console.log("[Users API] User after handleResponse:", {
        user,
        ma_hoi_vien: user?.ma_hoi_vien,
        ma_hoi_vien_type: typeof user?.ma_hoi_vien,
      });

      return user;
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
      // Backend yêu cầu userId trong body hoặc query
      // Lấy userId từ account store nếu không được truyền vào
      let finalUserId = userId;
      if (!finalUserId) {
        try {
          const { useAccountStore } = await import("@/stores/account");
          const { account } = useAccountStore.getState();
          if (account?.id) {
            finalUserId = Number(account.id);
          }
        } catch (e) {
          console.warn("Could not get userId from account store:", e);
        }
      }

      // Backend yêu cầu userId, nếu không có thì throw error
      if (!finalUserId) {
        throw new Error("User ID is required. Please login again.");
      }

      // Thêm userId vào data
      const requestData = { ...data, userId: finalUserId.toString() };

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
  updateProfileWithAvatar: async (
    formData: FormData,
    token?: string
  ): Promise<{ success: boolean; message: string; data: any }> => {
    try {
      // Kiểm tra FormData có file không
      const hasFile = Array.from(formData.entries()).some(
        ([key, value]) => value instanceof File
      );
      if (!hasFile) {
        throw new Error(
          "FormData không chứa file. Vui lòng chọn ảnh trước khi upload."
        );
      }

      const entries = Array.from(formData.entries());
      const hasImageField = entries.some(([key]) => key === "image");
      if (!hasImageField) {
        // Nếu không có field "image", tìm field "avatar" và rename
        const avatarEntry = entries.find(
          ([key, value]) => key === "avatar" && value instanceof File
        );
        if (avatarEntry) {
          formData.delete("avatar");
          formData.append("image", avatarEntry[1] as File);
        }
      }

      // Lấy userId và role từ account store nếu chưa có trong formData
      const userId = formData.get("userId");
      const role = formData.get("role");

      if (!userId) {
        // Try to get from account store
        try {
          const { useAccountStore } = await import("@/stores/account");
          const { account } = useAccountStore.getState();
          if (account?.id) {
            formData.append("userId", String(account.id));
          }
          if (account?.role) {
            formData.append("role", account.role);
          }
        } catch (e) {
          console.warn("Could not get userId from account store:", e);
        }
      }

      // Upload avatar
      // Sử dụng endpoint /auth/profile/avatar
      // Axios sẽ tự động detect FormData và set Content-Type với boundary
      const config: any = {
        headers: {},
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      };

      // Thêm Authorization header nếu có token
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      const response = await http.post<{
        success: boolean;
        message: string;
        data: any;
      }>("/auth/profile/avatar", formData, config);

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
   * @param data - Password change data
   * @param userId - Optional user ID (if not provided, will be extracted from token or account store)
   * @returns Promise<boolean>
   */
  changePassword: async (
    data: {
      oldPassword: string;
      newPassword: string;
    },
    userId?: number | string
  ): Promise<boolean> => {
    try {
      // Backend cần userId trong query hoặc body
      const requestData = userId
        ? { ...data, userId: userId.toString() }
        : data;

      await http.post("/users/change-password", requestData, {
        params: userId ? { userId: userId.toString() } : undefined,
      });
      return true;
    } catch (error: any) {
      console.error("Error changing password:", error);
      throw error;
    }
  },

  /**
   * Import users from Excel file
   * @param file - Excel file to import
   * @param clubId - Optional club ID
   * @returns Promise with import result
   */
  importExcel: async (
    file: File,
    clubId?: number
  ): Promise<{
    success: boolean;
    message: string;
    data: {
      imported: number;
      failed: number;
      errors: string[];
    };
  }> => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      if (clubId) {
        formData.append("club_id", clubId.toString());
      }

      const response = await http.post<{
        success: boolean;
        message: string;
        data: {
          imported: number;
          failed: number;
          errors: string[];
        };
      }>("/users/import-excel", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      return response.data;
    } catch (error: any) {
      console.error("Error importing users from Excel:", error);
      throw error;
    }
  },
};

export default usersApi;
