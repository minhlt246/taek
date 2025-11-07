import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClubsService } from './clubs.service';
import { ClubsController } from './clubs.controller';
import { Club } from './entities/club.entity';
import { Branch } from '../branches/entities/branch.entity';
import { Course } from '../courses/entities/course.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Club, Branch, Course])],
  controllers: [ClubsController],
  providers: [ClubsService],
  exports: [ClubsService], // Export service for use in other modules
})
export class ClubsModule {}
