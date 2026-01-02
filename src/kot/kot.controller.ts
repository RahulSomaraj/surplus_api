import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { KotService } from './kot.service';
import { CreateKotDto } from './dto/create-kot.dto';
import { UpdateKotDto } from './dto/update-kot.dto';

@Controller('kot')
export class KotController {
  constructor(private readonly kotService: KotService) {}

  @Post()
  create(@Body() createKotDto: CreateKotDto) {
    return this.kotService.create(createKotDto);
  }

  @Get()
  findAll() {
    return this.kotService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.kotService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateKotDto: UpdateKotDto) {
    return this.kotService.update(+id, updateKotDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.kotService.remove(+id);
  }
}
