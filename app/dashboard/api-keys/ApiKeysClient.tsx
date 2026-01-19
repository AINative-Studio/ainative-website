'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Copy, Key, RefreshCw, CheckCircle2, X } from 'lucide-react';
import { apiKeyService, type ApiKey } from '@/services/apiKeyService';

// Simple dialog component
const Dialog = ({
  open,
  onClose,
  children
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) => {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={() => onClose()}
    >
      <div
        className="bg-[#161B22] border border-[#1E262F] rounded-lg p-6 w-full max-w-md"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={() => onClose()}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>
        {children}
      </div>
    </div>
  );
};

const DialogHeader = ({ children }: { children: React.ReactNode }) => (
  <div className="mb-4">
    {children}
  </div>
);

const DialogTitle = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-lg font-semibold text-white">
    {children}
  </h3>
);

const DialogDescription = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <p className={`text-sm text-gray-400 ${className}`}>
    {children}
  </p>
);

const DialogFooter = ({ children }: { children: React.ReactNode }) => (
  <div className="mt-6 flex justify-end space-x-2">
    {children}
  </div>
);

const ApiKeysClient: React.FC = () => {
  // State for managing API keys
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [isLoadingKeys, setIsLoadingKeys] = useState(true);

  const [newKeyName, setNewKeyName] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newKeyGenerated, setNewKeyGenerated] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showRegenerateConfirm, setShowRegenerateConfirm] = useState<string | null>(null);
  const [isCreatingKey, setIsCreatingKey] = useState(false);
  const [isRegeneratingKey, setIsRegeneratingKey] = useState<string | null>(null);
  const [isDeletingKey, setIsDeletingKey] = useState<string | null>(null);

  // Copy key to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  // Fetch API keys from server
  const fetchApiKeys = async () => {
    setIsLoadingKeys(true);
    try {
      const keys = await apiKeyService.listApiKeys();
      setApiKeys(keys);
    } catch (error) {
      console.error('Error fetching API keys:', error);
      // Fallback to empty array on error
      setApiKeys([]);
    } finally {
      setIsLoadingKeys(false);
    }
  };

  // Create new API key
  const handleCreateKey = async () => {
    if (!newKeyName.trim()) {
      alert('Please enter a name for the API key');
      return;
    }

    setIsCreatingKey(true);
    try {
      const result = await apiKeyService.createApiKey(newKeyName.trim());
      setNewKeyGenerated(result.key);

      // Refresh the keys list
      await fetchApiKeys();
      setNewKeyName('');
    } catch (error) {
      console.error('Error creating API key:', error);
      alert('Failed to create API key. Please try again.');
    } finally {
      setIsCreatingKey(false);
    }
  };

  // Regenerate an API key
  const regenerateKey = async (id: string) => {
    setIsRegeneratingKey(id);
    try {
      const result = await apiKeyService.regenerateApiKey(id);
      setNewKeyGenerated(result.key);

      // Refresh the keys list
      await fetchApiKeys();
      setShowRegenerateConfirm(null);
    } catch (error) {
      console.error('Error regenerating API key:', error);
      alert('Failed to regenerate API key. Please try again.');
    } finally {
      setIsRegeneratingKey(null);
    }
  };

  // Delete an API key
  const deleteKey = async (id: string) => {
    setIsDeletingKey(id);
    try {
      await apiKeyService.deleteApiKey(id);

      // Refresh the keys list
      await fetchApiKeys();
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting API key:', error);
      alert('Failed to delete API key. Please try again.');
    } finally {
      setIsDeletingKey(null);
    }
  };

  // Load API keys on component mount
  useEffect(() => {
    fetchApiKeys();
  }, []);


  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">API Keys</h1>
          <p className="text-gray-400">Manage authentication credentials for AINative services</p>
        </div>
        <div>
          <Button
            className="mt-4 md:mt-0"
            onClick={() => setIsCreateDialogOpen(true)}
          >
            Create New API Key
          </Button>

          <Dialog
            open={isCreateDialogOpen}
            onClose={() => setIsCreateDialogOpen(false)}
          >
            <DialogHeader>
              <DialogTitle>Create API Key</DialogTitle>
              <DialogDescription className="text-gray-400">
                Generate a new API key for accessing AINative services.
              </DialogDescription>
            </DialogHeader>
            {!newKeyGenerated ? (
              <>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">API Key Name</Label>
                    <Input
                      id="name"
                      placeholder="e.g. Production API Key"
                      value={newKeyName}
                      onChange={(e) => setNewKeyName(e.target.value)}
                      className="bg-vite-bg border-[#1E262F] text-white"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" onClick={handleCreateKey} disabled={isCreatingKey}>
                    {isCreatingKey ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Creating...
                      </>
                    ) : (
                      'Generate Key'
                    )}
                  </Button>
                </DialogFooter>
              </>
            ) : (
              <div className="py-4">
                <Alert className="bg-yellow-900/20 border-yellow-800 mb-4">
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                  <AlertDescription className="text-yellow-500">
                    Copy this key now. You won&apos;t be able to see it again!
                  </AlertDescription>
                </Alert>
                <div className="flex items-center gap-2 mb-4">
                  <code className="bg-vite-bg px-3 py-2 rounded text-primary flex-1 break-all">
                    {newKeyGenerated}
                  </code>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => copyToClipboard(newKeyGenerated)}
                    className="min-w-10"
                  >
                    {copySuccess ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <Button
                  className="w-full"
                  onClick={() => {
                    setNewKeyGenerated(null);
                    setIsCreateDialogOpen(false);
                  }}
                >
                  Done
                </Button>
              </div>
            )}
          </Dialog>

        </div>
      </div>

      <Card className="bg-[#161B22] border-[#1E262F]">
        <CardHeader>
          <CardTitle className="text-white">Your API Keys</CardTitle>
          <CardDescription>
            These keys allow access to AINative services including ZeroDB and QNN.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {apiKeys.map((apiKey) => (
              <div
                key={apiKey.id}
                className={`p-4 border rounded-md ${
                  apiKey.status === 'active'
                    ? 'border-[#1E262F] bg-vite-bg'
                    : 'border-gray-700 bg-gray-900/50'
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <Key className="h-4 w-4 text-primary" />
                    <span className="font-medium text-white">{apiKey.name}</span>
                  </div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded ${
                      apiKey.status === 'active'
                        ? 'bg-green-900/30 text-green-500'
                        : 'bg-gray-800 text-gray-400'
                    }`}
                  >
                    {apiKey.status === 'active' ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <code className="bg-[#131921] px-3 py-1 rounded text-gray-400 flex-1 font-mono">
                    {apiKey.key.substring(0, 8)}••••••••••••{apiKey.key.substring(apiKey.key.length - 4)}
                  </code>
                  <div className="flex gap-1">
                    {showRegenerateConfirm === apiKey.id ? (
                      <>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="h-8"
                          onClick={() => regenerateKey(apiKey.id)}
                          disabled={isRegeneratingKey === apiKey.id}
                        >
                          {isRegeneratingKey === apiKey.id ? (
                            <>
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                              Regenerating...
                            </>
                          ) : (
                            'Confirm'
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8"
                          onClick={() => setShowRegenerateConfirm(null)}
                        >
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex items-center gap-1 h-8"
                        onClick={() => setShowRegenerateConfirm(apiKey.id)}
                      >
                        <RefreshCw className="h-3.5 w-3.5" /> Regenerate
                      </Button>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>Created on {apiKey.created}</span>
                  <span>Last used: {apiKey.lastUsed}</span>

                  {showDeleteConfirm === apiKey.id ? (
                    <div className="flex gap-1 ml-auto">
                      <Button
                        size="sm"
                        variant="destructive"
                        className="h-7 text-xs"
                        onClick={() => deleteKey(apiKey.id)}
                        disabled={isDeletingKey === apiKey.id}
                      >
                        {isDeletingKey === apiKey.id ? (
                          <>
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                            Deleting...
                          </>
                        ) : (
                          'Confirm Delete'
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs"
                        onClick={() => setShowDeleteConfirm(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 text-xs text-gray-400 hover:text-red-500 p-0 ml-2"
                      onClick={() => setShowDeleteConfirm(apiKey.id)}
                    >
                      Delete
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {isLoadingKeys ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-400">Loading API keys...</p>
            </div>
          ) : apiKeys.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400">No API keys found.</p>
              <Button className="mt-4" onClick={() => setIsCreateDialogOpen(true)}>
                Create your first API key
              </Button>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <div className="mt-8 p-6 bg-[#161B22] border border-[#1E262F] rounded-lg">
        <h3 className="text-lg font-medium text-white mb-4">API Key Security</h3>
        <ul className="space-y-2 text-gray-400">
          <li className="flex items-start gap-2">
            <div className="mt-1 min-w-4">
              <CheckCircle2 className="h-4 w-4 text-primary" />
            </div>
            <p>Never share your API keys in publicly accessible areas such as GitHub or client-side code.</p>
          </li>
          <li className="flex items-start gap-2">
            <div className="mt-1 min-w-4">
              <CheckCircle2 className="h-4 w-4 text-primary" />
            </div>
            <p>Store API keys in environment variables or secret management systems.</p>
          </li>
          <li className="flex items-start gap-2">
            <div className="mt-1 min-w-4">
              <CheckCircle2 className="h-4 w-4 text-primary" />
            </div>
            <p>Regenerate your API keys periodically to maintain security.</p>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default ApiKeysClient;
