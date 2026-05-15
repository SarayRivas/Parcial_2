import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
 
export enum UserRole {
  ADMIN = 'admin',
  LIBRARIAN = 'librarian',
  MEMBER = 'member',
}
 
@Entity('users')
export class User {
  @ApiProperty({ example: 'uuid-here' })
  @PrimaryGeneratedColumn('uuid')
  id: string;
 
  @ApiProperty({ example: 'user@email.com' })
  @Index({ unique: true })
  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;
 
  @Exclude()
  @Column({ type: 'varchar', length: 255 })
  passwordHash: string;
 
  @ApiProperty({ example: 'Juan' })
  @Column({ type: 'varchar', length: 100 })
  firstName: string;
 
  @ApiProperty({ example: 'Pérez' })
  @Column({ type: 'varchar', length: 100 })
  lastName: string;
 
  @ApiProperty({ enum: UserRole, default: UserRole.MEMBER })
  @Column({ type: 'enum', enum: UserRole, default: UserRole.MEMBER })
  role: UserRole;
 
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
 