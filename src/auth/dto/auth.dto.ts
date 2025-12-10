import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AuthPayloadDto {
  @ApiPropertyOptional({
    description: '10-digit Indian mobile number',
    example: '9876543210',
    pattern: '^[6-9]\\d{9}$',
  })
  @IsOptional()
  @IsString()
  @Matches(/^[6-9]\d{9}$/, {
    message: 'Phone number must be a valid 10-digit Indian mobile number',
  })
  phoneNumber?: string;

  @ApiPropertyOptional({
    description: 'Email address (alternative to phone login)',
    example: 'user@example.com',
  })
  @IsOptional()
  @IsEmail({}, { message: 'Email must be a valid email address' })
  email?: string;

  @ApiProperty({
    description: 'User password',
    example: 'Password123!',
  })
  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(1, { message: 'Password cannot be empty' })
  password: string;
}

export class RefreshTokenDto {
  @ApiProperty({
    description: 'Refresh token obtained from login',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsString()
  @IsNotEmpty({ message: 'Refresh token is required' })
  refreshToken: string;
}

export class LogoutDto {
  @ApiPropertyOptional({
    description: 'Session ID to logout from (optional, if not provided logs out from current session)',
    example: 'session-123-456',
  })
  @IsOptional()
  @IsString({ message: 'Session ID must be a string' })
  sessionId?: string;
}

export class ForgotPasswordDto {
  @ApiProperty({
    description: 'Email address of the user requesting password reset',
    example: 'user@example.com',
  })
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Email must be a valid email address' })
  email: string;
}

export class VerifyOtpDto {
  @ApiProperty({
    description: 'Email address the OTP was sent to',
    example: 'user@example.com',
  })
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Email must be a valid email address' })
  email: string;

  @ApiProperty({
    description: '4-digit OTP code',
    example: '1234',
  })
  @IsString()
  @Matches(/^\d{4}$/, { message: 'OTP must be a 4-digit code' })
  otp: string;
}

export class ResetPasswordDto {
  @ApiProperty({
    description: 'Reset token received after OTP verification',
    example: 'reset-token-abc123xyz',
  })
  @IsString()
  @IsNotEmpty({ message: 'Reset token is required' })
  token: string;

  @ApiProperty({
    description: 'New password (must contain uppercase, lowercase, number, and special character)',
    example: 'NewPassword123!',
  })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message:
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
  })
  newPassword: string;
}

export class UpdatePasswordDto {
  @ApiProperty({
    description: 'Current password',
    example: 'OldPassword123!',
  })
  @IsString()
  @IsNotEmpty({ message: 'Current password is required' })
  currentPassword: string;

  @ApiProperty({
    description: 'New password (must contain uppercase, lowercase, number, and special character)',
    example: 'NewPassword123!',
  })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message:
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
  })
  newPassword: string;
}

export class DeleteProfileDto {
  @ApiProperty({
    description: 'User password for confirmation',
    example: 'Password123!',
  })
  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  password: string;

  @ApiProperty({
    description: 'Reason for account deletion',
    example: 'No longer using the service',
  })
  @IsString()
  @IsNotEmpty({ message: 'Reason is required' })
  @MaxLength(500, { message: 'Reason must be at most 500 characters' })
  reason: string;
}

