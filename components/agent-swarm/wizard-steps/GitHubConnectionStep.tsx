'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Github,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Eye,
  EyeOff,
  Loader2,
  Shield,
  User,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  gitHubOnboardingService,
  type GitHubConnectionStatus,
  type GitHubPATValidation,
} from '@/lib/agent-swarm-wizard-service';

interface GitHubConnectionStepProps {
  onComplete: (status: GitHubConnectionStatus) => void;
  initialStatus?: GitHubConnectionStatus;
}

export default function GitHubConnectionStep({
  onComplete,
  initialStatus,
}: GitHubConnectionStepProps) {
  const [connectionStatus, setConnectionStatus] = useState<GitHubConnectionStatus | null>(
    initialStatus || null
  );
  const [patToken, setPatToken] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isStoring, setIsStoring] = useState(false);
  const [validationResult, setValidationResult] = useState<GitHubPATValidation | null>(null);
  const [error, setError] = useState<string | null>(null);

  const requiredScopes = ['repo', 'workflow'];

  useEffect(() => {
    if (!initialStatus) {
      checkConnectionStatus();
    }
  }, [initialStatus]);

  const checkConnectionStatus = async () => {
    try {
      const data = await gitHubOnboardingService.checkConnectionStatus();
      setConnectionStatus(data);
    } catch (err) {
      console.error('Failed to check connection status:', err);
    }
  };

  const validatePAT = async () => {
    if (!patToken.trim()) {
      setError('Please enter a GitHub Personal Access Token');
      return;
    }

    setIsValidating(true);
    setError(null);
    setValidationResult(null);

    try {
      const data = await gitHubOnboardingService.validatePAT(patToken, requiredScopes);

      if (data.is_valid) {
        setValidationResult(data);
      } else {
        setError(data.error_message || 'Invalid token. Please check and try again.');
      }
    } catch (err) {
      setError('Failed to validate token. Please try again.');
      console.error('Validation error:', err);
    } finally {
      setIsValidating(false);
    }
  };

  const storePAT = async () => {
    if (!validationResult?.is_valid) return;

    setIsStoring(true);
    setError(null);

    try {
      const data = await gitHubOnboardingService.storePAT(patToken, {
        enableRepoAccess: true,
        autoSyncRepos: false,
        syncPrivateRepos: false,
      });

      const newStatus: GitHubConnectionStatus = {
        connected: true,
        github_username: validationResult.github_username!,
        github_user_id: validationResult.github_user_id!,
        avatar_url: validationResult.avatar_url!,
        scopes: validationResult.scopes!,
        has_required_scopes: true,
        missing_scopes: [],
        last_validated: data.stored_at,
        organizations: validationResult.organizations || [],
      };
      setConnectionStatus(newStatus);
      onComplete(newStatus);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to store token. Please try again.';
      setError(errorMessage);
      console.error('Store error:', err);
    } finally {
      setIsStoring(false);
    }
  };

  const handleProceed = () => {
    if (connectionStatus?.connected && connectionStatus?.has_required_scopes) {
      onComplete(connectionStatus);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-3xl mx-auto"
    >
      <Card className="bg-[#161B22] border-[#2D333B]">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#4B6FED]/10">
              <Github className="h-6 w-6 text-[#8AB4FF]" />
            </div>
            <div>
              <CardTitle className="text-2xl text-white">Connect GitHub Account</CardTitle>
              <CardDescription className="text-gray-400 mt-1">
                Connect your GitHub account to allow Agent Swarm to create and manage repositories
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {connectionStatus?.connected ? (
            // Already Connected State
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Alert className="bg-green-500/10 border-green-500/30 text-white">
                <CheckCircle2 className="h-5 w-5 text-green-400" />
                <AlertTitle className="text-green-400 font-semibold">Connected Successfully</AlertTitle>
                <AlertDescription className="text-gray-300 mt-2">
                  Your GitHub account is connected and ready to use
                </AlertDescription>
              </Alert>

              <div className="mt-6 p-6 rounded-lg bg-[#0D1117] border border-[#2D333B]">
                <div className="flex items-center gap-4">
                  <img
                    src={connectionStatus.avatar_url}
                    alt={connectionStatus.github_username}
                    className="w-16 h-16 rounded-full border-2 border-[#4B6FED]"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="text-white font-semibold text-lg">
                        {connectionStatus.github_username}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {connectionStatus.scopes.map((scope) => (
                        <Badge
                          key={scope}
                          className="bg-[#4B6FED]/20 text-[#8AB4FF] border-[#4B6FED]/30"
                        >
                          <Shield className="h-3 w-3 mr-1" />
                          {scope}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  {connectionStatus.has_required_scopes && (
                    <CheckCircle2 className="h-8 w-8 text-green-400 flex-shrink-0" />
                  )}
                </div>

                {!connectionStatus.has_required_scopes && (
                  <Alert className="mt-4 bg-yellow-500/10 border-yellow-500/30">
                    <AlertCircle className="h-5 w-5 text-yellow-400" />
                    <AlertTitle className="text-yellow-400">Missing Required Scopes</AlertTitle>
                    <AlertDescription className="text-gray-300">
                      Your token is missing: {connectionStatus.missing_scopes.join(', ')}
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              {connectionStatus.has_required_scopes && (
                <Button
                  onClick={handleProceed}
                  className="w-full mt-6 bg-gradient-to-r from-[#4B6FED] to-[#8A63F4] hover:from-[#3A56D3] hover:to-[#7A4FEB]"
                  size="lg"
                >
                  Continue to Next Step
                  <CheckCircle2 className="ml-2 h-5 w-5" />
                </Button>
              )}
            </motion.div>
          ) : (
            // Not Connected State
            <div className="space-y-6">
              {/* Instructions */}
              <div className="p-4 rounded-lg bg-[#4B6FED]/5 border border-[#4B6FED]/20">
                <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                  <Shield className="h-4 w-4 text-[#8AB4FF]" />
                  Required Permissions
                </h4>
                <p className="text-gray-400 text-sm mb-3">
                  Your Personal Access Token must include the following scopes:
                </p>
                <div className="flex flex-wrap gap-2">
                  {requiredScopes.map((scope) => (
                    <Badge key={scope} className="bg-[#4B6FED]/20 text-[#8AB4FF] border-[#4B6FED]/30">
                      {scope}
                    </Badge>
                  ))}
                </div>
                <a
                  href="https://github.com/settings/tokens/new"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-4 text-[#8AB4FF] hover:text-[#4B6FED] text-sm transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                  Create a new token on GitHub
                </a>
              </div>

              {/* Token Input */}
              <div className="space-y-3">
                <label htmlFor="pat-token" className="text-white font-medium block">
                  GitHub Personal Access Token
                </label>
                <div className="relative">
                  <Input
                    id="pat-token"
                    type={showToken ? 'text' : 'password'}
                    value={patToken}
                    onChange={(e) => setPatToken(e.target.value)}
                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    className="bg-[#0D1117] border-[#2D333B] text-white pr-12 font-mono text-sm"
                    disabled={isValidating || isStoring}
                  />
                  <button
                    type="button"
                    onClick={() => setShowToken(!showToken)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-gray-500 text-xs">
                  Token must start with: ghp_, gho_, ghu_, ghs_, or ghr_
                </p>
              </div>

              {/* Error Display */}
              {error && (
                <Alert className="bg-red-500/10 border-red-500/30">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                  <AlertTitle className="text-red-400">Validation Failed</AlertTitle>
                  <AlertDescription className="text-gray-300">{error}</AlertDescription>
                </Alert>
              )}

              {/* Validation Result */}
              {validationResult?.is_valid && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ duration: 0.3 }}
                >
                  <Alert className="bg-green-500/10 border-green-500/30">
                    <CheckCircle2 className="h-5 w-5 text-green-400" />
                    <AlertTitle className="text-green-400">Valid Token</AlertTitle>
                    <AlertDescription className="text-gray-300 space-y-2">
                      <div className="flex items-center gap-2 mt-2">
                        <span className="font-semibold">Username:</span>
                        {validationResult.github_username}
                      </div>
                      <div>
                        <span className="font-semibold">Scopes:</span>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {validationResult.scopes?.map((scope) => (
                            <Badge key={scope} className="bg-green-500/20 text-green-300 border-green-500/30">
                              {scope}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      {validationResult.missing_scopes && validationResult.missing_scopes.length > 0 && (
                        <div className="mt-2 p-2 bg-yellow-500/10 rounded border border-yellow-500/30">
                          <span className="text-yellow-400 font-semibold">Missing scopes:</span>
                          <span className="text-yellow-300 ml-2">
                            {validationResult.missing_scopes.join(', ')}
                          </span>
                        </div>
                      )}
                    </AlertDescription>
                  </Alert>
                </motion.div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                {!validationResult?.is_valid ? (
                  <Button
                    onClick={validatePAT}
                    disabled={isValidating || !patToken.trim()}
                    className="flex-1 bg-[#4B6FED] hover:bg-[#3A56D3]"
                    size="lg"
                  >
                    {isValidating ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Validating...
                      </>
                    ) : (
                      <>
                        <Shield className="mr-2 h-5 w-5" />
                        Validate Token
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    onClick={storePAT}
                    disabled={isStoring}
                    className="flex-1 bg-gradient-to-r from-[#4B6FED] to-[#8A63F4] hover:from-[#3A56D3] hover:to-[#7A4FEB]"
                    size="lg"
                  >
                    {isStoring ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Storing...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="mr-2 h-5 w-5" />
                        Store and Continue
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
