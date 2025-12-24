import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { S3Service } from './s3.service';
import { CreateVideoDto } from './dto/create-video.dto';
import { UpdateVideoDto } from './dto/update-video.dto';
import { CompleteUploadDto } from './dto/complete-upload.dto';
import { UpdateProgressDto } from './dto/update-progress.dto';

@Injectable()
export class VideosService {
  constructor(
    private prisma: PrismaService,
    private s3Service: S3Service,
  ) {}

  async createVideo(createVideoDto: CreateVideoDto, userId: string) {
    const { title, lessonId, fileName = 'video.mp4', contentType = 'video/mp4' } = createVideoDto;

    // Verify lesson exists and get course info
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        course: {
          select: {
            id: true,
            instructorId: true,
          },
        },
      },
    });

    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    // Check if user owns the course
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    const isOwner = lesson.course.instructorId === userId;
    const isAdmin = user?.role === 'ADMIN';

    if (!isOwner && !isAdmin) {
      throw new ForbiddenException('You do not have permission to add videos to this lesson');
    }

    // Create video record
    const video = await this.prisma.video.create({
      data: {
        title,
        lessonId,
        s3Key: '', // Will be updated after upload
        cloudfrontUrl: '', // Will be updated after upload
        uploadStatus: 'UPLOADING',
      },
    });

    // Generate S3 key and presigned URL
    const s3Key = this.s3Service.generateS3Key(video.id, fileName);
    const uploadUrl = await this.s3Service.generatePresignedUploadUrl(s3Key, contentType);

    // Return video info and upload URL
    return {
      video,
      uploadUrl,
      s3Key,
    };
  }

  async completeUpload(videoId: string, completeUploadDto: CompleteUploadDto, userId: string) {
    const { s3Key, fileSizeBytes, durationSeconds } = completeUploadDto;

    // Get video and verify ownership
    const video = await this.prisma.video.findUnique({
      where: { id: videoId },
      include: {
        lesson: {
          include: {
            course: {
              select: {
                instructorId: true,
              },
            },
          },
        },
      },
    });

    if (!video) {
      throw new NotFoundException('Video not found');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    const isOwner = video.lesson.course.instructorId === userId;
    const isAdmin = user?.role === 'ADMIN';

    if (!isOwner && !isAdmin) {
      throw new ForbiddenException('You do not have permission to update this video');
    }

    // Verify file exists in S3
    const exists = await this.s3Service.checkObjectExists(s3Key);
    if (!exists) {
      throw new BadRequestException('Video file not found in storage');
    }

    // Update video record with S3 info
    const cloudfrontUrl = this.s3Service.getCloudfrontUrl(s3Key);

    return this.prisma.video.update({
      where: { id: videoId },
      data: {
        s3Key,
        cloudfrontUrl,
        fileSizeBytes: fileSizeBytes ? BigInt(fileSizeBytes) : null,
        durationSeconds,
        uploadStatus: 'READY',
      },
    });
  }

  async findAllByLesson(lessonId: string) {
    return this.prisma.video.findMany({
      where: { lessonId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findOne(id: string) {
    const video = await this.prisma.video.findUnique({
      where: { id },
      include: {
        lesson: {
          select: {
            id: true,
            title: true,
            courseId: true,
          },
        },
      },
    });

    if (!video) {
      throw new NotFoundException('Video not found');
    }

    return video;
  }

  async update(id: string, updateVideoDto: UpdateVideoDto, userId: string) {
    const video = await this.prisma.video.findUnique({
      where: { id },
      include: {
        lesson: {
          include: {
            course: {
              select: {
                instructorId: true,
              },
            },
          },
        },
      },
    });

    if (!video) {
      throw new NotFoundException('Video not found');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    const isOwner = video.lesson.course.instructorId === userId;
    const isAdmin = user?.role === 'ADMIN';

    if (!isOwner && !isAdmin) {
      throw new ForbiddenException('You do not have permission to update this video');
    }

    return this.prisma.video.update({
      where: { id },
      data: updateVideoDto,
    });
  }

  async remove(id: string, userId: string) {
    const video = await this.prisma.video.findUnique({
      where: { id },
      include: {
        lesson: {
          include: {
            course: {
              select: {
                instructorId: true,
              },
            },
          },
        },
      },
    });

    if (!video) {
      throw new NotFoundException('Video not found');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    const isOwner = video.lesson.course.instructorId === userId;
    const isAdmin = user?.role === 'ADMIN';

    if (!isOwner && !isAdmin) {
      throw new ForbiddenException('You do not have permission to delete this video');
    }

    // Delete from S3 if exists
    if (video.s3Key) {
      try {
        await this.s3Service.deleteObject(video.s3Key);
      } catch (error) {
        // Log error but continue with database deletion
        console.error('Error deleting video from S3:', error);
      }
    }

    // Delete from database
    await this.prisma.video.delete({
      where: { id },
    });

    return { message: 'Video deleted successfully' };
  }

  async updateProgress(updateProgressDto: UpdateProgressDto, userId: string) {
    const { videoId, lastPositionSeconds, watchedSeconds, completed } = updateProgressDto;

    // Verify video exists
    const video = await this.prisma.video.findUnique({
      where: { id: videoId },
    });

    if (!video) {
      throw new NotFoundException('Video not found');
    }

    // Upsert video progress
    const progress = await this.prisma.videoProgress.upsert({
      where: {
        userId_videoId: {
          userId,
          videoId,
        },
      },
      update: {
        lastPositionSeconds,
        watchedSeconds: watchedSeconds || lastPositionSeconds,
        isCompleted: completed || false,
      },
      create: {
        userId,
        videoId,
        lastPositionSeconds,
        watchedSeconds: watchedSeconds || lastPositionSeconds,
        isCompleted: completed || false,
      },
    });

    return progress;
  }

  async getProgress(videoId: string, userId: string) {
    const progress = await this.prisma.videoProgress.findUnique({
      where: {
        userId_videoId: {
          userId,
          videoId,
        },
      },
    });

    return progress || null;
  }

  async getUserProgress(userId: string) {
    return this.prisma.videoProgress.findMany({
      where: { userId },
      include: {
        video: {
          include: {
            lesson: {
              select: {
                id: true,
                title: true,
                course: {
                  select: {
                    id: true,
                    title: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }
}
