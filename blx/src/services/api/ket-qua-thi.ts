import http from "@/services/http";

export interface KetQuaThi {
  id: number;
  test_id?: number;
  ma_clb?: string;
  user_id?: number;
  ma_hoi_vien?: string;
  cap_dai_du_thi_id?: number;
  so_thi?: string;
  ho_va_ten?: string;
  gioi_tinh?: "Nam" | "Nữ";
  ngay_thang_nam_sinh?: string;
  ky_thuat_tan_can_ban?: number;
  nguyen_tac_phat_luc?: number;
  can_ban_tay?: number;
  ky_thuat_chan?: number;
  can_ban_tu_ve?: number;
  bai_quyen?: number;
  phan_the_bai_quyen?: number;
  song_dau?: number;
  the_luc?: number;
  ket_qua?: "Đạt" | "Không đạt" | "Chưa có kết quả";
  ghi_chu?: string;
  created_at: string;
  updated_at: string;
  test_exam?: any;
  user?: any;
  cap_dai_du_thi?: any;
}

export interface CreateKetQuaThiDto {
  test_id?: number;
  ma_clb?: string;
  user_id?: number;
  ma_hoi_vien?: string;
  cap_dai_du_thi_id?: number;
  so_thi?: string;
  ho_va_ten?: string;
  gioi_tinh?: "Nam" | "Nữ";
  ngay_thang_nam_sinh?: string;
  ky_thuat_tan_can_ban?: number;
  nguyen_tac_phat_luc?: number;
  can_ban_tay?: number;
  ky_thuat_chan?: number;
  can_ban_tu_ve?: number;
  bai_quyen?: number;
  phan_the_bai_quyen?: number;
  song_dau?: number;
  the_luc?: number;
  ket_qua?: "Đạt" | "Không đạt" | "Chưa có kết quả";
  ghi_chu?: string;
}

export const ketQuaThiApi = {
  async getAll(params?: {
    test_id?: number;
    user_id?: number;
    page?: number;
    limit?: number;
  }): Promise<
    | KetQuaThi[]
    | {
        docs: KetQuaThi[];
        totalDocs: number;
        limit: number;
        page: number;
        totalPages: number;
      }
  > {
    const response = await http.get("/ket-qua-thi", { params });
    const data = response.data?.data || response.data;
    // If paginated response, return as is, otherwise return array
    if (data && typeof data === "object" && "docs" in data) {
      return data as {
        docs: KetQuaThi[];
        totalDocs: number;
        limit: number;
        page: number;
        totalPages: number;
      };
    }
    return Array.isArray(data) ? data : [];
  },

  async getById(id: number): Promise<KetQuaThi> {
    const response = await http.get(`/ket-qua-thi/${id}`);
    return response.data?.data || response.data;
  },

  async create(
    data: CreateKetQuaThiDto
  ): Promise<{ success: boolean; message: string; data: KetQuaThi }> {
    const response = await http.post("/ket-qua-thi", data);
    return response.data;
  },

  async update(
    id: number,
    data: Partial<CreateKetQuaThiDto>
  ): Promise<{ success: boolean; message: string; data: KetQuaThi }> {
    const response = await http.patch(`/ket-qua-thi/${id}`, data);
    return response.data;
  },

  async delete(id: number): Promise<{ success: boolean; message: string }> {
    const response = await http.delete(`/ket-qua-thi/${id}`);
    return response.data;
  },

  async importExcel(
    file: File,
    testId?: number
  ): Promise<{
    success: boolean;
    message: string;
    imported: number;
    failed: number;
    errors: string[];
  }> {
    try {
      const formData = new FormData();
      formData.append("file", file);
      if (testId) {
        formData.append("test_id", String(testId));
      }

      const response = await http.post("/ket-qua-thi/import-excel", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    } catch (error: any) {
      console.error("Error importing Excel:", error);
      throw error;
    }
  },
};
