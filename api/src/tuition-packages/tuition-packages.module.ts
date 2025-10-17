import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TuitionPackage } from './entities/tuition-package.entity';
import { TuitionPackagesService } from './tuition-packages.service';
import { TuitionPackagesController } from './tuition-packages.controller';

@Module({
  imports: [TypeOrmModule.forFeature([TuitionPackage])],
  controllers: [TuitionPackagesController],
  providers: [TuitionPackagesService],
  exports: [TuitionPackagesService],
})
export class TuitionPackagesModule {}
