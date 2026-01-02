import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('kot')
export class Kot {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'int' })
    kotNumber: number;

    @Column({ type: 'int' })
    tableId: number;

    @Column({ type: 'int' })
    createdBy: number;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Column()
    status: string;

    @Column({ type: 'timestamp', nullable: true })
    updatedAt: Date;

    @Column({ type: 'int', nullable: true })
    updatedBy: number;

    @Column({ type: 'timestamp', nullable: true })
    deletedAt: Date | null;

    @Column({ type: 'int', nullable: true })
    deletedBy: number | null;

}
