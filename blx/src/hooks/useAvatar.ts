import { useState, useEffect } from "react";
import http from "@/services/http";
import { getAvatarUrl } from "@/utils/avatar";

/**
 * Hook để load avatar từ API dựa trên coach ID
 * @param coachId - ID của coach (từ account.id)
 * @returns Avatar URL hoặc null nếu chưa load được
 */
export const useAvatar = (coachId?: string | number): string | null => {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!coachId) {
      setAvatarUrl(null);
      return;
    }

    const loadAvatar = async () => {
      try {
        // Gọi API trực tiếp để lấy raw coach data
        const response = await http.get(`/coaches/${coachId}`);
        const coachData = response.data;

        if (coachData) {
          // Xử lý avatar URL
          const avatar = getAvatarUrl(coachData.photo_url, coachData.images);
          if (avatar) {
            setAvatarUrl(avatar);
          }
        }
      } catch (error) {
        // Không log error để tránh spam console
        // Avatar sẽ là null, component sẽ dùng fallback
        setAvatarUrl(null);
      }
    };

    loadAvatar();
  }, [coachId]);

  return avatarUrl;
};
