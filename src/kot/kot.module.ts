import { Module } from '@nestjs/common';
import { KotService } from './kot.service';
import { KotController } from './kot.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Kot } from './entities/kot.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Kot])],
  controllers: [KotController],
  providers: [KotService],
})
export class KotModule {}
