import http from "@/services/http";

/**
 * Club interface
 */
export interface Club {
  id: number;
  club_code: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  head_coach_id?: number;
  description?: string;
  logo_url?: string;
  images?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Branch interface
 */
export interface Branch {
  id: number;
  club_id: number;
  branch_code: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

/**
 * Club Stats interface
 */
export interface ClubStats {
  totalBranches: number;
  activeBranches: number;
  totalCourses: number;
  activeCourses: number;
}

/**
 * Club Overview interface
 */
export interface ClubOverview {
  club: Club;
  branches: Branch[];
  courses: any[];
  stats: ClubStats;
}

/**
 * API service for clubs
 */
export const clubsApi = {
  /**
   * Get all clubs
   * @returns Promise<Club[]>
   */
  getAll: async (): Promise<Club[]> => {
    try {
      const response = await http.get<Club[]>("/clubs");
      return Array.isArray(response.data) ? response.data : [];
    } catch (error: any) {
      // Only log if error is not suppressed (connection errors are handled by interceptor)
      if (!error.suppressLog) {
        console.error("Error fetching clubs:", error);
      }
      return [];
    }
  },

  /**
   * Get club by ID
   * @param id - Club ID
   * @returns Promise<Club | null>
   */
  getById: async (id: number): Promise<Club | null> => {
    try {
      const response = await http.get<Club>(`/clubs/${id}`);
      return response.data || null;
    } catch (error: any) {
      console.error(`Error fetching club ${id}:`, error);
      return null;
    }
  },

  /**
   * Get club statistics
   * @param id - Club ID
   * @returns Promise<ClubStats | null>
   */
  getStats: async (id: number): Promise<ClubStats | null> => {
    try {
      const response = await http.get<ClubStats>(`/clubs/${id}/stats`);
      return response.data || null;
    } catch (error: any) {
      console.error(`Error fetching club stats ${id}:`, error);
      return null;
    }
  },

  /**
   * Get club overview with branches and courses
   * @param id - Club ID
   * @returns Promise<ClubOverview | null>
   */
  getOverview: async (id: number): Promise<ClubOverview | null> => {
    try {
      const response = await http.get<ClubOverview>(`/clubs/${id}/overview`);
      return response.data || null;
    } catch (error: any) {
      // http.ts đã log lỗi 500+ rồi, không cần log lại ở đây
      return null;
    }
  },

  /**
   * Create a new club (Admin only)
   * @param data - Club data
   * @returns Promise<Club>
   */
  create: async (data: any): Promise<Club> => {
    try {
      const response = await http.post<Club | { success: boolean; message: string; data: Club }>("/clubs", data);
      // Handle response format: { success, message, data } or direct Club
      if (response.data && "id" in response.data && !("success" in response.data)) {
        return response.data as Club;
      }
      return (response.data as { data: Club })?.data || response.data as Club;
    } catch (error: any) {
      console.error("Error creating club:", error);
      throw error;
    }
  },

  /**
   * Update an existing club (Admin only)
   * @param id - Club ID
   * @param data - Club data to update
   * @returns Promise<Club>
   */
  update: async (id: number, data: any): Promise<Club> => {
    try {
      const response = await http.patch<Club | { success: boolean; message: string; data: Club }>(`/clubs/${id}`, data);
      // Handle response format: { success, message, data } or direct Club
      if (response.data && "id" in response.data && !("success" in response.data)) {
        return response.data as Club;
      }
      return (response.data as { data: Club })?.data || response.data as Club;
    } catch (error: any) {
      console.error(`Error updating club ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete a club (Admin only)
   * @param id - Club ID
   * @returns Promise<boolean>
   */
  delete: async (id: number): Promise<boolean> => {
    try {
      await http.delete(`/clubs/${id}`);
      return true;
    } catch (error: any) {
      console.error(`Error deleting club ${id}:`, error);
      throw error;
    }
  },
};

export default clubsApi;

