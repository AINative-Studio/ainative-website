'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Search,
  Shield,
  User,
  Users as UsersIcon,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { adminService } from '@/lib/admin-service';

export default function UsersClient() {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  // Fetch users
  const { data: usersData, isLoading } = useQuery({
    queryKey: ['admin-users', page, roleFilter],
    queryFn: () =>
      adminService.getUsers({
        page,
        pageSize: 50,
        ...(roleFilter !== 'all' && { role: roleFilter }),
      }),
  });

  // Update user role mutation
  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, newRole }: { userId: number; newRole: string }) =>
      adminService.updateUserRole(userId, newRole),
    onSuccess: () => {
      // Invalidate and refetch users
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });

  const handleRoleChange = async (userId: number, newRole: string) => {
    if (confirm(`Are you sure you want to change this user's role to ${newRole}?`)) {
      await updateRoleMutation.mutateAsync({ userId, newRole });
    }
  };

  // Mock data for fallback
  const mockUsers = {
    users: [
      {
        id: 1,
        email: 'john.doe@example.com',
        name: 'John Doe',
        role: 'user',
        createdAt: '2025-01-15T10:00:00Z',
        lastLogin: '2025-12-21T09:00:00Z',
      },
      {
        id: 2,
        email: 'jane.admin@example.com',
        name: 'Jane Admin',
        role: 'admin',
        createdAt: '2025-01-10T08:00:00Z',
        lastLogin: '2025-12-21T10:30:00Z',
      },
      {
        id: 3,
        email: 'bob.smith@example.com',
        name: 'Bob Smith',
        role: 'user',
        createdAt: '2025-02-01T14:00:00Z',
        lastLogin: '2025-12-20T15:00:00Z',
      },
    ],
    total: 3,
    page: 1,
    pageSize: 50,
  };

  const displayData = usersData || mockUsers;

  // Filter users by search query
  const filteredUsers = displayData.users.filter(
    (user) =>
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRoleBadgeColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
      case 'superuser':
        return 'bg-purple-600';
      case 'user':
        return 'bg-blue-600';
      default:
        return 'bg-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-300"
              >
                <ArrowLeft className="h-5 w-5" />
              </motion.button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white">User Management</h1>
              <p className="text-gray-400 mt-1">Manage users and their roles</p>
            </div>
          </div>
          <Badge variant="outline" className="border-blue-600 text-blue-400">
            {displayData.total} Total Users
          </Badge>
        </div>

        {/* Filters */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by email or name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-gray-700 border-gray-600 text-white"
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full md:w-48 bg-gray-700 border-gray-600 text-white">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="superuser">Superuser</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <UsersIcon className="h-5 w-5" />
              Users ({filteredUsers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              </div>
            ) : filteredUsers.length > 0 ? (
              <div className="space-y-3">
                {filteredUsers.map((user) => (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-4 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center">
                          <User className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-white font-medium">{user.name}</p>
                            <Badge className={getRoleBadgeColor(user.role)}>{user.role}</Badge>
                          </div>
                          <p className="text-sm text-gray-400">{user.email}</p>
                          <div className="flex gap-4 mt-1">
                            <p className="text-xs text-gray-500">
                              Created: {new Date(user.createdAt).toLocaleDateString()}
                            </p>
                            {user.lastLogin && (
                              <p className="text-xs text-gray-500">
                                Last login: {new Date(user.lastLogin).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {user.lastLogin ? (
                          <CheckCircle className="h-5 w-5 text-green-400" />
                        ) : (
                          <XCircle className="h-5 w-5 text-gray-500" />
                        )}
                        <Select
                          value={user.role}
                          onValueChange={(newRole) => handleRoleChange(user.id, newRole)}
                        >
                          <SelectTrigger className="w-32 bg-gray-700 border-gray-600 text-white">
                            <Shield className="h-4 w-4 mr-2" />
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-700 border-gray-600">
                            <SelectItem value="user">User</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="superuser">Superuser</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <UsersIcon className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">No users found matching your search</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {displayData.total > displayData.pageSize && (
          <div className="flex justify-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg"
            >
              Previous
            </motion.button>
            <div className="px-4 py-2 bg-gray-800 text-white rounded-lg">
              Page {page} of {Math.ceil(displayData.total / displayData.pageSize)}
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= Math.ceil(displayData.total / displayData.pageSize)}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg"
            >
              Next
            </motion.button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
