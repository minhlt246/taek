import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { TestRegistrationsService } from './test-registrations.service';
import { CreateTestRegistrationDto } from './dto/create-test-registration.dto';
import { UpdateTestRegistrationDto } from './dto/update-test-registration.dto';

@Controller('test-registrations')
export class TestRegistrationsController {
  constructor(
    private readonly testRegistrationsService: TestRegistrationsService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() input: CreateTestRegistrationDto) {
    return this.testRegistrationsService.create(input);
  }

  @Get()
  findAll() {
    return this.testRegistrationsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.testRegistrationsService.findOne(id);
  }

  @Get('test/:test_id')
  findByTest(@Param('test_id', ParseIntPipe) test_id: number) {
    return this.testRegistrationsService.findByTest(test_id);
  }

  @Get('user/:user_id')
  findByUser(@Param('user_id', ParseIntPipe) user_id: number) {
    return this.testRegistrationsService.findByUser(user_id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() input: UpdateTestRegistrationDto,
  ) {
    return this.testRegistrationsService.update(id, input);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.testRegistrationsService.remove(id);
  }
}
