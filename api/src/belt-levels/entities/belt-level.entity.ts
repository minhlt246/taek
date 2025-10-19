import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Coach } from '../../coaches/entities/coach.entity';
import { BeltPromotion } from '../../belt-promotions/entities/belt-promotion.entity';
// import { TestRegistration } from '../../test-registrations/entities/test-registration.entity';
import { Certificate } from '../../certificates/entities/certificate.entity';

@Entity('cap_dai')
export class BeltLevel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50, unique: true })
  name: string;

  @Column({ length: 20, nullable: true })
  color: string;

  @Column({ nullable: true })
  order_sequence: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @OneToMany(() => User, (user) => user.cap_dai)
  users: User[];

  @OneToMany(() => Coach, (coach) => coach.belt_level)
  coaches: Coach[];

  @OneToMany(() => BeltPromotion, (promotion) => promotion.from_belt)
  from_promotions: BeltPromotion[];

  @OneToMany(() => BeltPromotion, (promotion) => promotion.to_belt)
  to_promotions: BeltPromotion[];

  // @OneToMany(
  //   () => TestRegistration,
  //   (registration) => registration.current_belt,
  // )
  // current_test_registrations: TestRegistration[];

  // @OneToMany(() => TestRegistration, (registration) => registration.target_belt)
  // target_test_registrations: TestRegistration[];

  @OneToMany(() => Certificate, (certificate) => certificate.belt_level)
  certificates: Certificate[];
}
