/**
 * Coach standards constants
 * Tiêu chuẩn huấn luyện viên
 */
export interface CoachStandard {
  icon: string;
  title: string;
  description: string;
}

export const COACH_STANDARDS: CoachStandard[] = [
  {
    icon: "ti ti-school",
    title: "Trình độ cao",
    description: "Tất cả HLV có bằng cấp chuyên môn",
  },
  {
    icon: "ti ti-trophy",
    title: "Kinh nghiệm thi đấu",
    description: "Từng tham gia các giải quốc gia & quốc tế",
  },
  {
    icon: "ti ti-brain",
    title: "Phương pháp hiện đại",
    description: "Áp dụng phương pháp giảng dạy tiên tiến",
  },
  {
    icon: "ti ti-heart",
    title: "Tận tâm",
    description: "Luôn đặt sự phát triển của học viên lên hàng đầu",
  },
];
