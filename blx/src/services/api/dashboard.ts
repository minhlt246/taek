import http from "@/services/http";
import { User } from "./users";
import { BeltLevel } from "./belt-levels";

/**
 * Interface cho võ sinh mới đăng ký
 * belt_level luôn có giá trị (không bao giờ null) - đã được xử lý trong service
 */
export interface NewStudent {
  id: number;
  name: string;
  belt_level: BeltLevel; // Bắt buộc phải có cấp đai
  created_at: string;
  is_active: boolean;
}

/**
 * Interface cho thống kê võ sinh theo cấp đai
 */
export interface StudentByBeltLevel {
  belt_level_id: number;
  belt_level_name: string;
  belt_level_color?: string;
  count: number;
}

/**
 * Interface cho võ sinh đã nghỉ học
 */
export interface InactiveStudent {
  id: number;
  name: string;
  belt_level: BeltLevel | null;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

/**
 * Interface cho thăng đai thành công
 */
export interface BeltPromotion {
  id: number;
  user_id: number;
  user_name: string;
  from_belt_id: number;
  from_belt_name: string;
  from_belt_color?: string;
  to_belt_id: number;
  to_belt_name: string;
  to_belt_color?: string;
  promotion_date: string;
  status: string;
}

/**
 * Helper để tính toán ngày bắt đầu dựa trên số ngày
 */
const getStartDate = (days: number): Date => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
};

/**
 * Helper để format ngày
 */
const formatDate = (date: Date | string): string => {
  const d = typeof date === "string" ? new Date(date) : date;
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

/**
 * API service cho dashboard
 */
export const dashboardApi = {
  /**
   * Lấy danh sách võ sinh mới đăng ký
   * @param days - Số ngày qua (mặc định: 30)
   * @returns Promise<NewStudent[]>
   */
  getNewStudents: async (days: number = 30): Promise<NewStudent[]> => {
    try {
      // Fetch cả users và belt levels để map cấp đai
      const [usersResponse, beltLevelsResponse] = await Promise.all([
        http.get<User[]>("/users"),
        http.get<BeltLevel[]>("/belt-levels"),
      ]);

      const allUsers = Array.isArray(usersResponse.data)
        ? usersResponse.data
        : [];
      const beltLevels = Array.isArray(beltLevelsResponse.data)
        ? beltLevelsResponse.data
        : [];

      // Tạo map để lookup belt level nhanh
      const beltLevelMap = new Map<number, BeltLevel>();
      beltLevels.forEach((belt) => {
        beltLevelMap.set(belt.id, belt);
      });

      // Lọc võ sinh mới đăng ký trong khoảng thời gian
      const startDate = getStartDate(days);
      const newStudents = allUsers
        .filter((user) => {
          if (!user.created_at) return false;
          const createdDate = new Date(user.created_at);
          return createdDate >= startDate;
        })
        .sort((a, b) => {
          const dateA = new Date(a.created_at || 0);
          const dateB = new Date(b.created_at || 0);
          return dateB.getTime() - dateA.getTime();
        })
        .slice(0, 10) // Lấy 10 võ sinh mới nhất
        .map((user) => {
          // Backend trả về ho_va_ten, frontend interface có cả name và ho_va_ten
          const userName = (user as any).ho_va_ten || user.name || "";

          // Lấy cap_dai_id từ user (backend field name)
          // Kiểm tra nhiều trường hợp: cap_dai_id, belt_level_id, hoặc từ relation cap_dai
          const capDaiId =
            (user as any).cap_dai_id ||
            user.belt_level_id ||
            (user as any).cap_dai?.id ||
            null;

          // Map với belt levels để lấy thông tin cấp đai
          let beltLevel: BeltLevel | null = null;

          // Ưu tiên 1: Tìm trong map bằng cap_dai_id
          if (capDaiId && capDaiId > 0) {
            beltLevel = beltLevelMap.get(capDaiId) || null;
          }

          // Ưu tiên 2: Nếu không tìm thấy trong map, thử lấy từ relation cap_dai (nếu API có trả về)
          if (!beltLevel) {
            const capDaiRelation = (user as any).cap_dai;
            if (capDaiRelation && capDaiRelation.id) {
              beltLevel = {
                id: capDaiRelation.id,
                name: capDaiRelation.name || "",
                color: capDaiRelation.color || "",
              };
            }
          }

          // Ưu tiên 3: Thử lấy từ user.belt_level (nếu có)
          if (!beltLevel && user.belt_level) {
            beltLevel = user.belt_level;
          }

          // Bắt buộc phải có cấp đai: Nếu không tìm thấy, lấy cấp đai thấp nhất (order = 1)
          if (!beltLevel || !beltLevel.id) {
            const defaultBelt =
              beltLevels.find(
                (belt) => (belt as any).order_sequence === 1 || belt.order === 1
              ) || beltLevels[0]; // Lấy cấp đai có order/order_sequence = 1, hoặc cấp đai đầu tiên
            if (defaultBelt) {
              beltLevel = {
                id: defaultBelt.id,
                name: defaultBelt.name || "Chưa xác định",
                color: defaultBelt.color || "",
              };
            } else {
              // Fallback cuối cùng nếu không có cấp đai nào trong hệ thống
              beltLevel = {
                id: 0,
                name: "Chưa xác định",
                color: "",
              };
            }
          }

          return {
            id: user.id,
            name: userName,
            belt_level: beltLevel, // Luôn có giá trị, không bao giờ null
            created_at: user.created_at || (user as any).created_at || "",
            is_active: user.is_active ?? (user as any).active_status ?? true,
          };
        });

      return newStudents;
    } catch (error: any) {
      console.error("Error fetching new students:", error);
      return [];
    }
  },

  /**
   * Lấy thống kê võ sinh theo cấp đai
   * @param days - Số ngày qua (mặc định: 30)
   * @returns Promise<StudentByBeltLevel[]>
   */
  getStudentsByBeltLevel: async (
    days: number = 30
  ): Promise<StudentByBeltLevel[]> => {
    try {
      const [usersResponse, beltLevelsResponse] = await Promise.all([
        http.get<User[]>("/users"),
        http.get<BeltLevel[]>("/belt-levels"),
      ]);

      const allUsers = Array.isArray(usersResponse.data)
        ? usersResponse.data
        : [];
      const beltLevels = Array.isArray(beltLevelsResponse.data)
        ? beltLevelsResponse.data
        : [];

      // Lọc võ sinh trong khoảng thời gian
      const startDate = getStartDate(days);
      const filteredUsers = allUsers.filter((user) => {
        if (!user.created_at) return false;
        const createdDate = new Date(user.created_at);
        return createdDate >= startDate;
      });

      // Nhóm theo cấp đai
      const statsMap = new Map<number, StudentByBeltLevel>();

      filteredUsers.forEach((user) => {
        const beltId = user.belt_level_id || (user as any).cap_dai_id || 0;
        const belt = beltLevels.find((b) => b.id === beltId);

        if (!statsMap.has(beltId)) {
          statsMap.set(beltId, {
            belt_level_id: beltId,
            belt_level_name: belt?.name || "Chưa có cấp đai",
            belt_level_color: belt?.color || "",
            count: 0,
          });
        }

        const stat = statsMap.get(beltId)!;
        stat.count++;
      });

      return Array.from(statsMap.values()).sort((a, b) => b.count - a.count);
    } catch (error: any) {
      console.error("Error fetching students by belt level:", error);
      return [];
    }
  },

  /**
   * Lấy danh sách võ sinh đã nghỉ học
   * @param days - Số ngày qua (mặc định: 30)
   * @returns Promise<InactiveStudent[]>
   */
  getInactiveStudents: async (
    days: number = 30
  ): Promise<InactiveStudent[]> => {
    try {
      const response = await http.get<User[]>("/users");
      const allUsers = Array.isArray(response.data) ? response.data : [];

      // Lọc võ sinh không hoạt động
      const startDate = getStartDate(days);
      const inactiveStudents = allUsers
        .filter((user) => {
          if (user.is_active) return false;
          if (!user.updated_at) return false;
          const updatedDate = new Date(user.updated_at);
          return updatedDate >= startDate;
        })
        .sort((a, b) => {
          const dateA = new Date(a.updated_at || 0);
          const dateB = new Date(b.updated_at || 0);
          return dateB.getTime() - dateA.getTime();
        })
        .slice(0, 10)
        .map((user) => {
          const userName = (user as any).ho_va_ten || user.name || "";
          return {
            id: user.id,
            name: userName,
            belt_level: user.belt_level || (user as any).cap_dai || null,
            created_at: user.created_at || (user as any).created_at || "",
            updated_at: user.updated_at || (user as any).updated_at || "",
            is_active: false,
          };
        });

      return inactiveStudents;
    } catch (error: any) {
      console.error("Error fetching inactive students:", error);
      return [];
    }
  },

  /**
   * Lấy danh sách võ sinh thăng đai thành công
   * @param days - Số ngày qua (mặc định: 30)
   * @returns Promise<BeltPromotion[]>
   */
  getBeltPromotions: async (days: number = 30): Promise<BeltPromotion[]> => {
    try {
      const response = await http.get<any[]>("/belt-promotions");
      // Handle both array response and object with data property
      let allPromotions: any[] = [];
      if (Array.isArray(response.data)) {
        allPromotions = response.data;
      } else if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data &&
        Array.isArray((response.data as any).data)
      ) {
        allPromotions = (response.data as any).data;
      }

      // Lọc thăng đai trong khoảng thời gian
      const startDate = getStartDate(days);
      const promotions = allPromotions
        .filter((promotion: any) => {
          if (!promotion.promotion_date && !promotion.created_at) return false;
          const promoDate = new Date(
            promotion.promotion_date || promotion.created_at
          );
          // Không filter theo status vì có thể không có field status
          // Chỉ filter theo thời gian
          return promoDate >= startDate;
        })
        .sort((a: any, b: any) => {
          const dateA = new Date(a.promotion_date || a.created_at || 0);
          const dateB = new Date(b.promotion_date || b.created_at || 0);
          return dateB.getTime() - dateA.getTime();
        })
        .slice(0, 10)
        .map((promotion: any) => ({
          id: promotion.id,
          user_id: promotion.user_id || (promotion as any).user?.id || 0,
          user_name:
            (promotion as any).user?.ho_va_ten ||
            promotion.user?.name ||
            (promotion as any).user?.name ||
            "Không xác định",
          from_belt_id:
            promotion.from_belt_id ||
            (promotion as any).from_belt?.id ||
            (promotion as any).from_belt_id ||
            0,
          from_belt_name:
            (promotion as any).from_belt?.name ||
            promotion.from_belt_name ||
            (promotion as any).from_belt_name ||
            "",
          from_belt_color:
            (promotion as any).from_belt?.color ||
            (promotion as any).from_belt_color ||
            "",
          to_belt_id:
            promotion.to_belt_id ||
            (promotion as any).to_belt?.id ||
            (promotion as any).to_belt_id ||
            0,
          to_belt_name:
            (promotion as any).to_belt?.name ||
            promotion.to_belt_name ||
            (promotion as any).to_belt_name ||
            "",
          to_belt_color:
            (promotion as any).to_belt?.color ||
            (promotion as any).to_belt_color ||
            "",
          promotion_date:
            promotion.promotion_date ||
            (promotion as any).promotion_date ||
            promotion.created_at ||
            (promotion as any).created_at ||
            "",
          status: promotion.status || "approved",
        }));

      return promotions;
    } catch (error: any) {
      // http.ts đã log lỗi 500+ rồi, không cần log lại ở đây
      // Trả về mảng rỗng để không làm crash dashboard
      return [];
    }
  },

  /**
   * Lấy thống kê võ sinh đã nghỉ và còn học theo năm
   * @param year - Năm cần thống kê (mặc định: năm hiện tại)
   * @returns Promise<{active: number[], inactive: number[], months: string[]}>
   */
  getYearlyStudentStats: async (
    year: number = new Date().getFullYear()
  ): Promise<{ active: number[]; inactive: number[]; months: string[] }> => {
    // Khai báo monthNames ở ngoài để có thể dùng trong catch block
    const monthNames = [
      "Tháng 1",
      "Tháng 2",
      "Tháng 3",
      "Tháng 4",
      "Tháng 5",
      "Tháng 6",
      "Tháng 7",
      "Tháng 8",
      "Tháng 9",
      "Tháng 10",
      "Tháng 11",
      "Tháng 12",
    ];

    try {
      const response = await http.get<User[]>("/users");
      const allUsers = Array.isArray(response.data) ? response.data : [];

      // Khởi tạo mảng cho 12 tháng
      const activeCounts = new Array(12).fill(0);
      const inactiveCounts = new Array(12).fill(0);
      const monthLabels = [...monthNames];

      // Đếm tổng số võ sinh trong mỗi tháng của năm
      // Với mỗi tháng, đếm tất cả võ sinh đã đăng ký trước hoặc trong tháng đó (không giới hạn năm đăng ký)
      for (let month = 0; month < 12; month++) {
        allUsers.forEach((user) => {
          const createdDateStr = user.created_at || (user as any).created_at;
          if (!createdDateStr) return;

          const createdDate = new Date(createdDateStr);
          const createdYear = createdDate.getFullYear();
          const createdMonth = createdDate.getMonth();

          // Đếm võ sinh đã đăng ký trước hoặc trong tháng đó của năm
          // Nếu đăng ký năm trước, đếm vào tất cả các tháng
          // Nếu đăng ký trong năm, chỉ đếm từ tháng đăng ký trở đi
          const targetDate = new Date(year, month, 1);
          const userCreatedDate = new Date(createdYear, createdMonth, 1);

          if (userCreatedDate <= targetDate) {
            const isActive =
              user.is_active ?? (user as any).active_status ?? true;

            if (isActive) {
              activeCounts[month]++;
            } else {
              inactiveCounts[month]++;
            }
          }
        });
      }

      return {
        active: activeCounts,
        inactive: inactiveCounts,
        months: monthLabels,
      };
    } catch (error: any) {
      console.error("Error fetching yearly student stats:", error);
      return {
        active: new Array(12).fill(0),
        inactive: new Array(12).fill(0),
        months: monthNames,
      };
    }
  },

  /**
   * Lấy thống kê theo năm
   * @param year - Năm cần thống kê (mặc định: năm hiện tại)
   * @param type - Loại thống kê: 'registrations' | 'promotions' | 'revenue' | 'all'
   * @returns Promise<any>
   */
  getYearlyStats: async (
    year: number = new Date().getFullYear(),
    type: "registrations" | "promotions" | "revenue" | "all" = "all"
  ): Promise<any> => {
    try {
      const [usersResponse, promotionsResponse] = await Promise.all([
        http.get<User[]>("/users"),
        http.get<any[]>("/belt-promotions"),
      ]);

      const allUsers = Array.isArray(usersResponse.data)
        ? usersResponse.data
        : [];
      const allPromotions = Array.isArray(promotionsResponse.data)
        ? promotionsResponse.data
        : [];

      const stats: any = {
        year,
        registrations: [],
        promotions: [],
        revenue: [],
      };

      // Thống kê đăng ký theo tháng
      if (type === "registrations" || type === "all") {
        const monthlyRegistrations = new Array(12).fill(0);
        allUsers.forEach((user) => {
          const createdDateStr = user.created_at || (user as any).created_at;
          if (!createdDateStr) return;
          const createdDate = new Date(createdDateStr);
          if (createdDate.getFullYear() === year) {
            const month = createdDate.getMonth();
            monthlyRegistrations[month]++;
          }
        });
        stats.registrations = monthlyRegistrations;
      }

      // Thống kê thăng đai theo tháng
      if (type === "promotions" || type === "all") {
        const monthlyPromotions = new Array(12).fill(0);
        allPromotions.forEach((promotion) => {
          const promoDateStr =
            promotion.promotion_date ||
            (promotion as any).promotion_date ||
            promotion.created_at ||
            (promotion as any).created_at;
          if (!promoDateStr) return;
          const promoDate = new Date(promoDateStr);
          const status = promotion.status || (promotion as any).status;
          if (promoDate.getFullYear() === year && status === "approved") {
            const month = promoDate.getMonth();
            monthlyPromotions[month]++;
          }
        });
        stats.promotions = monthlyPromotions;
      }

      // Thống kê doanh thu (cần endpoint payments)
      if (type === "revenue" || type === "all") {
        // TODO: Implement khi có endpoint payments
        stats.revenue = new Array(12).fill(0);
      }

      return stats;
    } catch (error: any) {
      console.error("Error fetching yearly stats:", error);
      return {
        year,
        registrations: [],
        promotions: [],
        revenue: [],
      };
    }
  },
};

export default dashboardApi;
