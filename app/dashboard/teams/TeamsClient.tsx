'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { teamService, Team } from '@/lib/team-service';
import { organizationService } from '@/lib/organization-service';
import { Users, Plus, Trash2, Calendar, Building2, UserPlus, UserMinus, Mail } from 'lucide-react';

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

interface CreateTeamFormData {
  name: string;
  description: string;
  organization_id: string;
}

interface AddMemberFormData {
  user_id: string;
  role: string;
}

export default function TeamsClient() {
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  const [isAddMemberDialogOpen, setIsAddMemberDialogOpen] = useState(false);
  const [formData, setFormData] = useState<CreateTeamFormData>({
    name: '',
    description: '',
    organization_id: '',
  });
  const [memberFormData, setMemberFormData] = useState<AddMemberFormData>({
    user_id: '',
    role: 'member',
  });

  // Fetch organizations for dropdown
  const { data: orgsData } = useQuery({
    queryKey: ['organizations'],
    queryFn: () => organizationService.listOrganizations(),
  });

  // Fetch teams
  const { data: teamsData, isLoading, error } = useQuery({
    queryKey: ['teams'],
    queryFn: () => teamService.listTeams(),
  });

  // Fetch members for selected team
  const { data: membersData } = useQuery({
    queryKey: ['team-members', selectedTeamId],
    queryFn: () => teamService.listTeamMembers(selectedTeamId!),
    enabled: !!selectedTeamId,
  });

  // Create team mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateTeamFormData) =>
      teamService.createTeam({
        name: data.name,
        description: data.description,
        organization_id: parseInt(data.organization_id),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      setIsCreateDialogOpen(false);
      setFormData({ name: '', description: '', organization_id: '' });
    },
  });

  // Delete team mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => teamService.deleteTeam(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
  });

  // Add team member mutation
  const addMemberMutation = useMutation({
    mutationFn: ({ teamId, data }: { teamId: number; data: AddMemberFormData }) =>
      teamService.addTeamMember(teamId, { user_id: parseInt(data.user_id), role: data.role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members', selectedTeamId] });
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      setIsAddMemberDialogOpen(false);
      setMemberFormData({ user_id: '', role: 'member' });
    },
  });

  // Remove team member mutation
  const removeMemberMutation = useMutation({
    mutationFn: ({ teamId, userId }: { teamId: number; userId: number }) =>
      teamService.removeTeamMember(teamId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members', selectedTeamId] });
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
  });

  const handleCreateTeam = () => {
    if (formData.name.trim() && formData.organization_id) {
      createMutation.mutate(formData);
    }
  };

  const handleDeleteTeam = (id: number, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      deleteMutation.mutate(id);
    }
  };

  const handleAddMember = () => {
    if (selectedTeamId && memberFormData.user_id.trim()) {
      addMemberMutation.mutate({ teamId: selectedTeamId, data: memberFormData });
    }
  };

  const handleRemoveMember = (userId: number, name: string) => {
    if (selectedTeamId && confirm(`Remove "${name}" from team?`)) {
      removeMemberMutation.mutate({ teamId: selectedTeamId, userId });
    }
  };

  const openAddMemberDialog = (teamId: number) => {
    setSelectedTeamId(teamId);
    setIsAddMemberDialogOpen(true);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'lead':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'member':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-red-500">Failed to load teams</p>
          <p className="text-sm text-muted-foreground mt-2">{(error as Error).message}</p>
        </div>
      </div>
    );
  }

  const teams = teamsData?.teams || [];
  const organizations = orgsData?.organizations || [];
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
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Teams</h1>
          <p className="text-muted-foreground mt-2">
            Manage your teams and team members
          </p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Team
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Team</DialogTitle>
              <DialogDescription>
                Create a new team within an organization
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="organization">Organization</Label>
                <Select
                  value={formData.organization_id}
                  onValueChange={(value) => setFormData({ ...formData, organization_id: value })}
                >
                  <SelectTrigger id="organization">
                    <SelectValue placeholder="Select organization" />
                  </SelectTrigger>
                  <SelectContent>
                    {organizations.map((org) => (
                      <SelectItem key={org.id} value={org.id.toString()}>
                        {org.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Team Name</Label>
                <Input
                  id="name"
                  placeholder="Engineering Team"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Input
                  id="description"
                  placeholder="A brief description of the team"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateTeam}
                disabled={!formData.name.trim() || !formData.organization_id || createMutation.isPending}
              >
                {createMutation.isPending ? 'Creating...' : 'Create Team'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Add Member Dialog */}
      <Dialog open={isAddMemberDialogOpen} onOpenChange={setIsAddMemberDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Team Member</DialogTitle>
            <DialogDescription>
              Add a new member to this team
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="member_user_id">User ID</Label>
              <Input
                id="member_user_id"
                type="number"
                placeholder="123"
                value={memberFormData.user_id}
                onChange={(e) => setMemberFormData({ ...memberFormData, user_id: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="member_role">Role</Label>
              <Select
                value={memberFormData.role}
                onValueChange={(value) => setMemberFormData({ ...memberFormData, role: value })}
              >
                <SelectTrigger id="member_role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="lead">Team Lead</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddMemberDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddMember}
              disabled={!memberFormData.user_id.trim() || addMemberMutation.isPending}
            >
              {addMemberMutation.isPending ? 'Adding...' : 'Add Member'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Teams Grid */}
      {teams.length === 0 ? (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
        >
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Users className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No teams yet</h3>
              <p className="text-muted-foreground text-center mb-6">
                Get started by creating your first team
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Team
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {teams.map((team: Team) => (
            <motion.div key={team.id} variants={fadeUp}>
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        {team.name}
                      </CardTitle>
                      <CardDescription className="mt-2">
                        {team.description || 'No description'}
                      </CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteTeam(team.id, team.name)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Organization */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Building2 className="h-4 w-4" />
                    <span>
                      {organizations.find(o => o.id === team.organization_id)?.name || 'Unknown Org'}
                    </span>
                  </div>

                  {/* Member Count */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{team.member_count || 0} members</span>
                  </div>

                  {/* Created Date */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Created {new Date(team.created_at).toLocaleDateString()}</span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      className="flex-1"
                      variant="outline"
                      onClick={() => openAddMemberDialog(team.id)}
                    >
                      <UserPlus className="mr-2 h-4 w-4" />
                      Add Member
                    </Button>
                    <Button
                      className="flex-1"
                      variant="outline"
                      onClick={() => setSelectedTeamId(team.id)}
                    >
                      View Members
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Members List (when team is selected) */}
      {selectedTeamId && (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Team Members</CardTitle>
                  <CardDescription>
                    {teams.find(t => t.id === selectedTeamId)?.name || 'Team'} members
                  </CardDescription>
                </div>
                <Button variant="outline" onClick={() => setSelectedTeamId(null)}>
                  Close
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {members.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No members in this team</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {members.map((member) => (
                    <div
                      key={member.id}
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
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
