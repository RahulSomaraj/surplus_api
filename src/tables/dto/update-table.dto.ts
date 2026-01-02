import { IsString, IsInt, Min, Max, IsOptional, IsEnum, IsBoolean } from 'class-validator';
import { TableStatus } from '../entities/table.entity';

export class UpdateTableDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(20)
  capacity?: number;

  @IsOptional()
  @IsEnum(TableStatus)
  status?: TableStatus;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
