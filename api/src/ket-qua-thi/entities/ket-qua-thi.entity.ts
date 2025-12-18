import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { BeltLevel } from '../../belt-levels/entities/belt-level.entity';
import { TestExam } from '../../test-registrations/entities/test-exam.entity';

@Entity('ket_qua_thi')
export class KetQuaThi {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true, comment: 'ID kỳ thi' })
  test_id?: number;

  @Column({ length: 20, nullable: true, comment: 'Mã CLB' })
  ma_clb?: string;

  @Column({ nullable: true, comment: 'ID võ sinh' })
  user_id?: number;

  @Column({ length: 50, nullable: true, comment: 'Mã hội viên' })
  ma_hoi_vien?: string;

  @Column({ nullable: true, comment: 'Cấp đai dự thi' })
  cap_dai_du_thi_id?: number;

  @Column({ length: 20, nullable: true, comment: 'Số thi' })
  so_thi?: string;

  @Column({ length: 100, nullable: true, comment: 'Họ và tên' })
  ho_va_ten?: string;

  @Column({
    type: 'enum',
    enum: ['Nam', 'Nữ'],
    nullable: true,
    comment: 'Giới tính',
  })
  gioi_tinh?: 'Nam' | 'Nữ';

  @Column({ type: 'date', nullable: true, comment: 'Ngày tháng năm sinh' })
  ngay_thang_nam_sinh?: Date;

  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
    comment: 'Kỹ thuật tấn căn bản',
  })
  ky_thuat_tan_can_ban?: number;

  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
    comment: 'Nguyên tắc phát lực',
  })
  nguyen_tac_phat_luc?: number;

  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
    comment: 'Căn bản tay',
  })
  can_ban_tay?: number;

  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
    comment: 'Kỹ thuật chân',
  })
  ky_thuat_chan?: number;

  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
    comment: 'Căn bản tự vệ',
  })
  can_ban_tu_ve?: number;

  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
    comment: 'Bài quyền',
  })
  bai_quyen?: number;

  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
    comment: 'Phân thế bài quyền',
  })
  phan_the_bai_quyen?: number;

  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
    comment: 'Song đấu',
  })
  song_dau?: number;

  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
    comment: 'Thể lực',
  })
  the_luc?: number;

  @Column({
    type: 'enum',
    enum: ['Đạt', 'Không đạt', 'Chưa có kết quả'],
    nullable: true,
    default: 'Chưa có kết quả',
    comment: 'Kết quả',
  })
  ket_qua?: 'Đạt' | 'Không đạt' | 'Chưa có kết quả';

  @Column({ type: 'text', nullable: true, comment: 'Ghi chú' })
  ghi_chu?: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => TestExam)
  @JoinColumn({ name: 'test_id' })
  test_exam?: TestExam;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user?: User;

  @ManyToOne(() => BeltLevel)
  @JoinColumn({ name: 'cap_dai_du_thi_id' })
  cap_dai_du_thi?: BeltLevel;
}

