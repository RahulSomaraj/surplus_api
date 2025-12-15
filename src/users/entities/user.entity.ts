import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Role } from '../../common/enums/role.enum';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 254 })
  email: string;

  @Column({ length: 15 })
  phone: string;

  @Column({ type: 'text', nullable: true })
  photoURL: string | null;

  @Column({ type: 'enum', enum: Role, default: Role.CUSTOMER })
  role: Role;

  @Column({ type: 'varchar', length: 150, nullable: true })
  favoriteCuisine: string | null;

  @Column({ type: 'varchar', length: 150, default: '' })
  city: string;

  @Column({ type: 'boolean', default: false })
  termsAccepted: boolean;

  @Column({
    name: 'password_hash',
    type: 'varchar',
    length: 255,
    select: false,
  })
  passwordHash: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  deletedAt: Date | null;

  @Column({ type: 'int', nullable: true })
  createdBy: number | null;

  @Column({ type: 'int', nullable: true })
  updatedBy: number | null;

  @Column({ type: 'int', nullable: true })
  deletedBy: number | null;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;
}
