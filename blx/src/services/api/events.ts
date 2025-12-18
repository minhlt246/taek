import http from "@/services/http";

/**
 * Event interface
 */
export interface Event {
  id: number;
  title: string;
  description?: string;
  event_date?: string;
  location?: string;
  event_type?: string;
  is_published?: boolean;
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
 * API service for events
 */
export const eventsApi = {
  /**
   * Get all events with pagination
   * @param page - Page number (default: 1)
   * @param limit - Items per page (default: 25)
   * @returns Promise with paginated events
   */
  getAll: async (
    page: number = 1,
    limit: number = 25
  ): Promise<
    | Event[]
    | {
        docs: Event[];
        totalDocs: number;
        limit: number;
        page: number;
        totalPages: number;
      }
  > => {
    try {
      const response = await http.get("/events", { params: { page, limit } });

      // Handle paginated response
      if (
        response.data &&
        typeof response.data === "object" &&
        "docs" in response.data
      ) {
        return response.data as {
          docs: Event[];
          totalDocs: number;
          limit: number;
          page: number;
          totalPages: number;
        };
      }

      return handleResponse<Event[]>(response.data);
    } catch (error: any) {
      console.error("Error fetching events:", error);
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
   * Get event by ID
   * @param id - Event ID
   * @returns Promise<Event | null>
   */
  getById: async (id: number): Promise<Event | null> => {
    try {
      const response = await http.get(`/events/${id}`);
      return handleResponse<Event>(response.data);
    } catch (error: any) {
      console.error(`Error fetching event ${id}:`, error);
      return null;
    }
  },

  /**
   * Create a new event (Admin only)
   * @param data - Event data
   * @returns Promise<Event>
   */
  create: async (data: any): Promise<Event> => {
    try {
      const response = await http.post<
        Event | { success: boolean; message: string; data: Event }
      >("/events", data);
      console.log("[EventsApi] Create response:", response.data);
      if (
        response.data &&
        "id" in response.data &&
        !("success" in response.data)
      ) {
        return response.data as Event;
      }
      return (
        (response.data as { data: Event })?.data || (response.data as Event)
      );
    } catch (error: any) {
      console.error("Error creating event:", error);
      throw error;
    }
  },

  /**
   * Update an existing event (Admin only)
   * @param id - Event ID
   * @param data - Event data to update
   * @returns Promise<Event>
   */
  update: async (id: number, data: any): Promise<Event> => {
    try {
      const response = await http.patch<
        Event | { success: boolean; message: string; data: Event }
      >(`/events/${id}`, data);
      console.log("[EventsApi] Update response:", response.data);
      if (
        response.data &&
        "id" in response.data &&
        !("success" in response.data)
      ) {
        return response.data as Event;
      }
      return (
        (response.data as { data: Event })?.data || (response.data as Event)
      );
    } catch (error: any) {
      console.error(`Error updating event ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete an event (Admin only)
   * @param id - Event ID
   * @returns Promise<boolean>
   */
  delete: async (id: number): Promise<boolean> => {
    try {
      await http.delete(`/events/${id}`);
      return true;
    } catch (error: any) {
      console.error(`Error deleting event ${id}:`, error);
      throw error;
    }
  },
};

export default eventsApi;
