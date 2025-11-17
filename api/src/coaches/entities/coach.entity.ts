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
import { BeltLevel } from '../../belt-levels/entities/belt-level.entity';
import { Course } from '../../courses/entities/course.entity';
import { BeltPromotion } from '../../belt-promotions/entities/belt-promotion.entity';
import { StudentEvaluation } from '../../student-evaluations/entities/student-evaluation.entity';
import { Feedback } from '../../feedbacks/entities/feedback.entity';
// import { BeltTest } from '../../belt-tests/entities/belt-test.entity';

@Entity('huan_luyen_vien')
export class Coach {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50, unique: true, name: 'ma_hoi_vien', comment: 'Mã hội viên HLV' })
  ma_hoi_vien: string;

  @Column({ length: 100, name: 'ho_va_ten', comment: 'Họ và tên đầy đủ' })
  ho_va_ten: string;

  @Column({ type: 'date', nullable: true, name: 'ngay_thang_nam_sinh', comment: 'Ngày tháng năm sinh' })
  ngay_thang_nam_sinh: Date;

  @Column({ length: 20, nullable: true, name: 'ma_clb', comment: 'Mã câu lạc bộ' })
  ma_clb: string;

  @Column({ length: 20, nullable: true, name: 'ma_don_vi', comment: 'Mã đơn vị' })
  ma_don_vi: string;

  @Column({ nullable: true, name: 'quyen_so', comment: 'Quyền số' })
  quyen_so: number;

  @Column({
    type: 'enum',
    enum: ['Nam', 'Nữ'],
    nullable: true,
    name: 'gioi_tinh',
    comment: 'Giới tính',
  })
  gioi_tinh: 'Nam' | 'Nữ';

  @Column({ length: 255, nullable: true })
  photo_url: string;

  @Column({ type: 'text', nullable: true })
  images: string;

  @Column({ length: 15, nullable: true })
  phone: string;

  @Column({ length: 100, unique: true, nullable: true })
  email: string;

  @Column({ length: 255, nullable: true })
  password: string;

  @Column({
    type: 'enum',
    enum: ['owner', 'admin'],
    default: 'admin',
  })
  role: 'owner' | 'admin';

  @Column({ nullable: true, name: 'cap_dai_id' })
  belt_level_id: number;

  @Column({ nullable: true })
  experience_years: number;

  @Column({ length: 100, nullable: true })
  specialization: string;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ length: 100, nullable: true, name: 'emergency_contact_name', comment: 'Tên người liên hệ khẩn cấp' })
  emergency_contact_name: string;

  @Column({ length: 15, nullable: true, name: 'emergency_contact_phone', comment: 'Số điện thoại liên hệ khẩn cấp' })
  emergency_contact_phone: string;

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  // Note: Coach không có foreign key trực tiếp với Club và Branch
  // Quan hệ với Club được quản lý qua ma_clb (mã câu lạc bộ)
  // Quan hệ với Branch được quản lý qua bảng trung gian quan_ly_chi_nhanh và tro_giang_chi_nhanh

  @ManyToOne(() => BeltLevel, (beltLevel) => beltLevel.coaches)
  @JoinColumn({ name: 'cap_dai_id' })
  belt_level: BeltLevel;

  @OneToMany(() => Course, (course) => course.coach)
  courses: Course[];

  @OneToMany(() => BeltPromotion, (promotion) => promotion.coach)
  belt_promotions: BeltPromotion[];

  @OneToMany(() => StudentEvaluation, (evaluation) => evaluation.coach)
  student_evaluations: StudentEvaluation[];

  @OneToMany(() => Feedback, (feedback) => feedback.coach)
  feedbacks: Feedback[];

  // @OneToMany(() => BeltTest, (test) => test.examiner)
  // belt_tests: BeltTest[];
}
