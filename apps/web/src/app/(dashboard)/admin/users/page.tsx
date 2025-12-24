'use client';

import { useEffect, useState } from 'react';
import apiClient from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { useToast } from '@/components/ui/toast';
import { TableSkeleton } from '@/components/ui/skeleton';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'STUDENT' | 'INSTRUCTOR' | 'ADMIN';
  emailVerified: boolean;
  createdAt: string;
  _count?: {
    enrollments: number;
    coursesCreated: number;
  };
}

export default function UsersManagementPage() {
  const { showToast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [emailVerifiedFilter, setEmailVerifiedFilter] = useState<string>('ALL');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [minEnrollments, setMinEnrollments] = useState<string>('');
  const [maxEnrollments, setMaxEnrollments] = useState<string>('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newRole, setNewRole] = useState<string>('');

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [search, roleFilter, emailVerifiedFilter, dateFrom, dateTo, minEnrollments, maxEnrollments, users]);

  const fetchUsers = async () => {
    try {
      setLoading(true);

      // Build query parameters
      const params = new URLSearchParams();
      if (roleFilter !== 'ALL') params.append('role', roleFilter);
      if (emailVerifiedFilter !== 'ALL') params.append('emailVerified', emailVerifiedFilter);
      if (search) params.append('search', search);
      if (dateFrom) params.append('createdAfter', new Date(dateFrom).toISOString());
      if (dateTo) params.append('createdBefore', new Date(dateTo).toISOString());
      if (minEnrollments) params.append('minEnrollments', minEnrollments);
      if (maxEnrollments) params.append('maxEnrollments', maxEnrollments);

      const response = await apiClient.get(`/auth/users?${params.toString()}`);
      setUsers(response.data);
      setFilteredUsers(response.data);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      showToast('Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = [...users];

    // Filter by search
    if (search) {
      filtered = filtered.filter(
        (user) =>
          user.name.toLowerCase().includes(search.toLowerCase()) ||
          user.email.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Filter by role
    if (roleFilter !== 'ALL') {
      filtered = filtered.filter((user) => user.role === roleFilter);
    }

    // Filter by email verification
    if (emailVerifiedFilter !== 'ALL') {
      filtered = filtered.filter((user) => {
        if (emailVerifiedFilter === 'VERIFIED') return user.emailVerified;
        if (emailVerifiedFilter === 'UNVERIFIED') return !user.emailVerified;
        return true;
      });
    }

    // Filter by date range
    if (dateFrom) {
      const fromDate = new Date(dateFrom);
      filtered = filtered.filter((user) => new Date(user.createdAt) >= fromDate);
    }
    if (dateTo) {
      const toDate = new Date(dateTo);
      toDate.setHours(23, 59, 59, 999); // End of day
      filtered = filtered.filter((user) => new Date(user.createdAt) <= toDate);
    }

    // Filter by enrollment count
    if (minEnrollments) {
      const min = parseInt(minEnrollments);
      filtered = filtered.filter((user) => (user._count?.enrollments || 0) >= min);
    }
    if (maxEnrollments) {
      const max = parseInt(maxEnrollments);
      filtered = filtered.filter((user) => (user._count?.enrollments || 0) <= max);
    }

    setFilteredUsers(filtered);
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await apiClient.patch(`/auth/users/${userId}/role`, { role: newRole });
      showToast('User role updated successfully', 'success');
      fetchUsers();
      setEditingUser(null);
    } catch (error: any) {
      console.error('Error updating role:', error);
      showToast('Failed to update user role', 'error');
    }
  };

  const handleVerifyEmail = async (userId: string) => {
    try {
      await apiClient.patch(`/auth/users/${userId}/verify`);
      showToast('Email verified successfully', 'success');
      fetchUsers();
    } catch (error: any) {
      console.error('Error verifying email:', error);
      showToast('Failed to verify email', 'error');
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-100 text-red-800';
      case 'INSTRUCTOR':
        return 'bg-blue-100 text-blue-800';
      case 'STUDENT':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">User Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage all users on the platform ({users.length} total)
          </p>
        </div>
        <Button onClick={fetchUsers} variant="outline">
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card glass={false}>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Row 1: Search and Role */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Search Users
                </label>
                <Input
                  type="search"
                  placeholder="Search by name or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Filter by Role
                </label>
                <div className="flex gap-2">
                  {['ALL', 'STUDENT', 'INSTRUCTOR', 'ADMIN'].map((role) => (
                    <Button
                      key={role}
                      variant={roleFilter === role ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setRoleFilter(role)}
                    >
                      {role}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Row 2: Email Verification and Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Status
                </label>
                <Select
                  value={emailVerifiedFilter}
                  onChange={(e) => setEmailVerifiedFilter(e.target.value)}
                  glass={false}
                >
                  <option value="ALL">All Users</option>
                  <option value="VERIFIED">Verified</option>
                  <option value="UNVERIFIED">Unverified</option>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Joined From
                </label>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  glass={false}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Joined To
                </label>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  glass={false}
                />
              </div>
            </div>

            {/* Row 3: Activity Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Min Enrollments
                </label>
                <Input
                  type="number"
                  min="0"
                  placeholder="e.g., 5"
                  value={minEnrollments}
                  onChange={(e) => setMinEnrollments(e.target.value)}
                  glass={false}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Max Enrollments
                </label>
                <Input
                  type="number"
                  min="0"
                  placeholder="e.g., 50"
                  value={maxEnrollments}
                  onChange={(e) => setMaxEnrollments(e.target.value)}
                  glass={false}
                />
              </div>
            </div>

            {/* Clear Filters Button */}
            <div className="flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearch('');
                  setRoleFilter('ALL');
                  setEmailVerifiedFilter('ALL');
                  setDateFrom('');
                  setDateTo('');
                  setMinEnrollments('');
                  setMaxEnrollments('');
                }}
              >
                Clear All Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card glass={false}>
        <CardHeader>
          <CardTitle>
            Users ({filteredUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <TableSkeleton rows={10} />
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">No users found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b dark:border-gray-700">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                      Name
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                      Email
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                      Role
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                      Activity
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                      Joined
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="bg-white dark:bg-gray-800/50 border-b dark:border-gray-700 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="py-4 px-4">
                        <div className="font-medium text-gray-900 dark:text-gray-100">{user.name}</div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm text-gray-600 dark:text-gray-400">{user.email}</div>
                      </td>
                      <td className="py-4 px-4">
                        {editingUser?.id === user.id ? (
                          <select
                            value={newRole}
                            onChange={(e) => setNewRole(e.target.value)}
                            className="px-2 py-1 border dark:border-gray-700 border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 rounded text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
                          >
                            <option value="STUDENT">STUDENT</option>
                            <option value="INSTRUCTOR">INSTRUCTOR</option>
                            <option value="ADMIN">ADMIN</option>
                          </select>
                        ) : (
                          <span
                            className={`text-xs px-3 py-1 rounded-full font-medium ${getRoleBadgeColor(
                              user.role
                            )}`}
                          >
                            {user.role}
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`text-xs px-3 py-1 rounded-full font-medium ${
                            user.emailVerified
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {user.emailVerified ? 'Verified' : 'Unverified'}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {user.role === 'INSTRUCTOR' ? (
                            <span>{user._count?.coursesCreated || 0} courses</span>
                          ) : (
                            <span>{user._count?.enrollments || 0} enrollments</span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {formatDate(user.createdAt)}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex gap-2">
                          {editingUser?.id === user.id ? (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleRoleChange(user.id, newRole)}
                              >
                                Save
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditingUser(null)}
                              >
                                Cancel
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setEditingUser(user);
                                  setNewRole(user.role);
                                }}
                              >
                                Edit Role
                              </Button>
                              {!user.emailVerified && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleVerifyEmail(user.id)}
                                >
                                  Verify
                                </Button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card glass={false}>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {users.filter((u) => u.role === 'STUDENT').length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Students</div>
          </CardContent>
        </Card>
        <Card glass={false}>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {users.filter((u) => u.role === 'INSTRUCTOR').length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Instructors</div>
          </CardContent>
        </Card>
        <Card glass={false}>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {users.filter((u) => u.role === 'ADMIN').length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Admins</div>
          </CardContent>
        </Card>
        <Card glass={false}>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {users.filter((u) => u.emailVerified).length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Verified Users</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
