import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LearningProgress } from './entities/learning-progress.entity';
import { LearningProgressService } from './learning-progress.service';
import { LearningProgressController } from './learning-progress.controller';

@Module({
  imports: [TypeOrmModule.forFeature([LearningProgress])],
  controllers: [LearningProgressController],
  providers: [LearningProgressService],
  exports: [LearningProgressService],
})
export class LearningProgressModule {}
