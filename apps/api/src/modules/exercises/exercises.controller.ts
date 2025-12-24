import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ExercisesService } from './exercises.service';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { UpdateExerciseDto } from './dto/update-exercise.dto';
import { SubmitExerciseDto } from './dto/submit-exercise.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Exercises')
@Controller('exercises')
export class ExercisesController {
  constructor(private readonly exercisesService: ExercisesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.INSTRUCTOR, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new coding exercise' })
  @ApiResponse({ status: 201, description: 'Exercise created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Instructor/Admin only' })
  create(@Body() createExerciseDto: CreateExerciseDto, @Request() req) {
    return this.exercisesService.create(createExerciseDto, req.user.userId);
  }

  @Get('lesson/:lessonId')
  @ApiOperation({ summary: 'Get all exercises for a lesson' })
  @ApiResponse({ status: 200, description: 'Returns list of exercises' })
  findAll(@Param('lessonId') lessonId: string) {
    return this.exercisesService.findAll(lessonId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific exercise by ID' })
  @ApiResponse({ status: 200, description: 'Returns exercise details' })
  @ApiResponse({ status: 404, description: 'Exercise not found' })
  findOne(@Param('id') id: string) {
    return this.exercisesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.INSTRUCTOR, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update an exercise' })
  @ApiResponse({ status: 200, description: 'Exercise updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Only course owner can update' })
  @ApiResponse({ status: 404, description: 'Exercise not found' })
  update(
    @Param('id') id: string,
    @Body() updateExerciseDto: UpdateExerciseDto,
    @Request() req,
  ) {
    return this.exercisesService.update(id, updateExerciseDto, req.user.userId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.INSTRUCTOR, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete an exercise' })
  @ApiResponse({ status: 200, description: 'Exercise deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Only course owner can delete' })
  @ApiResponse({ status: 404, description: 'Exercise not found' })
  remove(@Param('id') id: string, @Request() req) {
    return this.exercisesService.remove(id, req.user.userId);
  }

  @Post('submit')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Submit code solution for an exercise' })
  @ApiResponse({ status: 201, description: 'Code submitted and graded successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Exercise not found' })
  submit(@Body() submitDto: SubmitExerciseDto, @Request() req) {
    return this.exercisesService.submitExercise(submitDto, req.user.userId);
  }

  @Get('submissions/:exerciseId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all submissions for a specific exercise (current user)' })
  @ApiResponse({ status: 200, description: 'Returns list of submissions' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getSubmissions(@Param('exerciseId') exerciseId: string, @Request() req) {
    return this.exercisesService.getSubmissions(exerciseId, req.user.userId);
  }

  @Get('submissions/user/all')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all submissions by current user' })
  @ApiResponse({ status: 200, description: 'Returns list of all user submissions' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getUserSubmissions(@Request() req) {
    return this.exercisesService.getUserSubmissions(req.user.userId);
  }
}
