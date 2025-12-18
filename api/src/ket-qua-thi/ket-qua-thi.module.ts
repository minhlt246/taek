import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KetQuaThi } from './entities/ket-qua-thi.entity';
import { User } from '../users/entities/user.entity';
import { BeltLevel } from '../belt-levels/entities/belt-level.entity';
import { TestExam } from '../test-registrations/entities/test-exam.entity';
import { KetQuaThiService } from './ket-qua-thi.service';
import { KetQuaThiController } from './ket-qua-thi.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([KetQuaThi, User, BeltLevel, TestExam]),
  ],
  controllers: [KetQuaThiController],
  providers: [KetQuaThiService],
  exports: [KetQuaThiService],
})
export class KetQuaThiModule {}

