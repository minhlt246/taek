/**
 * Utility functions for avatar URL handling
 */

/**
 * Parse images từ JSON string
 */
export const parseImages = (images?: string): string[] => {
  if (!images) return [];
  try {
    const parsed = JSON.parse(images);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

/**
 * Get avatar URL với xử lý URL đúng cách
 * Chuyển đổi relative path thành full URL nếu cần
 * @param photoUrl - photo_url từ API
 * @param images - images string (JSON array) từ API
 * @returns Avatar URL hoặc null nếu không có
 */
export const getAvatarUrl = (photoUrl?: string, images?: string): string | null => {
  // Ưu tiên: photo_url -> images[0] -> null
  let avatarUrl: string | undefined = photoUrl;

  // Thử lấy từ images array nếu không có photo_url
  if (!avatarUrl && images) {
    const parsedImages = parseImages(images);
    if (parsedImages.length > 0 && parsedImages[0]) {
      avatarUrl = parsedImages[0];
    }
  }

  // Nếu có avatarUrl, convert thành full URL nếu cần
  if (avatarUrl) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

    // Nếu là đường dẫn client/images/ (không có / ở đầu), truy cập qua backend API
    if (avatarUrl.startsWith("client/images/")) {
      return `${apiUrl}/${avatarUrl}`;
    }

    // Nếu là đường dẫn /uploads/, thêm API URL
    if (avatarUrl.startsWith("/uploads/")) {
      return `${apiUrl}${avatarUrl}`;
    }

    // Nếu đã là full URL (http/https), giữ nguyên
    if (avatarUrl.startsWith("http")) {
      return avatarUrl;
    }

    // Nếu là đường dẫn local (/client/images/, /styles), giữ nguyên
    if (avatarUrl.startsWith("/")) {
      return avatarUrl;
    }

    // Đường dẫn tương đối khác, thêm API URL
    return `${apiUrl}/${avatarUrl}`;
  }

  return null;
};

