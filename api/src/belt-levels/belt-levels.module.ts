import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BeltLevelsService } from './belt-levels.service';
import { BeltLevelsController } from './belt-levels.controller';
import { BeltLevel } from './entities/belt-level.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BeltLevel])],
  controllers: [BeltLevelsController],
  providers: [BeltLevelsService],
  exports: [BeltLevelsService], // Export service for use in other modules
})
export class BeltLevelsModule {}
