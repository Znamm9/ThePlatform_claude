import { Controller, Post, Body, Get, UseGuards, Patch, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { QueryUsersDto } from './dto/query-users.dto';
import { Public } from './decorators/public.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { Roles } from './decorators/roles.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';

@ApiTags('auth')
@Controller('auth')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Login with email and password' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  async getProfile(@CurrentUser() user: any) {
    return this.authService.getProfile(user.id);
  }

  @Get('users')
  @Roles('ADMIN', 'INSTRUCTOR')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all users with filters (Admin and Instructor)' })
  async getAllUsers(@Query() query: QueryUsersDto) {
    return this.authService.getAllUsersWithFilters(query);
  }

  @Patch('users/:id/role')
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user role (Admin only)' })
  async updateUserRole(@Param('id') userId: string, @Body() body: { role: string }) {
    return this.authService.updateUserRole(userId, body.role);
  }

  @Patch('users/:id/verify')
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verify user email (Admin only)' })
  async verifyUserEmail(@Param('id') userId: string) {
    return this.authService.verifyUserEmail(userId);
  }
}
