import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PoomsaeService } from './poomsae.service';
import { PoomsaeController } from './poomsae.controller';
import { Poomsae } from './poomsae.entity';
import { BeltLevelPoomsae } from './belt-level-poomsae.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Poomsae, BeltLevelPoomsae])],
  controllers: [PoomsaeController],
  providers: [PoomsaeService],
  exports: [PoomsaeService],
})
export class PoomsaeModule {}
