import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';

export class UpdateUserDto {
  @ApiPropertyOptional({
    description: 'Email address of the user',
    example: 'user@example.com',
    maxLength: 254,
  })
  @IsOptional()
  @ValidateIf((o) => o.email !== undefined && o.email !== null && o.email !== '')
  @IsEmail({}, { message: 'Email must be valid' })
  @MaxLength(254, { message: 'Email must be at most 254 characters' })
  @Transform(({ value }) =>
    typeof value === 'string' && value.trim() !== ''
      ? value.trim().toLowerCase()
      : undefined,
  )
  email?: string;

  @ApiPropertyOptional({
    description: '10-digit Indian mobile number',
    example: '9876543210',
    pattern: '^[6-9]\\d{9}$',
  })
  @IsOptional()
  @ValidateIf(
    (o) => o.phoneNumber !== undefined && o.phoneNumber !== null && o.phoneNumber !== '',
  )
  @IsString({ message: 'Phone number must be a string' })
  @Matches(/^[6-9]\d{9}$/, {
    message: 'Phone number must be a valid 10-digit Indian mobile number',
  })
  phoneNumber?: string;

  @ApiPropertyOptional({
    description: 'Password (must include uppercase, lowercase, number, and special character)',
    example: 'SecurePass123!',
    minLength: 8,
    maxLength: 128,
  })
  @IsOptional()
  @ValidateIf((o) => o.password !== undefined && o.password !== null && o.password !== '')
  @IsString({ message: 'Password must be a string' })
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @MaxLength(128, { message: 'Password must be at most 128 characters' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/, {
    message:
      'Password must include at least 1 uppercase, 1 lowercase, 1 number, and 1 special character',
  })
  password?: string;
}

