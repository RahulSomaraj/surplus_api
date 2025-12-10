import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import {
  AuthPayloadDto,
  RefreshTokenDto,
  LogoutDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  UpdatePasswordDto,
  DeleteProfileDto,
} from './dto/auth.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { User } from '../users/entities/user.entity';
import * as argon2 from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { RevokedToken } from './entities/revoked-token.entity';
import { ExtractJwt } from 'passport-jwt';
import type { Request } from 'express';
import { UserSession } from './entities/user-session.entity';
import { PasswordResetToken } from './entities/password-reset-token.entity';
import { randomUUID, randomBytes } from 'crypto';
import { EmailService } from '../shared/email.service';
import { generateOTP } from '../utils/otp-generator';
import { OtpToken } from './entities/otp-token.entity';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private jwtService: JwtService,
    @InjectRepository(RevokedToken)
    private revokedTokenRepo: Repository<RevokedToken>,
    @InjectRepository(UserSession)
    private sessionRepo: Repository<UserSession>,
    @InjectRepository(PasswordResetToken)
    private passwordResetTokenRepo: Repository<PasswordResetToken>,
    @InjectRepository(OtpToken)
    private otpTokenRepo: Repository<OtpToken>,
    private emailService: EmailService,
  ) {}

  async validateUser(authPayloadDto: AuthPayloadDto, req: Request) {
    try {
      const phoneNumber = authPayloadDto.phoneNumber?.trim();
      const email = authPayloadDto.email?.trim().toLowerCase();

      if ((!phoneNumber && !email) || !authPayloadDto.password) {
        throw new UnauthorizedException(
          'Phone number or email and password are required',
        );
      }

      const findUser = await this.userRepository.findOne({
        where: phoneNumber
          ? { phone: phoneNumber, deletedAt: IsNull() }
          : { email, deletedAt: IsNull() },
        select: { id: true, email: true, passwordHash: true, role: true },
      });

      if (!findUser) {
        throw new UnauthorizedException('Invalid credentials');
      }

      if (!findUser.passwordHash) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const isPasswordValid = await argon2.verify(
        findUser.passwordHash,
        authPayloadDto.password,
      );
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const sessionId = randomUUID();
      const payload = {
        sub: findUser.id,
        email: findUser.email,
        roles: [findUser.role],
        sessionId,
      };
      const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
      const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

      const session = this.sessionRepo.create({
        id: sessionId,
        user: findUser,
        refreshToken,
        deviceInfo: req.headers['user-agent'] || null,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });

      await this.sessionRepo.save(session);

      return {
        accessToken,
        refreshToken,
        sessionId: session.id,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      // Log the actual error for debugging
      this.logger.error('Login failed with error:', {
        message: error?.message || 'Unknown error',
        stack: error?.stack,
        name: error?.name,
        code: (error as any)?.code,
        error: error,
      });
      // Re-throw the original error if it's a known error type
      if (error instanceof Error && !(error instanceof UnauthorizedException)) {
        this.logger.error('Unexpected error during login:', error);
        throw new UnauthorizedException(`Login failed: ${error.message}`);
      }
      throw new UnauthorizedException('Login failed. Please try again.');
    }
  }

  async logout(req: Request, logoutDto: LogoutDto) {
    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req as any);
    if (!token) throw new UnauthorizedException('Missing bearer token');

    // Verify token and get payload (contains sub and exp)
    let verified: any;
    try {
      verified = this.jwtService.verify(token);
    } catch (err) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    const userId = verified?.sub;
    const exp = verified?.exp;
    if (!userId || !exp) {
      throw new UnauthorizedException('Invalid token payload');
    }

    const expiresAt = new Date(exp * 1000);

    // 1. Revoke the access token
    await this.revokedTokenRepo.save({
      token,
      userId,
      expiresAt,
    });

    // 2. Revoke the specific session when provided; otherwise best-effort current user latest session
    if (logoutDto?.sessionId) {
      const updated = await this.sessionRepo.findOne({
        where: { id: logoutDto.sessionId, revoked: false },
      });
      if (updated) {
        updated.revoked = true;
        await this.sessionRepo.save(updated);
      }
    } else {
      const session = await this.sessionRepo.findOne({
        where: { user: { id: userId }, revoked: false },
        order: { createdAt: 'DESC' },
        relations: ['user'],
      });
      if (session) {
        session.revoked = true;
        await this.sessionRepo.save(session);
      }
    }
    return { message: 'Logged out successfully' };
  }

  async logoutAll(req: Request) {
    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req as any);
    if (!token) throw new UnauthorizedException('Missing bearer token');

    let verified: any;
    try {
      verified = this.jwtService.verify(token);
    } catch (err) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    const userId = verified?.sub;
    const exp = verified?.exp;
    if (!userId || !exp) {
      throw new UnauthorizedException('Invalid token payload');
    }

    const expiresAt = new Date(exp * 1000);

    await this.revokedTokenRepo.save({ token, userId, expiresAt });

    const sessions = await this.sessionRepo.find({
      where: { user: { id: userId }, revoked: false },
      relations: ['user'],
    });
    if (sessions.length > 0) {
      for (const s of sessions) {
        s.revoked = true;
      }
      await this.sessionRepo.save(sessions);
    }

    return { message: 'Logged out from all sessions successfully' };
  }

  async refreshTokens(refreshPayload: RefreshTokenDto) {
    const { refreshToken } = refreshPayload;

    // 1. Verify the refresh token
    let payload: any;
    try {
      payload = this.jwtService.verify(refreshToken);
    } catch (err) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    // 2. Find the session by refresh token
    const session = await this.sessionRepo.findOne({
      where: { refreshToken },
      relations: ['user'],
    });

    if (!session || session.revoked || session.expiresAt < new Date()) {
      throw new UnauthorizedException('Session is invalid or expired');
    }

    // 3. Rotate tokens
    const newPayload = {
      sub: session.user.id,
      email: session.user.email,
      roles: [session.user.role],
      sessionId: session.id,
    };

    const newAccessToken = this.jwtService.sign(newPayload, {
      expiresIn: '15m',
    });
    const newRefreshToken = this.jwtService.sign(newPayload, {
      expiresIn: '7d',
    });

    // 4. Update session with new refresh token
    session.refreshToken = newRefreshToken;
    session.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await this.sessionRepo.save(session);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      sessionId: session.id,
    };
  }

  async forgotPassword(
    forgotPasswordDto: ForgotPasswordDto,
  ): Promise<{ message: string }> {
    const { email } = forgotPasswordDto;
    const normalizedEmail = email.trim().toLowerCase();

    // Send OTP for password reset (do not reveal account existence)
    return await this.generateOtp(normalizedEmail);
  }

  async resetPassword(
    resetPasswordDto: ResetPasswordDto,
  ): Promise<{ message: string }> {
    const { token, newPassword } = resetPasswordDto;

    const resetToken = await this.passwordResetTokenRepo.findOne({
      where: { token, isUsed: false },
    });

    if (!resetToken) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    if (resetToken.expiresAt < new Date()) {
      resetToken.isUsed = true;
      await this.passwordResetTokenRepo.save(resetToken);
      throw new BadRequestException('Invalid or expired reset token');
    }

    const hashedPassword = await argon2.hash(newPassword);

    await this.userRepository.update(resetToken.userId, {
      passwordHash: hashedPassword,
    });

    await this.sessionRepo.update(
      { user: { id: resetToken.userId }, revoked: false },
      { revoked: true },
    );

    resetToken.isUsed = true;
    await this.passwordResetTokenRepo.save(resetToken);

    return {
      message:
        'Password has been reset successfully. Please log in with your new password.',
    };
  }

  async updatePassword(
    userId: number,
    updatePasswordDto: UpdatePasswordDto,
  ): Promise<{ message: string }> {
    const { currentPassword, newPassword } = updatePasswordDto;

    // Find user
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: { id: true, passwordHash: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await argon2.verify(
      user.passwordHash,
      currentPassword,
    );
    if (!isCurrentPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    // Hash new password
    const hashedNewPassword = await argon2.hash(newPassword);

    // Update password
    await this.userRepository.update(userId, {
      passwordHash: hashedNewPassword,
    });

    // Revoke all user sessions for security
    await this.sessionRepo.update(
      { user: { id: userId }, revoked: false },
      { revoked: true },
    );

    return {
      message: 'Password has been updated successfully. Please log in again.',
    };
  }

  async deleteProfile(
    userId: number,
    deleteProfileDto: DeleteProfileDto,
  ): Promise<{ message: string }> {
    const { password, reason } = deleteProfileDto;

    // Find user
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: { id: true, passwordHash: true, deletedAt: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if user is already soft deleted
    if (user.deletedAt) {
      throw new BadRequestException('Account has already been deleted');
    }

    // Verify password
    const isPasswordValid = await argon2.verify(user.passwordHash, password);
    if (!isPasswordValid) {
      throw new BadRequestException('Invalid password');
    }

    // Soft delete the user
    await this.userRepository.update(userId, {
      deletedAt: new Date(),
    });

    // Revoke all user sessions
    await this.sessionRepo.update(
      { user: { id: userId }, revoked: false },
      { revoked: true },
    );

    // Invalidate all password reset tokens
    await this.passwordResetTokenRepo.update(
      { userId: userId, isUsed: false },
      { isUsed: true },
    );

    // Log the deletion reason (in a real app, you might want to store this in a separate audit table)
    this.logger.log(`User ${userId} deleted their account. Reason: ${reason}`);

    return {
      message:
        'Your account has been successfully deleted. All your data has been removed and you will be logged out.',
    };
  }

  async restoreProfile(userId: number): Promise<{ message: string }> {
    // This method can be used by admins to restore deleted accounts
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.deletedAt) {
      throw new BadRequestException('Account is not deleted');
    }

    await this.userRepository.update(userId, {
      deletedAt: null,
    });

    return { message: 'Account has been restored successfully' };
  }

  async generateOtp(email: string): Promise<{ message: string }> {
    const normalizedEmail = email.trim().toLowerCase();

    const user = await this.userRepository.findOne({
      where: { email: normalizedEmail, isActive: true, deletedAt: IsNull() },
      select: { id: true, email: true },
    });

    if (!user) {
      throw new NotFoundException('User with this email does not exist');
    }

    await this.otpTokenRepo.update(
      { userId: user.id, isUsed: false },
      { isUsed: true },
    );

    const otp = generateOTP();
    const otpHash = await argon2.hash(otp);

    const otpToken = this.otpTokenRepo.create({
      userId: user.id,
      user,
      otpHash,
      destination: user.email,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      isUsed: false,
    });

    await this.otpTokenRepo.save(otpToken);

    await this.emailService.sendOtp(user.email, otp);

    return { message: 'OTP has been sent to your email.' };
  }

  async verifyOtp(body: { email: string; otp: string }): Promise<{ message: string; resetToken: string }> {
    const normalizedEmail = body.email.trim().toLowerCase();
    const otp = body.otp.trim();

    const otpRecord = await this.otpTokenRepo
      .createQueryBuilder('otp')
      .where('otp.destination = :email', { email: normalizedEmail })
      .andWhere('otp.isUsed = false')
      .orderBy('otp.createdAt', 'DESC')
      .addSelect('otp.otpHash')
      .getOne();

    if (!otpRecord) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    const now = new Date();
    if (otpRecord.expiresAt < now) {
      otpRecord.isUsed = true;
      await this.otpTokenRepo.save(otpRecord);
      throw new BadRequestException('Invalid or expired OTP');
    }

    const isMatch = await argon2.verify(otpRecord.otpHash, otp);

    if (!isMatch) {
      await this.otpTokenRepo.save(otpRecord);
      throw new BadRequestException('Invalid or expired OTP');
    }

    otpRecord.isUsed = true;
    await this.otpTokenRepo.save(otpRecord);

    const resetToken = randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    const passwordResetToken = this.passwordResetTokenRepo.create({
      token: resetToken,
      userId: otpRecord.userId,
      expiresAt: resetExpires,
      isUsed: false,
    });

    await this.passwordResetTokenRepo.save(passwordResetToken);

    return { message: 'OTP verified successfully.', resetToken };
  }

}
