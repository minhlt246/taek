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
import { BeltPromotion } from '../../belt-promotions/entities/belt-promotion.entity';
// import { TestRegistration } from '../../test-registrations/entities/test-registration.entity';
import { Certificate } from '../../certificates/entities/certificate.entity';
import { StudentEvaluation } from '../../student-evaluations/entities/student-evaluation.entity';
import { Feedback } from '../../feedbacks/entities/feedback.entity';
import { Attendance } from '../../attendance/entities/attendance.entity';
import { LearningProgress } from '../../learning-progress/entities/learning-progress.entity';
import { StudentParent } from '../../student-parents/entities/student-parent.entity';

@Entity('vo_sinh')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100, comment: 'Họ và tên đầy đủ' })
  ho_va_ten: string;

  @Column({ type: 'date', comment: 'Ngày tháng năm sinh' })
  ngay_thang_nam_sinh: Date;

  @Column({
    type: 'varchar',
    length: 50,
    // unique: true, // Temporarily disabled to allow server startup, will be re-enabled after data fix
    nullable: true,
    comment: 'Mã hội viên',
  })
  ma_hoi_vien: string | null;

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

  @Column({
    length: 255,
    nullable: false,
    comment: 'Mật khẩu đăng nhập cho võ sinh',
  })
  password: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => BeltLevel)
  @JoinColumn({ name: 'cap_dai_id' })
  cap_dai: BeltLevel;

  @ManyToOne(() => Branch)
  @JoinColumn({ name: 'chi_nhanh_id' })
  chi_nhanh: Branch;

  @ManyToOne(() => Club)
  @JoinColumn({ name: 'cau_lac_bo_id' })
  cau_lac_bo: Club;

  @OneToMany(() => Enrollment, (enrollment) => enrollment.user)
  enrollments: Enrollment[];

  @OneToMany(() => Payment, (payment) => payment.user)
  payments: Payment[];

  @OneToMany(() => BeltPromotion, (promotion) => promotion.user)
  belt_promotions: BeltPromotion[];

  @OneToMany(() => Certificate, (certificate) => certificate.user)
  certificates: Certificate[];

  @OneToMany(() => StudentEvaluation, (evaluation) => evaluation.user)
  student_evaluations: StudentEvaluation[];

  @OneToMany(() => Feedback, (feedback) => feedback.user)
  feedbacks: Feedback[];

  @OneToMany(() => Attendance, (attendance) => attendance.user)
  attendance: Attendance[];

  @OneToMany(() => LearningProgress, (progress) => progress.user)
  learning_progress: LearningProgress[];

  @OneToMany(() => StudentParent, (studentParent) => studentParent.student)
  student_parents: StudentParent[];
}
