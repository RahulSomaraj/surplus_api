import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateRestaurantDto {
  @ApiProperty({
    description: 'Name of the restaurant',
    example: 'Sunrise Diner',
    maxLength: 200,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name: string;

  @ApiProperty({
    description: 'Location of the restaurant',
    example: '123 Main St, Springfield',
    maxLength: 200,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  location: string;
}
