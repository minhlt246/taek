import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Branch, BranchManager, BranchAssistant } from './entities';
import {
  CreateBranchDto,
  UpdateBranchDto,
  AssignManagerDto,
  AssignAssistantDto,
} from './dto';
import { IBranchService } from './interfaces';

@Injectable()
export class BranchesService implements IBranchService {
  constructor(
    @InjectRepository(Branch)
    private readonly branchRepository: Repository<Branch>,
    @InjectRepository(BranchManager)
    private readonly branchManagerRepository: Repository<BranchManager>,
    @InjectRepository(BranchAssistant)
    private readonly branchAssistantRepository: Repository<BranchAssistant>,
  ) {}

  /**
   * Create a new branch
   * @param createBranchDto - Branch creation data
   * @returns Promise<Branch> - Created branch
   * @throws ConflictException - When branch code already exists
   */
  async create(createBranchDto: CreateBranchDto): Promise<Branch> {
    // Check if branch_code already exists
    const existingBranch = await this.branchRepository.findOne({
      where: { branch_code: createBranchDto.branch_code },
    });

    if (existingBranch) {
      throw new ConflictException('Branch code already exists');
    }

    const branch = this.branchRepository.create(createBranchDto);
    return await this.branchRepository.save(branch);
  }

  async findAll(): Promise<Branch[]> {
    return await this.branchRepository.find({
      relations: [
        'club',
        'managers',
        'managers.manager',
        'assistants',
        'assistants.assistant',
      ],
    });
  }

  async findOne(id: number): Promise<Branch> {
    const branch = await this.branchRepository.findOne({
      where: { id },
      relations: [
        'club',
        'managers',
        'managers.manager',
        'assistants',
        'assistants.assistant',
      ],
    });

    if (!branch) {
      throw new NotFoundException(`Branch with ID ${id} not found`);
    }

    return branch;
  }

  async findByClub(club_id: number): Promise<Branch[]> {
    return await this.branchRepository.find({
      where: { club_id },
      relations: [
        'club',
        'managers',
        'managers.manager',
        'assistants',
        'assistants.assistant',
      ],
    });
  }

  async findByCode(branch_code: string): Promise<Branch> {
    const branch = await this.branchRepository.findOne({
      where: { branch_code },
      relations: [
        'club',
        'managers',
        'managers.manager',
        'assistants',
        'assistants.assistant',
      ],
    });

    if (!branch) {
      throw new NotFoundException(`Branch with code ${branch_code} not found`);
    }

    return branch;
  }

  async update(id: number, updateBranchDto: UpdateBranchDto): Promise<Branch> {
    const branch = await this.findOne(id);

    // Check if branch_code already exists (if being updated)
    if (
      updateBranchDto.branch_code &&
      updateBranchDto.branch_code !== branch.branch_code
    ) {
      const existingBranch = await this.branchRepository.findOne({
        where: { branch_code: updateBranchDto.branch_code },
      });

      if (existingBranch) {
        throw new ConflictException('Branch code already exists');
      }
    }

    await this.branchRepository.update(id, updateBranchDto);
    return await this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const branch = await this.findOne(id);
    await this.branchRepository.remove(branch);
  }

  // Branch Manager methods
  async assignManager(
    branch_id: number,
    assignManagerDto: AssignManagerDto,
  ): Promise<BranchManager> {
    const branch = await this.findOne(branch_id);

    // Check if manager is already assigned to this branch
    const existingManager = await this.branchManagerRepository.findOne({
      where: { branch_id, manager_id: assignManagerDto.manager_id },
    });

    if (existingManager) {
      throw new ConflictException('Manager is already assigned to this branch');
    }

    const branchManager = this.branchManagerRepository.create({
      branch_id,
      manager_id: assignManagerDto.manager_id,
      role: assignManagerDto.role || 'main_manager',
    });

    return await this.branchManagerRepository.save(branchManager);
  }

  async removeManager(branch_id: number, manager_id: number): Promise<void> {
    const branchManager = await this.branchManagerRepository.findOne({
      where: { branch_id, manager_id },
    });

    if (!branchManager) {
      throw new NotFoundException('Manager assignment not found');
    }

    await this.branchManagerRepository.remove(branchManager);
  }

  async getBranchManagers(branch_id: number): Promise<BranchManager[]> {
    return await this.branchManagerRepository.find({
      where: { branch_id, is_active: true },
      relations: ['manager'],
    });
  }

  async getManagerBranches(manager_id: number): Promise<BranchManager[]> {
    return await this.branchManagerRepository.find({
      where: { manager_id, is_active: true },
      relations: ['branch'],
    });
  }

  // Branch Assistant methods
  async assignAssistant(
    branch_id: number,
    assignAssistantDto: AssignAssistantDto,
  ): Promise<BranchAssistant> {
    const branch = await this.findOne(branch_id);

    // Check if assistant is already assigned to this branch
    const existingAssistant = await this.branchAssistantRepository.findOne({
      where: { branch_id, assistant_id: assignAssistantDto.assistant_id },
    });

    if (existingAssistant) {
      throw new ConflictException(
        'Assistant is already assigned to this branch',
      );
    }

    const branchAssistant = this.branchAssistantRepository.create({
      branch_id,
      assistant_id: assignAssistantDto.assistant_id,
    });

    return await this.branchAssistantRepository.save(branchAssistant);
  }

  async removeAssistant(
    branch_id: number,
    assistant_id: number,
  ): Promise<void> {
    const branchAssistant = await this.branchAssistantRepository.findOne({
      where: { branch_id, assistant_id },
    });

    if (!branchAssistant) {
      throw new NotFoundException('Assistant assignment not found');
    }

    await this.branchAssistantRepository.remove(branchAssistant);
  }

  async getBranchAssistants(branch_id: number): Promise<BranchAssistant[]> {
    return await this.branchAssistantRepository.find({
      where: { branch_id, is_active: true },
      relations: ['assistant'],
    });
  }

  async getAssistantBranches(assistant_id: number): Promise<BranchAssistant[]> {
    return await this.branchAssistantRepository.find({
      where: { assistant_id, is_active: true },
      relations: ['branch'],
    });
  }
}
