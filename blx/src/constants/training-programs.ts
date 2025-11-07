/**
 * Training Program interface
 */
export interface TrainingProgram {
  title: string;
  description: string;
}

/**
 * Static training programs data
 */
export const TRAINING_PROGRAMS: TrainingProgram[] = [
  {
    title: "Kỹ thuật cơ bản",
    description: "Học các tư thế, đòn đấm, đá cơ bản và nguyên tắc võ đạo",
  },
  {
    title: "Kỹ thuật nâng cao",
    description:
      "Nâng cao kỹ thuật, học các đòn thế phức tạp và kỹ thuật tự vệ",
  },
  {
    title: "Thi đấu",
    description: "Rèn luyện kỹ năng thi đấu, chiến thuật và tâm lý thi đấu",
  },
  {
    title: "Thể lực",
    description: "Rèn luyện sức mạnh, độ bền và sự dẻo dai của cơ thể",
  },
];

