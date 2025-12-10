import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AdminDashboardService } from './admin-dashboard.service';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AdminLoginDto } from './dto/admin-login.dto';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { JwtAuthGuard } from '../auth/guards/jwt.auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CreateAdminAccountDto } from './dto/create-admin-account.dto';
import { AdminRefreshDto } from './dto/admin-refresh.dto';

@ApiTags('admin-dashboard')
@Controller('admin-dashboard')
export class AdminDashboardController {
  constructor(private readonly adminDashboardService: AdminDashboardService) {}

  @Post('login')
  @Public()
  @ApiOperation({
    summary: 'Admin login',
    description: 'Login for admin dashboard users (email + password).',
  })
  @ApiBody({ type: AdminLoginDto })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Login successful' },
        accessToken: { type: 'string' },
        refreshToken: { type: 'string' },
        admin: {
          type: 'object',
          properties: {
            id: { type: 'number', example: 1 },
            fullName: { type: 'string', example: 'Jane Admin' },
            email: { type: 'string', example: 'admin@example.com' },
            accountType: { type: 'string', example: 'restaurant_owner' },
            favoriteCuisine: { type: 'string', example: 'Italian' },
            location: { type: 'string', example: 'New York' },
            policiesAccepted: { type: 'boolean', example: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() body: AdminLoginDto) {
    return this.adminDashboardService.login(body);
  }

  @Post('refresh')
  @Public()
  @ApiOperation({
    summary: 'Refresh admin tokens',
    description: 'Get a new access token using a valid admin refresh token.',
  })
  @ApiBody({ type: AdminRefreshDto })
  @ApiResponse({
    status: 200,
    description: 'Token refreshed successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Token refreshed' },
        accessToken: { type: 'string' },
        refreshToken: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Invalid or expired refresh token' })
  async refresh(@Body() body: AdminRefreshDto) {
    return this.adminDashboardService.refresh(body);
  }

  @Post('admins')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @ApiOperation({
    summary: 'Create an admin account',
    description: 'Protected route for admins to create other admin dashboard accounts.',
  })
  @ApiBody({ type: CreateAdminAccountDto })
  @ApiResponse({
    status: 201,
    description: 'Admin account created',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        fullName: { type: 'string', example: 'Jane Admin' },
        email: { type: 'string', example: 'admin@example.com' },
        accountType: { type: 'string', example: 'restaurant_owner' },
        favoriteCuisine: { type: 'string', example: 'Italian' },
        location: { type: 'string', example: 'New York' },
        policiesAccepted: { type: 'boolean', example: true },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  async createAdmin(@Body() body: CreateAdminAccountDto) {
    return this.adminDashboardService.create(body);
  }
}
