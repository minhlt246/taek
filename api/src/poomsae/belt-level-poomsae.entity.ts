import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { BeltLevel } from '../belt-levels/entities/belt-level.entity';
import { Poomsae } from './poomsae.entity';

@Entity('cap_dai_bai_quyen')
export class BeltLevelPoomsae {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'cap_dai_id' })
  capDaiId: number;

  @Column({ name: 'bai_quyen_id' })
  baiQuyenId: number;

  @Column({
    name: 'loai_quyen',
    type: 'enum',
    enum: ['bat_buoc', 'tu_chon', 'bo_sung'],
    default: 'bat_buoc',
  })
  loaiQuyen: 'bat_buoc' | 'tu_chon' | 'bo_sung';

  @Column({ name: 'thu_tu_uu_tien', default: 1 })
  thuTuUuTien: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => BeltLevel)
  @JoinColumn({ name: 'cap_dai_id' })
  beltLevel: BeltLevel;

  @ManyToOne(() => Poomsae, (poomsae) => poomsae.beltLevelPoomsaes)
  @JoinColumn({ name: 'bai_quyen_id' })
  poomsae: Poomsae;
}
