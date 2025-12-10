import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { AccountType } from '../../common/enums/account-type.enum';

export class CreateAdminAccountDto {
  @ApiProperty({ description: 'Full name', example: 'Jane Admin' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  fullName: string;

  @ApiProperty({ description: 'Email address', example: 'admin@example.com' })
  @IsEmail()
  @MaxLength(254)
  email: string;

  @ApiProperty({
    description: 'Password (will be hashed)',
    example: 'Password123!',
  })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({
    description: 'Account type',
    enum: AccountType,
    example: AccountType.RestaurantOwner,
  })
  @IsEnum(AccountType)
  accountType: AccountType;

  @ApiPropertyOptional({
    description: 'Favorite cuisine',
    example: 'Italian',
  })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  favoriteCuisine?: string;

  @ApiPropertyOptional({
    description: 'Location / city',
    example: 'New York',
  })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  location?: string;

  @ApiProperty({
    description: 'Indicates privacy & terms policies were accepted',
    example: true,
  })
  @IsBoolean()
  policiesAccepted: boolean;
}
