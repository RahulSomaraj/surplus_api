import {
  ConflictException,
  Injectable,
  UnauthorizedException,
  OnModuleInit,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as argon2 from 'argon2';
import { AdminAccount } from './entities/admin-account.entity';
import { AdminLoginDto } from './dto/admin-login.dto';
import { CreateAdminAccountDto } from './dto/create-admin-account.dto';
import { AccountType } from '../common/enums/account-type.enum';
import { JwtService } from '@nestjs/jwt';
import { AdminRefreshDto } from './dto/admin-refresh.dto';

@Injectable()
export class AdminDashboardService implements OnModuleInit {
  private readonly logger = new Logger(AdminDashboardService.name);

  constructor(
    @InjectRepository(AdminAccount)
    private readonly adminRepo: Repository<AdminAccount>,
    private readonly jwtService: JwtService,
  ) {}

  async onModuleInit() {
    const bootstrapEmail = process.env.ADMIN_BOOTSTRAP_EMAIL;
    const bootstrapPassword = process.env.ADMIN_BOOTSTRAP_PASSWORD;
    const bootstrapName = process.env.ADMIN_BOOTSTRAP_NAME || 'Super Admin';
    const bootstrapAccountType =
      (process.env.ADMIN_BOOTSTRAP_ACCOUNT_TYPE as AccountType) ||
      AccountType.RestaurantOwner;

    if (!bootstrapEmail || !bootstrapPassword) {
      return;
    }

    const exists = await this.adminRepo.findOne({
      where: { email: bootstrapEmail.toLowerCase() },
      select: { id: true },
    });
    if (exists) {
      return;
    }

    try {
      const passwordHash = await argon2.hash(bootstrapPassword);
      const admin = this.adminRepo.create({
        fullName: bootstrapName,
        email: bootstrapEmail.toLowerCase(),
        passwordHash,
        accountType: bootstrapAccountType,
        favoriteCuisine: null,
        location: null,
        policiesAccepted: true,
        isActive: true,
      });
      await this.adminRepo.save(admin);
      this.logger.log(
        `Bootstrap admin created with email ${bootstrapEmail}. Change the password immediately.`,
      );
    } catch (err) {
      this.logger.error('Failed to bootstrap admin account', err as any);
    }
  }

  async create(dto: CreateAdminAccountDto) {
    const email = dto.email.trim().toLowerCase();
    const exists = await this.adminRepo.findOne({ where: { email } });
    if (exists) {
      throw new ConflictException('Email already exists');
    }

    const passwordHash = await argon2.hash(dto.password);

    const admin = this.adminRepo.create({
      fullName: dto.fullName,
      email,
      passwordHash,
      accountType: dto.accountType,
      favoriteCuisine: dto.favoriteCuisine || null,
      location: dto.location || null,
      policiesAccepted: dto.policiesAccepted,
      isActive: true,
    });

    const saved = await this.adminRepo.save(admin);
    const { passwordHash: _, ...safe } = saved;
    return safe;
  }

  async login(dto: AdminLoginDto) {
    const email = dto.email.trim().toLowerCase();

    const admin = await this.adminRepo.findOne({
      where: { email },
      select: {
        id: true,
        fullName: true,
        email: true,
        passwordHash: true,
        accountType: true,
        policiesAccepted: true,
        location: true,
        favoriteCuisine: true,
        createdAt: true,
        updatedAt: true,
        isActive: true,
        deletedAt: true,
      },
    });

    if (!admin || admin.deletedAt || !admin.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const ok = await argon2.verify(admin.passwordHash, dto.password);
    if (!ok) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const { passwordHash, ...safeAdmin } = admin;
    const payload = {
      sub: admin.id,
      email: admin.email,
      roles: ['admin'],
      accountType: admin.accountType,
    };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    return {
      message: 'Login successful',
      accessToken,
      refreshToken,
      admin: safeAdmin,
    };
  }

  async refresh(dto: AdminRefreshDto) {
    let payload: any;
    try {
      payload = this.jwtService.verify(dto.refreshToken);
    } catch (err) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const admin = await this.adminRepo.findOne({
      where: { id: payload.sub },
    });
    if (!admin) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const newPayload = {
      sub: admin.id,
      email: admin.email,
      roles: ['admin'],
      accountType: admin.accountType,
    };

    const accessToken = this.jwtService.sign(newPayload, { expiresIn: '15m' });
    const refreshToken = this.jwtService.sign(newPayload, { expiresIn: '7d' });

    return {
      message: 'Token refreshed',
      accessToken,
      refreshToken,
    };
  }
}
