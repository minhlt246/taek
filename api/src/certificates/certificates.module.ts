import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Certificate } from './entities/certificate.entity';
import { CertificatesService } from './certificates.service';
import { CertificatesController } from './certificates.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Certificate])],
  controllers: [CertificatesController],
  providers: [CertificatesService],
  exports: [CertificatesService],
})
export class CertificatesModule {}
