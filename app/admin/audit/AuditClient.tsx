'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  FileText,
  Search,
  Shield,
  User,
  Database,
  Settings,
  Filter,
} from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

// Mock audit logs (since backend endpoint might not be fully implemented)
const mockAuditLogs = [
  {
    id: 1,
    userId: 2,
    userName: 'Jane Admin',
    action: 'UPDATE_USER_ROLE',
    resource: 'user',
    resourceId: 15,
    details: { oldRole: 'user', newRole: 'admin' },
    timestamp: '2025-12-21T10:30:00Z',
  },
  {
    id: 2,
    userId: 2,
    userName: 'Jane Admin',
    action: 'CREATE_PROJECT',
    resource: 'project',
    resourceId: 428,
    details: { projectName: 'AI Chat Bot' },
    timestamp: '2025-12-21T09:15:00Z',
  },
  {
    id: 3,
    userId: 1,
    userName: 'John Doe',
    action: 'DELETE_VECTOR',
    resource: 'vector',
    resourceId: 9876,
    details: { namespace: 'default', vectorId: 'vec_123' },
    timestamp: '2025-12-21T08:45:00Z',
  },
  {
    id: 4,
    userId: 2,
    userName: 'Jane Admin',
    action: 'UPDATE_SETTINGS',
    resource: 'system',
    resourceId: 1,
    details: { setting: 'max_upload_size', oldValue: '10MB', newValue: '20MB' },
    timestamp: '2025-12-20T16:30:00Z',
  },
  {
    id: 5,
    userId: 3,
    userName: 'Bob Smith',
    action: 'LOGIN',
    resource: 'auth',
    resourceId: 3,
    details: { ipAddress: '192.168.1.100', userAgent: 'Mozilla/5.0' },
    timestamp: '2025-12-20T15:00:00Z',
  },
];

export default function AuditClient() {
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');

  // Filter logs
  const filteredLogs = mockAuditLogs.filter((log) => {
    const matchesSearch =
      log.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.resource.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesAction = actionFilter === 'all' || log.action.includes(actionFilter);

    return matchesSearch && matchesAction;
  });

  const getActionIcon = (action: string) => {
    if (action.includes('USER')) return <User className="h-4 w-4" />;
    if (action.includes('PROJECT') || action.includes('VECTOR')) return <Database className="h-4 w-4" />;
    if (action.includes('SETTINGS')) return <Settings className="h-4 w-4" />;
    if (action.includes('ROLE')) return <Shield className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  const getActionColor = (action: string) => {
    if (action.includes('CREATE')) return 'bg-green-600';
    if (action.includes('UPDATE')) return 'bg-blue-600';
    if (action.includes('DELETE')) return 'bg-red-600';
    if (action.includes('LOGIN')) return 'bg-purple-600';
    return 'bg-gray-600';
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
              <h1 className="text-3xl font-bold text-white">Audit Logs</h1>
              <p className="text-gray-400 mt-1">System activity and security audit trail</p>
            </div>
          </div>
          <Badge variant="outline" className="border-green-600 text-green-400">
            {filteredLogs.length} Entries
          </Badge>
        </div>

        {/* Filters */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by user, action, or resource..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-gray-700 border-gray-600 text-white"
                />
              </div>
              <div className="flex gap-2">
                {['all', 'CREATE', 'UPDATE', 'DELETE', 'LOGIN'].map((action) => (
                  <motion.button
                    key={action}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActionFilter(action)}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      actionFilter === action
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {action === 'all' ? 'All' : action}
                  </motion.button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Audit Logs */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Activity Log
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredLogs.length > 0 ? (
              <div className="space-y-3">
                {filteredLogs.map((log) => (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-4 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-2 rounded-lg ${getActionColor(log.action)}`}>
                        {getActionIcon(log.action)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge className={getActionColor(log.action)}>{log.action}</Badge>
                            <span className="text-white font-medium">{log.userName}</span>
                          </div>
                          <p className="text-sm text-gray-400">
                            {new Date(log.timestamp).toLocaleString()}
                          </p>
                        </div>
                        <p className="text-gray-300 text-sm mb-2">
                          {log.action.toLowerCase().replace(/_/g, ' ')} on {log.resource} #{log.resourceId}
                        </p>
                        {log.details && (
                          <div className="bg-gray-800/50 p-3 rounded-lg mt-2">
                            <p className="text-xs text-gray-400 font-mono">
                              {JSON.stringify(log.details, null, 2)}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Filter className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">No audit logs found matching your filters</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-green-400">
                  {mockAuditLogs.filter((l) => l.action.includes('CREATE')).length}
                </p>
                <p className="text-sm text-gray-400 mt-1">Creates</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-400">
                  {mockAuditLogs.filter((l) => l.action.includes('UPDATE')).length}
                </p>
                <p className="text-sm text-gray-400 mt-1">Updates</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-red-400">
                  {mockAuditLogs.filter((l) => l.action.includes('DELETE')).length}
                </p>
                <p className="text-sm text-gray-400 mt-1">Deletes</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-purple-400">
                  {mockAuditLogs.filter((l) => l.action.includes('LOGIN')).length}
                </p>
                <p className="text-sm text-gray-400 mt-1">Logins</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}
