import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { Restaurant } from './entities/restaurant.entity';

@Injectable()
export class RestaurantsService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurantRepo: Repository<Restaurant>,
  ) {}

  async create(dto: CreateRestaurantDto, userId?: number) {
    const restaurant = this.restaurantRepo.create({
      name: dto.name.trim(),
      location: dto.location.trim(),
      createdBy: userId ?? null,
      isActive: true,
    });
    return this.restaurantRepo.save(restaurant);
  }

  findAll() {
    return this.restaurantRepo.find({
      where: { deletedAt: IsNull() },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number) {
    const restaurant = await this.restaurantRepo.findOne({
      where: { id, deletedAt: IsNull() },
    });
    if (!restaurant) {
      throw new NotFoundException('Restaurant not found');
    }
    return restaurant;
  }

  async update(id: number, dto: UpdateRestaurantDto, userId?: number) {
    const restaurant = await this.findOne(id);

    if (dto.name !== undefined) {
      restaurant.name = dto.name.trim();
    }
    if (dto.location !== undefined) {
      restaurant.location = dto.location.trim();
    }
    if (dto.isActive !== undefined) {
      restaurant.isActive = dto.isActive;
    }

    restaurant.updatedBy = userId ?? restaurant.updatedBy ?? null;
    return this.restaurantRepo.save(restaurant);
  }

  async remove(id: number, userId?: number) {
    const restaurant = await this.findOne(id);
    restaurant.deletedAt = new Date();
    restaurant.deletedBy = userId ?? null;
    restaurant.isActive = false;
    await this.restaurantRepo.save(restaurant);
    return { message: 'Restaurant removed successfully' };
  }
}
