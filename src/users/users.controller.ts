import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  UseGuards,
  UseFilters,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { RolesGuard } from '../auth/guards/roles.guard';
import { HttpExceptionFilter } from '../shared/exception-service';
import { Public } from '../common/decorators/public.decorator';
import { DeleteUserDto } from './dto/delete-user.dto';
import { GetUser } from '../common/decorators/get-user.decorator';

@ApiTags('users')
@UseFilters(new HttpExceptionFilter('users'))
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Public()
  @Post()
  @ApiOperation({ 
    summary: 'Create a new user (Signup)',
    description: 'Register a new user account with profile details and role.',
  })
  @ApiBody({ 
    type: CreateUserDto,
    examples: {
      example1: {
        summary: 'Signup as customer',
        value: {
          role: 'CUSTOMER',
          email: 'user@example.com',
          phoneNumber: '9876543210',
          password: 'SecurePass123!',
          favoriteCuisine: 'Italian',
          city: 'New York',
          termsAccepted: true,
        },
      },
      example2: {
        summary: 'Signup as restaurant owner',
        value: {
          role: 'RESTAURANT_OWNER',
          email: 'john.doe@example.com',
          phoneNumber: '9876543211',
          password: 'MyPassword123!',
          favoriteCuisine: 'Mexican',
          city: 'Chicago',
          termsAccepted: true,
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'User created successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        email: { type: 'string', example: 'user@example.com' },
        phone: { type: 'string', example: '9876543210' },
        role: { type: 'string', example: 'CUSTOMER' },
        favoriteCuisine: { type: 'string', example: 'Italian' },
        city: { type: 'string', example: 'New York' },
        termsAccepted: { type: 'boolean', example: true },
        isActive: { type: 'boolean', example: true },
        createdAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 409, description: 'Email or phone number already exists' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get('profile')
  @Roles(
    Role.CUSTOMER,
    Role.CHEF,
    Role.RESTAURANT_OWNER,
    Role.DELIVERY_PARTNER,
    Role.SUPPLIER,
    Role.ADMIN,
    Role.SUPERADMIN,
  )
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Get current user profile',
    description: 'Retrieve the authenticated user profile information. User ID is automatically extracted from the JWT token.',
  })
  @ApiResponse({
    status: 200,
    description: 'User retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        email: { type: 'string', example: 'john.doe@example.com' },
        phone: { type: 'string', example: '9876543210' },
        role: { type: 'string', example: 'CHEF' },
        favoriteCuisine: { type: 'string', example: 'Thai' },
        city: { type: 'string', example: 'Seattle' },
        termsAccepted: { type: 'boolean', example: true },
        isActive: { type: 'boolean', example: true },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
  findOne(@GetUser('id') userId: number) {
    return this.usersService.findOne(userId);
  }

  @Get()
  @Roles(
    Role.CUSTOMER,
    Role.CHEF,
    Role.RESTAURANT_OWNER,
    Role.DELIVERY_PARTNER,
    Role.SUPPLIER,
    Role.ADMIN,
    Role.SUPERADMIN,
  )
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Get all users',
    description: 'Retrieve a list of all users. Requires authentication.',
  })
  @ApiResponse({ 
    status: 200, 
    description: 'List of users returned successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'number', example: 1 },
          email: { type: 'string', example: 'john.doe@example.com' },
          phone: { type: 'string', example: '9876543210' },
          role: { type: 'string', example: 'CUSTOMER' },
          favoriteCuisine: { type: 'string', example: 'Italian' },
          city: { type: 'string', example: 'New York' },
          termsAccepted: { type: 'boolean', example: true },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll() {
    return this.usersService.findAll();
  }

  @Patch('profile')
  @Roles(
    Role.CUSTOMER,
    Role.CHEF,
    Role.RESTAURANT_OWNER,
    Role.DELIVERY_PARTNER,
    Role.SUPPLIER,
    Role.ADMIN,
    Role.SUPERADMIN,
  )
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Update current user profile',
    description: 'Update authenticated user information. All fields are optional. User ID is automatically extracted from the JWT token.',
  })
  @ApiBody({ 
    type: UpdateUserDto,
    examples: {
      example1: {
        summary: 'Update multiple fields',
        value: {
          role: 'CHEF',
          email: 'newemail@example.com',
          password: 'NewSecurePass123!',
          favoriteCuisine: 'Thai',
          city: 'Seattle',
          termsAccepted: true,
        },
      },
      example2: {
        summary: 'Update email',
        value: {
          email: 'newemail@example.com',
        },
      },
      example3: {
        summary: 'Update password',
        value: {
          password: 'NewSecurePass123!',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        email: { type: 'string', example: 'user@example.com' },
        phone: { type: 'string', example: '9876543210' },
        role: { type: 'string', example: 'CHEF' },
        favoriteCuisine: { type: 'string', example: 'Italian' },
        city: { type: 'string', example: 'Seattle' },
        termsAccepted: { type: 'boolean', example: true },
        isActive: { type: 'boolean', example: true },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 409, description: 'Email or phone number already exists' })
  update(@GetUser('id') userId: number, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(userId, updateUserDto);
  }

@Delete('profile')
@Roles(
  Role.CUSTOMER,
  Role.CHEF,
  Role.RESTAURANT_OWNER,
  Role.DELIVERY_PARTNER,
  Role.SUPPLIER,
  Role.ADMIN,
  Role.SUPERADMIN,
)
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
@ApiOperation({ 
  summary: 'Delete current user profile',
  description: 'Delete the authenticated user account. User ID is automatically extracted from the JWT token.',
})
@ApiBody({ 
  type: DeleteUserDto,
  examples: {
    example1: {
      summary: 'Delete user',
      value: {
        deletedBy: 1,
      },
    },
  },
})
@ApiResponse({ 
  status: 200, 
  description: 'User deleted successfully',
  schema: {
    type: 'object',
    properties: {
      message: { type: 'string', example: 'User deleted successfully' },
    },
  },
})
@ApiResponse({ status: 401, description: 'Unauthorized' })
@ApiResponse({ status: 404, description: 'User not found' })
@ApiResponse({ status: 400, description: 'Invalid request body' })
remove(@GetUser('id') userId: number, @Body() deleteUserDto: DeleteUserDto) {
  return this.usersService.remove(userId, deleteUserDto);
}
}
