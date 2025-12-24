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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { QuizzesService } from './quizzes.service';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';
import { CreateQuizQuestionDto } from './dto/create-quiz-question.dto';
import { UpdateQuizQuestionDto } from './dto/update-quiz-question.dto';
import { SubmitQuizDto } from './dto/submit-quiz.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Quizzes')
@Controller('quizzes')
export class QuizzesController {
  constructor(private readonly quizzesService: QuizzesService) {}

  // ========================================
  // Quiz CRUD Operations
  // ========================================

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.INSTRUCTOR, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new quiz' })
  @ApiResponse({ status: 201, description: 'Quiz created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Instructor/Admin only' })
  create(@Body() createQuizDto: CreateQuizDto, @Request() req) {
    return this.quizzesService.create(createQuizDto, req.user.userId);
  }

  @Get('lesson/:lessonId')
  @ApiOperation({ summary: 'Get all quizzes for a lesson' })
  @ApiResponse({ status: 200, description: 'Returns list of quizzes' })
  findAll(@Param('lessonId') lessonId: string) {
    return this.quizzesService.findAll(lessonId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific quiz by ID' })
  @ApiResponse({ status: 200, description: 'Returns quiz details' })
  @ApiResponse({ status: 404, description: 'Quiz not found' })
  findOne(@Param('id') id: string) {
    return this.quizzesService.findOne(id, false);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.INSTRUCTOR, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a quiz' })
  @ApiResponse({ status: 200, description: 'Quiz updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Only course owner can update' })
  @ApiResponse({ status: 404, description: 'Quiz not found' })
  update(
    @Param('id') id: string,
    @Body() updateQuizDto: UpdateQuizDto,
    @Request() req,
  ) {
    return this.quizzesService.update(id, updateQuizDto, req.user.userId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.INSTRUCTOR, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a quiz' })
  @ApiResponse({ status: 200, description: 'Quiz deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Only course owner can delete' })
  @ApiResponse({ status: 404, description: 'Quiz not found' })
  remove(@Param('id') id: string, @Request() req) {
    return this.quizzesService.remove(id, req.user.userId);
  }

  // ========================================
  // Quiz Question Operations
  // ========================================

  @Post(':quizId/questions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.INSTRUCTOR, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add a question to a quiz' })
  @ApiResponse({ status: 201, description: 'Question added successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  addQuestion(
    @Param('quizId') quizId: string,
    @Body() createQuestionDto: CreateQuizQuestionDto,
    @Request() req,
  ) {
    return this.quizzesService.addQuestion(quizId, createQuestionDto, req.user.userId);
  }

  @Patch('questions/:questionId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.INSTRUCTOR, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a quiz question' })
  @ApiResponse({ status: 200, description: 'Question updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Question not found' })
  updateQuestion(
    @Param('questionId') questionId: string,
    @Body() updateQuestionDto: UpdateQuizQuestionDto,
    @Request() req,
  ) {
    return this.quizzesService.updateQuestion(questionId, updateQuestionDto, req.user.userId);
  }

  @Delete('questions/:questionId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.INSTRUCTOR, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a quiz question' })
  @ApiResponse({ status: 200, description: 'Question deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Question not found' })
  removeQuestion(@Param('questionId') questionId: string, @Request() req) {
    return this.quizzesService.removeQuestion(questionId, req.user.userId);
  }

  // ========================================
  // Quiz Taking & Attempts
  // ========================================

  @Post('submit')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Submit a quiz attempt' })
  @ApiResponse({ status: 201, description: 'Quiz submitted and graded successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Quiz not found' })
  submit(@Body() submitDto: SubmitQuizDto, @Request() req) {
    return this.quizzesService.submitQuiz(submitDto, req.user.userId);
  }

  @Get('attempts/:quizId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all attempts for a quiz (current user)' })
  @ApiResponse({ status: 200, description: 'Returns list of attempts' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getAttempts(@Param('quizId') quizId: string, @Request() req) {
    return this.quizzesService.getAttempts(quizId, req.user.userId);
  }

  @Get('attempt/:attemptId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a specific quiz attempt by ID' })
  @ApiResponse({ status: 200, description: 'Returns attempt details with answers' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not your attempt' })
  @ApiResponse({ status: 404, description: 'Attempt not found' })
  getAttempt(@Param('attemptId') attemptId: string, @Request() req) {
    return this.quizzesService.getAttempt(attemptId, req.user.userId);
  }

  @Get('attempts/user/all')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all quiz attempts by current user' })
  @ApiResponse({ status: 200, description: 'Returns list of all user attempts' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getUserAttempts(@Request() req) {
    return this.quizzesService.getUserAttempts(req.user.userId);
  }
}
