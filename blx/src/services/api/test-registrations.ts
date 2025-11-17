import http from "@/services/http";

export interface TestRegistration {
  id: number;
  test_id?: number;
  user_id: number;
  current_belt_id: number;
  target_belt_id: number;
  registration_date: string;
  payment_status: 'paid' | 'pending';
  test_result: 'pass' | 'fail' | 'pending';
  score?: number;
  examiner_notes?: string;
  created_at: string;
  test_exam?: any;
  user?: any;
  current_belt?: any;
  target_belt?: any;
}

export interface CreateTestRegistrationDto {
  test_id: number;
  user_id: number;
  current_belt_id: number;
  target_belt_id: number;
  registration_date?: string;
  payment_status?: 'paid' | 'pending';
  test_result?: 'pass' | 'fail' | 'pending';
  score?: number;
  examiner_notes?: string;
}

export interface ImportExcelResponse {
  success: boolean;
  message: string;
  data: {
    imported: number;
    failed: number;
    errors: string[];
    testExamId?: number;
  };
}

export const testRegistrationsApi = {
  async getAll(): Promise<TestRegistration[]> {
    const response = await http.get('/test-registrations');
    return response.data;
  },

  async getById(id: number): Promise<TestRegistration> {
    const response = await http.get(`/test-registrations/${id}`);
    return response.data;
  },

  async getByTest(testId: number): Promise<TestRegistration[]> {
    const response = await http.get(`/test-registrations/test/${testId}`);
    return response.data;
  },

  async getByUser(userId: number): Promise<TestRegistration[]> {
    const response = await http.get(`/test-registrations/user/${userId}`);
    return response.data;
  },

  async create(
    data: CreateTestRegistrationDto,
  ): Promise<{ success: boolean; message: string; data: TestRegistration }> {
    const response = await http.post('/test-registrations', data);
    return response.data;
  },

  async update(
    id: number,
    data: Partial<CreateTestRegistrationDto>,
  ): Promise<{ success: boolean; message: string; data: TestRegistration }> {
    const response = await http.patch(`/test-registrations/${id}`, data);
    return response.data;
  },

  async delete(id: number): Promise<{ success: boolean; message: string }> {
    const response = await http.delete(`/test-registrations/${id}`);
    return response.data;
  },

  async importExcel(
    file: File,
    testId?: number,
    clubId?: number,
  ): Promise<ImportExcelResponse> {
    const formData = new FormData();
    formData.append('file', file);
    if (testId) {
      formData.append('test_id', testId.toString());
    }
    if (clubId) {
      formData.append('club_id', clubId.toString());
    }

    const response = await http.post('/test-registrations/import-excel', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

