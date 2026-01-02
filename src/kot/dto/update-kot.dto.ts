import { IsInt, IsOptional, IsString } from 'class-validator';

export class UpdateKotDto {
  @IsOptional()
  @IsInt()
  kotNumber?: number;

  @IsOptional()
  @IsInt()
  tableId?: number;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsInt()
  updatedBy?: number;
}
