import { IsInt, IsString, IsOptional } from 'class-validator';

export class CreateKotDto {
  @IsInt()
  kotNumber: number;

  @IsInt()
  tableId: number;

  @IsInt()
  createdBy: number;

  @IsString()
  status: string;
}
