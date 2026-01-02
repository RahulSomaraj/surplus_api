import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Table } from './entities/table.entity';
import { CreateTableDto } from './dto/create-table.dto';
import { UpdateTableDto } from './dto/update-table.dto';
import { DeleteTableDto } from './dto/delete-dto';

@Injectable()
export class TablesService {
  constructor(
    @InjectRepository(Table)
    private readonly tableRepo: Repository<Table>,
  ) {}

  async create(dto: CreateTableDto) {
    const tableExists = await this.tableRepo.findOne({
      where: { name: dto.name.trim() },
    });

    if (tableExists) {
      throw new NotFoundException('Table with this name already exists');
    }
    const table = this.tableRepo.create({
      name: dto.name.trim(),
      capacity: dto.capacity,
      status: dto.status,
      isActive: dto.isActive ?? true,
    });

    return this.tableRepo.save(table);
  }

  findAll() {
    return this.tableRepo.find({
      order: { id: 'ASC' },
    });
  }

  async findOne(id: number) {
    const table = await this.tableRepo.findOne({
      where: { id },
    });

    if (!table) {
      throw new NotFoundException('Table not found');
    }

    return table;
  }

  async update(id: number, dto: UpdateTableDto) {
    const table = await this.findOne(id);

    if (dto.name !== undefined) {
      table.name = dto.name.trim();
    }
    if (dto.capacity !== undefined) {
      table.capacity = dto.capacity;
    }
    if (dto.status !== undefined) {
      table.status = dto.status;
    }
    if (dto.isActive !== undefined) {
      table.isActive = dto.isActive;
    }

    return this.tableRepo.save(table);
  }

  async remove(id: number,deletedto:DeleteTableDto) {
    const table = await this.findOne(id);

    await this.tableRepo.update(id, { deletedAt: new Date(), deletedBy: deletedto.deletedBy });

    return { message: 'Table removed successfully' };
  }
}
