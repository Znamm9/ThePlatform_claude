import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { QueryUsersDto, UserRoleFilter, EmailVerificationFilter } from './dto/query-users.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { name, email, password } = registerDto;

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user with STUDENT role by default
    const user = await this.prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: 'STUDENT',
        emailVerified: false,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        emailVerified: true,
        createdAt: true,
      },
    });

    return {
      message: 'User registered successfully',
      user,
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { email: user.email, sub: user.id, role: user.role };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        emailVerified: user.emailVerified,
      },
    };
  }

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.passwordHash) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      emailVerified: user.emailVerified,
    };
  }

  async getProfile(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        role: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async getAllUsers() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        role: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            enrollments: true,
            coursesCreated: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getAllUsersWithFilters(filters: QueryUsersDto) {
    const where: any = {};

    // Role filter
    if (filters.role && filters.role !== UserRoleFilter.ALL) {
      where.role = filters.role;
    }

    // Email verification filter
    if (filters.emailVerified && filters.emailVerified !== EmailVerificationFilter.ALL) {
      where.emailVerified = filters.emailVerified === EmailVerificationFilter.VERIFIED;
    }

    // Date range filters
    if (filters.createdAfter || filters.createdBefore) {
      where.createdAt = {};
      if (filters.createdAfter) {
        where.createdAt.gte = new Date(filters.createdAfter);
      }
      if (filters.createdBefore) {
        where.createdAt.lte = new Date(filters.createdBefore);
      }
    }

    // Search filter (name or email)
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const users = await this.prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        role: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            enrollments: true,
            coursesCreated: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Apply post-query filters (enrollment/courses count)
    // These need to be applied after query because Prisma doesn't support filtering on aggregate counts in WHERE
    let filteredUsers = users;

    if (filters.minEnrollments !== undefined) {
      filteredUsers = filteredUsers.filter(
        (u) => u._count.enrollments >= filters.minEnrollments!
      );
    }

    if (filters.maxEnrollments !== undefined) {
      filteredUsers = filteredUsers.filter(
        (u) => u._count.enrollments <= filters.maxEnrollments!
      );
    }

    if (filters.minCoursesCreated !== undefined) {
      filteredUsers = filteredUsers.filter(
        (u) => u._count.coursesCreated >= filters.minCoursesCreated!
      );
    }

    return filteredUsers;
  }

  async updateUserRole(userId: string, role: string) {
    // Validate role
    if (!['STUDENT', 'INSTRUCTOR', 'ADMIN'].includes(role)) {
      throw new ConflictException('Invalid role');
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: { role: role as any },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        emailVerified: true,
      },
    });
  }

  async verifyUserEmail(userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { emailVerified: true },
      select: {
        id: true,
        email: true,
        name: true,
        emailVerified: true,
      },
    });
  }
}
