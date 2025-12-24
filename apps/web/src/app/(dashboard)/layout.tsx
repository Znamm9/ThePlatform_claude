'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-primary-50/30 to-secondary-50/30 dark:from-dark-50 dark:via-dark-100 dark:to-dark-200">
      <nav className="nav-glass">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link
                href="/"
                className="text-2xl font-bold gradient-text"
              >
                QA Platform
              </Link>
              <div className="hidden md:flex space-x-2">
                <Link
                  href={`/${user?.role?.toLowerCase()}/dashboard`}
                  className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:bg-primary-500/10"
                >
                  Dashboard
                </Link>
                {user?.role === 'INSTRUCTOR' && (
                  <Link
                    href="/instructor/students"
                    className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:bg-primary-500/10"
                  >
                    Platform Users
                  </Link>
                )}
                {user?.role === 'ADMIN' && (
                  <Link
                    href="/admin/users"
                    className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:bg-primary-500/10"
                  >
                    User Management
                  </Link>
                )}
                <Link
                  href={`/${user?.role?.toLowerCase()}/profile`}
                  className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:bg-primary-500/10"
                >
                  Profile
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="hidden sm:inline-block text-sm font-medium px-4 py-2 rounded-full bg-gradient-to-r from-primary-500/10 to-secondary-500/10 text-gray-700 dark:text-gray-300">
                {user?.name} <span className="text-primary-600 dark:text-primary-400">({user?.role})</span>
              </span>
              <ThemeToggle />
              <Button
                variant="glass"
                size="sm"
                onClick={() => signOut({ callbackUrl: '/login' })}
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto pt-24 pb-6 px-4 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
