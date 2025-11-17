import http from "@/services/http";

/**
 * Backend Coach entity interface (from API response)
 */
export interface CoachResponse {
  id: number;
  coach_code?: string; // Deprecated: use ma_hoi_vien instead
  name?: string; // Deprecated: use ho_va_ten instead
  ho_va_ten?: string; // Backend field name - Họ và tên đầy đủ
  ma_hoi_vien?: string; // Backend field name - Mã hội viên HLV
  ngay_thang_nam_sinh?: string; // Date of birth (YYYY-MM-DD)
  ma_clb?: string; // Mã câu lạc bộ
  ma_don_vi?: string; // Mã đơn vị
  quyen_so?: number; // Quyền số
  gioi_tinh?: "Nam" | "Nữ"; // Gender
  photo_url?: string;
  images?: string; // JSON string array
  phone?: string;
  email?: string;
  role?: "owner" | "admin" | "head_coach" | "main_manager" | "assistant_manager" | "assistant";
  belt_level_id?: number;
  belt_level?: {
    id: number;
    name: string;
    color?: string;
  };
  experience_years?: number;
  specialization?: string;
  bio?: string;
  address?: string; // Địa chỉ
  emergency_contact_name?: string; // Tên người liên hệ khẩn cấp
  emergency_contact_phone?: string; // Số điện thoại liên hệ khẩn cấp
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
 * Frontend Coach interface (mapped from API)
 */
export interface Coach {
  id: number;
  name: string;
  title: string;
  belt?: string;
  experience?: string;
  image?: string;
  images?: string[]; // Parsed images array
  bio?: string;
  achievements?: string[];
  specialization?: string;
  specializationDetail?: string;
  isHeadCoach?: boolean;
  // Additional fields from database
  coachCode?: string;
  phone?: string;
  email?: string;
  role?: string;
  experienceYears?: number;
  clubId?: number;
  clubName?: string;
  branchId?: number;
  branchName?: string;
  isActive?: boolean;
}

/**
 * API response interface
 */
export interface CoachesResponse {
  data: CoachResponse[];
  message?: string;
}

/**
 * Map role to Vietnamese title
 */
const getRoleTitle = (role?: string): string => {
  switch (role) {
    case "head_coach":
      return "Huấn luyện viên trưởng";
    case "main_manager":
      return "Quản lý chính";
    case "assistant_manager":
      return "Quản lý phó";
    case "assistant":
      return "Trợ giảng";
    default:
      return "Huấn luyện viên";
  }
};

/**
 * Format experience years to string
 */
const formatExperience = (years?: number): string => {
  if (!years) return "";
  if (years === 1) return "1 năm";
  return `${years} năm`;
};

/**
 * Parse images from JSON string
 */
const parseImages = (images?: string): string[] => {
  if (!images) return [];
  try {
    const parsed = JSON.parse(images);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

/**
 * Get avatar URL with default fallback and convert to full URL if needed
 */
const getAvatarUrl = (photoUrl?: string, images?: string): string => {
  // Ưu tiên: photo_url -> images[0] -> default image
  let avatarUrl: string | undefined = photoUrl;
  
  // Thử lấy từ images array nếu không có photo_url
  if (!avatarUrl && images) {
    try {
      const parsedImages = parseImages(images);
      if (parsedImages.length > 0 && parsedImages[0]) {
        avatarUrl = parsedImages[0];
      }
    } catch {
      // Ignore parse error
    }
  }
  
  // Nếu có avatarUrl, convert thành full URL nếu cần
  if (avatarUrl) {
    // Nếu là đường dẫn client/images/, truy cập qua backend API
    if (avatarUrl.startsWith('client/images/')) {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      return `${apiUrl}/${avatarUrl}`;
    }
    // Nếu đã là full URL hoặc đường dẫn local (/client/images/...), giữ nguyên
    return avatarUrl;
  }
  
  // Fallback về ảnh mặc định cho huấn luyện viên
  return "/client/images/users/user-40.jpg";
};

/**
 * Map backend CoachResponse to frontend Coach
 */
const mapCoachResponse = (response: CoachResponse): Coach => {
  // Use email as fallback if name is empty
  const displayName =
    response.name?.trim() || response.ho_va_ten?.trim() || response.email?.split("@")[0] || "Huấn luyện viên";

  return {
    id: response.id,
    name: displayName,
    title: getRoleTitle(response.role),
    belt: response.belt_level?.name || "",
    experience: formatExperience(response.experience_years),
    image: getAvatarUrl(response.photo_url, response.images),
    images: parseImages(response.images),
    bio: response.bio || "",
    specialization: response.specialization || "",
    specializationDetail: response.specialization || "",
    isHeadCoach: response.role === "head_coach",
    // Additional fields
    coachCode: response.coach_code,
    phone: response.phone,
    email: response.email,
    role: response.role,
    experienceYears: response.experience_years,
    clubId: response.club_id,
    clubName: response.club?.name,
    branchId: response.branch_id,
    branchName: response.branch?.name,
    isActive: response.is_active,
  };
};

/**
 * API service for coaches
 */
export const coachesApi = {
  /**
   * Get all coaches
   * @returns Promise<Coach[]>
   */
  getAll: async (): Promise<Coach[]> => {
    try {
      const response = await http.get<CoachResponse[] | CoachesResponse>(
        "/coaches"
      );

      // Handle different response formats
      let coachesData: CoachResponse[] = [];
      if (Array.isArray(response.data)) {
        coachesData = response.data;
      } else {
        coachesData = (response.data as CoachesResponse)?.data || [];
      }

      // Filter out inactive coaches and map to frontend Coach interface
      const mappedCoaches = coachesData
        .filter((coach) => coach.is_active !== false)
        .map(mapCoachResponse);

      return mappedCoaches;
    } catch (error: any) {
      if (error.code === "ECONNREFUSED" || error.message === "Network Error") {
        console.warn(
          "API server is not running. Please start the backend server."
        );
      } else {
        console.error("Error fetching coaches:", error);
      }
      return [];
    }
  },

  /**
   * Get coach by ID
   * @param id - Coach ID
   * @returns Promise<Coach | null>
   */
  getById: async (id: number): Promise<Coach | null> => {
    try {
      const response = await http.get<CoachResponse | { data: CoachResponse }>(
        `/coaches/${id}`
      );
      let coachData: CoachResponse | null = null;
      if ("id" in response.data && !("data" in response.data)) {
        coachData = response.data as CoachResponse;
      } else {
        coachData = (response.data as { data: CoachResponse })?.data || null;
      }
      return coachData ? mapCoachResponse(coachData) : null;
    } catch (error: any) {
      if (error.code === "ECONNREFUSED" || error.message === "Network Error") {
        console.warn(
          "API server is not running. Please start the backend server."
        );
      } else {
        console.error(`Error fetching coach ${id}:`, error);
      }
      return null;
    }
  },

  /**
   * Get head coach
   * @returns Promise<Coach | null>
   */
  getHeadCoach: async (): Promise<Coach | null> => {
    try {
      const response = await http.get<CoachResponse | { data: CoachResponse }>(
        "/coaches/head/coach"
      );


      // Handle both response formats: direct CoachResponse or { data: CoachResponse }
      if (!response.data) {
        return null;
      }
      let coachData: CoachResponse | null = null;
      if (
        response.data &&
        "id" in response.data &&
        !("data" in response.data)
      ) {
        coachData = response.data as CoachResponse;
      } else {
        coachData = (response.data as { data: CoachResponse })?.data || null;
      }

      if (!coachData) {
        return null;
      }

      const mappedCoach = mapCoachResponse(coachData);


      return mappedCoach;
    } catch (error: any) {
      if (error.code === "ECONNREFUSED" || error.message === "Network Error") {
        console.warn(
          "API server is not running. Please start the backend server."
        );
      } else {
        console.error("Error fetching head coach:", error);
      }
      return null;
    }
  },

  /**
   * Create a new coach (Admin only)
   * @param data - Coach data
   * @returns Promise<CoachResponse>
   */
  create: async (data: any): Promise<CoachResponse> => {
    try {
      const response = await http.post<CoachResponse | { success: boolean; message: string; data: CoachResponse }>("/coaches", data);
      // Handle response format: { success, message, data } or direct CoachResponse
      if (response.data && "id" in response.data && !("success" in response.data)) {
        return response.data as CoachResponse;
      }
      return (response.data as { data: CoachResponse })?.data || response.data as CoachResponse;
    } catch (error: any) {
      console.error("Error creating coach:", error);
      throw error;
    }
  },

  /**
   * Update an existing coach (Admin only)
   * @param id - Coach ID
   * @param data - Coach data to update
   * @returns Promise<CoachResponse>
   */
  update: async (id: number, data: any): Promise<CoachResponse> => {
    try {
      const response = await http.patch<CoachResponse | { success: boolean; message: string; data: CoachResponse }>(`/coaches/${id}`, data);
      // Handle response format: { success, message, data } or direct CoachResponse
      if (response.data && "id" in response.data && !("success" in response.data)) {
        return response.data as CoachResponse;
      }
      return (response.data as { data: CoachResponse })?.data || response.data as CoachResponse;
    } catch (error: any) {
      console.error(`Error updating coach ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete a coach (Admin only)
   * @param id - Coach ID
   * @returns Promise<boolean>
   */
  delete: async (id: number): Promise<boolean> => {
    try {
      await http.delete(`/coaches/${id}`);
      return true;
    } catch (error: any) {
      console.error(`Error deleting coach ${id}:`, error);
      throw error;
    }
  },
};

export default coachesApi;
