import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { LessonsService } from './lessons.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { ReorderLessonsDto } from './dto/reorder-lessons.dto';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('lessons')
@Controller('lessons')
@UseGuards(RolesGuard)
export class LessonsController {
  constructor(private lessonsService: LessonsService) {}

  @Public()
  @Get('course/:courseId')
  @ApiOperation({ summary: 'Get all lessons for a course' })
  findAll(@Param('courseId') courseId: string) {
    return this.lessonsService.findAll(courseId);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get lesson by ID' })
  findOne(@Param('id') id: string) {
    return this.lessonsService.findOne(id);
  }

  @Post('course/:courseId')
  @Roles('INSTRUCTOR', 'ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new lesson (Instructor/Admin only)' })
  create(
    @Param('courseId') courseId: string,
    @CurrentUser() user: any,
    @Body() createLessonDto: CreateLessonDto,
  ) {
    return this.lessonsService.create(
      courseId,
      user.id,
      user.role,
      createLessonDto,
    );
  }

  @Patch(':id')
  @Roles('INSTRUCTOR', 'ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a lesson (Owner/Admin only)' })
  update(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() updateLessonDto: UpdateLessonDto,
  ) {
    return this.lessonsService.update(id, user.id, user.role, updateLessonDto);
  }

  @Delete(':id')
  @Roles('INSTRUCTOR', 'ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a lesson (Owner/Admin only)' })
  delete(@Param('id') id: string, @CurrentUser() user: any) {
    return this.lessonsService.delete(id, user.id, user.role);
  }

  @Post('course/:courseId/reorder')
  @Roles('INSTRUCTOR', 'ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reorder lessons in a course (Owner/Admin only)' })
  reorder(
    @Param('courseId') courseId: string,
    @CurrentUser() user: any,
    @Body() reorderDto: ReorderLessonsDto,
  ) {
    return this.lessonsService.reorder(
      courseId,
      user.id,
      user.role,
      reorderDto,
    );
  }
}
