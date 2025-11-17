import http from "@/services/http";

/**
 * Course interface
 */
export interface Course {
  id: number;
  title: string;
  description?: string;
  level?: "beginner" | "intermediate" | "advanced";
  quarter?: "Q1" | "Q2" | "Q3" | "Q4";
  year?: number;
  coach_id?: number;
  club_id?: number;
  branch_id?: number;
  start_date?: string;
  end_date?: string;
  current_students?: number;
  image_url?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  coach?: {
    id: number;
    name: string;
    role?: string;
  };
  branch?: {
    id: number;
    name: string;
    address?: string;
  };
  club?: {
    id: number;
    name: string;
  };
}

/**
 * API response interface
 */
export interface CoursesResponse {
  data: Course[];
  message?: string;
}

/**
 * Format course level to Vietnamese
 */
export const getCourseLevelLabel = (level?: string): string => {
  switch (level) {
    case "beginner":
      return "Cơ bản";
    case "intermediate":
      return "Trung cấp";
    case "advanced":
      return "Nâng cao";
    default:
      return "Cơ bản";
  }
};

/**
 * API service for courses
 */
export const coursesApi = {
  /**
   * Get all courses (for admin: include inactive, for client: only active)
   * @param includeInactive - Include inactive courses (default: false)
   * @returns Promise<Course[]>
   */
  getAll: async (includeInactive: boolean = false): Promise<Course[]> => {
    try {
      const url = includeInactive ? "/courses?includeInactive=true" : "/courses";
      const response = await http.get<CoursesResponse | Course[]>(url);
      // Handle different response formats
      if (Array.isArray(response.data)) {
        return includeInactive 
          ? response.data 
          : response.data.filter((course) => course.is_active !== false);
      }
      const courses = (response.data as CoursesResponse)?.data || [];
      return includeInactive 
        ? courses 
        : courses.filter((course) => course.is_active !== false);
    } catch (error: any) {
      // http.ts đã log lỗi 500+ và connection errors rồi, không cần log lại ở đây
      return [];
    }
  },

  /**
   * Get course by ID
   * @param id - Course ID
   * @returns Promise<Course | null>
   */
  getById: async (id: number): Promise<Course | null> => {
    try {
      const response = await http.get<Course | { data: Course }>(`/courses/${id}`);
      if (!response.data) {
        return null;
      }
      if ("id" in response.data && !("data" in response.data)) {
        return response.data as Course;
      }
      return (response.data as { data: Course })?.data || null;
    } catch (error: any) {
      if (error.code === "ECONNREFUSED" || error.message === "Network Error") {
        console.warn(
          "API server is not running. Please start the backend server."
        );
      } else {
        console.error(`Error fetching course ${id}:`, error);
      }
      return null;
    }
  },

  /**
   * Get course detail with student count
   * @param id - Course ID
   * @returns Promise<Course & { studentCount: number } | null>
   */
  getDetail: async (id: number): Promise<(Course & { studentCount: number }) | null> => {
    try {
      const response = await http.get<Course & { studentCount: number }>(
        `/courses/${id}/detail`
      );
      return response.data || null;
    } catch (error: any) {
      console.error(`Error fetching course detail ${id}:`, error);
      return null;
    }
  },

  /**
   * Create a new course (Admin only)
   * @param data - Course data
   * @returns Promise<Course>
   */
  create: async (data: any): Promise<Course> => {
    try {
      const response = await http.post<{ success: boolean; message: string; data: Course } | Course>("/courses", data);
      console.log("[CoursesApi] Create response:", response.data);
      // Handle response format: { success, message, data } or direct Course
      if (response.data && "id" in response.data && !("success" in response.data)) {
        return response.data as Course;
      }
      return (response.data as { data: Course })?.data || response.data as Course;
    } catch (error: any) {
      console.error("Error creating course:", error);
      throw error;
    }
  },

  /**
   * Update an existing course (Admin only)
   * @param id - Course ID
   * @param data - Course data to update
   * @returns Promise<Course>
   */
  update: async (id: number, data: any): Promise<Course> => {
    try {
      const response = await http.patch<{ success: boolean; message: string; data: Course } | Course>(`/courses/${id}`, data);
      console.log("[CoursesApi] Update response:", response.data);
      // Handle response format: { success, message, data } or direct Course
      if (response.data && "id" in response.data && !("success" in response.data)) {
        return response.data as Course;
      }
      return (response.data as { data: Course })?.data || response.data as Course;
    } catch (error: any) {
      console.error(`Error updating course ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete a course (Admin only)
   * @param id - Course ID
   * @returns Promise<boolean>
   */
  delete: async (id: number): Promise<boolean> => {
    try {
      await http.delete(`/courses/${id}`);
      return true;
    } catch (error: any) {
      console.error(`Error deleting course ${id}:`, error);
      throw error;
    }
  },
};

export default coursesApi;

