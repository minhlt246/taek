import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Poomsae } from './poomsae.entity';
import { BeltLevelPoomsae } from './belt-level-poomsae.entity';
import { CreatePoomsaeDto } from './dto/create-poomsae.dto';
import { UpdatePoomsaeDto } from './dto/update-poomsae.dto';

@Injectable()
export class PoomsaeService {
  constructor(
    @InjectRepository(Poomsae)
    private poomsaeRepository: Repository<Poomsae>,
    @InjectRepository(BeltLevelPoomsae)
    private beltLevelPoomsaeRepository: Repository<BeltLevelPoomsae>,
  ) {}

  async create(createPoomsaeDto: CreatePoomsaeDto): Promise<Poomsae> {
    const poomsae = this.poomsaeRepository.create(createPoomsaeDto);
    return await this.poomsaeRepository.save(poomsae);
  }

  async findAll(): Promise<Poomsae[]> {
    return await this.poomsaeRepository.find({
      order: { tenBaiQuyenVietnamese: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Poomsae | null> {
    return await this.poomsaeRepository.findOne({
      where: { id },
      relations: ['beltLevelPoomsaes', 'beltLevelPoomsaes.beltLevel'],
    });
  }

  async update(
    id: number,
    updatePoomsaeDto: UpdatePoomsaeDto,
  ): Promise<Poomsae | null> {
    await this.poomsaeRepository.update(id, updatePoomsaeDto);
    return await this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.poomsaeRepository.delete(id);
  }

  async findByBeltLevel(beltLevelId: number): Promise<Poomsae[]> {
    const beltLevelPoomsaes = await this.beltLevelPoomsaeRepository.find({
      where: { capDaiId: beltLevelId },
      relations: ['poomsae'],
      order: { thuTuUuTien: 'ASC' },
    });

    return beltLevelPoomsaes.map((bp) => bp.poomsae);
  }

  async getRequiredPoomsaeForBeltLevel(
    beltLevelId: number,
  ): Promise<Poomsae[]> {
    const beltLevelPoomsaes = await this.beltLevelPoomsaeRepository.find({
      where: {
        capDaiId: beltLevelId,
        loaiQuyen: 'bat_buoc',
      },
      relations: ['poomsae'],
      order: { thuTuUuTien: 'ASC' },
    });

    return beltLevelPoomsaes.map((bp) => bp.poomsae);
  }

  async linkBeltLevelToPoomsae(
    beltLevelId: number,
    poomsaeId: number,
    loaiQuyen: 'bat_buoc' | 'tu_chon' | 'bo_sung' = 'bat_buoc',
    thuTuUuTien: number = 1,
  ): Promise<BeltLevelPoomsae> {
    const beltLevelPoomsae = this.beltLevelPoomsaeRepository.create({
      capDaiId: beltLevelId,
      baiQuyenId: poomsaeId,
      loaiQuyen,
      thuTuUuTien,
    });

    return await this.beltLevelPoomsaeRepository.save(beltLevelPoomsae);
  }

  async unlinkBeltLevelFromPoomsae(
    beltLevelId: number,
    poomsaeId: number,
  ): Promise<void> {
    await this.beltLevelPoomsaeRepository.delete({
      capDaiId: beltLevelId,
      baiQuyenId: poomsaeId,
    });
  }
}
