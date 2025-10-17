import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BranchesService } from './branches.service';
import { BranchesController } from './branches.controller';
import { Branch, BranchManager, BranchAssistant } from './entities';

@Module({
  imports: [TypeOrmModule.forFeature([Branch, BranchManager, BranchAssistant])],
  controllers: [BranchesController],
  providers: [BranchesService],
  exports: [BranchesService], // Export service for use in other modules
})
export class BranchesModule {}
