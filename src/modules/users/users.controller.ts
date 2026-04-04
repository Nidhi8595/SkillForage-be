import { Controller, Post, Get, Patch, Body, Param, BadRequestException } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from '../../common/dto/create-user.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

@ApiTags('users')
@Controller('users')
export class UsersController {

  constructor(private readonly usersService: UsersService) { }

  // POST /api/users
  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto.name, createUserDto.email);
  }

  // GET /api/users/:id
  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', description: 'MongoDB user ID' })
  @ApiResponse({ status: 200, description: "User found" })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  // POST /api/users/login
  @Post('login')
  async login(@Body('email') email: string) {
    if (!email) {
      throw new BadRequestException('Email is required');
    }
    return this.usersService.login(email);
  }

  // PATCH /api/users/:id/role
  @Patch(':id/role')
  @ApiOperation({ summary: 'Update user target role' })
  @ApiParam({ name: 'id', description: 'MongoDB user ID' })
  @ApiResponse({ status: 200, description: 'Role updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async updateRole(
    @Param('id') id: string,
    @Body('role') role: string,
  ) {
    return this.usersService.updateTargetRole(id, role);
  }

  @Get(':id/history')
  async getHistory(@Param('id') id: string) {
    return this.usersService.getScoreHistory(id);
  }
}