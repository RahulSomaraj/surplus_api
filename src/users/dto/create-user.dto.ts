import { Transform } from 'class-transformer';
import {
  Equals,
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../../common/enums/role.enum';

export class CreateUserDto {
  @ApiProperty({
    description: 'Role of the user',
    enum: Role,
    example: Role.CUSTOMER,
  })
  @IsEnum(Role, { message: 'Role must be one of the supported values' })
  role: Role;

  @ApiProperty({
    description: 'Email address of the user',
    example: 'user@example.com',
    maxLength: 254,
  })
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Email must be valid' })
  @MaxLength(254, { message: 'Email must be at most 254 characters' })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  email: string;

  @ApiProperty({
    description: '10-digit Indian mobile number',
    example: '9876543210',
    pattern: '^[6-9]\\d{9}$',
  })
  @IsString()
  @IsNotEmpty({ message: 'Phone number is required' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @Matches(/^[6-9]\d{9}$/, {
    message: 'Phone number must be a valid 10-digit Indian mobile number',
  })
  phoneNumber: string;

  @ApiProperty({
    description: 'Password (must include uppercase, lowercase, number, and special character)',
    example: 'SecurePass123!',
    minLength: 8,
    maxLength: 128,
  })
  @IsNotEmpty({ message: 'Password is required' })
  @IsString()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @MaxLength(128, { message: 'Password must be at most 128 characters' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/, {
    message:
      'Password must include at least 1 uppercase, 1 lowercase, 1 number, and 1 special character',
  })
  password: string;

  @ApiProperty({
    description: 'Favorite cuisine of the user',
    example: 'Italian',
    maxLength: 150,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(150, { message: 'Favorite cuisine must be at most 150 characters' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  favoriteCuisine?: string;

  @ApiProperty({
    description: 'City of the user',
    example: 'New York',
    maxLength: 150,
  })
  @IsString()
  @IsNotEmpty({ message: 'City is required' })
  @MaxLength(150, { message: 'City must be at most 150 characters' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  city: string;

  @ApiProperty({
    description: 'Terms acceptance flag',
    example: true,
  })
  @IsBoolean()
  @Equals(true, { message: 'termsAccepted must be true' })
  termsAccepted: boolean;
}
