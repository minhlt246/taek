import { usersApi, User } from "./users";
import { enrollmentsApi, Enrollment } from "./enrollments";
import { beltLevelsApi, BeltLevel } from "./belt-levels";

/**
 * Profile Data interface
 */
export interface ProfileData {
  name: string;
  username: string;
  memberId: string;
  beltLevel: string;
  beltColor: string;
  yearsTraining: string;
  instructor: string;
  trainingPoints: string;
  attendancePoints: string;
  lastBeltDate: string;
  status: string;
  avatarUrl?: string;
}

/**
 * Belt History interface
 */
export interface BeltHistory {
  date: string;
  belt: string;
  beltColor: string;
  result: string;
}

/**
 * Achievement interface
 */
export interface Achievement {
  title: string;
  competition: string;
}

/**
 * Attendance Record interface
 */
export interface AttendanceRecord {
  date: string;
  time: string;
  status: "present" | "absent";
}

/**
 * Certificate interface
 */
export interface Certificate {
  title: string;
  serial: string;
  image: string;
  hasPdf?: boolean;
}

/**
 * Format date helper
 */
const formatDate = (dateString?: string | null): string => {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return "N/A";
    }
    const formatted = date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    return formatted && formatted !== "Invalid Date" ? formatted : "N/A";
  } catch (error) {
    return "N/A";
  }
};

/**
 * Calculate years of training
 */
const calculateYearsTraining = (createdAt?: string): string => {
  if (!createdAt) return "N/A";
  try {
    const startDate = new Date(createdAt);
    if (isNaN(startDate.getTime())) {
      return "N/A";
    }
    const now = new Date();
    if (isNaN(now.getTime())) {
      return "N/A";
    }
    const diffTime = Math.abs(now.getTime() - startDate.getTime());
    if (isNaN(diffTime) || diffTime < 0) {
      return "N/A";
    }
    const daysDiff = diffTime / (1000 * 60 * 60 * 24);
    if (isNaN(daysDiff)) {
      return "N/A";
    }
    const diffYears = Math.floor(daysDiff / 365);
    if (isNaN(diffYears) || diffYears < 0) {
      return "N/A";
    }
    return diffYears > 0 ? `${diffYears} năm` : "Dưới 1 năm";
  } catch (error) {
    return "N/A";
  }
};

/**
 * Get avatar URL from user data
 */
const getAvatarUrl = (user: User, customAvatarUrl?: string): string => {
  if (customAvatarUrl) return customAvatarUrl;
  if (user.email) {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || user.email)}&background=667eea&color=fff&size=200`;
  }
  return "/assets/img/my-profile-img.jpg";
};

/**
 * Map user data to profile data
 */
const mapUserToProfileData = (
  user: User,
  levels: BeltLevel[],
  customAvatarUrl?: string
): ProfileData => {
  const beltLevel = levels.find((level) => level.id === user.belt_level_id);
  const beltLevelName = beltLevel?.name || "Chưa có";
  const beltLevelColor = beltLevel?.color || "#808080";

  // Lấy mã hội viên từ API, nếu không có thì fallback về VS-{id}
  const memberId = user.ma_hoi_vien
    ? user.ma_hoi_vien
    : user.id && !isNaN(Number(user.id)) && user.id > 0
      ? `VS-${String(user.id).padStart(6, "0")}`
      : "N/A";

  const username =
    user.email?.split("@")[0] ||
    user.name?.toLowerCase().replace(/\s+/g, "") ||
    "N/A";

  const instructor = user.club?.name || user.branch?.name || "Chưa có";

  const trainingPoints = "0 điểm"; // TODO: Fetch from API

  const attendancePoints = "0/0 buổi"; // TODO: Fetch from API

  const lastBeltDate = user.updated_at ? formatDate(user.updated_at) : "N/A";

  const avatarUrl = getAvatarUrl(user, customAvatarUrl);

  return {
    name: user.name || "Chưa có tên",
    username: username || "N/A",
    memberId: memberId || "N/A",
    beltLevel: beltLevelName || "Chưa có",
    beltColor: beltLevelColor || "#808080",
    yearsTraining: calculateYearsTraining(user.created_at) || "N/A",
    instructor: instructor || "Chưa có",
    trainingPoints: trainingPoints || "0 điểm",
    attendancePoints: attendancePoints || "0/0 buổi",
    lastBeltDate: lastBeltDate || "N/A",
    status: user.is_active ? "Active" : "Inactive",
    avatarUrl: avatarUrl || undefined,
  };
};

/**
 * API service for profile
 */
export const profileApi = {
  /**
   * Get complete profile data
   * @returns Promise with profile data, enrollments, and related data
   */
  getProfileData: async (): Promise<{
    profileData: ProfileData | null;
    enrollments: Enrollment[];
    beltHistory: BeltHistory[];
    achievements: Achievement[];
    attendanceRecords: AttendanceRecord[];
    certificates: Certificate[];
  }> => {
    try {
      // Fetch user profile
      const user = await usersApi.getProfile();
      if (!user) {
        return {
          profileData: null,
          enrollments: [],
          beltHistory: [],
          achievements: [],
          attendanceRecords: [],
          certificates: [],
        };
      }

      // Fetch belt levels for mapping
      const levels = await beltLevelsApi.getAll();

      // Fetch enrollments
      const userEnrollments = await enrollmentsApi.getMyEnrollments();

      // Map user data to profile data
      const profileData = mapUserToProfileData(user, levels);

      // Fetch belt history (placeholder - cần API riêng)
      // TODO: Implement API endpoint for belt history
      const beltHistory: BeltHistory[] = [];

      // Fetch achievements (placeholder - cần API riêng)
      // TODO: Implement API endpoint for achievements
      const achievements: Achievement[] = [];

      // Fetch attendance records (placeholder - cần API riêng)
      // TODO: Implement API endpoint for attendance
      const attendanceRecords: AttendanceRecord[] = [];

      // Fetch certificates (placeholder - cần API riêng)
      // TODO: Implement API endpoint for certificates
      const certificates: Certificate[] = [];

      return {
        profileData,
        enrollments: userEnrollments,
        beltHistory,
        achievements,
        attendanceRecords,
        certificates,
      };
    } catch (error) {
      console.error("Error fetching profile data:", error);
      throw error;
    }
  },

  /**
   * Upload avatar
   * @param file - File to upload
   * @param token - Optional auth token
   * @returns Promise with avatar URL
   */
  uploadAvatar: async (
    file: File,
    token?: string
  ): Promise<{
    success: boolean;
    message: string;
    data: { avatarUrl: string };
  }> => {
    try {
      // Validate file type
      const validTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
      ];
      if (!validTypes.includes(file.type)) {
        throw new Error("Chỉ chấp nhận file ảnh (JPEG, PNG, GIF, WEBP)");
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        throw new Error("Kích thước file không được vượt quá 5MB");
      }

      const formData = new FormData();
      // Backend expect field name là "image" không phải "avatar"
      formData.append("image", file);

      const response = await usersApi.updateProfileWithAvatar(formData, token);

      return response;
    } catch (error: any) {
      console.error("Error uploading avatar:", error);
      throw error;
    }
  },

  /**
   * Refresh profile data after avatar upload
   * @param avatarUrl - New avatar URL
   * @returns Promise with updated profile data
   */
  refreshProfileAfterAvatarUpload: async (
    avatarUrl: string
  ): Promise<ProfileData | null> => {
    try {
      const user = await usersApi.getProfile();
      if (!user) return null;

      const levels = await beltLevelsApi.getAll();
      const profileData = mapUserToProfileData(user, levels, avatarUrl);

      return profileData;
    } catch (error) {
      console.error("Error refreshing profile:", error);
      return null;
    }
  },

  /**
   * Change password
   * @param data - Password change data
   * @returns Promise<boolean>
   */
  changePassword: async (
    data: {
      oldPassword: string;
      newPassword: string;
    },
    userId?: number | string
  ): Promise<boolean> => {
    try {
      // Nếu không có userId, thử lấy từ profile
      let finalUserId = userId;
      if (!finalUserId) {
        const user = await usersApi.getProfile();
        if (user?.id) {
          finalUserId = user.id;
        }
      }

      await usersApi.changePassword(data, finalUserId);
      return true;
    } catch (error: any) {
      console.error("Error changing password:", error);
      throw error;
    }
  },
};

export default profileApi;
