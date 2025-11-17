import http from "@/services/http";

/**
 * Belt Level interface
 */
export interface BeltLevel {
  id: number;
  name: string;
  color?: string;
  order?: number; // Alias cho order_sequence
  order_sequence?: number; // Backend field name
  description?: string;
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
 * API service for belt levels
 */
export const beltLevelsApi = {
  /**
   * Get all belt levels
   * @returns Promise<BeltLevel[]>
   */
  getAll: async (): Promise<BeltLevel[]> => {
    try {
      const response = await http.get("/belt-levels");
      return handleResponse<BeltLevel[]>(response.data);
    } catch (error: any) {
      console.error("Error fetching belt levels:", error);
      return [];
    }
  },

  /**
   * Get belt level by ID
   * @param id - Belt Level ID
   * @returns Promise<BeltLevel | null>
   */
  getById: async (id: number): Promise<BeltLevel | null> => {
    try {
      const response = await http.get(`/belt-levels/${id}`);
      return handleResponse<BeltLevel>(response.data);
    } catch (error: any) {
      console.error(`Error fetching belt level ${id}:`, error);
      return null;
    }
  },

  /**
   * Create a new belt level (Admin only)
   * @param data - Belt Level data
   * @returns Promise<BeltLevel>
   */
  create: async (data: any): Promise<BeltLevel> => {
    try {
      const response = await http.post<BeltLevel | { success: boolean; message: string; data: BeltLevel }>("/belt-levels", data);
      console.log("[BeltLevelsApi] Create response:", response.data);
      if (response.data && "id" in response.data && !("success" in response.data)) {
        return response.data as BeltLevel;
      }
      return (response.data as { data: BeltLevel })?.data || response.data as BeltLevel;
    } catch (error: any) {
      console.error("Error creating belt level:", error);
      throw error;
    }
  },

  /**
   * Update an existing belt level (Admin only)
   * @param id - Belt Level ID
   * @param data - Belt Level data to update
   * @returns Promise<BeltLevel>
   */
  update: async (id: number, data: any): Promise<BeltLevel> => {
    try {
      const response = await http.patch<BeltLevel | { success: boolean; message: string; data: BeltLevel }>(`/belt-levels/${id}`, data);
      console.log("[BeltLevelsApi] Update response:", response.data);
      if (response.data && "id" in response.data && !("success" in response.data)) {
        return response.data as BeltLevel;
      }
      return (response.data as { data: BeltLevel })?.data || response.data as BeltLevel;
    } catch (error: any) {
      console.error(`Error updating belt level ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete a belt level (Admin only)
   * @param id - Belt Level ID
   * @returns Promise<boolean>
   */
  delete: async (id: number): Promise<boolean> => {
    try {
      await http.delete(`/belt-levels/${id}`);
      return true;
    } catch (error: any) {
      console.error(`Error deleting belt level ${id}:`, error);
      throw error;
    }
  },

  /**
   * Get poomsae by belt level
   * @param beltLevelId - Belt Level ID
   * @returns Promise<any[]>
   */
  getByBeltLevel: async (beltLevelId: number): Promise<any[]> => {
    try {
      const response = await http.get(`/belt-levels/${beltLevelId}/poomsae`);
      return handleResponse<any[]>(response.data);
    } catch (error: any) {
      console.error(`Error fetching poomsae for belt level ${beltLevelId}:`, error);
      return [];
    }
  },

  /**
   * Get required poomsae by belt level
   * @param beltLevelId - Belt Level ID
   * @returns Promise<any[]>
   */
  getRequiredByBeltLevel: async (beltLevelId: number): Promise<any[]> => {
    try {
      const response = await http.get(`/belt-levels/${beltLevelId}/required-poomsae`);
      return handleResponse<any[]>(response.data);
    } catch (error: any) {
      console.error(`Error fetching required poomsae for belt level ${beltLevelId}:`, error);
      return [];
    }
  },

  /**
   * Link poomsae to belt level
   * @param beltLevelId - Belt Level ID
   * @param poomsaeId - Poomsae ID
   * @returns Promise<boolean>
   */
  linkBeltLevel: async (beltLevelId: number, poomsaeId: number): Promise<boolean> => {
    try {
      await http.post(`/belt-levels/${beltLevelId}/poomsae/${poomsaeId}`);
      return true;
    } catch (error: any) {
      console.error(`Error linking poomsae ${poomsaeId} to belt level ${beltLevelId}:`, error);
      throw error;
    }
  },

  /**
   * Unlink poomsae from belt level
   * @param beltLevelId - Belt Level ID
   * @param poomsaeId - Poomsae ID
   * @returns Promise<boolean>
   */
  unlinkBeltLevel: async (beltLevelId: number, poomsaeId: number): Promise<boolean> => {
    try {
      await http.delete(`/belt-levels/${beltLevelId}/poomsae/${poomsaeId}`);
      return true;
    } catch (error: any) {
      console.error(`Error unlinking poomsae ${poomsaeId} from belt level ${beltLevelId}:`, error);
      throw error;
    }
  },
};

export default beltLevelsApi;

