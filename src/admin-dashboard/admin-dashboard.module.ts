import { Module, forwardRef } from '@nestjs/common';
import { AdminDashboardService } from './admin-dashboard.service';
import { AdminDashboardController } from './admin-dashboard.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminAccount } from './entities/admin-account.entity';
import { AuthModule } from '../auth/auth.module';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([AdminAccount]),
    forwardRef(() => AuthModule),
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => {
        const jwtSecret = config.get<string>('JWT_SECRET') || 'change-me';
        return { secret: jwtSecret };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [AdminDashboardController],
  providers: [AdminDashboardService, RolesGuard],
})
export class AdminDashboardModule {}
