import http from "@/services/http";

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
 * API service for branches
 */
export const branchesApi = {
  /**
   * Get all branches
   * @returns Promise<Branch[]>
   */
  getAll: async (): Promise<Branch[]> => {
    try {
      const response = await http.get("/branches");
      return handleResponse<Branch[]>(response.data);
    } catch (error: any) {
      console.error("Error fetching branches:", error);
      return [];
    }
  },

  /**
   * Get branch by ID
   * @param id - Branch ID
   * @returns Promise<Branch | null>
   */
  getById: async (id: number): Promise<Branch | null> => {
    try {
      const response = await http.get(`/branches/${id}`);
      return handleResponse<Branch>(response.data);
    } catch (error: any) {
      console.error(`Error fetching branch ${id}:`, error);
      return null;
    }
  },

  /**
   * Create a new branch (Admin only)
   * @param data - Branch data
   * @returns Promise<Branch>
   */
  create: async (data: any): Promise<Branch> => {
    try {
      const response = await http.post<Branch | { success: boolean; message: string; data: Branch }>("/branches", data);
      console.log("[BranchesApi] Create response:", response.data);
      if (response.data && "id" in response.data && !("success" in response.data)) {
        return response.data as Branch;
      }
      return (response.data as { data: Branch })?.data || response.data as Branch;
    } catch (error: any) {
      console.error("Error creating branch:", error);
      throw error;
    }
  },

  /**
   * Update an existing branch (Admin only)
   * @param id - Branch ID
   * @param data - Branch data to update
   * @returns Promise<Branch>
   */
  update: async (id: number, data: any): Promise<Branch> => {
    try {
      const response = await http.patch<Branch | { success: boolean; message: string; data: Branch }>(`/branches/${id}`, data);
      console.log("[BranchesApi] Update response:", response.data);
      if (response.data && "id" in response.data && !("success" in response.data)) {
        return response.data as Branch;
      }
      return (response.data as { data: Branch })?.data || response.data as Branch;
    } catch (error: any) {
      console.error(`Error updating branch ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete a branch (Admin only)
   * @param id - Branch ID
   * @returns Promise<boolean>
   */
  delete: async (id: number): Promise<boolean> => {
    try {
      await http.delete(`/branches/${id}`);
      return true;
    } catch (error: any) {
      console.error(`Error deleting branch ${id}:`, error);
      throw error;
    }
  },
};

export default branchesApi;

