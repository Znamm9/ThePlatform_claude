import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { VideosService } from './videos.service';
import { VideosController } from './videos.controller';
import { S3Service } from './s3.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule, ConfigModule],
  controllers: [VideosController],
  providers: [VideosService, S3Service],
  exports: [VideosService],
})
export class VideosModule {}
