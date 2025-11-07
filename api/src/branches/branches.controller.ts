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
  async create(@Body() createBranchDto: CreateBranchDto) {
    const branch = await this.branchesService.create(createBranchDto);
    return {
      success: true,
      message: 'Branch created successfully',
      data: branch,
    };
  }

  @Get()
  async findAll() {
    const branches = await this.branchesService.findAll();
    return branches; // Return array directly for frontend compatibility
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const branch = await this.branchesService.findOne(id);
    return branch; // Return object directly for frontend compatibility
  }

  @Get('code/:branch_code')
  async findByCode(@Param('branch_code') branch_code: string) {
    const branch = await this.branchesService.findByCode(branch_code);
    return branch; // Return object directly for frontend compatibility
  }

  @Get('club/:club_id')
  async findByClub(@Param('club_id', ParseIntPipe) club_id: number) {
    const branches = await this.branchesService.findByClub(club_id);
    return branches; // Return array directly for frontend compatibility
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBranchDto: UpdateBranchDto,
  ) {
    const branch = await this.branchesService.update(id, updateBranchDto);
    return {
      success: true,
      message: 'Branch updated successfully',
      data: branch,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.branchesService.remove(id);
    return {
      success: true,
      message: 'Branch deleted successfully',
    };
  }

  // Branch Manager endpoints
  @Post(':id/managers')
  @HttpCode(HttpStatus.CREATED)
  async assignManager(
    @Param('id', ParseIntPipe) branch_id: number,
    @Body() assignManagerDto: AssignManagerDto,
  ) {
    const result = await this.branchesService.assignManager(branch_id, assignManagerDto);
    return {
      success: true,
      message: 'Manager assigned successfully',
      data: result,
    };
  }

  @Get(':id/managers')
  async getBranchManagers(@Param('id', ParseIntPipe) branch_id: number) {
    const managers = await this.branchesService.getBranchManagers(branch_id);
    return managers; // Return array directly for frontend compatibility
  }

  @Delete(':id/managers/:manager_id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeManager(
    @Param('id', ParseIntPipe) branch_id: number,
    @Param('manager_id', ParseIntPipe) manager_id: number,
  ) {
    await this.branchesService.removeManager(branch_id, manager_id);
    return {
      success: true,
      message: 'Manager removed successfully',
    };
  }

  @Get('managers/:manager_id/branches')
  async getManagerBranches(@Param('manager_id', ParseIntPipe) manager_id: number) {
    const branches = await this.branchesService.getManagerBranches(manager_id);
    return branches; // Return array directly for frontend compatibility
  }

  // Branch Assistant endpoints
  @Post(':id/assistants')
  @HttpCode(HttpStatus.CREATED)
  async assignAssistant(
    @Param('id', ParseIntPipe) branch_id: number,
    @Body() assignAssistantDto: AssignAssistantDto,
  ) {
    const result = await this.branchesService.assignAssistant(branch_id, assignAssistantDto);
    return {
      success: true,
      message: 'Assistant assigned successfully',
      data: result,
    };
  }

  @Get(':id/assistants')
  async getBranchAssistants(@Param('id', ParseIntPipe) branch_id: number) {
    const assistants = await this.branchesService.getBranchAssistants(branch_id);
    return assistants; // Return array directly for frontend compatibility
  }

  @Delete(':id/assistants/:assistant_id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeAssistant(
    @Param('id', ParseIntPipe) branch_id: number,
    @Param('assistant_id', ParseIntPipe) assistant_id: number,
  ) {
    await this.branchesService.removeAssistant(branch_id, assistant_id);
    return {
      success: true,
      message: 'Assistant removed successfully',
    };
  }

  @Get('assistants/:assistant_id/branches')
  async getAssistantBranches(
    @Param('assistant_id', ParseIntPipe) assistant_id: number,
  ) {
    const branches = await this.branchesService.getAssistantBranches(assistant_id);
    return branches; // Return array directly for frontend compatibility
  }
}
