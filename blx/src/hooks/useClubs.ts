import { useState, useEffect } from "react";
import { clubsApi, ClubOverview } from "@/services/api/clubs";

/**
 * Hook để lấy thông tin câu lạc bộ và chi nhánh
 * @returns {Object} - { overview, loading, error }
 */
export const useClubs = () => {
  const [overview, setOverview] = useState<ClubOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        setLoading(true);
        setError(null);
        const clubs = await clubsApi.getAll();
        if (clubs.length > 0) {
          const clubOverview = await clubsApi.getOverview(clubs[0].id);
          setOverview(clubOverview);
        } else {
          setError("Không tìm thấy câu lạc bộ nào.");
        }
      } catch (err) {
        console.error("Error loading club overview:", err);
        setError("Không thể tải dữ liệu. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchOverview();
  }, []);

  return { overview, loading, error };
};

