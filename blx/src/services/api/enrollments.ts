import http from "@/services/http";

/**
 * Enrollment interface
 */
export interface Enrollment {
  id: number;
  user_id: number;
  course_id: number;
  enrollment_date?: string;
  status?: "pending" | "approved" | "rejected";
  created_at?: string;
  updated_at?: string;
  course?: {
    id: number;
    title: string;
    description?: string;
    level?: string;
  };
}

/**
 * Create enrollment request
 */
export interface CreateEnrollmentRequest {
  course_id: number;
}

/**
 * API service for enrollments
 */
export const enrollmentsApi = {
  /**
   * Get all enrollments for current user
   * @returns Promise<Enrollment[]>
   */
  getMyEnrollments: async (): Promise<Enrollment[]> => {
    try {
      const response = await http.get<Enrollment[] | { data: Enrollment[] }>(
        "/enrollments/me"
      );
      if (Array.isArray(response.data)) {
        return response.data;
      }
      return (response.data as { data: Enrollment[] })?.data || [];
    } catch (error: any) {
      console.error("Error fetching enrollments:", error);
      return [];
    }
  },

  /**
   * Enroll in a course
   * @param courseId - Course ID
   * @returns Promise<Enrollment>
   */
  enroll: async (courseId: number): Promise<Enrollment> => {
    const response = await http.post<Enrollment | { data: Enrollment }>(
      "/enrollments",
      { course_id: courseId }
    );
    if ("id" in response.data && !("data" in response.data)) {
      return response.data as Enrollment;
    }
    return (response.data as { data: Enrollment })?.data;
  },

  /**
   * Cancel enrollment
   * @param enrollmentId - Enrollment ID
   * @returns Promise<void>
   */
  cancel: async (enrollmentId: number): Promise<void> => {
    await http.delete(`/enrollments/${enrollmentId}`);
  },

  /**
   * Check if user is enrolled in a course
   * @param courseId - Course ID
   * @returns Promise<boolean>
   */
  isEnrolled: async (courseId: number): Promise<boolean> => {
    try {
      const enrollments = await enrollmentsApi.getMyEnrollments();
      return enrollments.some(
        (enrollment) =>
          enrollment.course_id === courseId &&
          (enrollment.status === "approved" || enrollment.status === "pending")
      );
    } catch (error) {
      console.error("Error checking enrollment:", error);
      return false;
    }
  },
};

