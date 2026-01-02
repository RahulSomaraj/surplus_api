import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum TableStatus {
  AVAILABLE = 'available',
  OCCUPIED = 'occupied',
  RESERVED = 'reserved',
}

@Entity({ name: 'tables' })
export class Table {
  @PrimaryGeneratedColumn()
  id: number; // auto-increment number

  @Column({ length: 50 })
  name: string; // e.g. "T1", "Table 10"

  @Column({ type: 'int' })
  capacity: number; // seats count

  @Column({
    type: 'enum',
    enum: TableStatus,
    default: TableStatus.AVAILABLE,
  })
  status: TableStatus;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  deletedAt: Date | null;
    
  @Column({ type: 'int', nullable: true })
  deletedBy: number | null;
}
