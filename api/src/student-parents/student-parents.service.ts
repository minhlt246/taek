import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StudentParent } from './entities/student-parent.entity';
import { CreateStudentParentDto, UpdateStudentParentDto } from './dto';
import { IStudentParentService } from './interfaces';

@Injectable()
export class StudentParentsService implements IStudentParentService {
  constructor(
    @InjectRepository(StudentParent)
    private readonly studentParentRepository: Repository<StudentParent>,
  ) {}

  async create(
    createStudentParentDto: CreateStudentParentDto,
  ): Promise<StudentParent> {
    const studentParent = this.studentParentRepository.create(
      createStudentParentDto,
    );
    return await this.studentParentRepository.save(studentParent);
  }

  async findAll(): Promise<StudentParent[]> {
    return await this.studentParentRepository.find({
      relations: ['student', 'parent'],
    });
  }

  async findOne(id: number): Promise<StudentParent> {
    const studentParent = await this.studentParentRepository.findOne({
      where: { id },
      relations: ['student', 'parent'],
    });

    if (!studentParent) {
      throw new NotFoundException(
        `Student-Parent relationship with ID ${id} not found`,
      );
    }

    return studentParent;
  }

  async findByStudent(student_id: number): Promise<StudentParent[]> {
    return await this.studentParentRepository.find({
      where: { student_id },
      relations: ['student', 'parent'],
    });
  }

  async findByParent(parent_id: number): Promise<StudentParent[]> {
    return await this.studentParentRepository.find({
      where: { parent_id },
      relations: ['student', 'parent'],
    });
  }

  async update(
    id: number,
    updateStudentParentDto: UpdateStudentParentDto,
  ): Promise<StudentParent> {
    await this.findOne(id);
    await this.studentParentRepository.update(id, updateStudentParentDto);
    return await this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const studentParent = await this.findOne(id);
    await this.studentParentRepository.remove(studentParent);
  }
}
