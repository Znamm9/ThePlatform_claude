import {
  Controller,
  Get,
  Post,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ProgressService } from './progress.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Progress')
@Controller('progress')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Get('course/:courseId')
  @ApiOperation({ summary: 'Get course progress for current user' })
  @ApiResponse({ status: 200, description: 'Returns detailed course progress' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getCourseProgress(@Param('courseId') courseId: string, @Request() req) {
    return this.progressService.getCourseProgress(courseId, req.user.userId);
  }

  @Post('lesson/:lessonId/complete')
  @ApiOperation({ summary: 'Mark a lesson as completed' })
  @ApiResponse({ status: 200, description: 'Lesson marked as completed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async markLessonComplete(@Param('lessonId') lessonId: string, @Request() req) {
    await this.progressService.markLessonComplete(lessonId, req.user.userId);

    // Get the lesson to find course ID
    const lesson = await this.progressService['prisma'].lesson.findUnique({
      where: { id: lessonId },
      select: { courseId: true },
    });

    if (lesson) {
      // Update enrollment progress
      return this.progressService.updateEnrollmentProgress(lesson.courseId, req.user.userId);
    }

    return { success: true };
  }

  @Get('enrollments')
  @ApiOperation({ summary: 'Get all enrollments with progress for current user' })
  @ApiResponse({ status: 200, description: 'Returns list of enrollments' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getUserEnrollments(@Request() req) {
    return this.progressService.getUserEnrollments(req.user.userId);
  }

  @Get('analytics/course/:courseId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.INSTRUCTOR, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get instructor analytics for a course' })
  @ApiResponse({ status: 200, description: 'Returns course analytics' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Instructor/Admin only' })
  getInstructorAnalytics(@Param('courseId') courseId: string, @Request() req) {
    return this.progressService.getInstructorCourseAnalytics(courseId, req.user.userId);
  }
}
