'use client';

import { useSession } from 'next-auth/react';

export function useAuth() {
  const { data: session, status } = useSession();

  return {
    user: session?.user,
    isAuthenticated: status === 'authenticated',
    isLoading: status === 'loading',
    isStudent: session?.user?.role === 'STUDENT',
    isInstructor: session?.user?.role === 'INSTRUCTOR',
    isAdmin: session?.user?.role === 'ADMIN',
  };
}
