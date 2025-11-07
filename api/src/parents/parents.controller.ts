import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ParentsService } from './parents.service';
import { CreateParentDto, UpdateParentDto } from './dto';

@Controller('parents')
export class ParentsController {
  constructor(private readonly parentsService: ParentsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createParentDto: CreateParentDto) {
    const parent = await this.parentsService.create(createParentDto);
    return {
      success: true,
      message: 'Parent created successfully',
      data: parent,
    };
  }

  @Get()
  async findAll() {
    const parents = await this.parentsService.findAll();
    return parents; // Return array directly for frontend compatibility
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const parent = await this.parentsService.findOne(id);
    return parent; // Return object directly for frontend compatibility
  }

  @Get('relationship/:relationship')
  async findByRelationship(@Param('relationship') relationship: string) {
    const parents = await this.parentsService.findByRelationship(relationship);
    return parents; // Return array directly for frontend compatibility
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateParentDto: UpdateParentDto,
  ) {
    const parent = await this.parentsService.update(id, updateParentDto);
    return {
      success: true,
      message: 'Parent updated successfully',
      data: parent,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.parentsService.remove(id);
    return {
      success: true,
      message: 'Parent deleted successfully',
    };
  }
}
