import http from "@/services/http";
import { newsApi, parseNewsImages, getNewsTypeLabel } from "./news";

/**
 * Gallery image interface
 */
export interface GalleryImage {
  id: number;
  category: "training" | "competition" | "events" | "all";
  src: string;
  badge: string;
  title?: string;
  source?: "news" | "event";
  sourceId?: number;
}

/**
 * Gallery video interface
 */
export interface GalleryVideo {
  id: number;
  title: string;
  thumbnail: string;
  videoUrl?: string;
  description?: string;
}

/**
 * Map news type to gallery category
 */
const mapNewsTypeToCategory = (
  newsType: string
): "training" | "competition" | "events" | "all" => {
  const lowerType = newsType.toLowerCase();
  if (lowerType.includes("tập luyện") || lowerType.includes("training")) {
    return "training";
  }
  if (
    lowerType.includes("thi đấu") ||
    lowerType.includes("competition") ||
    lowerType.includes("thành tích")
  ) {
    return "competition";
  }
  if (lowerType.includes("sự kiện") || lowerType.includes("event")) {
    return "events";
  }
  return "all";
};

/**
 * Map event type to gallery category
 */
const mapEventTypeToCategory = (
  eventType: string
): "training" | "competition" | "events" | "all" => {
  const lowerType = eventType.toLowerCase();
  if (lowerType === "tournament") {
    return "competition";
  }
  if (
    lowerType === "seminar" ||
    lowerType === "graduation" ||
    lowerType === "social"
  ) {
    return "events";
  }
  return "all";
};

/**
 * API service for gallery
 */
export const galleryApi = {
  /**
   * Get all gallery images from news and events
   * @returns Promise<GalleryImage[]>
   */
  getImages: async (): Promise<GalleryImage[]> => {
    try {
      const images: GalleryImage[] = [];

      // Fetch published news with images
      const newsList = await newsApi.getAll();

      newsList.forEach((news) => {
        // Get featured image
        if (news.featured_image_url) {
          const category = mapNewsTypeToCategory(
            getNewsTypeLabel(news.slug, news.title)
          );
          images.push({
            id: news.id,
            category,
            src: news.featured_image_url,
            badge: getNewsTypeLabel(news.slug, news.title),
            title: news.title,
            source: "news",
            sourceId: news.id,
          });
        }

        // Get images from images field
        const newsImages = parseNewsImages(news.images);
        newsImages.forEach((imageUrl, index) => {
          const category = mapNewsTypeToCategory(
            getNewsTypeLabel(news.slug, news.title)
          );
          images.push({
            id: news.id * 1000 + index, // Unique ID
            category,
            src: imageUrl,
            badge: getNewsTypeLabel(news.slug, news.title),
            title: news.title,
            source: "news",
            sourceId: news.id,
          });
        });
      });

      // Fetch events (if they have images in the future)
      try {
        const eventsResponse = await http.get<any[] | { data: any[] }>(
          "/events"
        );
        let eventsData: any[] = [];
        if (Array.isArray(eventsResponse.data)) {
          eventsData = eventsResponse.data;
        } else {
          eventsData = (eventsResponse.data as { data: any[] })?.data || [];
        }

        // Note: Events don't have images field currently, but we can add it later
        // For now, we'll skip events without images
      } catch (error) {
        // Events API might not be available, skip silently
        console.warn("Could not fetch events for gallery:", error);
      }

      if (process.env.NODE_ENV === "development") {
        console.log("[Gallery API] Images:", images);
      }

      return images;
    } catch (error: any) {
      if (error.code === "ECONNREFUSED" || error.message === "Network Error") {
        console.warn(
          "API server is not running. Please start the backend server."
        );
      } else {
        console.error("Error fetching gallery images:", error);
        console.error("Error details:", error.response?.data || error.message);
      }
      return [];
    }
  },

  /**
   * Get gallery images by category
   * @param category - Image category filter
   * @returns Promise<GalleryImage[]>
   */
  getImagesByCategory: async (
    category: "training" | "competition" | "events" | "all"
  ): Promise<GalleryImage[]> => {
    const allImages = await galleryApi.getImages();
    if (category === "all") {
      return allImages;
    }
    return allImages.filter((img) => img.category === category);
  },

  /**
   * Get gallery videos
   * Currently returns empty array as videos are not in the database yet
   * @returns Promise<GalleryVideo[]>
   */
  getVideos: async (): Promise<GalleryVideo[]> => {
    try {
      // TODO: Implement video API when available
      // For now, we can fetch from news if they have video URLs
      const newsList = await newsApi.getAll();

      const videos: GalleryVideo[] = [];

      // Check if news content contains video links
      newsList.forEach((news) => {
        if (news.content) {
          // Simple regex to find YouTube/Vimeo links
          const videoRegex =
            /(?:youtube\.com\/watch\?v=|youtu\.be\/|vimeo\.com\/)([a-zA-Z0-9_-]+)/g;
          const matches = news.content.match(videoRegex);

          if (matches && matches.length > 0) {
            matches.forEach((match, index) => {
              const videoId = match.split(/[=\/]/).pop();
              const thumbnail = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
              videos.push({
                id: news.id * 1000 + index,
                title: news.title,
                thumbnail,
                videoUrl: match,
                description: news.excerpt,
              });
            });
          }
        }
      });

      if (process.env.NODE_ENV === "development") {
        console.log("[Gallery API] Videos:", videos);
      }

      return videos;
    } catch (error: any) {
      if (error.code === "ECONNREFUSED" || error.message === "Network Error") {
        console.warn(
          "API server is not running. Please start the backend server."
        );
      } else {
        console.error("Error fetching gallery videos:", error);
      }
      return [];
    }
  },
};

export default galleryApi;

