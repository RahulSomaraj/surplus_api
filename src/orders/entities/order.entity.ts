import { Column, CreateDateColumn, DeleteDateColumn, Entity, UpdateDateColumn } from "typeorm";
import { PrimaryGeneratedColumn } from "typeorm/browser";

@Entity('orders')
export class Order {
    @PrimaryGeneratedColumn()
    id: number;

    @Column('text',{ array: true })
    items:string[];

    @Column('decimal',{ precision: 10, scale: 2 })
    totalPrice:number;

    @Column()
    userId:number;

    @Column()
    restaurantId:number;

    @Column()
    status:string;

    @CreateDateColumn()
    createdAt: Date;
   
    @UpdateDateColumn()
    updatedAt: Date;
   
    @DeleteDateColumn()
    deletedAt?: Date;

    @Column({ type: 'int', nullable: true })
    createdBy?: number;
  
    @Column({ type: 'int', nullable: true })
    updatedBy?: number;
  
    @Column({ type: 'int', nullable: true })
    deletedByUserId?: number;   
}

