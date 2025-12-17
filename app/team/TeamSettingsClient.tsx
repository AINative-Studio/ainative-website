'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Users,
  UserPlus,
  Settings,
  Shield,
  Mail,
  MoreHorizontal,
  Trash2,
  Crown,
  Loader2,
} from 'lucide-react';

type Role = 'owner' | 'admin' | 'member' | 'viewer';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: Role;
  status: 'active' | 'pending';
  joinedAt: string;
}

interface PendingInvite {
  id: string;
  email: string;
  role: Role;
  sentAt: string;
  expiresAt: string;
}

// Mock team members
const mockMembers: TeamMember[] = [
  {
    id: '1',
    name: 'Alex Johnson',
    email: 'alex@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex',
    role: 'owner',
    status: 'active',
    joinedAt: '2024-01-15',
  },
  {
    id: '2',
    name: 'Sarah Chen',
    email: 'sarah@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
    role: 'admin',
    status: 'active',
    joinedAt: '2024-03-20',
  },
  {
    id: '3',
    name: 'Mike Wilson',
    email: 'mike@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mike',
    role: 'member',
    status: 'active',
    joinedAt: '2024-06-10',
  },
  {
    id: '4',
    name: 'Emily Davis',
    email: 'emily@example.com',
    role: 'viewer',
    status: 'active',
    joinedAt: '2024-09-05',
  },
];

const mockInvites: PendingInvite[] = [
  {
    id: 'inv-1',
    email: 'newmember@company.com',
    role: 'member',
    sentAt: '2024-12-10',
    expiresAt: '2024-12-17',
  },
];

const roleConfig: Record<Role, { label: string; color: string; description: string }> = {
  owner: {
    label: 'Owner',
    color: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    description: 'Full access to all features and settings',
  },
  admin: {
    label: 'Admin',
    color: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    description: 'Can manage team members and most settings',
  },
  member: {
    label: 'Member',
    color: 'bg-green-500/20 text-green-300 border-green-500/30',
    description: 'Can use AI features and view analytics',
  },
  viewer: {
    label: 'Viewer',
    color: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
    description: 'Can only view dashboards and reports',
  },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

function RoleBadge({ role }: { role: Role }) {
  const config = roleConfig[role];
  return (
    <Badge variant="outline" className={config.color}>
      {role === 'owner' && <Crown className="w-3 h-3 mr-1" />}
      {config.label}
    </Badge>
  );
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function TeamSettingsClient() {
  const [members] = useState<TeamMember[]>(mockMembers);
  const [invites] = useState<PendingInvite[]>(mockInvites);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<Role>('member');
  const [isInviting, setIsInviting] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [teamName, setTeamName] = useState('AINative Team');

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;
    setIsInviting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsInviting(false);
    setShowInviteDialog(false);
    setInviteEmail('');
    setInviteRole('member');
  };

  return (
    <motion.div
      className="max-w-5xl mx-auto px-4 md:px-6 pt-4"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Header */}
      <motion.div className="mb-8" variants={itemVariants}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <Users className="w-8 h-8 text-[#4B6FED]" />
              Team Settings
            </h1>
            <p className="text-gray-400">
              Manage your team members, roles, and permissions
            </p>
          </div>
          <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
            <DialogTrigger asChild>
              <Button className="bg-[#4B6FED] hover:bg-[#3A56D3] text-white">
                <UserPlus className="w-4 h-4 mr-2" />
                Invite Member
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#161B22] border-gray-800 text-white">
              <DialogHeader>
                <DialogTitle>Invite Team Member</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Send an invitation to join your team
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="colleague@company.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="bg-gray-800 border-gray-700"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as Role)}>
                    <SelectTrigger className="bg-gray-800 border-gray-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="member">Member</SelectItem>
                      <SelectItem value="viewer">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">{roleConfig[inviteRole].description}</p>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowInviteDialog(false)}
                  className="border-gray-700 text-white hover:bg-gray-800"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleInvite}
                  disabled={!inviteEmail.trim() || isInviting}
                  className="bg-[#4B6FED] hover:bg-[#3A56D3]"
                >
                  {isInviting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4 mr-2" />
                      Send Invite
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </motion.div>

      <Tabs defaultValue="members" className="space-y-6">
        <TabsList className="bg-[#161B22] border border-gray-800">
          <TabsTrigger value="members" className="data-[state=active]:bg-gray-800">
            <Users className="w-4 h-4 mr-2" />
            Members ({members.length})
          </TabsTrigger>
          <TabsTrigger value="settings" className="data-[state=active]:bg-gray-800">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </TabsTrigger>
          <TabsTrigger value="permissions" className="data-[state=active]:bg-gray-800">
            <Shield className="w-4 h-4 mr-2" />
            Permissions
          </TabsTrigger>
        </TabsList>

        {/* Members Tab */}
        <TabsContent value="members" className="space-y-6">
          {/* Pending Invites */}
          {invites.length > 0 && (
            <motion.div variants={itemVariants}>
              <Card className="bg-[#161B22] border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white text-lg">Pending Invitations</CardTitle>
                  <CardDescription className="text-gray-400">
                    {invites.length} pending invite{invites.length !== 1 ? 's' : ''}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {invites.map((invite) => (
                      <div
                        key={invite.id}
                        className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                            <Mail className="w-5 h-5 text-gray-400" />
                          </div>
                          <div>
                            <p className="text-white font-medium">{invite.email}</p>
                            <p className="text-sm text-gray-400">
                              Sent {formatDate(invite.sentAt)} • Expires{' '}
                              {formatDate(invite.expiresAt)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <RoleBadge role={invite.role} />
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-gray-400 hover:text-red-400"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Team Members */}
          <motion.div variants={itemVariants}>
            <Card className="bg-[#161B22] border-gray-800">
              <CardHeader>
                <CardTitle className="text-white text-lg">Team Members</CardTitle>
                <CardDescription className="text-gray-400">
                  People who have access to this workspace
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {members.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={member.avatar} alt={member.name} />
                          <AvatarFallback className="bg-[#4B6FED] text-white">
                            {getInitials(member.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-white font-medium">{member.name}</p>
                          <p className="text-sm text-gray-400">{member.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <RoleBadge role={member.role} />
                        <p className="text-xs text-gray-500 hidden md:block">
                          Joined {formatDate(member.joinedAt)}
                        </p>
                        {member.role !== 'owner' && (
                          <Button variant="ghost" size="sm" className="text-gray-400">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <motion.div variants={itemVariants}>
            <Card className="bg-[#161B22] border-gray-800">
              <CardHeader>
                <CardTitle className="text-white text-lg">Team Information</CardTitle>
                <CardDescription className="text-gray-400">
                  Basic information about your team
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="teamName">Team Name</Label>
                  <Input
                    id="teamName"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    className="bg-gray-800 border-gray-700 max-w-md"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Team ID</Label>
                  <div className="text-sm text-gray-400 font-mono bg-gray-800 p-2 rounded max-w-md">
                    team_abc123xyz
                  </div>
                </div>
                <Button className="bg-[#4B6FED] hover:bg-[#3A56D3]">Save Changes</Button>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="bg-[#161B22] border-red-900/50">
              <CardHeader>
                <CardTitle className="text-red-400 text-lg">Danger Zone</CardTitle>
                <CardDescription className="text-gray-400">
                  Irreversible actions that affect your entire team
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-red-900/30 rounded-lg">
                  <div>
                    <p className="text-white font-medium">Delete Team</p>
                    <p className="text-sm text-gray-400">
                      Permanently delete this team and all associated data
                    </p>
                  </div>
                  <Button variant="destructive">Delete Team</Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Permissions Tab */}
        <TabsContent value="permissions" className="space-y-6">
          <motion.div variants={itemVariants}>
            <Card className="bg-[#161B22] border-gray-800">
              <CardHeader>
                <CardTitle className="text-white text-lg">Role Permissions</CardTitle>
                <CardDescription className="text-gray-400">
                  Configure what each role can access
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {(Object.entries(roleConfig) as [Role, typeof roleConfig.owner][]).map(
                    ([role, config]) => (
                      <div
                        key={role}
                        className="p-4 bg-gray-800/50 rounded-lg border border-gray-700"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <RoleBadge role={role} />
                          {role !== 'owner' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-gray-400"
                            >
                              Edit
                            </Button>
                          )}
                        </div>
                        <p className="text-sm text-gray-400">{config.description}</p>
                        <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2">
                          <div className="text-xs text-gray-500">
                            <span
                              className={`inline-block w-2 h-2 rounded-full mr-1 ${
                                role !== 'viewer' ? 'bg-green-500' : 'bg-gray-600'
                              }`}
                            />
                            Use AI Features
                          </div>
                          <div className="text-xs text-gray-500">
                            <span
                              className={`inline-block w-2 h-2 rounded-full mr-1 ${
                                role === 'owner' || role === 'admin' ? 'bg-green-500' : 'bg-gray-600'
                              }`}
                            />
                            Manage Members
                          </div>
                          <div className="text-xs text-gray-500">
                            <span
                              className={`inline-block w-2 h-2 rounded-full mr-1 ${
                                role === 'owner' || role === 'admin' ? 'bg-green-500' : 'bg-gray-600'
                              }`}
                            />
                            Billing Access
                          </div>
                          <div className="text-xs text-gray-500">
                            <span
                              className={`inline-block w-2 h-2 rounded-full mr-1 ${
                                role === 'owner' ? 'bg-green-500' : 'bg-gray-600'
                              }`}
                            />
                            Delete Team
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
