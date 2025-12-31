import { Type } from 'class-transformer';
import {
  IsString,
  IsOptional,
  IsUUID,
  IsBoolean,
  IsNumber,
  Min,
  MaxLength,
  IsNotEmpty,
  IsInt,
} from 'class-validator';

export class UpdateMenuDto {
  @IsOptional()
  @IsString()
  @MaxLength(150)
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsNotEmpty({ message: 'deletedBy is required' })
  @Type(() => Number)
  @IsInt({ message: 'deletedBy must be a number' })
  restaurantId?: number;
}
