/**
 * FAQ interface
 */
export interface FAQ {
  question: string;
  answer: string;
}

/**
 * Static FAQs data
 */
export const FAQS: FAQ[] = [
  {
    question: "Làm sao để biết lớp nào phù hợp với tôi?",
    answer:
      "Bạn có thể tham gia lớp học thử miễn phí để trải nghiệm. Huấn luyện viên sẽ đánh giá trình độ và tư vấn lớp học phù hợp nhất với bạn.",
  },
  {
    question: "Tôi chưa từng học võ, có thể tham gia không?",
    answer:
      "Hoàn toàn có thể! Chúng tôi có lớp cơ bản dành riêng cho người mới bắt đầu. Huấn luyện viên sẽ hướng dẫn từng bước một cách chi tiết.",
  },
  {
    question: "Trẻ em từ mấy tuổi có thể tham gia?",
    answer:
      "Trẻ em từ 5 tuổi trở lên có thể tham gia lớp học. Chúng tôi có chương trình đặc biệt dành cho trẻ em với phương pháp vui nhộn và an toàn.",
  },
  {
    question: "Có cần chuẩn bị gì trước khi đến tập không?",
    answer:
      "Bạn chỉ cần mặc quần áo thể thao thoải mái. Chúng tôi sẽ cung cấp võ phục và các dụng cụ cần thiết. Bạn có thể mang theo nước uống và khăn lau.",
  },
];

