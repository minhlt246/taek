import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('tin_nhan_lien_he')
export class ContactMessage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 100 })
  email: string;

  @Column({ length: 15, nullable: true })
  phone: string;

  @Column({ length: 200, nullable: true })
  subject: string;

  @Column({ type: 'text' })
  message: string;

  @Column({
    type: 'enum',
    enum: ['new', 'read', 'replied', 'closed'],
    default: 'new',
  })
  status: 'new' | 'read' | 'replied' | 'closed';

  @CreateDateColumn()
  created_at: Date;
}
