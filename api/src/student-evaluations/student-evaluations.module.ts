import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentEvaluation } from './entities/student-evaluation.entity';
import { StudentEvaluationsService } from './student-evaluations.service';
import { StudentEvaluationsController } from './student-evaluations.controller';

@Module({
  imports: [TypeOrmModule.forFeature([StudentEvaluation])],
  controllers: [StudentEvaluationsController],
  providers: [StudentEvaluationsService],
  exports: [StudentEvaluationsService],
})
export class StudentEvaluationsModule {}
