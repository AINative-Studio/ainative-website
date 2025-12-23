'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import {
  Mail,
  Plus,
  Edit2,
  Trash2,
  Send,
  Settings,
  History,
  BarChart2,
  Loader2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Clock,
  TrendingUp,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import {
  emailService,
  EmailTemplate,
  SendEmailData,
  UpdateSettingsData,
  EmailHistoryItem,
} from '@/lib/email-service';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const stagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

export default function EmailManagementClient() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('templates');
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [isSendDialogOpen, setIsSendDialogOpen] = useState(false);

  // Template form state
  const [templateForm, setTemplateForm] = useState({
    name: '',
    subject: '',
    body: '',
  });

  // Send email form state
  const [sendForm, setSendForm] = useState({
    to: '',
    subject: '',
    body: '',
  });

  // Settings form state
  const [settingsForm, setSettingsForm] = useState({
    smtpHost: '',
    smtpPort: 587,
    smtpUser: '',
    smtpPassword: '',
    smtpSecure: true,
    fromEmail: '',
    fromName: '',
  });

  // Fetch templates
  const {
    data: templatesData,
    isLoading: templatesLoading,
    error: templatesError,
  } = useQuery({
    queryKey: ['email-templates'],
    queryFn: () => emailService.getTemplates(),
  });

  // Fetch settings
  const {
    data: settings,
    isLoading: settingsLoading,
    error: settingsError,
  } = useQuery({
    queryKey: ['email-settings'],
    queryFn: () => emailService.getSettings(),
  });

  // Update form when settings are loaded
  useEffect(() => {
    if (settings) {
      setSettingsForm({
        smtpHost: settings.smtpHost,
        smtpPort: settings.smtpPort,
        smtpUser: settings.smtpUser,
        smtpPassword: '',
        smtpSecure: settings.smtpSecure,
        fromEmail: settings.fromEmail,
        fromName: settings.fromName,
      });
    }
  }, [settings]);

  // Fetch history
  const {
    data: historyData,
    isLoading: historyLoading,
  } = useQuery({
    queryKey: ['email-history'],
    queryFn: () => emailService.getHistory({ page: 1, pageSize: 50 }),
  });

  // Fetch analytics
  const {
    data: analytics,
    isLoading: analyticsLoading,
  } = useQuery({
    queryKey: ['email-analytics'],
    queryFn: () => emailService.getAnalytics(),
  });

  // Create template mutation
  const createTemplateMutation = useMutation({
    mutationFn: (data: typeof templateForm) => emailService.createTemplate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-templates'] });
      setIsTemplateDialogOpen(false);
      resetTemplateForm();
    },
  });

  // Update template mutation
  const updateTemplateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: typeof templateForm }) =>
      emailService.updateTemplate(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-templates'] });
      setIsTemplateDialogOpen(false);
      resetTemplateForm();
      setSelectedTemplate(null);
    },
  });

  // Delete template mutation
  const deleteTemplateMutation = useMutation({
    mutationFn: (id: number) => emailService.deleteTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-templates'] });
    },
  });

  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: (data: UpdateSettingsData) => emailService.updateSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-settings'] });
    },
  });

  // Send email mutation
  const sendEmailMutation = useMutation({
    mutationFn: (data: SendEmailData) => emailService.sendEmail(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-history'] });
      queryClient.invalidateQueries({ queryKey: ['email-analytics'] });
      setIsSendDialogOpen(false);
      resetSendForm();
    },
  });

  const resetTemplateForm = () => {
    setTemplateForm({ name: '', subject: '', body: '' });
  };

  const resetSendForm = () => {
    setSendForm({ to: '', subject: '', body: '' });
  };

  const handleCreateTemplate = () => {
    setSelectedTemplate(null);
    resetTemplateForm();
    setIsTemplateDialogOpen(true);
  };

  const handleEditTemplate = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setTemplateForm({
      name: template.name,
      subject: template.subject,
      body: template.body,
    });
    setIsTemplateDialogOpen(true);
  };

  const handleDeleteTemplate = (id: number) => {
    if (confirm('Are you sure you want to delete this template?')) {
      deleteTemplateMutation.mutate(id);
    }
  };

  const handleSaveTemplate = () => {
    if (selectedTemplate) {
      updateTemplateMutation.mutate({ id: selectedTemplate.id, data: templateForm });
    } else {
      createTemplateMutation.mutate(templateForm);
    }
  };

  const handleSendEmail = () => {
    sendEmailMutation.mutate(sendForm);
  };

  const handleUpdateSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettingsMutation.mutate(settingsForm);
  };

  const getStatusIcon = (status: EmailHistoryItem['status']) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'sent':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'bounced':
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      default:
        return <Mail className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={stagger}
      className="min-h-screen p-4 md:p-8 space-y-8"
    >
      {/* Header */}
      <motion.div variants={fadeUp} className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
            Email System Management
          </h1>
          <p className="text-gray-400 mt-2">Manage templates, settings, and monitor email activity</p>
        </div>
        <Button onClick={() => setIsSendDialogOpen(true)} className="gap-2">
          <Send className="h-4 w-4" />
          Send Test Email
        </Button>
      </motion.div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-gray-900/50">
          <TabsTrigger value="templates" className="gap-2">
            <Mail className="h-4 w-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <History className="h-4 w-4" />
            History
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2">
            <BarChart2 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Templates Tab */}
        <TabsContent value="templates">
          <motion.div variants={stagger} className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Email Templates</h2>
              <Button onClick={handleCreateTemplate} className="gap-2">
                <Plus className="h-4 w-4" />
                Create Template
              </Button>
            </div>

            {templatesLoading ? (
              <Card className="border-gray-800">
                <CardContent className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                </CardContent>
              </Card>
            ) : templatesError ? (
              <Card className="border-red-800/50 bg-red-950/20">
                <CardContent className="py-8 text-center text-red-400">
                  Failed to load templates. Please try again.
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {templatesData?.templates.map((template) => (
                  <motion.div key={template.id} variants={fadeUp}>
                    <Card className="border-gray-800 hover:border-blue-500/50 transition-all">
                      <CardHeader>
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        <p className="text-sm text-gray-400 line-clamp-1">{template.subject}</p>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <p className="text-sm text-gray-500 line-clamp-2">{template.body}</p>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditTemplate(template)}
                              className="flex-1 gap-2"
                            >
                              <Edit2 className="h-3 w-3" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedTemplate(template);
                                setIsPreviewDialogOpen(true);
                              }}
                              className="flex-1 gap-2"
                            >
                              <Eye className="h-3 w-3" />
                              Preview
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteTemplate(template.id)}
                              disabled={deleteTemplateMutation.isPending}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <motion.div variants={fadeUp}>
            <Card className="border-gray-800 max-w-3xl mx-auto">
              <CardHeader>
                <CardTitle className="text-2xl">Email Settings</CardTitle>
                <p className="text-gray-400">Configure SMTP and sender information</p>
              </CardHeader>
              <CardContent>
                {settingsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                  </div>
                ) : (
                  <form onSubmit={handleUpdateSettings} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="smtpHost">SMTP Host</Label>
                        <input
                          id="smtpHost"
                          type="text"
                          value={settingsForm.smtpHost}
                          onChange={(e) =>
                            setSettingsForm({ ...settingsForm, smtpHost: e.target.value })
                          }
                          className="w-full px-3 py-2 bg-gray-900 border border-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="smtp.gmail.com"
                          readOnly
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="smtpPort">SMTP Port</Label>
                        <input
                          id="smtpPort"
                          type="number"
                          value={settingsForm.smtpPort}
                          onChange={(e) =>
                            setSettingsForm({ ...settingsForm, smtpPort: parseInt(e.target.value) })
                          }
                          className="w-full px-3 py-2 bg-gray-900 border border-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          readOnly
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="smtpUser">SMTP Username</Label>
                      <input
                        id="smtpUser"
                        type="text"
                        value={settingsForm.smtpUser}
                        onChange={(e) =>
                          setSettingsForm({ ...settingsForm, smtpUser: e.target.value })
                        }
                        className="w-full px-3 py-2 bg-gray-900 border border-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        readOnly
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="fromEmail">From Email</Label>
                        <input
                          id="fromEmail"
                          type="email"
                          value={settingsForm.fromEmail}
                          onChange={(e) =>
                            setSettingsForm({ ...settingsForm, fromEmail: e.target.value })
                          }
                          className="w-full px-3 py-2 bg-gray-900 border border-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          readOnly
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="fromName">From Name</Label>
                        <input
                          id="fromName"
                          type="text"
                          value={settingsForm.fromName}
                          onChange={(e) =>
                            setSettingsForm({ ...settingsForm, fromName: e.target.value })
                          }
                          className="w-full px-3 py-2 bg-gray-900 border border-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          readOnly
                        />
                      </div>
                    </div>
                    <div className="text-sm text-gray-400 bg-blue-950/20 border border-blue-900/50 rounded-md p-4">
                      <p className="font-semibold mb-2">Note:</p>
                      <p>Email settings are currently read-only and managed by system administrators for security.</p>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history">
          <motion.div variants={fadeUp}>
            <Card className="border-gray-800">
              <CardHeader>
                <CardTitle className="text-2xl">Email History</CardTitle>
                <p className="text-gray-400">Recent email activity and delivery status</p>
              </CardHeader>
              <CardContent>
                {historyLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                  </div>
                ) : (
                  <div className="space-y-2">
                    {historyData?.emails.map((email) => (
                      <div
                        key={email.id}
                        className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg border border-gray-800 hover:border-gray-700 transition-all"
                      >
                        <div className="flex items-center gap-4 flex-1">
                          {getStatusIcon(email.status)}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{email.subject}</p>
                            <p className="text-sm text-gray-400 truncate">To: {email.to}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          <span className="capitalize">{email.status}</span>
                          <span>{new Date(email.sentAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <motion.div variants={stagger} className="space-y-6">
            {analyticsLoading ? (
              <Card className="border-gray-800">
                <CardContent className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <motion.div variants={fadeUp}>
                    <Card className="border-gray-800">
                      <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-400">Total Sent</CardTitle>
                        <Send className="h-4 w-4 text-blue-500" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{analytics?.totalSent.toLocaleString()}</div>
                      </CardContent>
                    </Card>
                  </motion.div>
                  <motion.div variants={fadeUp}>
                    <Card className="border-gray-800">
                      <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-400">Delivered</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {analytics?.totalDelivered.toLocaleString()}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{analytics?.deliveryRate}% rate</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                  <motion.div variants={fadeUp}>
                    <Card className="border-gray-800">
                      <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-400">Opened</CardTitle>
                        <Eye className="h-4 w-4 text-purple-500" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{analytics?.totalOpened.toLocaleString()}</div>
                        <p className="text-xs text-gray-500 mt-1">{analytics?.openRate}% rate</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                  <motion.div variants={fadeUp}>
                    <Card className="border-gray-800">
                      <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-400">Failed</CardTitle>
                        <XCircle className="h-4 w-4 text-red-500" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{analytics?.totalFailed.toLocaleString()}</div>
                        <p className="text-xs text-gray-500 mt-1">{analytics?.failureRate}% rate</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>

                {/* Activity Chart */}
                <motion.div variants={fadeUp}>
                  <Card className="border-gray-800">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-blue-500" />
                        Email Activity
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={analytics?.recentActivity}>
                          <defs>
                            <linearGradient id="colorSent" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorDelivered" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                          <XAxis dataKey="date" stroke="#9ca3af" />
                          <YAxis stroke="#9ca3af" />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#1f2937',
                              border: '1px solid #374151',
                              borderRadius: '8px',
                            }}
                          />
                          <Area
                            type="monotone"
                            dataKey="sent"
                            stroke="#3b82f6"
                            fillOpacity={1}
                            fill="url(#colorSent)"
                          />
                          <Area
                            type="monotone"
                            dataKey="delivered"
                            stroke="#10b981"
                            fillOpacity={1}
                            fill="url(#colorDelivered)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </motion.div>
              </>
            )}
          </motion.div>
        </TabsContent>
      </Tabs>

      {/* Template Dialog */}
      <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
        <DialogContent className="bg-gray-900 border-gray-800">
          <DialogHeader>
            <DialogTitle>
              {selectedTemplate ? 'Edit Template' : 'Create Template'}
            </DialogTitle>
            <DialogDescription>
              {selectedTemplate ? 'Update template details' : 'Create a new email template'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="template-name">Template Name</Label>
              <input
                id="template-name"
                type="text"
                value={templateForm.name}
                onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Welcome Email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="template-subject">Subject</Label>
              <input
                id="template-subject"
                type="text"
                value={templateForm.subject}
                onChange={(e) => setTemplateForm({ ...templateForm, subject: e.target.value })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Welcome to AINative Studio"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="template-body">Body</Label>
              <textarea
                id="template-body"
                value={templateForm.body}
                onChange={(e) => setTemplateForm({ ...templateForm, body: e.target.value })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[200px]"
                placeholder="Hello {{name}}, welcome to our platform!"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsTemplateDialogOpen(false);
                resetTemplateForm();
                setSelectedTemplate(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveTemplate}
              disabled={
                createTemplateMutation.isPending || updateTemplateMutation.isPending
              }
            >
              {createTemplateMutation.isPending || updateTemplateMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
        <DialogContent className="bg-gray-900 border-gray-800 max-w-2xl">
          <DialogHeader>
            <DialogTitle>Template Preview</DialogTitle>
          </DialogHeader>
          {selectedTemplate && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-400 mb-2">Subject:</p>
                <p className="font-medium">{selectedTemplate.subject}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-2">Body:</p>
                <div className="bg-gray-800 p-4 rounded-md whitespace-pre-wrap">
                  {selectedTemplate.body}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Send Email Dialog */}
      <Dialog open={isSendDialogOpen} onOpenChange={setIsSendDialogOpen}>
        <DialogContent className="bg-gray-900 border-gray-800">
          <DialogHeader>
            <DialogTitle>Send Test Email</DialogTitle>
            <DialogDescription>Send a test email to verify your configuration</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="send-to">To</Label>
              <input
                id="send-to"
                type="email"
                value={sendForm.to}
                onChange={(e) => setSendForm({ ...sendForm, to: e.target.value })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="user@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="send-subject">Subject</Label>
              <input
                id="send-subject"
                type="text"
                value={sendForm.subject}
                onChange={(e) => setSendForm({ ...sendForm, subject: e.target.value })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Test Email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="send-body">Body</Label>
              <textarea
                id="send-body"
                value={sendForm.body}
                onChange={(e) => setSendForm({ ...sendForm, body: e.target.value })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[150px]"
                placeholder="This is a test email..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSendDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSendEmail}
              disabled={sendEmailMutation.isPending}
              className="gap-2"
            >
              {sendEmailMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Send
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
