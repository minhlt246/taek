import http from "@/services/http";

/**
 * News interface
 */
export interface News {
  id: number;
  title: string;
  slug: string;
  content?: string;
  excerpt?: string;
  author_id?: number;
  featured_image_url?: string;
  images?: string; // JSON string array
  is_published?: boolean;
  published_at?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * News type/category mapping
 */
export const getNewsTypeLabel = (slug?: string, title?: string): string => {
  if (!slug && !title) return "Tin tức";

  const lowerSlug = slug?.toLowerCase() || "";
  const lowerTitle = title?.toLowerCase() || "";

  if (lowerSlug.includes("su-kien") || lowerTitle.includes("sự kiện")) {
    return "Sự kiện";
  }
  if (lowerSlug.includes("thanh-tich") || lowerTitle.includes("thành tích")) {
    return "Thành tích";
  }
  if (lowerSlug.includes("thong-bao") || lowerTitle.includes("thông báo")) {
    return "Thông báo";
  }
  return "Tin tức";
};

/**
 * Format date from API
 */
export const formatNewsDate = (dateString?: string): string => {
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
 * Parse images from JSON string
 */
export const parseNewsImages = (images?: string): string[] => {
  if (!images) return [];
  try {
    const parsed = JSON.parse(images);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

/**
 * API response interface
 */
export interface NewsResponse {
  data: News[];
  message?: string;
}

/**
 * API service for news
 */
export const newsApi = {
  /**
   * Get all published news
   * @returns Promise<News[]>
   */
  getAll: async (): Promise<News[]> => {
    try {
      const response = await http.get<NewsResponse | News[]>("/news/published");
      // Handle different response formats
      if (Array.isArray(response.data)) {
        return response.data;
      }
      return (response.data as NewsResponse)?.data || [];
    } catch (error: any) {
      if (error.code === "ECONNREFUSED" || error.message === "Network Error") {
        console.warn(
          "API server is not running. Please start the backend server."
        );
      } else {
        console.error("Error fetching news:", error);
      }
      return [];
    }
  },

  /**
   * Get news by ID
   * @param id - News ID
   * @returns Promise<News | null>
   */
  getById: async (id: number): Promise<News | null> => {
    try {
      const response = await http.get<News | { data: News }>(`/news/${id}`);
      if (!response.data) {
        return null;
      }
      if ("id" in response.data && !("data" in response.data)) {
        return response.data as News;
      }
      return (response.data as { data: News })?.data || null;
    } catch (error: any) {
      if (error.code === "ECONNREFUSED" || error.message === "Network Error") {
        console.warn(
          "API server is not running. Please start the backend server."
        );
      } else {
        console.error(`Error fetching news ${id}:`, error);
      }
      return null;
    }
  },

  /**
   * Get news by slug
   * @param slug - News slug
   * @returns Promise<News | null>
   */
  getBySlug: async (slug: string): Promise<News | null> => {
    try {
      const response = await http.get<News | { data: News }>(
        `/news/slug/${slug}`
      );
      if (!response.data) {
        return null;
      }
      if ("id" in response.data && !("data" in response.data)) {
        return response.data as News;
      }
      return (response.data as { data: News })?.data || null;
    } catch (error: any) {
      if (error.code === "ECONNREFUSED" || error.message === "Network Error") {
        console.warn(
          "API server is not running. Please start the backend server."
        );
      } else {
        console.error(`Error fetching news by slug ${slug}:`, error);
      }
      return null;
    }
  },

  /**
   * Get all news including unpublished (Admin only) with pagination
   * @param page - Page number (default: 1)
   * @param limit - Items per page (default: 25)
   * @returns Promise with paginated news
   */
  getAllAdmin: async (
    page: number = 1,
    limit: number = 25
  ): Promise<
    | News[]
    | {
        docs: News[];
        totalDocs: number;
        limit: number;
        page: number;
        totalPages: number;
      }
  > => {
    try {
      const response = await http.get<
        | NewsResponse
        | News[]
        | {
            docs: News[];
            totalDocs: number;
            limit: number;
            page: number;
            totalPages: number;
          }
      >("/news", { params: { page, limit } });

      // Handle paginated response
      if (
        response.data &&
        typeof response.data === "object" &&
        "docs" in response.data
      ) {
        return response.data as {
          docs: News[];
          totalDocs: number;
          limit: number;
          page: number;
          totalPages: number;
        };
      }

      // Handle different response formats
      if (Array.isArray(response.data)) {
        return response.data;
      }
      return (response.data as NewsResponse)?.data || [];
    } catch (error: any) {
      console.error("Error fetching all news:", error);
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
   * Create a new news (Admin only)
   * @param data - News data
   * @returns Promise<News>
   */
  create: async (data: any): Promise<News> => {
    try {
      const response = await http.post<
        News | { success: boolean; message: string; data: News }
      >("/news", data);
      console.log("[NewsApi] Create response:", response.data);
      // Handle response format: { success, message, data } or direct News
      if (
        response.data &&
        "id" in response.data &&
        !("success" in response.data)
      ) {
        return response.data as News;
      }
      return (response.data as { data: News })?.data || (response.data as News);
    } catch (error: any) {
      console.error("Error creating news:", error);
      throw error;
    }
  },

  /**
   * Update an existing news (Admin only)
   * @param id - News ID
   * @param data - News data to update
   * @returns Promise<News>
   */
  update: async (id: number, data: any): Promise<News> => {
    try {
      const response = await http.patch<
        News | { success: boolean; message: string; data: News }
      >(`/news/${id}`, data);
      console.log("[NewsApi] Update response:", response.data);
      // Handle response format: { success, message, data } or direct News
      if (
        response.data &&
        "id" in response.data &&
        !("success" in response.data)
      ) {
        return response.data as News;
      }
      return (response.data as { data: News })?.data || (response.data as News);
    } catch (error: any) {
      console.error(`Error updating news ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete a news (Admin only)
   * @param id - News ID
   * @returns Promise<boolean>
   */
  delete: async (id: number): Promise<boolean> => {
    try {
      await http.delete(`/news/${id}`);
      return true;
    } catch (error: any) {
      console.error(`Error deleting news ${id}:`, error);
      throw error;
    }
  },
};

export default newsApi;
