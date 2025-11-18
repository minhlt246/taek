import http from "@/services/http";

export interface CreateTicketDto {
  title: string;
  category: string;
  text: string;
  image1?: string;
}

export interface Ticket {
  id: string;
  title: string;
  userId: number;
  category: string;
  status: string;
  text: string;
  image1?: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    firstName: string;
    lastName: string;
    username: string;
  };
}

export interface SupportCategory {
  value: string;
  label: string;
}

export interface GetMyTicketsParams {
  page?: number;
  limit?: number;
  query?: {
    status?: string;
    date?: string;
  };
}

export interface GetMyTicketsResponse {
  docs: Ticket[];
  limit: number;
  page: number;
  totalDocs: number;
  totalPages: number;
}

export interface UploadResponse {
  url?: string;
  fullUrl?: string;
  path?: string;
}

export const supportApi = {
  async getSupportCategories(): Promise<{
    success: boolean;
    data: SupportCategory[];
  }> {
    const response = await http.get("/support/categories");
    return response.data;
  },

  async getMyTickets(
    params: GetMyTicketsParams
  ): Promise<GetMyTicketsResponse> {
    const response = await http.get("/support/tickets", { params });
    return response.data;
  },

  async createTicket(
    ticketData: CreateTicketDto
  ): Promise<{ success: boolean; message?: string; data?: Ticket }> {
    const response = await http.post("/support/tickets", ticketData);
    return response.data;
  },

  async getTicketDetail(ticketId: string): Promise<any> {
    const response = await http.get(`/support/tickets/${ticketId}`);
    return response.data;
  },

  async getTicketReplies(ticketId: string): Promise<any[]> {
    const response = await http.get(`/support/tickets/${ticketId}/replies`);
    return response.data?.data || response.data || [];
  },

  async replyToTicket(
    ticketId: string,
    text: string
  ): Promise<{ success: boolean; message?: string }> {
    const response = await http.post(`/support/tickets/${ticketId}/replies`, {
      text,
    });
    return response.data;
  },

  async uploadImage(file: File): Promise<UploadResponse[]> {
    const formData = new FormData();
    formData.append("file", file);
    const response = await http.post("/support/upload/image", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data?.data || response.data || [];
  },

  async uploadFile(file: File): Promise<UploadResponse[]> {
    const formData = new FormData();
    formData.append("file", file);
    const response = await http.post("/support/upload/file", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data?.data || response.data || [];
  },

  async closeTicket(
    ticketId: string
  ): Promise<{ success: boolean; message?: string }> {
    const response = await http.patch(`/support/tickets/${ticketId}/close`);
    return response.data;
  },
};

