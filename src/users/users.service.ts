import {
  ConflictException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Repository, IsNull } from 'typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import * as argon2 from 'argon2';
import { DeleteUserDto } from './dto/delete-user.dto';
import { Role } from '../common/enums/role.enum';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    try {
      const email = createUserDto.email.trim().toLowerCase();
      const city = createUserDto.city.trim();

      // Check if email already exists
      const emailExists = await this.userRepository.findOne({
        where: { email, deletedAt: IsNull() },
      });

      if (emailExists) {
        throw new ConflictException('Use another Email');
      }

      // Check if phone number already exists
      const phoneExists = await this.userRepository.findOne({
        where: { phone: createUserDto.phoneNumber, deletedAt: IsNull() },
      });

      if (phoneExists) {
        throw new ConflictException('Phone number already exists');
      }

      if (createUserDto.termsAccepted !== true) {
        throw new ConflictException('Terms must be accepted');
      }

      const { password, phoneNumber } = createUserDto;
      const passwordHash = await argon2.hash(password, {
        type: argon2.argon2id,
      });
      
      const user = this.userRepository.create({
        email,
        phone: phoneNumber,
        favoriteCuisine: createUserDto.favoriteCuisine?.trim() || null,
        city,
        termsAccepted: true,
        passwordHash,
        role: createUserDto.role ?? Role.CUSTOMER,
        isActive: true,
      });
      const savedUser = await this.userRepository.save(user);
      
      // Return user without passwordHash
      const { passwordHash: _, ...userWithoutPassword } = savedUser;
      return userWithoutPassword;
    } catch (err) {
      this.logger.error('Create user error:', err);
      if (err instanceof HttpException) throw err;
      throw new InternalServerErrorException('Failed to create user');
    }
  }

  async findOne(id: number) {
    try {
      const user = await this.userRepository.findOne({
        where: { id, deletedAt: IsNull() },
        select: {
          id: true,
          email: true,
          phone: true,
          photoURL: true,
          role: true,
          favoriteCuisine: true,
          city: true,
          termsAccepted: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      if (!user) {
        throw new NotFoundException('User not found');
      }
      return user;
    } catch (err) {
      if (err instanceof HttpException) throw err;
      throw new InternalServerErrorException('Failed to fetch user');
    }
  }

  async findAll() {
    try {
      const users = await this.userRepository.find({
        where: { deletedAt: IsNull() },
        select: {
          id: true,
          email: true,
          phone: true,
          photoURL: true,
          role: true,
          favoriteCuisine: true,
          city: true,
          termsAccepted: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      return users;
    } catch (err) {
      throw new InternalServerErrorException('Failed to retrieve users');
    }
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    try {
      const user = await this.userRepository.findOne({
        where: { id, deletedAt: IsNull() },
      });
      if (!user) throw new NotFoundException('User not found');

      // Handle phoneNumber to phone mapping if phoneNumber is provided
      const updateData: any = { ...updateUserDto };
      if (updateUserDto.phoneNumber) {
        // Check if phone number already exists for another user
        const phoneExists = await this.userRepository.findOne({
          where: { phone: updateUserDto.phoneNumber, deletedAt: IsNull() },
        });

        if (phoneExists && phoneExists.id !== id) {
          throw new ConflictException('Phone number already exists');
        }

        updateData.phone = updateUserDto.phoneNumber;
        delete updateData.phoneNumber;
      }

      // Handle email normalization if email is provided
      if (updateUserDto.email) {
        updateData.email = updateUserDto.email.trim().toLowerCase();
        
        // Check if email already exists for another user
        const emailExists = await this.userRepository.findOne({
          where: { email: updateData.email, deletedAt: IsNull() },
        });

        if (emailExists && emailExists.id !== id) {
          throw new ConflictException('Email already exists');
        }
      }

      // Handle password hashing if password is provided
      if (updateUserDto.password) {
        updateData.passwordHash = await argon2.hash(updateUserDto.password, {
          type: argon2.argon2id,
        });
        delete updateData.password;
      }

      if (updateUserDto.role) {
        updateData.role = updateUserDto.role;
      }

      if (updateUserDto.favoriteCuisine !== undefined) {
        updateData.favoriteCuisine =
          updateUserDto.favoriteCuisine?.trim() || null;
      }

      if (updateUserDto.city !== undefined) {
        updateData.city = updateUserDto.city.trim();
      }

      if (updateUserDto.termsAccepted !== undefined) {
        if (updateUserDto.termsAccepted !== true) {
          throw new ConflictException('Terms must be accepted');
        }
        updateData.termsAccepted = true;
      }

      Object.assign(user, updateData);
      const updatedUser = await this.userRepository.save(user);
      
      // Return user with all fields except passwordHash
      const { passwordHash: _, ...userWithoutPassword } = updatedUser;
      return userWithoutPassword;
    } catch (err) {
      this.logger.error('Update user error:', err);
      if (err instanceof HttpException) throw err;
      throw new InternalServerErrorException('Failed to update user');
    }
  }

  async remove(id: number, deleteUserDto: DeleteUserDto): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });
    if (!user) throw new NotFoundException(`User with ID ${id} not found`);

    await this.userRepository.update(id, {
      deletedAt: new Date(),
      deletedBy: deleteUserDto.deletedBy,
      isActive: false,
    });
    return { message: `User with ID ${id} has been successfully removed` };
  }
}
