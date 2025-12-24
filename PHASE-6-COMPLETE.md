# Phase 6 Complete - Coding Exercises

Phase 6 (Coding Exercises) is now complete!

## What Was Implemented

### Backend (NestJS)

1. **Exercises Module**
   - Full CRUD operations for exercises
   - Permission-based access control (instructors own courses)
   - Test case management
   - Exercise difficulty levels (EASY, MEDIUM, HARD)
   - Points system for exercises
   - Sort order management

2. **Code Execution Service**
   - Secure code execution using vm2 sandbox
   - Test case validation
   - Automatic grading
   - Error handling and timeouts (5-second limit)
   - Support for JSON input/output
   - Detailed test results per test case

3. **Exercise Submission System**
   - Submit code solutions
   - Automatic code execution against test cases
   - Store submission history
   - Calculate points earned
   - Track correct/incorrect submissions
   - Detailed test results with input/expected/actual output

4. **API Endpoints**
   ```
   POST   /exercises                      # Create exercise (Instructor/Admin)
   GET    /exercises/lesson/:lessonId     # Get all exercises for lesson (Public)
   GET    /exercises/:id                  # Get exercise by ID (Public)
   PATCH  /exercises/:id                  # Update exercise (Owner/Admin)
   DELETE /exercises/:id                  # Delete exercise (Owner/Admin)
   POST   /exercises/submit               # Submit code solution (Authenticated)
   GET    /exercises/submissions/:exerciseId  # Get user's submissions for exercise
   GET    /exercises/submissions/user/all     # Get all user's submissions
   ```

### Frontend (Next.js)

1. **Instructor Exercise Management**
   - **Exercise Form Component** - Create exercises with test cases
   - **Exercise List Component** - View and delete exercises
   - **Manage Exercises Page** (`/instructor/courses/[id]/lessons/[lessonId]/exercises`)
     - Create exercises with multiple test cases
     - Set difficulty level and points
     - Add starter code and solution code
     - Define test cases with input/output
     - Delete exercises with confirmation

2. **Student Code Editor**
   - **Code Editor Component** - Write and submit code
   - **Lesson Viewer Integration** - Exercises embedded in lesson pages
   - Features:
     - Large textarea for code writing (upgradeable to Monaco Editor)
     - Submit code and get instant feedback
     - View test results with pass/fail status
     - See input, expected output, and actual output
     - Submission history with timestamps
     - Load previous submissions
     - Points earned display
     - Error messages for failed tests

3. **Code Editor Features**
   - Monospace font for code
   - Syntax highlighting support (ready for Monaco)
   - Submit button with loading state
   - Show/hide submission history
   - Load previous code from history
   - Real-time test results
   - Detailed error messages
   - Responsive design

## Key Features

### For Instructors
- **Create Exercises**: Define coding challenges with test cases
- **Test Cases**: Add multiple test cases with input/expected output
- **Starter Code**: Provide initial code template
- **Solution Code**: Store reference solution
- **Difficulty Levels**: Mark exercises as EASY, MEDIUM, or HARD
- **Points System**: Assign points to exercises
- **Exercise Management**: View, edit, and delete exercises

### For Students
- **Code Editor**: Write code solutions in a clean editor
- **Instant Feedback**: Submit and get immediate test results
- **Test Results**: See which test cases passed/failed
- **Submission History**: View all previous attempts
- **Load Previous**: Restore code from past submissions
- **Points Tracking**: See points earned on each submission
- **Detailed Errors**: View error messages and stack traces

### Technical Highlights
- **Sandboxed Execution**: Code runs in isolated vm2 environment
- **Timeout Protection**: 5-second execution limit
- **Auto-Grading**: Automatic comparison of output
- **JSON Support**: Handle complex input/output formats
- **Error Handling**: Catch and display runtime errors
- **Permission System**: Only course owners can manage exercises
- **Progress Tracking**: Store all submission attempts
- **Test Result Details**: Show input, expected, and actual for each test

## Files Created

### Backend (8 files)
```
apps/api/src/modules/exercises/
├── dto/
│   ├── create-exercise.dto.ts         # Exercise creation DTO
│   ├── update-exercise.dto.ts         # Exercise update DTO
│   └── submit-exercise.dto.ts         # Code submission DTO
├── code-execution.service.ts          # Code execution & testing
├── exercises.service.ts               # Exercise business logic
├── exercises.controller.ts            # Exercise API endpoints
└── exercises.module.ts                # NestJS module
```

### Frontend (4 files)
```
apps/web/src/
├── components/exercises/
│   ├── exercise-form.tsx              # Exercise creation form
│   ├── exercise-list.tsx              # Exercise list display
│   └── code-editor.tsx                # Student code editor
└── app/(dashboard)/instructor/courses/[id]/lessons/[lessonId]/exercises/
    └── page.tsx                       # Exercise management page
```

### Modified Files (3 files)
```
apps/api/src/app.module.ts             # Added ExercisesModule
apps/web/src/app/(dashboard)/instructor/courses/[id]/lessons/page.tsx  # Added Exercises button
apps/web/src/app/(public)/courses/[slug]/lessons/[lessonSlug]/page.tsx  # Added exercise display
```

## Database Schema Used

### Exercises Table
```prisma
model Exercise {
  id           String             @id @default(uuid())
  lessonId     String             @map("lesson_id")
  title        String
  description  String             @db.Text
  instructions String             @db.Text
  starterCode  String?            @map("starter_code") @db.Text
  solutionCode String?            @map("solution_code") @db.Text
  testCases    Json?              @map("test_cases")
  difficulty   ExerciseDifficulty
  points       Int                @default(0)
  sortOrder    Int                @map("sort_order")
  createdAt    DateTime           @default(now())
  updatedAt    DateTime           @updatedAt
}

enum ExerciseDifficulty {
  EASY
  MEDIUM
  HARD
}
```

### ExerciseSubmission Table
```prisma
model ExerciseSubmission {
  id            String   @id @default(uuid())
  userId        String   @map("user_id")
  exerciseId    String   @map("exercise_id")
  submittedCode String   @map("submitted_code") @db.Text
  isCorrect     Boolean? @map("is_correct")
  testResults   Json?    @map("test_results")
  pointsEarned  Int      @default(0) @map("points_earned")
  feedback      String?  @db.Text
  submittedAt   DateTime @default(now())
}
```

## Code Execution Flow

### How Code Execution Works

1. **Student**: Writes code in the editor
2. **Submit**: Clicks "Submit Code" button
3. **Frontend**: Sends code to backend via POST /exercises/submit
4. **Backend**: Fetches exercise and test cases
5. **Execution Service**: Runs code in vm2 sandbox for each test case
6. **Validation**: Compares actual output with expected output
7. **Grading**: Calculates pass/fail and points earned
8. **Storage**: Saves submission with test results
9. **Response**: Returns results to frontend
10. **Display**: Shows test results to student

## Test Case Format

Test cases are stored as JSON with the following structure:

```json
[
  {
    "input": "5",
    "expectedOutput": "10",
    "description": "Should double the input"
  },
  {
    "input": "{\"a\": 1, \"b\": 2}",
    "expectedOutput": "3",
    "description": "Should sum object values"
  }
]
```

## Code Execution Security

- **Sandboxing**: Uses vm2 for isolated execution
- **Timeout**: 5-second limit prevents infinite loops
- **No External Access**: Cannot access network or file system
- **No Eval**: Direct eval is disabled
- **No WASM**: WebAssembly disabled
- **Safe Globals**: Limited global objects available

## Example Exercise

### Title
"Double the Number"

### Description
Write a function that doubles the input number.

### Instructions
```
Create a function called `solution` that takes a number as input
and returns the number multiplied by 2.

Example:
solution(5) => 10
solution(10) => 20
```

### Starter Code
```javascript
function solution(input) {
  // Your code here
}
```

### Solution Code
```javascript
function solution(input) {
  return input * 2;
}
```

### Test Cases
```json
[
  {
    "input": "5",
    "expectedOutput": "10",
    "description": "Should double 5"
  },
  {
    "input": "0",
    "expectedOutput": "0",
    "description": "Should handle zero"
  },
  {
    "input": "-3",
    "expectedOutput": "-6",
    "description": "Should handle negative numbers"
  }
]
```

## Testing the Features

### 1. Create Exercise (Instructor)
```
1. Login as instructor
2. Go to /instructor/courses
3. Click a course you created
4. Click "Manage Lessons"
5. Click "Exercises" button next to a lesson
6. Click "New Exercise"
7. Fill in title, description, instructions
8. Add starter code (optional)
9. Add test cases with input/output
10. Click "Create Exercise"
11. Exercise appears in the list
```

### 2. Solve Exercise (Student)
```
1. Login as student
2. Browse to a course
3. Click on a lesson that has exercises
4. Scroll down to "Coding Exercises" section
5. Read the problem description
6. Write code in the editor
7. Click "Submit Code"
8. View test results (passed/failed)
9. See points earned
10. Try again if needed
```

### 3. View Submission History
```
1. After submitting code
2. Click "Show History" button
3. See list of all submissions
4. View timestamp and pass/fail status
5. Click "Load Code" to restore previous submission
```

## Features Comparison

| Feature | Implemented | Notes |
|---------|-------------|-------|
| Create Exercises | ✅ | Full CRUD with test cases |
| Code Execution | ✅ | Sandboxed with vm2 |
| Test Cases | ✅ | Multiple test cases per exercise |
| Auto-Grading | ✅ | Automatic pass/fail detection |
| Points System | ✅ | Points awarded for correct solutions |
| Submission History | ✅ | All attempts saved |
| Test Results | ✅ | Detailed input/output/error display |
| Starter Code | ✅ | Optional code template |
| Solution Code | ✅ | Reference solution storage |
| Difficulty Levels | ✅ | EASY, MEDIUM, HARD |
| Code Editor | ✅ | Basic textarea (upgradeable to Monaco) |
| Syntax Highlighting | ⏳ | Ready for Monaco Editor integration |
| Multi-Language | ⏳ | Currently JavaScript only |
| Code Linting | ⏳ | Future enhancement |
| Hints System | ⏳ | Future enhancement |
| Test Case Hints | ⏳ | Future enhancement |

## What's Next (Phase 7 - Quizzes)

Phase 7 will add quiz/assessment features:

1. Create quiz schema with questions
2. Build quiz creation interface
3. Implement quiz-taking UI
4. Add multiple choice questions
5. Add true/false questions
6. Add code-based questions
7. Implement quiz grading
8. Show quiz results and explanations
9. Track quiz attempts
10. Add time limits for quizzes

## Known Limitations

1. **JavaScript Only**: Currently only supports JavaScript code
2. **Basic Editor**: Uses textarea instead of Monaco Editor
3. **No Syntax Highlighting**: Plain text editing only
4. **No Autocomplete**: No code completion features
5. **No Hints**: Students don't get hints when stuck
6. **No Partial Credit**: Either full points or no points
7. **Limited Error Info**: Basic error messages only
8. **No Test Case Visibility**: Students can't see test inputs before submitting

## Future Enhancements

1. **Monaco Editor**: Upgrade to VS Code-style editor
2. **Multiple Languages**: Support Python, Java, C++, etc.
3. **Syntax Highlighting**: Language-specific highlighting
4. **Autocomplete**: Intelligent code completion
5. **Hints System**: Progressive hints when struggling
6. **Partial Credit**: Award points for partially correct solutions
7. **Test Visibility**: Option to show test inputs to students
8. **Code Review**: Instructor can review and comment on submissions
9. **Plagiarism Detection**: Check for copied code
10. **Performance Testing**: Test code efficiency

## API Security

- ✅ JWT authentication required for submissions
- ✅ Permission checks (only course owners manage)
- ✅ Code execution sandbox (vm2)
- ✅ Timeout protection (5 seconds)
- ✅ No file system access
- ✅ No network access
- ✅ Public exercise reading (anyone can view)
- ✅ Private submissions (only owner can view)

## Performance Optimizations

1. **Sandboxed Execution**: Isolated vm2 instances
2. **Timeout Limits**: Prevent infinite loops
3. **JSON Validation**: Normalize input/output
4. **Lazy Loading**: Exercises load only when needed
5. **History Pagination**: Future - paginate submission history

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

---

**Status**: Phase 6 Complete ✅
**Next**: Phase 7 - Quizzes & Assessments
**Progress**: 6/13 phases completed (46%)

## Quick Reference

### Dependencies Added
```json
{
  "vm2": "3.10.0",
  "@nestjs/mapped-types": "2.1.0"
}
```

### Example Test Case
```typescript
{
  input: "5",
  expectedOutput: "10",
  description: "Should double the input"
}
```

### Example Submission Response
```json
{
  "id": "submission-id",
  "exerciseId": "exercise-id",
  "submittedCode": "function solution(input) { return input * 2; }",
  "isCorrect": true,
  "pointsEarned": 10,
  "testResults": {
    "allTestsPassed": true,
    "totalTests": 3,
    "passedTests": 3,
    "failedTests": 0,
    "results": [...]
  },
  "submittedAt": "2025-01-15T10:30:00Z"
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
