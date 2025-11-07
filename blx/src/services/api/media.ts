import http from "@/services/http";

/**
 * Media interface
 */
export interface Media {
  id: number;
  title: string;
  description?: string;
  file_url: string;
  file_type: 'image' | 'video';
  mime_type?: string;
  file_size?: number;
  club_id?: number;
  branch_id?: number;
  created_by?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  club?: {
    id: number;
    name: string;
    club_code: string;
  };
  branch?: {
    id: number;
    name: string;
    branch_code: string;
  };
}

/**
 * Create Media DTO
 */
export interface CreateMediaDto {
  title: string;
  description?: string;
  file_url: string;
  file_type: 'image' | 'video';
  mime_type?: string;
  file_size?: number;
  club_id?: number;
  branch_id?: number;
  created_by?: number;
  is_active?: boolean;
}

/**
 * Update Media DTO
 */
export interface UpdateMediaDto {
  title?: string;
  description?: string;
  file_url?: string;
  file_type?: 'image' | 'video';
  mime_type?: string;
  file_size?: number;
  club_id?: number;
  branch_id?: number;
  is_active?: boolean;
}

/**
 * Format file size to human readable format
 */
export const formatFileSize = (bytes?: number): string => {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Format date from API
 */
export const formatMediaDate = (dateString?: string): string => {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return "";
  }
};

/**
 * API service for media
 */
export const mediaApi = {
  /**
   * Get all media
   * @param type - Optional filter by type (image or video)
   * @returns Promise<Media[]>
   */
  getAll: async (type?: 'image' | 'video'): Promise<Media[]> => {
    try {
      const url = type ? `/media?type=${type}` : '/media';
      const response = await http.get<Media[]>(url);
      return Array.isArray(response.data) ? response.data : [];
    } catch (error: any) {
      if (error.code === "ECONNREFUSED" || error.message === "Network Error") {
        console.warn(
          "API server is not running. Please start the backend server."
        );
      } else {
        console.error("Error fetching media:", error);
      }
      return [];
    }
  },

  /**
   * Get active media only
   * @returns Promise<Media[]>
   */
  getActive: async (): Promise<Media[]> => {
    try {
      const response = await http.get<Media[]>('/media/active');
      return Array.isArray(response.data) ? response.data : [];
    } catch (error: any) {
      if (error.code === "ECONNREFUSED" || error.message === "Network Error") {
        console.warn(
          "API server is not running. Please start the backend server."
        );
      } else {
        console.error("Error fetching active media:", error);
      }
      return [];
    }
  },

  /**
   * Get media by ID
   * @param id - Media ID
   * @returns Promise<Media | null>
   */
  getById: async (id: number): Promise<Media | null> => {
    try {
      const response = await http.get<Media>(`/media/${id}`);
      return response.data || null;
    } catch (error: any) {
      if (error.code === "ECONNREFUSED" || error.message === "Network Error") {
        console.warn(
          "API server is not running. Please start the backend server."
        );
      } else {
        console.error(`Error fetching media ${id}:`, error);
      }
      return null;
    }
  },

  /**
   * Get media by type
   * @param type - Media type (image or video)
   * @returns Promise<Media[]>
   */
  getByType: async (type: 'image' | 'video'): Promise<Media[]> => {
    try {
      const response = await http.get<Media[]>(`/media/type/${type}`);
      return Array.isArray(response.data) ? response.data : [];
    } catch (error: any) {
      if (error.code === "ECONNREFUSED" || error.message === "Network Error") {
        console.warn(
          "API server is not running. Please start the backend server."
        );
      } else {
        console.error(`Error fetching media by type ${type}:`, error);
      }
      return [];
    }
  },

  /**
   * Get media by club
   * @param clubId - Club ID
   * @returns Promise<Media[]>
   */
  getByClub: async (clubId: number): Promise<Media[]> => {
    try {
      const response = await http.get<Media[]>(`/media/club/${clubId}`);
      return Array.isArray(response.data) ? response.data : [];
    } catch (error: any) {
      if (error.code === "ECONNREFUSED" || error.message === "Network Error") {
        console.warn(
          "API server is not running. Please start the backend server."
        );
      } else {
        console.error(`Error fetching media by club ${clubId}:`, error);
      }
      return [];
    }
  },

  /**
   * Get media by branch
   * @param branchId - Branch ID
   * @returns Promise<Media[]>
   */
  getByBranch: async (branchId: number): Promise<Media[]> => {
    try {
      const response = await http.get<Media[]>(`/media/branch/${branchId}`);
      return Array.isArray(response.data) ? response.data : [];
    } catch (error: any) {
      if (error.code === "ECONNREFUSED" || error.message === "Network Error") {
        console.warn(
          "API server is not running. Please start the backend server."
        );
      } else {
        console.error(`Error fetching media by branch ${branchId}:`, error);
      }
      return [];
    }
  },

  /**
   * Create new media
   * @param data - Media data
   * @returns Promise<Media | null>
   */
  create: async (data: CreateMediaDto): Promise<Media | null> => {
    try {
      const response = await http.post<{ success: boolean; message: string; data: Media }>(
        '/media',
        data
      );
      return response.data?.data || null;
    } catch (error: any) {
      if (error.code === "ECONNREFUSED" || error.message === "Network Error") {
        console.warn(
          "API server is not running. Please start the backend server."
        );
      } else {
        console.error("Error creating media:", error);
      }
      return null;
    }
  },

  /**
   * Update media
   * @param id - Media ID
   * @param data - Updated media data
   * @returns Promise<Media | null>
   */
  update: async (id: number, data: UpdateMediaDto): Promise<Media | null> => {
    try {
      const response = await http.patch<{ success: boolean; message: string; data: Media }>(
        `/media/${id}`,
        data
      );
      return response.data?.data || null;
    } catch (error: any) {
      if (error.code === "ECONNREFUSED" || error.message === "Network Error") {
        console.warn(
          "API server is not running. Please start the backend server."
        );
      } else {
        console.error(`Error updating media ${id}:`, error);
      }
      return null;
    }
  },

  /**
   * Delete media
   * @param id - Media ID
   * @returns Promise<boolean>
   */
  delete: async (id: number): Promise<boolean> => {
    try {
      await http.delete(`/media/${id}`);
      return true;
    } catch (error: any) {
      if (error.code === "ECONNREFUSED" || error.message === "Network Error") {
        console.warn(
          "API server is not running. Please start the backend server."
        );
      } else {
        console.error(`Error deleting media ${id}:`, error);
      }
      return false;
    }
  },
};

export default mediaApi;

