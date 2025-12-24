# Phase 7 Complete - Quizzes & Assessments

Phase 7 (Quizzes & Assessments) is now complete!

## What Was Implemented

### Backend (NestJS)

1. **Quizzes Module**
   - Full CRUD operations for quizzes
   - Permission-based access control (instructors own courses)
   - Multiple question types (MULTIPLE_CHOICE, TRUE_FALSE, CODE_BASED)
   - Passing score configuration
   - Time limit support
   - Sort order management

2. **Quiz Questions Module**
   - CRUD operations for individual questions
   - Support for 3 question types
   - Options for multiple choice questions
   - Correct answers and explanations
   - Points system per question
   - Sort order management

3. **Quiz Grading Service**
   - Automatic grading of quiz submissions
   - Answer validation based on question type
   - Normalized string comparison for text answers
   - Boolean normalization for true/false questions
   - Percentage score calculation
   - Pass/fail determination
   - Detailed results per question

4. **Quiz Submission System**
   - Submit quiz attempts with answers
   - Automatic grading on submission
   - Store attempt history
   - Track score, pass/fail, and timing
   - Detailed answer feedback
   - Points earned tracking

5. **API Endpoints**
   ```
   POST   /quizzes                         # Create quiz (Instructor/Admin)
   GET    /quizzes/lesson/:lessonId        # Get all quizzes for lesson (Public)
   GET    /quizzes/:id                     # Get quiz by ID (Public, no answers)
   PATCH  /quizzes/:id                     # Update quiz (Owner/Admin)
   DELETE /quizzes/:id                     # Delete quiz (Owner/Admin)

   POST   /quizzes/:quizId/questions       # Add question to quiz (Instructor/Admin)
   PATCH  /quizzes/questions/:questionId   # Update question (Owner/Admin)
   DELETE /quizzes/questions/:questionId   # Delete question (Owner/Admin)

   POST   /quizzes/submit                  # Submit quiz attempt (Authenticated)
   GET    /quizzes/attempts/:quizId        # Get user's attempts for quiz
   GET    /quizzes/attempt/:attemptId      # Get specific attempt with details
   GET    /quizzes/attempts/user/all       # Get all user's quiz attempts
   ```

### Frontend (Next.js)

1. **Instructor Quiz Management**
   - **Quiz Form Component** - Create quizzes with questions
   - **Quiz List Component** - View and delete quizzes
   - **Manage Quizzes Page** (`/instructor/courses/[id]/lessons/[lessonId]/quizzes`)
     - Create quizzes with title, description
     - Set passing score percentage
     - Configure time limits (optional)
     - Add multiple questions inline
     - Support for 3 question types
     - Add options for multiple choice
     - Set correct answers
     - Add explanations (optional)
     - Set points per question
     - Delete quizzes with confirmation

2. **Student Quiz Taking**
   - **Quiz Taker Component** - Interactive quiz interface
   - **Quiz Integration in Lesson Viewer** - Embedded in lesson pages
   - Features:
     - Start quiz with info display
     - Display all questions at once
     - Multiple choice with radio buttons
     - True/False questions
     - Code-based text area
     - Progress tracking (answered count)
     - Time countdown (if time limit set)
     - Auto-submit on timeout
     - Submit button with validation
     - Warning for unanswered questions

3. **Quiz Results & Review**
   - **Quiz Results Component** - Detailed results display
   - Features:
     - Pass/fail status with visual feedback
     - Score percentage display
     - Correct/incorrect count
     - Points earned display
     - Question-by-question review
     - Show user's answers
     - Show correct answers
     - Visual indicators (✓/✗)
     - Explanations display
     - Retry quiz option
     - Completion timestamp

4. **Navigation Integration**
   - Added "Quizzes" button to lesson management page
   - Quizzes appear in lesson viewer after exercises
   - Smooth state management between quiz start/complete

## Key Features

### For Instructors
- **Create Quizzes**: Define assessments with multiple questions
- **Question Types**: Multiple choice, true/false, code-based
- **Multiple Choice Options**: Add 2+ options with correct answer
- **True/False Questions**: Simple boolean questions
- **Code-Based Questions**: Text input for code or detailed answers
- **Explanations**: Provide explanations for each question
- **Passing Score**: Set minimum percentage to pass
- **Time Limits**: Optional time constraints
- **Points System**: Assign points to each question
- **Quiz Management**: View, edit, and delete quizzes

### For Students
- **Quiz Overview**: See question count, passing score, time limit
- **Interactive Interface**: Clean, easy-to-use quiz taking UI
- **Multiple Choice**: Radio button selection with highlighting
- **True/False**: Simple binary choice
- **Code Input**: Large text area for code answers
- **Progress Tracking**: See how many questions answered
- **Timer**: Countdown display with auto-submit
- **Instant Results**: Immediate grading on submission
- **Detailed Feedback**: See correct/incorrect answers
- **Explanations**: Learn from explanations
- **Retry Option**: Take quiz again
- **Attempt History**: Track all attempts

### Technical Highlights
- **Automatic Grading**: Instant scoring without manual review
- **Type Safety**: Full TypeScript throughout
- **Answer Normalization**: Smart comparison (case-insensitive, trimmed)
- **Validation**: Server-side validation of all inputs
- **Permission System**: Only course owners can manage quizzes
- **Public Reading**: Anyone can view quiz questions (not answers)
- **Private Attempts**: Only quiz taker can view their attempts
- **Time Management**: Optional time limits with auto-submit
- **Responsive Design**: Works on all screen sizes

## Files Created

### Backend (9 files)
```
apps/api/src/modules/quizzes/
├── dto/
│   ├── create-quiz.dto.ts              # Quiz creation DTO
│   ├── update-quiz.dto.ts              # Quiz update DTO
│   ├── create-quiz-question.dto.ts     # Question creation DTO
│   ├── update-quiz-question.dto.ts     # Question update DTO
│   └── submit-quiz.dto.ts              # Quiz submission DTO
├── quiz-grading.service.ts             # Grading logic
├── quizzes.service.ts                  # Quiz business logic
├── quizzes.controller.ts               # Quiz API endpoints
└── quizzes.module.ts                   # NestJS module
```

### Frontend (5 files)
```
apps/web/src/
├── components/quizzes/
│   ├── quiz-form.tsx                   # Quiz creation form
│   ├── quiz-list.tsx                   # Quiz list display
│   ├── quiz-taker.tsx                  # Student quiz interface
│   └── quiz-results.tsx                # Results display
└── app/(dashboard)/instructor/courses/[id]/lessons/[lessonId]/quizzes/
    └── page.tsx                        # Quiz management page
```

### Modified Files (2 files)
```
apps/api/src/app.module.ts              # Added QuizzesModule
apps/web/src/app/(public)/courses/[slug]/lessons/[lessonSlug]/page.tsx  # Added quiz display
apps/web/src/app/(dashboard)/instructor/courses/[id]/lessons/page.tsx   # Added Quizzes button
```

## Database Schema Used

### Quiz Table
```prisma
model Quiz {
  id               String   @id @default(uuid())
  lessonId         String   @map("lesson_id")
  title            String
  description      String?  @db.Text
  passingScore     Int      @default(70) @map("passing_score")
  timeLimitMinutes Int?     @map("time_limit_minutes")
  sortOrder        Int      @map("sort_order")
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  lesson    Lesson        @relation(fields: [lessonId], references: [id], onDelete: Cascade)
  questions QuizQuestion[]
  attempts  QuizAttempt[]
}
```

### QuizQuestion Table
```prisma
model QuizQuestion {
  id             String       @id @default(uuid())
  quizId         String       @map("quiz_id")
  questionText   String       @map("question_text") @db.Text
  questionType   QuestionType @map("question_type")
  options        Json?
  correctAnswer  Json         @map("correct_answer")
  explanation    String?      @db.Text
  points         Int          @default(1)
  sortOrder      Int          @map("sort_order")
  createdAt      DateTime     @default(now())

  quiz    Quiz         @relation(fields: [quizId], references: [id], onDelete: Cascade)
  answers QuizAnswer[]
}

enum QuestionType {
  MULTIPLE_CHOICE
  CODE_BASED
  TRUE_FALSE
}
```

### QuizAttempt Table
```prisma
model QuizAttempt {
  id              String   @id @default(uuid())
  userId          String   @map("user_id")
  quizId          String   @map("quiz_id")
  score           Int
  passed          Boolean
  startedAt       DateTime @default(now())
  completedAt     DateTime?
  timeTakenSeconds Int?    @map("time_taken_seconds")

  user    User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  quiz    Quiz         @relation(fields: [quizId], references: [id], onDelete: Cascade)
  answers QuizAnswer[]
}
```

### QuizAnswer Table
```prisma
model QuizAnswer {
  id           String   @id @default(uuid())
  attemptId    String   @map("attempt_id")
  questionId   String   @map("question_id")
  userAnswer   Json     @map("user_answer")
  isCorrect    Boolean  @map("is_correct")
  pointsEarned Int      @default(0) @map("points_earned")
  answeredAt   DateTime @default(now())

  attempt  QuizAttempt  @relation(fields: [attemptId], references: [id], onDelete: Cascade)
  question QuizQuestion @relation(fields: [questionId], references: [id], onDelete: Cascade)
}
```

## Quiz Flow

### Instructor Creates Quiz

1. **Navigate**: Go to lesson → Click "Quizzes" button
2. **Create Quiz**: Click "New Quiz"
3. **Configure**:
   - Enter title and description
   - Set passing score (default 70%)
   - Set time limit (optional)
4. **Add Questions**: Click "Add Question"
   - Enter question text
   - Select type (Multiple Choice, True/False, Code)
   - For MC: Add 2+ options
   - Enter correct answer
   - Add explanation (optional)
   - Set points (default 1)
5. **Submit**: Click "Create Quiz"

### Student Takes Quiz

1. **View Lesson**: Navigate to lesson page
2. **Start Quiz**: Click "Start Quiz" button
3. **Answer Questions**:
   - Read each question
   - Select/enter answer
   - Track progress (answered count)
   - Watch timer (if time limit)
4. **Submit**: Click "Submit Quiz"
5. **View Results**: See score, pass/fail, and detailed feedback
6. **Review**: Check each question's correct answer and explanation
7. **Retry** (optional): Click "Retry Quiz" to take again

## Grading Logic

### Multiple Choice
```typescript
correctAnswer === userAnswer (case-insensitive, trimmed)
```

### True/False
```typescript
normalizeBoolean(correctAnswer) === normalizeBoolean(userAnswer)
// Accepts: true, false, "true", "false", "1", "0", "yes", "no"
```

### Code-Based
```typescript
normalizeString(correctAnswer) === normalizeString(userAnswer)
// Simple string comparison (can be enhanced with code execution)
```

### Score Calculation
```typescript
score = (earnedPoints / totalPoints) * 100
passed = score >= passingScore
```

## Example Quiz

### Quiz: Testing Fundamentals
- **Passing Score**: 70%
- **Time Limit**: 15 minutes
- **Questions**: 5

#### Question 1 (Multiple Choice, 2 points)
**Question**: What is a test case?
**Options**:
- A type of bug
- A set of conditions to verify functionality ✓
- A testing tool
- A programming language

**Explanation**: A test case is a set of conditions or variables used to determine if a system under test satisfies requirements correctly.

#### Question 2 (True/False, 1 point)
**Question**: Unit tests should test multiple components together.
**Answer**: False ✓

**Explanation**: Unit tests should test individual units/components in isolation. Integration tests test multiple components together.

#### Question 3 (Code-Based, 3 points)
**Question**: Write a function that returns true if a number is even.
**Expected Answer**: `return n % 2 === 0;`

## Features Comparison

| Feature | Implemented | Notes |
|---------|-------------|-------|
| Create Quizzes | ✅ | Full CRUD with questions |
| Multiple Choice | ✅ | 2+ options with radio selection |
| True/False | ✅ | Boolean questions |
| Code-Based | ✅ | Text input for code answers |
| Automatic Grading | ✅ | Instant scoring |
| Pass/Fail | ✅ | Based on passing score |
| Points System | ✅ | Points per question |
| Time Limits | ✅ | Optional countdown timer |
| Explanations | ✅ | Show after submission |
| Attempt History | ✅ | Track all attempts |
| Retry Quizzes | ✅ | Take quiz multiple times |
| Results Review | ✅ | Detailed answer review |
| Question Types | ✅ | 3 types supported |
| Passing Score | ✅ | Configurable percentage |
| Sort Order | ✅ | Custom question order |
| Code Execution | ⏳ | Future: Run code for validation |
| Partial Credit | ⏳ | Future: Points for partial correctness |
| Question Banks | ⏳ | Future: Reusable question library |
| Random Questions | ⏳ | Future: Randomize question order |
| Answer Shuffle | ⏳ | Future: Shuffle MC options |
| Question Categories | ⏳ | Future: Organize questions |

## What's Next (Phase 8)

Phase 8 will focus on progress tracking and analytics:

1. Enhanced progress tracking system
2. Student dashboard with course progress
3. Instructor analytics dashboard
4. Lesson completion tracking
5. Quiz pass rates and analytics
6. Exercise completion rates
7. Video watch time tracking
8. Course completion certificates
9. Milestone achievements
10. Leaderboards (optional)

## Testing the Features

### 1. Create Quiz (Instructor)
```
1. Login as instructor
2. Go to /instructor/courses
3. Click a course you created
4. Click "Manage Lessons"
5. Click "Quizzes" button next to a lesson
6. Click "New Quiz"
7. Fill in title: "JavaScript Basics Quiz"
8. Set passing score: 70
9. Set time limit: 10 minutes
10. Click "Add Question"
11. Enter question: "What is a variable?"
12. Select type: "MULTIPLE_CHOICE"
13. Add 4 options
14. Enter correct answer
15. Add explanation
16. Click "Add Question to Quiz"
17. Add 2-3 more questions
18. Click "Create Quiz"
19. Quiz appears in the list
```

### 2. Take Quiz (Student)
```
1. Login as student
2. Browse to a course
3. Click on a lesson that has quizzes
4. Scroll down to "Quizzes" section
5. Click "Start Quiz"
6. Answer all questions
7. Watch the timer count down
8. Click "Submit Quiz"
9. View results (score, pass/fail)
10. Review each question
11. See correct/incorrect answers
12. Read explanations
```

### 3. View Quiz History
```
1. After taking a quiz
2. See your score and status
3. Click "Retry Quiz" to take again
4. Previous attempt is saved
5. Can compare multiple attempts
```

## API Security

- ✅ JWT authentication required for submissions
- ✅ Permission checks (only course owners manage)
- ✅ Public quiz reading (questions only, not answers)
- ✅ Private attempts (only owner can view)
- ✅ Answer hiding (students don't see answers before submission)
- ✅ Validation on all inputs
- ✅ Auto-grading (no client-side manipulation)

## Performance Optimizations

1. **Lazy Loading**: Quizzes load only when needed
2. **Parallel Fetching**: Quiz and lesson data fetched together
3. **JSON Storage**: Efficient storage of options and answers
4. **Indexed Queries**: Fast lookups by lesson ID
5. **Client State**: Minimal re-renders during quiz taking

## Code Quality

- ✅ TypeScript types everywhere
- ✅ Form validation with class-validator
- ✅ Error handling with try-catch
- ✅ Loading states for UX
- ✅ Permission checks on all endpoints
- ✅ Swagger/OpenAPI documentation ready
- ✅ Responsive design
- ✅ Clean component structure
- ✅ Reusable components
- ✅ Proper state management

## Known Limitations

1. **No Code Execution**: Code-based questions use string comparison only
2. **No Question Bank**: Can't reuse questions across quizzes
3. **No Randomization**: Questions always in same order
4. **No Partial Credit**: All or nothing per question
5. **No Question Preview**: Students see all questions at once
6. **No Answer Changes**: Can't change answer after viewing results
7. **No Time Pause**: Timer can't be paused
8. **No Question Categories**: Can't organize questions by topic

## Future Enhancements

1. **Code Execution**: Run submitted code against test cases
2. **Question Banks**: Reusable question library
3. **Random Questions**: Randomize question order per attempt
4. **Shuffle Answers**: Randomize MC option order
5. **Partial Credit**: Award points for partially correct answers
6. **Question Preview**: Show questions one at a time
7. **Timer Pause**: Allow pausing for breaks
8. **Question Categories**: Organize by topic/difficulty
9. **Bulk Import**: Import questions from CSV/JSON
10. **Question Analytics**: Track which questions are hardest

---

**Status**: Phase 7 Complete ✅
**Next**: Phase 8 - Progress Tracking & Analytics
**Progress**: 7/13 phases completed (54%)

## Quick Reference

### Question Types
```typescript
MULTIPLE_CHOICE  // Radio button selection
TRUE_FALSE       // Boolean choice
CODE_BASED       // Text area for code
```

### Example API Call (Submit Quiz)
```typescript
POST /quizzes/submit
{
  "quizId": "quiz-123",
  "answers": [
    {
      "questionId": "q1",
      "userAnswer": "Paris"
    },
    {
      "questionId": "q2",
      "userAnswer": true
    }
  ]
}

Response:
{
  "id": "attempt-456",
  "score": 85,
  "passed": true,
  "totalPoints": 10,
  "earnedPoints": 8.5,
  "answers": [...]
}
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
