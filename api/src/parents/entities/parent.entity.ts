import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { StudentParent } from '../../student-parents/entities/student-parent.entity';

@Entity('phu_huynh')
export class Parent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 100, nullable: true })
  email: string;

  @Column({ length: 15, nullable: true })
  phone: string;

  @Column({
    type: 'enum',
    enum: ['father', 'mother', 'guardian', 'other'],
    default: 'other',
  })
  relationship: 'father' | 'mother' | 'guardian' | 'other';

  @Column({ length: 255, nullable: true })
  address: string;

  @Column({ default: false })
  emergency_contact: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @OneToMany(() => StudentParent, (studentParent) => studentParent.parent)
  student_parents: StudentParent[];
}
