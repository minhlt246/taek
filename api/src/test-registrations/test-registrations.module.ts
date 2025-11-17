import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TestRegistration } from './entities/test-registration.entity';
import { TestExam } from './entities/test-exam.entity';
import { User } from '../users/entities/user.entity';
import { BeltLevel } from '../belt-levels/entities/belt-level.entity';
import { TestRegistrationsService } from './test-registrations.service';
import { TestRegistrationsController } from './test-registrations.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TestRegistration,
      TestExam,
      User,
      BeltLevel,
    ]),
  ],
  controllers: [TestRegistrationsController],
  providers: [TestRegistrationsService],
  exports: [TestRegistrationsService],
})
export class TestRegistrationsModule {}

