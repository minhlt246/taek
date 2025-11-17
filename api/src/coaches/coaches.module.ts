import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoachesService } from './coaches.service';
import { CoachesController } from './coaches.controller';
import { Coach } from './entities/coach.entity';
import { Club } from '../clubs/entities/club.entity';
import { BeltLevel } from '../belt-levels/entities/belt-level.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Coach, Club, BeltLevel])],
  controllers: [CoachesController],
  providers: [CoachesService],
  exports: [CoachesService], // Export service for use in other modules
})
export class CoachesModule {}
