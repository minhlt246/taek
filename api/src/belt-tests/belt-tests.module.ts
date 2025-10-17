import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BeltTest } from './entities/belt-test.entity';
import { BeltTestsService } from './belt-tests.service';
import { BeltTestsController } from './belt-tests.controller';

@Module({
  imports: [TypeOrmModule.forFeature([BeltTest])],
  controllers: [BeltTestsController],
  providers: [BeltTestsService],
  exports: [BeltTestsService],
})
export class BeltTestsModule {}
