import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Course } from '../../courses/entities/course.entity';
import { Coach } from '../../coaches/entities/coach.entity';
import { Event } from '../../events/entities/event.entity';
import { Notification } from '../../notifications/entities/notification.entity';
import { TuitionPackage } from '../../tuition-packages/entities/tuition-package.entity';
// import { BeltTest } from '../../belt-tests/entities/belt-test.entity';
import { Branch } from '../../branches/entities/branch.entity';

@Entity('cau_lac_bo')
export class Club {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 20, unique: true })
  club_code: string;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 255, nullable: true })
  address: string;

  @Column({ length: 20, nullable: true })
  phone: string;

  @Column({ length: 100, nullable: true })
  email: string;

  @Column({ nullable: true })
  head_coach_id: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ length: 255, nullable: true })
  logo_url: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @OneToMany(() => User, (user) => user.cau_lac_bo)
  users: User[];

  @OneToMany(() => Branch, (branch) => branch.club)
  branches: Branch[];

  // Note: Coach không có foreign key trực tiếp với Club
  // Quan hệ được quản lý qua ma_clb (mã câu lạc bộ) trong bảng huan_luyen_vien
  // Không thể dùng @OneToMany relation vì không có club_id trong bảng huan_luyen_vien

  @ManyToOne(() => Coach, (coach) => coach.id)
  @JoinColumn({ name: 'head_coach_id' })
  head_coach: Coach;

  @OneToMany(() => Course, (course) => course.club)
  courses: Course[];

  @OneToMany(() => Event, (event) => event.club)
  events: Event[];

  @OneToMany(() => Notification, (notification) => notification.club)
  notifications: Notification[];

  @OneToMany(() => TuitionPackage, (tuitionPackage) => tuitionPackage.club)
  tuition_packages: TuitionPackage[];

  // @OneToMany(() => BeltTest, (test) => test.club)
  // belt_tests: BeltTest[];
}
