import http from "@/services/http";

/**
 * Setting interface
 */
export interface Setting {
  id: number;
  key: string;
  value: string;
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
 * API service for settings
 */
export const settingsApi = {
  /**
   * Get all settings
   * @returns Promise<Setting[]>
   */
  getAll: async (): Promise<Setting[]> => {
    try {
      const response = await http.get("/settings");
      return handleResponse<Setting[]>(response.data);
    } catch (error: any) {
      console.error("Error fetching settings:", error);
      return [];
    }
  },

  /**
   * Update settings (Admin only)
   * @param data - Settings data
   * @returns Promise<Setting[]>
   */
  update: async (data: any): Promise<Setting[]> => {
    try {
      const response = await http.patch<Setting[] | { success: boolean; message: string; data: Setting[] }>("/settings", data);
      console.log("[SettingsApi] Update response:", response.data);
      if (Array.isArray(response.data)) {
        return response.data;
      }
      return (response.data as { data: Setting[] })?.data || [];
    } catch (error: any) {
      console.error("Error updating settings:", error);
      throw error;
    }
  },
};

export default settingsApi;

