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
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { VideosService } from './videos.service';
import { CreateVideoDto } from './dto/create-video.dto';
import { UpdateVideoDto } from './dto/update-video.dto';
import { CompleteUploadDto } from './dto/complete-upload.dto';
import { UpdateProgressDto } from './dto/update-progress.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('videos')
@Controller('videos')
@UseGuards(JwtAuthGuard, RolesGuard)
export class VideosController {
  constructor(private readonly videosService: VideosService) {}

  @Post()
  @Roles('INSTRUCTOR', 'ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new video and get upload URL' })
  @ApiResponse({
    status: 201,
    description: 'Video created successfully with presigned upload URL',
  })
  @ApiResponse({ status: 403, description: 'Forbidden - Not course owner' })
  @ApiResponse({ status: 404, description: 'Lesson not found' })
  create(@Body() createVideoDto: CreateVideoDto, @CurrentUser('sub') userId: string) {
    return this.videosService.createVideo(createVideoDto, userId);
  }

  @Post(':id/complete-upload')
  @Roles('INSTRUCTOR', 'ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mark video upload as complete' })
  @ApiResponse({
    status: 200,
    description: 'Video upload completed and marked as ready',
  })
  @ApiResponse({ status: 400, description: 'Video file not found in storage' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not course owner' })
  @ApiResponse({ status: 404, description: 'Video not found' })
  completeUpload(
    @Param('id') id: string,
    @Body() completeUploadDto: CompleteUploadDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.videosService.completeUpload(id, completeUploadDto, userId);
  }

  @Get('lesson/:lessonId')
  @Public()
  @ApiOperation({ summary: 'Get all videos for a lesson' })
  @ApiResponse({ status: 200, description: 'Returns array of videos' })
  findAllByLesson(@Param('lessonId') lessonId: string) {
    return this.videosService.findAllByLesson(lessonId);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get a single video by ID' })
  @ApiResponse({ status: 200, description: 'Returns video details' })
  @ApiResponse({ status: 404, description: 'Video not found' })
  findOne(@Param('id') id: string) {
    return this.videosService.findOne(id);
  }

  @Patch(':id')
  @Roles('INSTRUCTOR', 'ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update video metadata' })
  @ApiResponse({ status: 200, description: 'Video updated successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not course owner' })
  @ApiResponse({ status: 404, description: 'Video not found' })
  update(
    @Param('id') id: string,
    @Body() updateVideoDto: UpdateVideoDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.videosService.update(id, updateVideoDto, userId);
  }

  @Delete(':id')
  @Roles('INSTRUCTOR', 'ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a video' })
  @ApiResponse({
    status: 200,
    description: 'Video deleted successfully from storage and database',
  })
  @ApiResponse({ status: 403, description: 'Forbidden - Not course owner' })
  @ApiResponse({ status: 404, description: 'Video not found' })
  remove(@Param('id') id: string, @CurrentUser('sub') userId: string) {
    return this.videosService.remove(id, userId);
  }

  @Post('progress')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update video watch progress' })
  @ApiResponse({ status: 200, description: 'Progress updated successfully' })
  @ApiResponse({ status: 404, description: 'Video not found' })
  updateProgress(
    @Body() updateProgressDto: UpdateProgressDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.videosService.updateProgress(updateProgressDto, userId);
  }

  @Get('progress/:videoId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get video watch progress for current user' })
  @ApiResponse({ status: 200, description: 'Returns progress data or null' })
  getProgress(@Param('videoId') videoId: string, @CurrentUser('sub') userId: string) {
    return this.videosService.getProgress(videoId, userId);
  }

  @Get('progress')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all video progress for current user' })
  @ApiResponse({ status: 200, description: 'Returns array of progress records' })
  getUserProgress(@CurrentUser('sub') userId: string) {
    return this.videosService.getUserProgress(userId);
  }
}
