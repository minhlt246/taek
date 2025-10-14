import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentParentsService } from './student-parents.service';
import { StudentParentsController } from './student-parents.controller';
import { StudentParent } from './entities/student-parent.entity';

@Module({
  imports: [TypeOrmModule.forFeature([StudentParent])],
  controllers: [StudentParentsController],
  providers: [StudentParentsService],
  exports: [StudentParentsService],
})
export class StudentParentsModule {}
