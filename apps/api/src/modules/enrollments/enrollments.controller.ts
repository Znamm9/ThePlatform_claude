import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { EnrollmentsService } from './enrollments.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('enrollments')
@Controller('enrollments')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @Post()
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: 'Enroll in a free course' })
  async createEnrollment(
    @CurrentUser('id') userId: string,
    @Body() createEnrollmentDto: CreateEnrollmentDto,
  ) {
    return this.enrollmentsService.createEnrollment(userId, createEnrollmentDto);
  }

  @Get('admin/all')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all enrollments (Admin only)' })
  async getAllEnrollments() {
    return this.enrollmentsService.getAllEnrollments();
  }

  @Get('my-enrollments')
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: 'Get my enrollments' })
  async getMyEnrollments(@CurrentUser('id') userId: string) {
    return this.enrollmentsService.getMyEnrollments(userId);
  }

  @Get('status')
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: 'Check enrollment status for a course' })
  async getEnrollmentStatus(
    @CurrentUser('id') userId: string,
    @Query('courseId') courseId: string,
  ) {
    return this.enrollmentsService.getEnrollmentStatus(userId, courseId);
  }

  @Get(':id')
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: 'Get enrollment by ID with course details' })
  async getEnrollmentById(
    @Param('id') enrollmentId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.enrollmentsService.getEnrollmentById(enrollmentId, userId);
  }

  @Delete(':id')
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: 'Delete enrollment (unenroll from course)' })
  async deleteEnrollment(
    @Param('id') enrollmentId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.enrollmentsService.deleteEnrollment(enrollmentId, userId);
  }
}
