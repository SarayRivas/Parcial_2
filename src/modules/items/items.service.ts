import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Item, ItemType } from './entities/item.entity';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { LoanStatus } from '../loans/entities/loan.entity';

@Injectable()
export class ItemsService {
  constructor(
    @InjectRepository(Item) private readonly itemsRepo: Repository<Item>,
  ) {}

  async create(dto: CreateItemDto): Promise<Item> {
    const existing = await this.itemsRepo.findOne({ where: { code: dto.code } });
    if (existing) {
      throw new ConflictException(`Item with code '${dto.code}' already exists`);
    }
    const item = this.itemsRepo.create(dto);
    return this.itemsRepo.save(item);
  }

  async findAll(type?: ItemType): Promise<(Item & { isAvailable: boolean })[]> {
    const qb = this.itemsRepo
      .createQueryBuilder('item')
      .where('item.isActive = :isActive', { isActive: true });

    if (type) {
      qb.andWhere('item.type = :type', { type });
    }

    const items = await qb.getMany();

    // Check availability: item has no active/overdue loan
    const itemsWithAvailability = await Promise.all(
      items.map(async (item) => {
        const activeLoan = await this.itemsRepo.manager
          .getRepository('loans')
          .createQueryBuilder('loan')
          .where('loan.itemId = :itemId', { itemId: item.id })
          .andWhere('loan.status IN (:...statuses)', {
            statuses: [LoanStatus.ACTIVE, LoanStatus.OVERDUE],
          })
          .getOne();
        return { ...item, isAvailable: !activeLoan };
      }),
    );

    return itemsWithAvailability;
  }

  async findOne(id: string): Promise<Item & { isAvailable: boolean }> {
    const item = await this.itemsRepo.findOne({ where: { id, isActive: true } });
    if (!item) {
      throw new NotFoundException(`Item ${id} not found`);
    }

    const activeLoan = await this.itemsRepo.manager
      .getRepository('loans')
      .createQueryBuilder('loan')
      .where('loan.itemId = :itemId', { itemId: item.id })
      .andWhere('loan.status IN (:...statuses)', {
        statuses: [LoanStatus.ACTIVE, LoanStatus.OVERDUE],
      })
      .getOne();

    return { ...item, isAvailable: !activeLoan };
  }

  async update(id: string, dto: UpdateItemDto): Promise<Item> {
    const item = await this.itemsRepo.findOne({ where: { id, isActive: true } });
    if (!item) {
      throw new NotFoundException(`Item ${id} not found`);
    }
    Object.assign(item, dto);
    return this.itemsRepo.save(item);
  }

  async remove(id: string): Promise<void> {
    const item = await this.itemsRepo.findOne({ where: { id, isActive: true } });
    if (!item) {
      throw new NotFoundException(`Item ${id} not found`);
    }
    item.isActive = false;
    await this.itemsRepo.save(item);
  }
}