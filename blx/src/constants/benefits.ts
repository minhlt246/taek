/**
 * Benefits interface
 */
export interface Benefit {
  icon: string;
  title: string;
  description: string;
}

/**
 * Static benefits data
 */
export const BENEFITS: Benefit[] = [
  {
    icon: "ti ti-heart",
    title: "Sức khỏe tốt hơn",
    description: "Rèn luyện thể lực, tăng cường sức khỏe và sự dẻo dai",
  },
  {
    icon: "ti ti-shield",
    title: "Tự vệ hiệu quả",
    description: "Học các kỹ thuật tự vệ thực tế để bảo vệ bản thân",
  },
  {
    icon: "ti ti-users",
    title: "Kỹ năng xã hội",
    description:
      "Gặp gỡ bạn bè, phát triển kỹ năng giao tiếp và làm việc nhóm",
  },
  {
    icon: "ti ti-brain",
    title: "Tinh thần võ đạo",
    description: "Rèn luyện tính kỷ luật, tôn trọng và tinh thần võ đạo",
  },
  {
    icon: "ti ti-trophy",
    title: "Thành tích cá nhân",
    description: "Cơ hội tham gia thi đấu và đạt được các thành tích cao",
  },
  {
    icon: "ti ti-mood-happy",
    title: "Giảm căng thẳng",
    description: "Tập luyện giúp giải tỏa stress và cải thiện tâm trạng",
  },
];

