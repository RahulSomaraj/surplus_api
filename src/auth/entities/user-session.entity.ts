import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity()
export class UserSession {
  @PrimaryColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  user: User;

  @Column()
  refreshToken: string;

  @Column({ default: false })
  revoked: boolean;

  @Column()
  expiresAt: Date;

  @Column({ type: 'varchar', nullable: true })
  deviceInfo: string | null;

  @CreateDateColumn()
  createdAt: Date;
}
