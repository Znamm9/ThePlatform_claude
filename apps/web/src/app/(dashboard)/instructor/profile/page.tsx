'use client';

import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

export default function InstructorProfile() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Profile</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Manage your account information</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-gray-700 dark:text-gray-300">Full Name</Label>
            <p className="text-lg font-medium">{user?.name}</p>
          </div>

          <div>
            <Label className="text-gray-700 dark:text-gray-300">Email Address</Label>
            <p className="text-lg font-medium">{user?.email}</p>
          </div>

          <div>
            <Label className="text-gray-700 dark:text-gray-300">Role</Label>
            <p className="text-lg">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800">
                {user?.role}
              </span>
            </p>
          </div>

          <div>
            <Label className="text-gray-700 dark:text-gray-300">Email Verified</Label>
            <p className="text-lg">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  user?.emailVerified
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                {user?.emailVerified ? 'Verified' : 'Not Verified'}
              </span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
