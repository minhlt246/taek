import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TestRegistration } from './entities/test-registration.entity';
import { TestRegistrationsService } from './test-registrations.service';
import { TestRegistrationsController } from './test-registrations.controller';

@Module({
  imports: [TypeOrmModule.forFeature([TestRegistration])],
  controllers: [TestRegistrationsController],
  providers: [TestRegistrationsService],
  exports: [TestRegistrationsService],
})
export class TestRegistrationsModule {}
