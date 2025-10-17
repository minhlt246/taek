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
import { BranchesService } from './branches.service';
import {
  CreateBranchDto,
  UpdateBranchDto,
  AssignManagerDto,
  AssignAssistantDto,
} from './dto';

@Controller('branches')
export class BranchesController {
  constructor(private readonly branchesService: BranchesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createBranchDto: CreateBranchDto) {
    return this.branchesService.create(createBranchDto);
  }

  @Get()
  findAll() {
    return this.branchesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.branchesService.findOne(id);
  }

  @Get('code/:branch_code')
  findByCode(@Param('branch_code') branch_code: string) {
    return this.branchesService.findByCode(branch_code);
  }

  @Get('club/:club_id')
  findByClub(@Param('club_id', ParseIntPipe) club_id: number) {
    return this.branchesService.findByClub(club_id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBranchDto: UpdateBranchDto,
  ) {
    return this.branchesService.update(id, updateBranchDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.branchesService.remove(id);
  }

  // Branch Manager endpoints
  @Post(':id/managers')
  @HttpCode(HttpStatus.CREATED)
  assignManager(
    @Param('id', ParseIntPipe) branch_id: number,
    @Body() assignManagerDto: AssignManagerDto,
  ) {
    return this.branchesService.assignManager(branch_id, assignManagerDto);
  }

  @Get(':id/managers')
  getBranchManagers(@Param('id', ParseIntPipe) branch_id: number) {
    return this.branchesService.getBranchManagers(branch_id);
  }

  @Delete(':id/managers/:manager_id')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeManager(
    @Param('id', ParseIntPipe) branch_id: number,
    @Param('manager_id', ParseIntPipe) manager_id: number,
  ) {
    return this.branchesService.removeManager(branch_id, manager_id);
  }

  @Get('managers/:manager_id/branches')
  getManagerBranches(@Param('manager_id', ParseIntPipe) manager_id: number) {
    return this.branchesService.getManagerBranches(manager_id);
  }

  // Branch Assistant endpoints
  @Post(':id/assistants')
  @HttpCode(HttpStatus.CREATED)
  assignAssistant(
    @Param('id', ParseIntPipe) branch_id: number,
    @Body() assignAssistantDto: AssignAssistantDto,
  ) {
    return this.branchesService.assignAssistant(branch_id, assignAssistantDto);
  }

  @Get(':id/assistants')
  getBranchAssistants(@Param('id', ParseIntPipe) branch_id: number) {
    return this.branchesService.getBranchAssistants(branch_id);
  }

  @Delete(':id/assistants/:assistant_id')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeAssistant(
    @Param('id', ParseIntPipe) branch_id: number,
    @Param('assistant_id', ParseIntPipe) assistant_id: number,
  ) {
    return this.branchesService.removeAssistant(branch_id, assistant_id);
  }

  @Get('assistants/:assistant_id/branches')
  getAssistantBranches(
    @Param('assistant_id', ParseIntPipe) assistant_id: number,
  ) {
    return this.branchesService.getAssistantBranches(assistant_id);
  }
}
