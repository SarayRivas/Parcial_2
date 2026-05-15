import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export enum ItemType {
  BOOK = 'book',
  MAGAZINE = 'magazine',
  EQUIPMENT = 'equipment',
}

@Entity('items')
export class Item {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 'BK-0042' })
  @Index({ unique: true })
  @Column({ type: 'varchar', length: 32, unique: true })
  code: string;

  @ApiProperty({ example: 'El Quijote' })
  @Column({ type: 'varchar', length: 255 })
  title: string;

  @ApiProperty({ enum: ItemType })
  @Column({ type: 'enum', enum: ItemType })
  type: ItemType;

  @ApiProperty({ default: true })
  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;
}