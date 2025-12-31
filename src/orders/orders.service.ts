import { Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { Repository } from 'typeorm';
import { TransformationType } from 'class-transformer';

@Injectable()
export class OrdersService {
  
  constructor(@InjectRepository(Order) private readonly orders:Repository<Order>) {}
  
  async create(createOrderDto: CreateOrderDto) {
    try{
      const order = this.orders.create(createOrderDto);
      return await this.orders.save(order);
    }
    catch(error){
      console.error('Error creating order:', error);
      throw error;
    }
  }

  findAll() {
    const orders=this.orders.find();
    return orders;
  }

  findOne(id: number) {
    try{
      const order=this.orders.findOne({where:{id:id}});
      if(!order){
        throw new Error('Order not found');
      }
      return order;
    }
    catch(error){
      console.error('Error finding order:', error);
      throw error;
    }
  }

  update(id: number, updateOrderDto: UpdateOrderDto) {
    try{
      const order=this.orders.findOne({where:{id:id}});
      if(!order){
        throw new Error('Order not found');
      }
      this.orders.update(id,updateOrderDto);
      return this.orders.findOne({where:{id:id}});
    }
    catch(error){
      console.error('Error updating order:', error);
      throw error;
    }
  }

  remove(id: number) {
    try{
      const order=this.orders.findOne({where:{id:id}});
      if(!order){
        throw new Error('Order not found');
      }
      const deletedOrder= this.orders.update(id,{status:'deleted',deletedAt:new Date()});
      return {message:'Order deleted successfully',order:deletedOrder};
    }
    catch(error){
      console.error('Error removing order:', error);
      throw error;
    }
  }
}
