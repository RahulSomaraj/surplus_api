import { IsString, IsInt, Min, Max, IsOptional, IsEnum } from 'class-validator';
import { TableStatus } from '../entities/table.entity';

export class CreateTableDto {
  @IsString()
  name: string;

  @IsInt()
  @Min(1)
  @Max(20)
  capacity: number;

  @IsOptional()
  @IsEnum(TableStatus)
  status?: TableStatus;

  @IsOptional()
  isActive?: boolean;
}
