import { Inject, Injectable } from '@nestjs/common';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Menu } from './entities/menu.entity';
import { Repository, IsNull } from 'typeorm';
import { DeleteMenuDto } from './dto/delete-dto';

@Injectable()
export class MenuService {
 
  constructor(@InjectRepository(Menu) private readonly menuRepository: Repository<Menu>) {}

  async create(createMenuDto: CreateMenuDto) {
    try{
      const menuExists=await this.menuRepository.findOne({where:{name:createMenuDto.name,restaurantId:createMenuDto.restaurantId,deletedAt:IsNull()}});
      if(menuExists){
        throw new Error('Menu with the same name already exists for this restaurant');
      }
      const menu = this.menuRepository.create(createMenuDto);
      return this.menuRepository.save(menu);
    }
    catch(error)
    {
      console.error('Error creating menu:', error);
      throw error;
    }
  }

  async findAll() {
    const menus=await this.menuRepository.find({where:{deletedAt:IsNull()}});
    return menus;
  }

  async findOne(id: number) {
    try{
      const menu=await this.menuRepository.findOne({where:{id:id,deletedAt:IsNull()}});
      if(!menu){
        throw new Error('Menu not found');
      }
      return menu;
    }
    catch(error){
      console.error('Error finding menu:', error);
      throw error;
    }
  }

  async update(id: number, updateMenuDto: UpdateMenuDto) {
    try{
      const menu=await this.menuRepository.findOne({where:{id:id,deletedAt:IsNull()}});
      if(!menu){
        throw new Error('Menu not found');
      }
      await this.menuRepository.update(id,updateMenuDto);
      return await this.menuRepository.findOne({where:{id:id,deletedAt:IsNull()}});
    }
    catch(error){
      console.error('Error updating menu:', error);
      throw error;
    }
  }

  async remove(id: number,deleteMenuDto:DeleteMenuDto) {
    try{
      const menu=await this.menuRepository.findOne({where:{id:id,deletedAt:IsNull()}});
      if(!menu){
        throw new Error('Menu not found');
      }
      await this.menuRepository.update(id,{deletedAt:new Date()});
      return {message:'Menu deleted successfully'};
    }
    catch(error){
      console.error('Error removing menu:', error);
      throw error;
    }
  }
}
