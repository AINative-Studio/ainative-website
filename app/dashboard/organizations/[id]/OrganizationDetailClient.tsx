'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { organizationService } from '@/lib/organization-service';
import { Building2, Users, Plus, Trash2, Mail, Crown, Calendar, ArrowLeft, Settings2, UserMinus } from 'lucide-react';
import Link from 'next/link';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const stagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

interface OrganizationDetailClientProps {
  organizationId: string;
}

interface InviteMemberFormData {
  user_id: string;
  role: string;
}

interface UpdateOrgFormData {
  name: string;
  description: string;
  plan_tier: string;
}

export default function OrganizationDetailClient({ organizationId }: OrganizationDetailClientProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [inviteFormData, setInviteFormData] = useState<InviteMemberFormData>({
    user_id: '',
    role: 'member',
  });
  const [editFormData, setEditFormData] = useState<UpdateOrgFormData>({
    name: '',
    description: '',
    plan_tier: 'free',
  });

  const orgId = parseInt(organizationId);

  // Fetch organization details
  const { data: org, isLoading: orgLoading } = useQuery({
    queryKey: ['organization', orgId],
    queryFn: () => organizationService.getOrganization(orgId),
  });

  // Fetch organization members
  const { data: membersData, isLoading: membersLoading } = useQuery({
    queryKey: ['organization-members', orgId],
    queryFn: () => organizationService.listMembers(orgId),
  });

  // Add member mutation
  const addMemberMutation = useMutation({
    mutationFn: (data: InviteMemberFormData) =>
      organizationService.addMember(orgId, { user_id: parseInt(data.user_id), role: data.role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization-members', orgId] });
      setIsInviteDialogOpen(false);
      setInviteFormData({ user_id: '', role: 'member' });
    },
  });

  // Remove member mutation
  const removeMemberMutation = useMutation({
    mutationFn: (userId: number) => organizationService.removeMember(orgId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization-members', orgId] });
    },
  });

  // Update organization mutation
  const updateOrgMutation = useMutation({
    mutationFn: (data: UpdateOrgFormData) => organizationService.updateOrganization(orgId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization', orgId] });
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      setIsEditDialogOpen(false);
    },
  });

  // Delete organization mutation
  const deleteOrgMutation = useMutation({
    mutationFn: () => organizationService.deleteOrganization(orgId),
    onSuccess: () => {
      router.push('/dashboard/organizations');
    },
  });

  const handleInviteMember = () => {
    if (inviteFormData.user_id.trim()) {
      addMemberMutation.mutate(inviteFormData);
    }
  };

  const handleRemoveMember = (userId: number, name: string) => {
    if (confirm(`Are you sure you want to remove "${name}" from this organization?`)) {
      removeMemberMutation.mutate(userId);
    }
  };

  const handleUpdateOrg = () => {
    if (editFormData.name.trim()) {
      updateOrgMutation.mutate(editFormData);
    }
  };

  const handleDeleteOrg = () => {
    if (org && confirm(`Are you sure you want to delete "${org.name}"? This action cannot be undone.`)) {
      deleteOrgMutation.mutate();
    }
  };

  const openEditDialog = () => {
    if (org) {
      setEditFormData({
        name: org.name,
        description: org.description || '',
        plan_tier: org.plan_tier,
      });
      setIsEditDialogOpen(true);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'member':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'viewer':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  const getPlanBadgeColor = (tier: string) => {
    switch (tier.toLowerCase()) {
      case 'free':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
      case 'professional':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'enterprise':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  if (orgLoading || membersLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!org) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-red-500">Organization not found</p>
          <Link href="/dashboard/organizations">
            <Button variant="outline" className="mt-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Organizations
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const members = membersData?.members || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <Link href="/dashboard/organizations">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <Building2 className="h-8 w-8" />
              <h1 className="text-3xl font-bold tracking-tight">{org.name}</h1>
              <span className={`text-xs font-semibold px-2 py-1 rounded ${getPlanBadgeColor(org.plan_tier)}`}>
                {org.plan_tier.toUpperCase()}
              </span>
            </div>
            <p className="text-muted-foreground mt-2">{org.description || 'No description'}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={openEditDialog}>
            <Settings2 className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button variant="destructive" onClick={handleDeleteOrg} disabled={deleteOrgMutation.isPending}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </motion.div>

      {/* Edit Organization Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Organization</DialogTitle>
            <DialogDescription>Update organization details</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Organization Name</Label>
              <Input
                id="edit-name"
                value={editFormData.name}
                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Input
                id="edit-description"
                value={editFormData.description}
                onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-plan">Plan Tier</Label>
              <Select
                value={editFormData.plan_tier}
                onValueChange={(value) => setEditFormData({ ...editFormData, plan_tier: value })}
              >
                <SelectTrigger id="edit-plan">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateOrg} disabled={!editFormData.name.trim() || updateOrgMutation.isPending}>
              {updateOrgMutation.isPending ? 'Updating...' : 'Update Organization'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Tabs */}
      <Tabs defaultValue="members" className="space-y-6">
        <TabsList>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Members Tab */}
        <TabsContent value="members">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Organization Members</CardTitle>
                    <CardDescription>
                      Manage who has access to this organization
                    </CardDescription>
                  </div>

                  <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Member
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Member</DialogTitle>
                        <DialogDescription>
                          Add a new member to this organization
                        </DialogDescription>
                      </DialogHeader>

                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="user_id">User ID</Label>
                          <Input
                            id="user_id"
                            type="number"
                            placeholder="123"
                            value={inviteFormData.user_id}
                            onChange={(e) => setInviteFormData({ ...inviteFormData, user_id: e.target.value })}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="role">Role</Label>
                          <Select
                            value={inviteFormData.role}
                            onValueChange={(value) => setInviteFormData({ ...inviteFormData, role: value })}
                          >
                            <SelectTrigger id="role">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="viewer">Viewer</SelectItem>
                              <SelectItem value="member">Member</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsInviteDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button
                          onClick={handleInviteMember}
                          disabled={!inviteFormData.user_id.trim() || addMemberMutation.isPending}
                        >
                          {addMemberMutation.isPending ? 'Adding...' : 'Add Member'}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>

              <CardContent>
                {members.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No members yet</p>
                  </div>
                ) : (
                  <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={stagger}
                    className="space-y-4"
                  >
                    {members.map((member) => (
                      <motion.div
                        key={member.id}
                        variants={fadeUp}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Users className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-semibold">{member.name}</p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Mail className="h-3 w-3" />
                              {member.email}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className={`text-xs font-semibold px-2 py-1 rounded ${getRoleBadgeColor(member.role)}`}>
                            {member.role.toUpperCase()}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveMember(member.user_id, member.name)}
                            disabled={removeMemberMutation.isPending}
                          >
                            <UserMinus className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
          >
            <Card>
              <CardHeader>
                <CardTitle>Organization Details</CardTitle>
                <CardDescription>View and manage organization information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <Label className="text-muted-foreground">Organization ID</Label>
                    <p className="text-lg font-semibold mt-1">{org.id}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Plan Tier</Label>
                    <p className="text-lg font-semibold mt-1">{org.plan_tier}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Member Count</Label>
                    <p className="text-lg font-semibold mt-1">{org.member_count || 0}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Created</Label>
                    <p className="text-lg font-semibold mt-1">
                      {new Date(org.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <Label className="text-muted-foreground">Last Updated</Label>
                    <p className="text-lg font-semibold mt-1">
                      {new Date(org.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
