export * from './roles';
export * from './course-categories';

export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: '/api/auth/register',
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    ME: '/api/auth/me',
  },
  COURSES: {
    LIST: '/api/courses',
    DETAIL: (id: string) => `/api/courses/${id}`,
    CURRICULUM: (id: string) => `/api/courses/${id}/curriculum`,
  },
  ENROLLMENTS: {
    LIST: '/api/enrollments',
    ENROLL: '/api/enrollments',
  },
  PROGRESS: {
    COURSE: (id: string) => `/api/progress/courses/${id}`,
    LESSON_COMPLETE: (id: string) => `/api/progress/lessons/${id}/complete`,
    VIDEO: (id: string) => `/api/progress/videos/${id}`,
  },
  PAYMENTS: {
    CREATE_INTENT: '/api/payments/create-intent',
    CONFIRM: '/api/payments/confirm',
    HISTORY: '/api/payments/history',
  },
} as const;
