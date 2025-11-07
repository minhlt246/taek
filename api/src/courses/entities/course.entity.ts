import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Club } from '../../clubs/entities/club.entity';
import { Branch } from '../../branches/entities/branch.entity';
import { Coach } from '../../coaches/entities/coach.entity';
import { Enrollment } from '../../enrollments/entities/enrollment.entity';
// import { Schedule } from '../../schedules/entities/schedule.entity'; // Removed - schedules now reference club/branch
import { Attendance } from '../../attendance/entities/attendance.entity';
import { StudentEvaluation } from '../../student-evaluations/entities/student-evaluation.entity';
import { Feedback } from '../../feedbacks/entities/feedback.entity';
import { LearningProgress } from '../../learning-progress/entities/learning-progress.entity';

@Entity('khoa_hoc')
export class Course {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner',
  })
  level: 'beginner' | 'intermediate' | 'advanced';

  @Column({
    type: 'enum',
    enum: ['Q1', 'Q2', 'Q3', 'Q4'],
    nullable: true,
  })
  quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4';

  @Column({ nullable: true })
  year: number;

  @Column({ nullable: true })
  coach_id: number;

  @Column({ nullable: true })
  club_id: number;

  @Column({ nullable: true })
  branch_id: number;

  @Column({ type: 'date', nullable: true })
  start_date: Date;

  @Column({ type: 'date', nullable: true })
  end_date: Date;

  @Column({ default: 0 })
  current_students: number;

  @Column({ nullable: true })
  max_students: number;

  @Column({ nullable: true })
  price: number;

  @Column({ length: 255, nullable: true })
  instructor_name: string;

  @Column({ length: 100, nullable: true })
  training_time: string; // Giờ tập (ví dụ: "18:00-19:30")

  @Column({ length: 255, nullable: true })
  training_days: string; // Buổi tập (ví dụ: "Thứ 2, 4, 6" hoặc "Monday, Wednesday, Friday")

  @Column({ length: 255, nullable: true })
  image_url: string;

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => Club, (club) => club.courses)
  @JoinColumn({ name: 'club_id' })
  club: Club;

  @ManyToOne(() => Branch, (branch) => branch.courses)
  @JoinColumn({ name: 'branch_id' })
  branch: Branch;

  @ManyToOne(() => Coach, (coach) => coach.courses)
  @JoinColumn({ name: 'coach_id' })
  coach: Coach;

  @OneToMany(() => Enrollment, (enrollment) => enrollment.course)
  enrollments: Enrollment[];

  // Schedule relation removed - schedules now reference club/branch instead of course
  // @OneToMany(() => Schedule, (schedule) => schedule.course)
  // schedules: Schedule[];

  @OneToMany(() => Attendance, (attendance) => attendance.course)
  attendance: Attendance[];

  @OneToMany(() => StudentEvaluation, (evaluation) => evaluation.course)
  student_evaluations: StudentEvaluation[];

  @OneToMany(() => Feedback, (feedback) => feedback.course)
  feedbacks: Feedback[];

  @OneToMany(() => LearningProgress, (progress) => progress.course)
  learning_progress: LearningProgress[];
}
