# Phase 5 Complete - Video Upload & Streaming

Phase 5 (Video Upload & Streaming) is now complete! 🎉

## What Was Implemented

### Backend (NestJS)

1. **Videos Module**
   - Full CRUD operations for videos
   - AWS S3 integration for video storage
   - CloudFront CDN URL generation
   - Presigned URL generation for secure uploads
   - Video upload status tracking (UPLOADING, PROCESSING, READY, FAILED)
   - Permission-based access control (instructors own courses)

2. **S3 Service**
   - AWS SDK v3 integration
   - Presigned upload URL generation (1-hour expiration)
   - Object deletion from S3
   - Object existence verification
   - CloudFront URL generation
   - S3 key generation with timestamps

3. **Video Progress Tracking**
   - Track video watch progress per user
   - Store last watched position
   - Track total watched seconds
   - Mark videos as completed (90% threshold)
   - Get user's watch history

4. **API Endpoints**
   ```
   POST   /videos                      # Create video & get upload URL (Instructor/Admin)
   POST   /videos/:id/complete-upload  # Mark upload complete (Instructor/Admin)
   GET    /videos/lesson/:lessonId     # Get all videos for lesson (Public)
   GET    /videos/:id                  # Get video by ID (Public)
   PATCH  /videos/:id                  # Update video metadata (Owner/Admin)
   DELETE /videos/:id                  # Delete video from S3 & DB (Owner/Admin)
   POST   /videos/progress             # Update watch progress (Authenticated)
   GET    /videos/progress/:videoId    # Get progress for video (Authenticated)
   GET    /videos/progress             # Get all user progress (Authenticated)
   ```

### Frontend (Next.js)

1. **Instructor Video Management**
   - **Video Upload Component** - Upload videos with progress bar
   - **Video List Component** - View uploaded videos with metadata
   - **Manage Videos Page** (`/instructor/courses/[id]/lessons/[lessonId]/videos`)
     - Upload multiple videos per lesson
     - Real-time upload progress tracking
     - View video status (UPLOADING, READY, FAILED)
     - Delete videos with confirmation
     - Display file size and duration

2. **Student Video Player**
   - **Custom Video Player Component** - Full-featured HTML5 video player
   - **Lesson Viewer Integration** - Videos embedded in lesson pages
   - Features:
     - Play/Pause controls
     - Seek bar with current position
     - Volume control with visual slider
     - Fullscreen mode
     - Time display (current / total)
     - Automatic progress tracking
     - Multiple videos per lesson
     - Switch between videos

3. **Video Player Features**
   - Custom controls styled with Tailwind CSS
   - Responsive design (works on mobile & desktop)
   - Progress tracking every 5 seconds
   - Completion detection (90% watched)
   - Click-to-play/pause on video
   - Keyboard-friendly controls

## Key Features

### For Instructors
- **Upload Videos**: Direct upload to AWS S3 with presigned URLs
- **Progress Tracking**: See upload progress in real-time
- **Video Management**: View, delete, and organize videos
- **Status Monitoring**: Track upload status (uploading, ready, failed)
- **Multiple Videos**: Upload multiple videos per lesson

### For Students
- **Watch Videos**: Stream videos via CloudFront CDN
- **Custom Player**: Full-featured video player with controls
- **Auto-Resume**: Progress saved automatically (backend ready)
- **Multiple Videos**: Switch between lesson videos
- **Responsive**: Works on all screen sizes

### Technical Highlights
- **Direct S3 Upload**: Frontend uploads directly to S3 (not through backend)
- **Presigned URLs**: Secure, time-limited upload URLs
- **CloudFront CDN**: Fast video delivery globally
- **Progress Tracking**: Backend tracks watch history
- **Completion Detection**: Automatically marks videos as watched
- **Permission System**: Only course owners can manage videos

## Files Created

### Backend (10 files)
```
apps/api/src/modules/videos/
├── dto/
│   ├── create-video.dto.ts           # Video creation DTO
│   ├── update-video.dto.ts           # Video update DTO
│   ├── complete-upload.dto.ts        # Upload completion DTO
│   └── update-progress.dto.ts        # Progress tracking DTO
├── s3.service.ts                      # AWS S3 operations
├── videos.service.ts                  # Video business logic
├── videos.controller.ts               # Video API endpoints
└── videos.module.ts                   # NestJS module
```

### Frontend (5 files)
```
apps/web/src/
├── components/video/
│   ├── video-upload.tsx               # Video upload form
│   ├── video-list.tsx                 # Video list display
│   └── video-player.tsx               # Custom video player
└── app/(dashboard)/instructor/courses/[id]/lessons/[lessonId]/videos/
    └── page.tsx                       # Video management page
```

### Modified Files (3 files)
```
apps/api/src/app.module.ts             # Added VideosModule
apps/web/src/app/(dashboard)/instructor/courses/[id]/lessons/page.tsx  # Added Videos button
apps/web/src/app/(public)/courses/[slug]/lessons/[lessonSlug]/page.tsx  # Added video player
```

## Database Schema Used

### Videos Table
```prisma
model Video {
  id              String        @id @default(cuid())
  lessonId        String        @map("lesson_id")
  title           String
  s3Key           String        @map("s3_key")
  cloudfrontUrl   String        @map("cloudfront_url")
  durationSeconds Int?          @map("duration_seconds")
  fileSizeBytes   BigInt?       @map("file_size_bytes")
  thumbnailUrl    String?       @map("thumbnail_url")
  uploadStatus    UploadStatus  @default(UPLOADING)
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
}

enum UploadStatus {
  UPLOADING
  PROCESSING
  READY
  FAILED
}
```

### VideoProgress Table
```prisma
model VideoProgress {
  id                  String   @id @default(cuid())
  userId              String   @map("user_id")
  videoId             String   @map("video_id")
  lastPositionSeconds Int      @default(0)
  watchedSeconds      Int      @default(0)
  completed           Boolean  @default(false)
  lastWatchedAt       DateTime @default(now())
}
```

## AWS Configuration Required

Before using video features, configure AWS credentials in `apps/api/.env`:

```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
AWS_S3_BUCKET=qa-platform-videos
CLOUDFRONT_URL=https://your-cloudfront-domain.cloudfront.net
```

### AWS Setup Steps

1. **Create S3 Bucket**
   - Name: `qa-platform-videos` (or your choice)
   - Region: `us-east-1` (or your choice)
   - Enable CORS for presigned URLs:
   ```json
   [
     {
       "AllowedHeaders": ["*"],
       "AllowedMethods": ["PUT", "POST", "GET"],
       "AllowedOrigins": ["http://localhost:3000"],
       "ExposeHeaders": []
     }
   ]
   ```

2. **Create CloudFront Distribution**
   - Origin: Your S3 bucket
   - Viewer Protocol Policy: Redirect HTTP to HTTPS
   - Allowed HTTP Methods: GET, HEAD
   - Cache Policy: CachingOptimized

3. **Create IAM User**
   - Permissions: `s3:PutObject`, `s3:GetObject`, `s3:DeleteObject`, `s3:HeadObject`
   - Scope: Your S3 bucket only
   - Generate access keys

## Upload Flow

### How Video Upload Works

1. **Frontend**: User selects video file and enters title
2. **Backend**: Creates video record in DB with status `UPLOADING`
3. **Backend**: Generates S3 key: `videos/{videoId}/{timestamp}-{filename}`
4. **Backend**: Creates presigned upload URL (1-hour expiration)
5. **Backend**: Returns video record, upload URL, and S3 key
6. **Frontend**: Uploads file directly to S3 using presigned URL
7. **Frontend**: Shows upload progress (0-100%)
8. **Frontend**: Calls complete-upload endpoint when done
9. **Backend**: Verifies file exists in S3
10. **Backend**: Updates video record with CloudFront URL and status `READY`
11. **Student**: Can now watch the video

## Video Player Controls

- **Play/Pause**: Click video or play button
- **Seek**: Drag progress bar to jump to position
- **Volume**: Adjust volume slider
- **Fullscreen**: Click fullscreen button
- **Progress**: Automatically saved every 5 seconds
- **Completion**: Auto-detected at 90% watched

## Testing the Features

### 1. Upload Video (Instructor)
```
1. Login as instructor
2. Go to /instructor/courses
3. Click a course you created
4. Click "Manage Lessons"
5. Click "Videos" button next to a lesson
6. Enter video title and select video file
7. Click "Upload Video"
8. Watch progress bar reach 100%
9. Video appears in the list with status "READY"
```

### 2. Watch Video (Student)
```
1. Browse to /courses
2. Click on a course
3. Click on a lesson that has videos
4. Video player loads automatically
5. Click play to watch
6. Progress is saved as you watch
7. Switch between videos if multiple exist
```

### 3. Track Progress (Any User)
```
1. Watch a video for at least 5 seconds
2. Backend receives progress update
3. Close browser and return later
4. (Future) Video resumes from last position
```

## Features Comparison

| Feature | Implemented | Notes |
|---------|-------------|-------|
| Video Upload | ✅ | Direct to S3 with presigned URLs |
| Upload Progress | ✅ | Real-time progress bar |
| CloudFront CDN | ✅ | Fast video delivery |
| Custom Player | ✅ | HTML5 with custom controls |
| Play/Pause | ✅ | Click or button |
| Seek Bar | ✅ | Draggable timeline |
| Volume Control | ✅ | Slider with mute |
| Fullscreen | ✅ | Standard API |
| Progress Tracking | ✅ | Backend storage |
| Auto-Resume | ⚠️ | Backend ready, frontend TODO |
| Video Thumbnails | ⏳ | Schema ready, generation TODO |
| Video Processing | ⏳ | Accepts any format, no transcoding |
| HLS/Adaptive | ⏳ | Future enhancement |
| Subtitles/Captions | ⏳ | Future enhancement |
| Download Video | ⏳ | Future enhancement |

## What's Next (Phase 6 - Exercises)

Phase 6 will add coding exercises/challenges:

1. Create exercise schema with test cases
2. Build code editor component (Monaco/CodeMirror)
3. Implement code execution sandbox
4. Create exercise submission system
5. Add automated test evaluation
6. Build instructor exercise creator
7. Show student submission history

## Known Limitations

1. **No Transcoding**: Videos are served as-is (no format conversion)
2. **No HLS/DASH**: Single file playback only (not adaptive bitrate)
3. **No Thumbnails**: Thumbnail generation not implemented
4. **No Auto-Resume**: Player doesn't restore last position yet
5. **Basic Progress**: Progress tracking works but no visual indicator
6. **No Upload Validation**: Accepts any video format (could fail playback)
7. **No File Size Limit**: Should add max file size validation
8. **No Video Preview**: Can't preview before uploading

## API Security

- ✅ JWT authentication required for uploads
- ✅ Permission checks (only course owners)
- ✅ Presigned URLs expire after 1 hour
- ✅ S3 keys use unique IDs (no collisions)
- ✅ Videos deleted from S3 when DB record deleted
- ✅ Public videos readable by anyone (via CloudFront)

## Performance Optimizations

1. **Direct S3 Upload**: Frontend uploads directly (no backend proxy)
2. **CloudFront CDN**: Global edge caching for fast delivery
3. **Presigned URLs**: Temporary, secure upload URLs
4. **Progress Batching**: Updates every 5 seconds (not every frame)
5. **Video Lazy Loading**: Videos load only when lesson opened

## Code Quality

- ✅ TypeScript types everywhere
- ✅ Form validation with class-validator
- ✅ Error handling with try-catch
- ✅ Loading states for UX
- ✅ Permission checks on all endpoints
- ✅ Swagger/OpenAPI documentation
- ✅ Responsive design
- ✅ Clean component structure
- ✅ Reusable components

---

**Status**: Phase 5 Complete ✅
**Next**: Phase 6 - Coding Exercises
**Progress**: 5/13 phases completed (38%)

## Quick Reference

### Environment Variables
```env
# Backend (.env)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_S3_BUCKET=qa-platform-videos
CLOUDFRONT_URL=https://xxxxx.cloudfront.net
```

### Useful Commands
```bash
# Backend
cd apps/api
pnpm dev  # Start backend on :3001

# Frontend
cd apps/web
pnpm dev  # Start frontend on :3000

# Both
pnpm dev  # Start both from root
```

### API Testing (with curl)
```bash
# Create video (get upload URL)
curl -X POST http://localhost:3001/videos \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"My Video","lessonId":"lesson-id","fileName":"video.mp4"}'

# Upload to presigned URL
curl -X PUT "PRESIGNED_URL" \
  -H "Content-Type: video/mp4" \
  --upload-file video.mp4

# Complete upload
curl -X POST http://localhost:3001/videos/VIDEO_ID/complete-upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"s3Key":"videos/xxx/video.mp4","fileSizeBytes":1024000}'
```
