import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('courses')
@Controller('courses')
@UseGuards(RolesGuard)
export class CoursesController {
  constructor(private coursesService: CoursesService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get all published courses' })
  @ApiQuery({ name: 'categoryId', required: false })
  @ApiQuery({ name: 'isPremium', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'difficultyLevel', required: false })
  findAll(
    @Query('categoryId') categoryId?: string,
    @Query('isPremium') isPremium?: string,
    @Query('search') search?: string,
    @Query('difficultyLevel') difficultyLevel?: string,
  ) {
    return this.coursesService.findAll({
      categoryId,
      isPremium: isPremium === 'true' ? true : isPremium === 'false' ? false : undefined,
      search,
      difficultyLevel,
    });
  }

  @Get('admin/all')
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all courses including unpublished (Admin only)' })
  findAllAdmin() {
    return this.coursesService.findAllAdmin();
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get course by ID' })
  findOne(@Param('id') id: string) {
    return this.coursesService.findOne(id);
  }

  @Public()
  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get course by slug' })
  findBySlug(@Param('slug') slug: string) {
    return this.coursesService.findBySlug(slug);
  }

  @Get('instructor/my-courses')
  @Roles('INSTRUCTOR', 'ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get courses created by current instructor' })
  findByInstructor(@CurrentUser() user: any) {
    return this.coursesService.findByInstructor(user.id);
  }

  @Post()
  @Roles('INSTRUCTOR', 'ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new course (Instructor/Admin only)' })
  create(@CurrentUser() user: any, @Body() createCourseDto: CreateCourseDto) {
    return this.coursesService.create(user.id, createCourseDto);
  }

  @Patch(':id')
  @Roles('INSTRUCTOR', 'ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a course (Owner/Admin only)' })
  update(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() updateCourseDto: UpdateCourseDto,
  ) {
    return this.coursesService.update(id, user.id, user.role, updateCourseDto);
  }

  @Delete(':id')
  @Roles('INSTRUCTOR', 'ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a course (Owner/Admin only)' })
  delete(@Param('id') id: string, @CurrentUser() user: any) {
    return this.coursesService.delete(id, user.id, user.role);
  }

  @Post(':id/publish')
  @Roles('INSTRUCTOR', 'ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Publish a course (Owner/Admin only)' })
  publish(@Param('id') id: string, @CurrentUser() user: any) {
    return this.coursesService.publish(id, user.id, user.role);
  }

  @Post(':id/unpublish')
  @Roles('INSTRUCTOR', 'ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Unpublish a course (Owner/Admin only)' })
  unpublish(@Param('id') id: string, @CurrentUser() user: any) {
    return this.coursesService.unpublish(id, user.id, user.role);
  }
}
