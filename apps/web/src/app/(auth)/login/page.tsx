import Link from 'next/link';
import { LoginForm } from '@/components/auth/login-form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 gradient-animated opacity-30 -z-10" />
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-secondary-500/20 rounded-full blur-3xl" />

      <Card className="w-full max-w-md animate-scale-in" hover={false}>
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-4xl font-black">
            <span className="gradient-text">Welcome Back</span>
          </CardTitle>
          <CardDescription className="text-base">
            Sign in to your account to continue learning
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
          <div className="mt-6 text-center text-sm">
            Don&apos;t have an account?{' '}
            <Link
              href="/register"
              className="font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
            >
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
