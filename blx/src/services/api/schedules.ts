import http from "@/services/http";

/**
 * Schedule interface matching backend entity
 */
export interface ScheduleResponse {
  id: number;
  club_id?: number;
  branch_id?: number;
  day_of_week: string;
  start_time?: string; // Format: "HH:mm:ss" or "HH:mm"
  end_time?: string; // Format: "HH:mm:ss" or "HH:mm"
  location?: string;
  created_at?: string;
  updated_at?: string;
  club?: {
    id: number;
    name: string;
    club_code?: string;
  };
  branch?: {
    id: number;
    name: string;
    branch_code?: string;
  };
}

/**
 * Frontend Schedule interface
 */
export interface Schedule {
  id: number;
  day: string; // Vietnamese day name: "Thứ 2", "Thứ 3", etc.
  date: string; // "Hàng tuần" or specific date
  time: string; // "06:00 - 07:30"
  startTime: string; // "06:00"
  endTime: string; // "07:30"
  className: string; // Course title
  level: string; // Vietnamese level: "Cơ bản", "Trung cấp", "Nâng cao"
  instructor: string; // Coach name
  location?: string;
  courseId?: number;
}

/**
 * Grouped schedule by day
 */
export interface ScheduleGroup {
  day: string; // Vietnamese day name
  date: string; // "Hàng tuần"
  classes: Array<{
    time: string;
    name: string;
    level: string;
    instructor: string;
    location?: string;
  }>;
}

/**
 * Map day of week from English to Vietnamese
 */
const getDayName = (dayOfWeek: string): string => {
  const dayMap: Record<string, string> = {
    Monday: "Thứ 2",
    Tuesday: "Thứ 3",
    Wednesday: "Thứ 4",
    Thursday: "Thứ 5",
    Friday: "Thứ 6",
    Saturday: "Thứ 7",
    Sunday: "Chủ nhật",
  };
  return dayMap[dayOfWeek] || dayOfWeek;
};

/**
 * Format time from "HH:mm:ss" or "HH:mm" to "HH:mm"
 */
const formatTime = (time?: string): string => {
  if (!time) return "";
  // Handle both "HH:mm:ss" and "HH:mm" formats
  return time.substring(0, 5);
};

/**
 * Format time range
 */
const formatTimeRange = (startTime?: string, endTime?: string): string => {
  const start = formatTime(startTime);
  const end = formatTime(endTime);
  if (!start && !end) return "";
  if (!start) return end;
  if (!end) return start;
  return `${start} - ${end}`;
};

/**
 * Get course level label in Vietnamese
 */
const getLevelLabel = (level?: string): string => {
  switch (level) {
    case "beginner":
      return "Cơ bản";
    case "intermediate":
      return "Trung cấp";
    case "advanced":
      return "Nâng cao";
    default:
      return "Tất cả";
  }
};

/**
 * Map backend ScheduleResponse to frontend Schedule
 */
const mapScheduleResponse = (response: ScheduleResponse): Schedule => {
  return {
    id: response.id,
    day: getDayName(response.day_of_week),
    date: "Hàng tuần",
    time: formatTimeRange(response.start_time, response.end_time),
    startTime: formatTime(response.start_time),
    endTime: formatTime(response.end_time),
    className: response.course?.title || "Lớp học",
    level: getLevelLabel(response.course?.level),
    instructor: response.course?.coach?.name || "HLV",
    location: response.location,
    courseId: response.course_id,
  };
};

/**
 * Group schedules by day
 */
const groupSchedulesByDay = (schedules: Schedule[]): ScheduleGroup[] => {
  const grouped = schedules.reduce((acc, schedule) => {
    const existingGroup = acc.find((g) => g.day === schedule.day);
    if (existingGroup) {
      existingGroup.classes.push({
        time: schedule.time,
        name: schedule.className,
        level: schedule.level,
        instructor: schedule.instructor,
        location: schedule.location,
      });
    } else {
      acc.push({
        day: schedule.day,
        date: schedule.date,
        classes: [
          {
            time: schedule.time,
            name: schedule.className,
            level: schedule.level,
            instructor: schedule.instructor,
            location: schedule.location,
          },
        ],
      });
    }
    return acc;
  }, [] as ScheduleGroup[]);

  // Sort by day order (Thứ 2 -> Chủ nhật)
  const dayOrder = [
    "Thứ 2",
    "Thứ 3",
    "Thứ 4",
    "Thứ 5",
    "Thứ 6",
    "Thứ 7",
    "Chủ nhật",
  ];
  return grouped.sort(
    (a, b) => dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day)
  );
};

/**
 * API service for schedules
 */
export const schedulesApi = {
  /**
   * Get all schedules
   * @returns Promise<ScheduleGroup[]>
   */
  getAll: async (): Promise<ScheduleGroup[]> => {
    try {
      const response = await http.get<ScheduleResponse[] | { data: ScheduleResponse[] }>(
        "/schedules"
      );

      // Debug logging
      if (process.env.NODE_ENV === "development") {
        console.log("[Schedules API] Raw response:", response.data);
      }

      // Handle different response formats
      let schedulesData: ScheduleResponse[] = [];
      if (Array.isArray(response.data)) {
        schedulesData = response.data;
      } else {
        schedulesData = (response.data as { data: ScheduleResponse[] })?.data || [];
      }

      // Map to frontend Schedule interface
      const mappedSchedules = schedulesData.map(mapScheduleResponse);

      // Group by day
      const grouped = groupSchedulesByDay(mappedSchedules);

      if (process.env.NODE_ENV === "development") {
        console.log("[Schedules API] Mapped and grouped schedules:", grouped);
      }

      return grouped;
    } catch (error: any) {
      if (error.code === "ECONNREFUSED" || error.message === "Network Error") {
        console.warn(
          "API server is not running. Please start the backend server."
        );
      } else {
        console.error("Error fetching schedules:", error);
        console.error("Error details:", error.response?.data || error.message);
      }
      return [];
    }
  },

  /**
   * Get schedule by ID
   * @param id - Schedule ID
   * @returns Promise<Schedule | null>
   */
  getById: async (id: number): Promise<Schedule | null> => {
    try {
      const response = await http.get<ScheduleResponse | { data: ScheduleResponse }>(
        `/schedules/${id}`
      );
      if (!response.data) {
        return null;
      }
      let scheduleData: ScheduleResponse | null = null;
      if (
        response.data &&
        "id" in response.data &&
        !("data" in response.data)
      ) {
        scheduleData = response.data as ScheduleResponse;
      } else {
        scheduleData = (response.data as { data: ScheduleResponse })?.data || null;
      }
      return scheduleData ? mapScheduleResponse(scheduleData) : null;
    } catch (error: any) {
      if (error.code === "ECONNREFUSED" || error.message === "Network Error") {
        console.warn(
          "API server is not running. Please start the backend server."
        );
      } else {
        console.error(`Error fetching schedule ${id}:`, error);
      }
      return null;
    }
  },

  /**
   * Get schedules by day of week
   * @param dayOfWeek - Day of week (Monday, Tuesday, etc.)
   * @returns Promise<ScheduleGroup[]>
   */
  getByDay: async (dayOfWeek: string): Promise<ScheduleGroup[]> => {
    try {
      const response = await http.get<ScheduleResponse[] | { data: ScheduleResponse[] }>(
        `/schedules/day/${dayOfWeek}`
      );
      let schedulesData: ScheduleResponse[] = [];
      if (Array.isArray(response.data)) {
        schedulesData = response.data;
      } else {
        schedulesData = (response.data as { data: ScheduleResponse[] })?.data || [];
      }
      const mappedSchedules = schedulesData.map(mapScheduleResponse);
      return groupSchedulesByDay(mappedSchedules);
    } catch (error: any) {
      if (error.code === "ECONNREFUSED" || error.message === "Network Error") {
        console.warn(
          "API server is not running. Please start the backend server."
        );
      } else {
        console.error(`Error fetching schedules for ${dayOfWeek}:`, error);
      }
      return [];
    }
  },

  /**
   * Get schedules by course ID
   * @param courseId - Course ID
   * @returns Promise<ScheduleGroup[]>
   */
  getByCourse: async (courseId: number): Promise<ScheduleGroup[]> => {
    try {
      const response = await http.get<ScheduleResponse[] | { data: ScheduleResponse[] }>(
        `/schedules/course/${courseId}`
      );
      let schedulesData: ScheduleResponse[] = [];
      if (Array.isArray(response.data)) {
        schedulesData = response.data;
      } else {
        schedulesData = (response.data as { data: ScheduleResponse[] })?.data || [];
      }
      const mappedSchedules = schedulesData.map(mapScheduleResponse);
      return groupSchedulesByDay(mappedSchedules);
    } catch (error: any) {
      if (error.code === "ECONNREFUSED" || error.message === "Network Error") {
        console.warn(
          "API server is not running. Please start the backend server."
        );
      } else {
        console.error(`Error fetching schedules for course ${courseId}:`, error);
      }
      return [];
    }
  },

  /**
   * Create a new schedule
   * @param data - Schedule data
   * @returns Promise<ScheduleResponse | null>
   */
  create: async (data: {
    club_id: number;
    branch_id: number;
    day_of_week: string;
    start_time?: string;
    end_time?: string;
    location?: string;
  }): Promise<ScheduleResponse | null> => {
    try {
      const response = await http.post<
        ScheduleResponse | { success: boolean; message: string; data: ScheduleResponse }
      >("/schedules", data);
      
      if (response.data && "id" in response.data && !("success" in response.data)) {
        return response.data as ScheduleResponse;
      }
      return (response.data as { data: ScheduleResponse })?.data || null;
    } catch (error: any) {
      console.error("Error creating schedule:", error);
      throw error;
    }
  },

  /**
   * Update a schedule
   * @param id - Schedule ID
   * @param data - Schedule data to update
   * @returns Promise<ScheduleResponse | null>
   */
  update: async (
    id: number,
    data: {
      club_id?: number;
      branch_id?: number;
      day_of_week?: string;
      start_time?: string;
      end_time?: string;
      location?: string;
    }
  ): Promise<ScheduleResponse | null> => {
    try {
      const response = await http.patch<
        ScheduleResponse | { success: boolean; message: string; data: ScheduleResponse }
      >(`/schedules/${id}`, data);
      
      if (response.data && "id" in response.data && !("success" in response.data)) {
        return response.data as ScheduleResponse;
      }
      return (response.data as { data: ScheduleResponse })?.data || null;
    } catch (error: any) {
      console.error(`Error updating schedule ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete a schedule
   * @param id - Schedule ID
   * @returns Promise<boolean>
   */
  delete: async (id: number): Promise<boolean> => {
    try {
      await http.delete(`/schedules/${id}`);
      return true;
    } catch (error: any) {
      console.error(`Error deleting schedule ${id}:`, error);
      throw error;
    }
  },
};

export default schedulesApi;

