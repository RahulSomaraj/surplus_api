import { Injectable } from '@nestjs/common';
import { CreateKotDto } from './dto/create-kot.dto';
import { UpdateKotDto } from './dto/update-kot.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Kot } from './entities/kot.entity';
import { Repository, IsNull } from 'typeorm';

@Injectable()
export class KotService {

  constructor(@InjectRepository(Kot) private readonly kotRepo:Repository<Kot>){}

  create(createKotDto: CreateKotDto) {
    try{
      const kot=this.kotRepo.create({
        kotNumber:createKotDto.kotNumber,
        tableId:createKotDto.tableId,
        createdBy:createKotDto.createdBy,
        status:createKotDto.status
      });
      return this.kotRepo.save(kot);
    }
    catch(err)
    {
      if(err instanceof Error)
      {
        throw new Error(err.message);
      }
      throw err;
    }
  }

  findAll() {
    try{  
      const kots=this.kotRepo.find({
        where:{deletedAt:IsNull()},
        order:{id:'ASC'}
      });
      return kots;
    }
    catch(err)
    {
      if(err instanceof Error)
      {
        throw new Error(err.message);
      }
      throw err;
    }
  }

  findOne(id: number) {
    try{
        const kot=this.kotRepo.findOne({
          where:{id,deletedAt:IsNull()}
        });
        if(!kot) throw new Error('Kot not found');
        return kot;
    }
    catch(err)
    {
      if(err instanceof Error)
      {
        throw new Error(err.message);
      }
      throw err;
    }
  }

  update(id: number, updateKotDto: UpdateKotDto) {
    try{
      const kot=this.kotRepo.findOne({
        where:{id,deletedAt:IsNull()}
      });
      if(!kot) throw new Error('Kot not found');
      return this.kotRepo.update(id,updateKotDto);
    }
    catch(err)
    {
      if(err instanceof Error)
      {
        throw new Error(err.message);
      }
      throw err;
    }
  }

  remove(id: number) {
    try{
      const kot=this.kotRepo.findOne({
        where:{id,deletedAt:IsNull()}
      });
      if(!kot) throw new Error('Kot not found');
      return this.kotRepo.update(id,{deletedAt:new Date()});
    }
    catch(err)
    {
      if(err instanceof Error)
      {
        throw new Error(err.message);
      }
      throw err;
    }
  }
}
