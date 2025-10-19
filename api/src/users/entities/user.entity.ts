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
import { BeltLevel } from '../../belt-levels/entities/belt-level.entity';
import { Branch } from '../../branches/entities/branch.entity';
import { Enrollment } from '../../enrollments/entities/enrollment.entity';
import { Payment } from '../../payments/entities/payment.entity';
import { News } from '../../news/entities/news.entity';
import { BeltPromotion } from '../../belt-promotions/entities/belt-promotion.entity';
// import { TestRegistration } from '../../test-registrations/entities/test-registration.entity';
import { Certificate } from '../../certificates/entities/certificate.entity';
import { StudentEvaluation } from '../../student-evaluations/entities/student-evaluation.entity';
import { Feedback } from '../../feedbacks/entities/feedback.entity';
import { Attendance } from '../../attendance/entities/attendance.entity';
import { LearningProgress } from '../../learning-progress/entities/learning-progress.entity';
import { StudentParent } from '../../student-parents/entities/student-parent.entity';

@Entity('vo_sinh')
export class VoSinh {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100, comment: 'Họ và tên đầy đủ' })
  ho_va_ten: string;

  @Column({ type: 'date', comment: 'Ngày tháng năm sinh' })
  ngay_thang_nam_sinh: Date;

  @Column({ length: 50, unique: true, comment: 'Mã hội viên' })
  ma_hoi_vien: string;

  @Column({ length: 20, comment: 'Mã câu lạc bộ' })
  ma_clb: string;

  @Column({ length: 20, comment: 'Mã đơn vị' })
  ma_don_vi: string;

  @Column({ comment: 'Quyền số' })
  quyen_so: number;

  @Column({ comment: 'Cấp đai hiện tại' })
  cap_dai_id: number;

  @Column({
    type: 'enum',
    enum: ['Nam', 'Nữ'],
    comment: 'Giới tính',
  })
  gioi_tinh: 'Nam' | 'Nữ';

  @Column({ length: 100, unique: true, nullable: true })
  email: string;

  @Column({ length: 15, nullable: true })
  phone: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ length: 100, nullable: true })
  emergency_contact_name: string;

  @Column({ length: 15, nullable: true })
  emergency_contact_phone: string;

  @Column({ default: true })
  active_status: boolean;

  @Column({ length: 255, nullable: true })
  profile_image_url: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => BeltLevel, (beltLevel) => beltLevel.vo_sinh)
  @JoinColumn({ name: 'cap_dai_id' })
  cap_dai: BeltLevel;

  @OneToMany(() => Enrollment, (enrollment) => enrollment.vo_sinh)
  enrollments: Enrollment[];

  @OneToMany(() => Payment, (payment) => payment.vo_sinh)
  payments: Payment[];

  @OneToMany(() => BeltPromotion, (promotion) => promotion.vo_sinh)
  belt_promotions: BeltPromotion[];

  @OneToMany(() => Certificate, (certificate) => certificate.vo_sinh)
  certificates: Certificate[];

  @OneToMany(() => StudentEvaluation, (evaluation) => evaluation.vo_sinh)
  student_evaluations: StudentEvaluation[];

  @OneToMany(() => Feedback, (feedback) => feedback.vo_sinh)
  feedbacks: Feedback[];

  @OneToMany(() => Attendance, (attendance) => attendance.vo_sinh)
  attendance: Attendance[];

  @OneToMany(() => LearningProgress, (progress) => progress.vo_sinh)
  learning_progress: LearningProgress[];

  @OneToMany(() => StudentParent, (studentParent) => studentParent.vo_sinh)
  student_parents: StudentParent[];
}
