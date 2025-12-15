import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt.auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { RestaurantsService } from './restaurants.service';
import { GetUser } from '../common/decorators/get-user.decorator';

@ApiTags('restaurants')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.SUPERADMIN, Role.RESTAURANT_OWNER)
@Controller('restaurants')
export class RestaurantsController {
  constructor(private readonly restaurantsService: RestaurantsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new restaurant' })
  @ApiBody({ type: CreateRestaurantDto })
  @ApiResponse({ status: 201, description: 'Restaurant created successfully' })
  create(
    @Body() dto: CreateRestaurantDto,
    @GetUser('id') userId: number,
  ) {
    return this.restaurantsService.create(dto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'List all restaurants' })
  @ApiResponse({ status: 200, description: 'List of restaurants returned' })
  findAll() {
    return this.restaurantsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a restaurant by ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Restaurant retrieved' })
  @ApiResponse({ status: 404, description: 'Restaurant not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.restaurantsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update restaurant details' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: UpdateRestaurantDto })
  @ApiResponse({ status: 200, description: 'Restaurant updated' })
  @ApiResponse({ status: 404, description: 'Restaurant not found' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateRestaurantDto,
    @GetUser('id') userId: number,
  ) {
    return this.restaurantsService.update(id, dto, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete a restaurant' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Restaurant deleted' })
  @ApiResponse({ status: 404, description: 'Restaurant not found' })
  remove(
    @Param('id', ParseIntPipe) id: number,
    @GetUser('id') userId: number,
  ) {
    return this.restaurantsService.remove(id, userId);
  }
}
