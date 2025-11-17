import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BeltLevel } from './entities/belt-level.entity';
import { CreateBeltLevelDto, UpdateBeltLevelDto } from './dto';
import { IBeltLevelService } from './interfaces';

@Injectable()
export class BeltLevelsService implements IBeltLevelService {
  constructor(
    @InjectRepository(BeltLevel)
    private readonly beltLevelRepository: Repository<BeltLevel>,
  ) {}

  async create(createBeltLevelDto: CreateBeltLevelDto): Promise<BeltLevel> {
    // Check if name already exists
    const existingBeltLevel = await this.beltLevelRepository.findOne({
      where: { name: createBeltLevelDto.name },
    });

    if (existingBeltLevel) {
      throw new ConflictException('Belt level name already exists');
    }

    // Create belt level
    const beltLevel = this.beltLevelRepository.create(createBeltLevelDto);
    return await this.beltLevelRepository.save(beltLevel);
  }

  async findAll(): Promise<BeltLevel[]> {
    return await this.beltLevelRepository.find({
      order: { order_sequence: 'ASC' },
    });
  }

  async findOne(id: number): Promise<BeltLevel> {
    const beltLevel = await this.beltLevelRepository.findOne({
      where: { id },
    });

    if (!beltLevel) {
      throw new NotFoundException(`Belt level with ID ${id} not found`);
    }

    return beltLevel;
  }

  async findByName(name: string): Promise<BeltLevel> {
    const beltLevel = await this.beltLevelRepository.findOne({
      where: { name },
    });

    if (!beltLevel) {
      throw new NotFoundException(`Belt level with name ${name} not found`);
    }

    return beltLevel;
  }

  async update(
    id: number,
    updateBeltLevelDto: UpdateBeltLevelDto,
  ): Promise<BeltLevel> {
    const beltLevel = await this.findOne(id);

    // Check if name already exists (if being updated)
    if (updateBeltLevelDto.name && updateBeltLevelDto.name !== beltLevel.name) {
      const existingBeltLevel = await this.beltLevelRepository.findOne({
        where: { name: updateBeltLevelDto.name },
      });

      if (existingBeltLevel) {
        throw new ConflictException('Belt level name already exists');
      }
    }

    // Update belt level
    await this.beltLevelRepository.update(id, updateBeltLevelDto);
    return await this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const beltLevel = await this.findOne(id);
    await this.beltLevelRepository.remove(beltLevel);
  }

  /**
   * Fix order_sequence for all belt levels
   * Automatically assigns correct order_sequence based on belt level names
   */
  async fixOrderSequence(): Promise<{
    success: boolean;
    message: string;
    updated: number;
  }> {
    try {
      const allBeltLevels = await this.beltLevelRepository.find({
        order: { order_sequence: 'ASC' },
      });

      console.log(
        `[BeltLevelsService] Fixing order sequence for ${allBeltLevels.length} belt levels`,
      );

      // Mapping belt level names to correct order_sequence
      // Cấp đai màu (thấp đến cao): Cấp 10 -> Cấp 1
      // Cấp đai đen (thấp đến cao): 1 Dan -> 10 Dan
      const orderMap: Record<string, number> = {
        // Cấp đai màu - thứ tự từ thấp đến cao (order_sequence nhỏ = thấp)
        'Cấp 10': 1, // Thấp nhất
        'Cấp 9': 2,
        'Cấp 8': 3,
        'Cấp 7': 4,
        'Cấp 6': 5,
        'Cấp 5': 6,
        'Cấp 4': 7,
        'Cấp 3': 8,
        'Cấp 2': 9,
        'Cấp 1': 10, // Cao nhất trong cấp màu
        // Cấp đai đen - thứ tự từ thấp đến cao (sau cấp màu)
        'Nhất đẳng (1 Dan)': 11, // Thấp nhất trong cấp đen
        'Nhị đẳng (2 Dan)': 12,
        'Tam đẳng (3 Dan)': 13,
        'Tứ đẳng (4 Dan)': 14,
        'Ngũ đẳng (5 Dan)': 15,
        'Lục đẳng (6 Dan)': 16,
        'Thất đẳng (7 Dan)': 17,
        'Bát đẳng (8 Dan)': 18,
        'Cửu đẳng (9 Dan)': 19,
        'Thập đẳng (10 Dan)': 20, // Cao nhất
      };

      let updatedCount = 0;

      for (const beltLevel of allBeltLevels) {
        const correctOrder = orderMap[beltLevel.name];

        if (correctOrder !== undefined && beltLevel.order_sequence !== correctOrder) {
          beltLevel.order_sequence = correctOrder;
          await this.beltLevelRepository.save(beltLevel);
          updatedCount++;
          console.log(
            `[BeltLevelsService] Updated "${beltLevel.name}" order_sequence from ${beltLevel.order_sequence} to ${correctOrder}`,
          );
        }
      }

      // For belt levels not in the map, assign sequential order after 20
      let nextOrder = 21;
      for (const beltLevel of allBeltLevels) {
        if (orderMap[beltLevel.name] === undefined) {
          beltLevel.order_sequence = nextOrder++;
          await this.beltLevelRepository.save(beltLevel);
          updatedCount++;
          console.log(
            `[BeltLevelsService] Assigned order_sequence ${beltLevel.order_sequence} to "${beltLevel.name}"`,
          );
        }
      }

      return {
        success: true,
        message: `Fixed order sequence for ${updatedCount} belt level(s)`,
        updated: updatedCount,
      };
    } catch (error) {
      console.error('[BeltLevelsService] Error fixing order sequence:', error);
      throw error;
    }
  }

  /**
   * Update color belt levels (Cấp 10 -> Cấp 1) based on standard Taekwondo colors
   * Keeps black belt levels (Dan) unchanged
   */
  async updateColorBeltLevels(): Promise<{
    success: boolean;
    message: string;
    updated: number;
  }> {
    try {
      const allBeltLevels = await this.beltLevelRepository.find({
        order: { order_sequence: 'ASC' },
      });

      console.log(
        `[BeltLevelsService] Updating color belt levels. Found ${allBeltLevels.length} total belt levels`,
      );

      // Mapping for color belt levels (Cấp 10 -> Cấp 1)
      // Based on image: colors and poomsae codes
      const colorBeltMap: Record<
        string,
        { color: string; description: string; poomsaeCode?: string }
      > = {
        'Cấp 10': {
          color: 'White',
          description: 'Đai trắng cấp 10',
          poomsaeCode: 'KT1',
        },
        'Cấp 9': {
          color: 'Orange',
          description: 'Đai cam cấp 9',
          poomsaeCode: 'KT2',
        },
        'Cấp 8': {
          color: 'Violet',
          description: 'Đai tím cấp 8',
          poomsaeCode: 'Q1',
        },
        'Cấp 7': {
          color: 'Yellow',
          description: 'Đai vàng cấp 7',
          poomsaeCode: 'Q2',
        },
        'Cấp 6': {
          color: 'Green',
          description: 'Đai xanh lá cấp 6',
          poomsaeCode: 'Q3',
        },
        'Cấp 5': {
          color: 'Blue',
          description: 'Đai xanh dương cấp 5',
          poomsaeCode: 'Q4',
        },
        'Cấp 4': {
          color: 'Red',
          description: 'Đai đỏ cấp 4',
          poomsaeCode: 'Q5',
        },
        'Cấp 3': {
          color: 'Red-Black',
          description: 'Đai đỏ đen cấp 3',
          poomsaeCode: 'Q6',
        },
        'Cấp 2': {
          color: 'Red-Black',
          description: 'Đai đỏ đen cấp 2',
          poomsaeCode: 'Q7',
        },
        'Cấp 1': {
          color: 'Red-Black',
          description: 'Đai đỏ đen cấp 1',
          poomsaeCode: 'Thi Q8',
        },
      };

      let updatedCount = 0;

      for (const beltLevel of allBeltLevels) {
        // Only update color belt levels (Cấp 10 -> Cấp 1)
        // Skip black belt levels (Dan)
        if (beltLevel.name.startsWith('Cấp ')) {
          const updateData = colorBeltMap[beltLevel.name];

          if (updateData) {
            const needsUpdate =
              beltLevel.color !== updateData.color ||
              beltLevel.description !== updateData.description;

            if (needsUpdate) {
              beltLevel.color = updateData.color;
              beltLevel.description = updateData.description;
              await this.beltLevelRepository.save(beltLevel);
              updatedCount++;
              console.log(
                `[BeltLevelsService] Updated "${beltLevel.name}": color="${updateData.color}", description="${updateData.description}"`,
              );
            }
          } else {
            console.warn(
              `[BeltLevelsService] No mapping found for "${beltLevel.name}"`,
            );
          }
        } else {
          // Black belt level - skip
          console.log(
            `[BeltLevelsService] Skipping black belt level: "${beltLevel.name}"`,
          );
        }
      }

      return {
        success: true,
        message: `Updated ${updatedCount} color belt level(s). Black belt levels unchanged.`,
        updated: updatedCount,
      };
    } catch (error) {
      console.error('[BeltLevelsService] Error updating color belt levels:', error);
      throw error;
    }
  }
}
