import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AccountType } from '../../common/enums/account-type.enum';

@Entity({ name: 'admin_accounts' })
export class AdminAccount {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 150 })
  fullName: string;

  @Column({ length: 254, unique: true })
  email: string;

  // Store hashed password, not plain text
  @Column({ type: 'varchar', length: 255, select: false })
  passwordHash: string;

  @Column({ type: 'enum', enum: AccountType })
  accountType: AccountType;

  @Column({ type: 'varchar', length: 150, nullable: true })
  favoriteCuisine?: string | null;

  @Column({ type: 'varchar', length: 150, nullable: true })
  location?: string | null;

  @Column({ type: 'boolean', default: false })
  policiesAccepted: boolean;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  deletedAt: Date | null;

  @Column({ type: 'int', nullable: true })
  createdBy: number | null;

  @Column({ type: 'int', nullable: true })
  updatedBy: number | null;

  @Column({ type: 'int', nullable: true })
  deletedBy: number | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
