import http from "@/services/http";

/**
 * Poomsae interface
 */
export interface Poomsae {
  id: number;
  tenBaiQuyenVietnamese?: string;
  tenBaiQuyenEnglish?: string;
  tenBaiQuyenKorean?: string;
  capDo?: string;
  moTa?: string;
  soDongTac?: number;
  thoiGianThucHien?: number;
  khoiLuongLyThuyet?: string;
  // Legacy fields for backward compatibility
  name?: string;
  description?: string;
  video_url?: string;
  belt_level_id?: number;
  belt_level?: {
    id: number;
    name: string;
    color?: string;
  };
  created_at?: string;
  updated_at?: string;
  createdAt?: string;
  updatedAt?: string;
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
 * API service for poomsae
 */
export const poomsaeApi = {
  /**
   * Get all poomsae
   * @returns Promise<Poomsae[]>
   */
  getAll: async (): Promise<Poomsae[]> => {
    try {
      const response = await http.get<Poomsae[] | { data: Poomsae[] }>("/poomsae");
      return handleResponse<Poomsae[]>(response.data);
    } catch (error: any) {
      console.error("Error fetching poomsae:", error);
      return [];
    }
  },

  /**
   * Get poomsae by ID
   * @param id - Poomsae ID
   * @returns Promise<Poomsae | null>
   */
  getById: async (id: number): Promise<Poomsae | null> => {
    try {
      const response = await http.get<Poomsae | { data: Poomsae }>(`/poomsae/${id}`);
      return handleResponse<Poomsae>(response.data);
    } catch (error: any) {
      console.error(`Error fetching poomsae ${id}:`, error);
      return null;
    }
  },

  /**
   * Create a new poomsae (Admin only)
   * @param data - Poomsae data
   * @returns Promise<Poomsae>
   */
  create: async (data: any): Promise<Poomsae> => {
    try {
      const response = await http.post<Poomsae | { success: boolean; message: string; data: Poomsae }>("/poomsae", data);
      console.log("[PoomsaeApi] Create response:", response.data);
      if (response.data && "id" in response.data && !("success" in response.data)) {
        return response.data as Poomsae;
      }
      return (response.data as { data: Poomsae })?.data || response.data as Poomsae;
    } catch (error: any) {
      console.error("Error creating poomsae:", error);
      throw error;
    }
  },

  /**
   * Update an existing poomsae (Admin only)
   * @param id - Poomsae ID
   * @param data - Poomsae data to update
   * @returns Promise<Poomsae>
   */
  update: async (id: number, data: any): Promise<Poomsae> => {
    try {
      const response = await http.patch<Poomsae | { success: boolean; message: string; data: Poomsae }>(`/poomsae/${id}`, data);
      console.log("[PoomsaeApi] Update response:", response.data);
      if (response.data && "id" in response.data && !("success" in response.data)) {
        return response.data as Poomsae;
      }
      return (response.data as { data: Poomsae })?.data || response.data as Poomsae;
    } catch (error: any) {
      console.error(`Error updating poomsae ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete a poomsae (Admin only)
   * @param id - Poomsae ID
   * @returns Promise<boolean>
   */
  delete: async (id: number): Promise<boolean> => {
    try {
      await http.delete(`/poomsae/${id}`);
      return true;
    } catch (error: any) {
      console.error(`Error deleting poomsae ${id}:`, error);
      throw error;
    }
  },

  /**
   * Get poomsae by belt level
   * @param beltLevelId - Belt Level ID
   * @returns Promise<Poomsae[]>
   */
  getByBeltLevel: async (beltLevelId: number): Promise<Poomsae[]> => {
    try {
      const response = await http.get<Poomsae[] | { data: Poomsae[] }>(`/poomsae/belt-level/${beltLevelId}`);
      console.log(`[PoomsaeApi] Raw response for belt level ${beltLevelId}:`, response.data);
      const result = handleResponse<Poomsae[]>(response.data);
      console.log(`[PoomsaeApi] Processed result for belt level ${beltLevelId}:`, result);
      return result;
    } catch (error: any) {
      console.error(`Error fetching poomsae for belt level ${beltLevelId}:`, error);
      return [];
    }
  },
};

export default poomsaeApi;

