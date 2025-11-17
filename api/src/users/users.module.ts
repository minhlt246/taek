import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { BeltLevelPoomsae } from '../poomsae/belt-level-poomsae.entity';
import { Poomsae } from '../poomsae/poomsae.entity';
import { CoachesModule } from '../coaches/coaches.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, BeltLevelPoomsae, Poomsae]),
    CoachesModule, // Import CoachesModule để sử dụng CoachesService
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService], // Export service for use in other modules
})
export class UsersModule {}
