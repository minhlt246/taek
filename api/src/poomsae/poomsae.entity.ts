import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { BeltLevelPoomsae } from './belt-level-poomsae.entity';

@Entity('bai_quyen')
export class Poomsae {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'ten_bai_quyen_vietnamese' })
  tenBaiQuyenVietnamese: string;

  @Column({ name: 'ten_bai_quyen_english' })
  tenBaiQuyenEnglish: string;

  @Column({ name: 'ten_bai_quyen_korean', nullable: true })
  tenBaiQuyenKorean?: string;

  @Column({ name: 'cap_do' })
  capDo: string;

  @Column({ name: 'mo_ta', type: 'text', nullable: true })
  moTa?: string;

  @Column({ name: 'so_dong_tac', nullable: true })
  soDongTac?: number;

  @Column({ name: 'thoi_gian_thuc_hien', nullable: true })
  thoiGianThucHien?: number;

  @Column({ name: 'khoi_luong_ly_thuyet', type: 'text', nullable: true })
  khoiLuongLyThuyet?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(
    () => BeltLevelPoomsae,
    (beltLevelPoomsae) => beltLevelPoomsae.poomsae,
  )
  beltLevelPoomsaes: BeltLevelPoomsae[];
}
