import http from "@/services/http";

/**
 * Payment interface
 */
export interface Payment {
  id: number;
  user_id: number;
  course_id?: number;
  amount: number;
  payment_date?: string;
  payment_method?: string;
  status?: string;
  notes?: string;
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
 * API service for payments
 */
export const paymentsApi = {
  /**
   * Get all payments
   * @returns Promise<Payment[]>
   */
  getAll: async (): Promise<Payment[]> => {
    try {
      const response = await http.get("/payments");
      return handleResponse<Payment[]>(response.data);
    } catch (error: any) {
      console.error("Error fetching payments:", error);
      return [];
    }
  },

  /**
   * Get payment by ID
   * @param id - Payment ID
   * @returns Promise<Payment | null>
   */
  getById: async (id: number): Promise<Payment | null> => {
    try {
      const response = await http.get(`/payments/${id}`);
      return handleResponse<Payment>(response.data);
    } catch (error: any) {
      console.error(`Error fetching payment ${id}:`, error);
      return null;
    }
  },
};

export default paymentsApi;

