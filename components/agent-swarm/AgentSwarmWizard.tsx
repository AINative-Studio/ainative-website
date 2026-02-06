'use client';

/**
 * Agent Swarm Setup Wizard
 * Beautiful, user-friendly multi-step wizard for non-technical users
 * Guides users through: GitHub → ZeroDB → PRD → Data Model → Backlog → Sprint Plan → Launch
 */

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Github,
  Database,
  FileText,
  Table,
  ListTodo,
  Calendar,
  Rocket,
  Check,
  ChevronLeft,
  Loader2,
  AlertCircle,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

// Import real step components
import {
  GitHubConnectionStep,
  ZeroDBSetupStep,
  PRDUploadStep,
  DataModelReviewStep,
  BacklogReviewStep,
  SprintPlanReviewStep,
  LaunchMonitorStep,
} from './wizard-steps';

// Import service layer types
import {
  agentSwarmAIService,
  type GitHubConnectionStatus,
  type ZeroDBProject,
  type DataModel,
  type Backlog,
  type SprintPlan,
} from '@/lib/agent-swarm-wizard-service';

// Step Configuration
const WIZARD_STEPS = [
  {
    id: 0,
    title: 'Connect GitHub',
    description: 'Connect your GitHub account to deploy your app',
    icon: Github,
    color: 'text-[#F4B400]',
  },
  {
    id: 1,
    title: 'Setup ZeroDB',
    description: 'Configure your database for the application',
    icon: Database,
    color: 'text-[#4B6FED]',
  },
  {
    id: 2,
    title: 'Upload PRD',
    description: 'Upload your Product Requirements Document',
    icon: FileText,
    color: 'text-[#8A63F4]',
  },
  {
    id: 3,
    title: 'Data Model',
    description: 'Review and approve the AI-generated data model',
    icon: Table,
    color: 'text-[#34A853]',
  },
  {
    id: 4,
    title: 'Backlog',
    description: 'Review the AI-generated project backlog',
    icon: ListTodo,
    color: 'text-[#EA4335]',
  },
  {
    id: 5,
    title: 'Sprint Plan',
    description: 'Review the AI-generated sprint plan',
    icon: Calendar,
    color: 'text-[#FCAE39]',
  },
  {
    id: 6,
    title: 'Launch & Monitor',
    description: 'Launch agents and monitor progress in real-time',
    icon: Rocket,
    color: 'text-[#F4B400]',
  },
];

// TypeScript Interfaces for Wizard State
interface WizardState {
  currentStep: number;
  githubData: GitHubConnectionStatus | null;
  zerodbData: {
    apiKey: string;
    project: ZeroDBProject;
  } | null;
  prdContent: string;
  projectId: string | null;
  dataModel: DataModel | null;
  backlog: Backlog | null;
  sprintPlan: SprintPlan | null;
  completionResult: {
    repoUrl: string;
    deploymentUrl?: string;
  } | null;
}

// Main Wizard Component
export default function AgentSwarmWizard() {
  const [wizardState, setWizardState] = useState<WizardState>({
    currentStep: 0,
    githubData: null,
    zerodbData: null,
    prdContent: '',
    projectId: null,
    dataModel: null,
    backlog: null,
    sprintPlan: null,
    completionResult: null,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate progress percentage
  const progressPercentage = ((wizardState.currentStep + 1) / WIZARD_STEPS.length) * 100;

  // Handle Previous Step
  const handleBack = useCallback(() => {
    setError(null);
    setWizardState((prev) => ({
      ...prev,
      currentStep: Math.max(0, prev.currentStep - 1),
    }));
  }, []);

  // Step 0: GitHub Connection Complete
  const handleGitHubComplete = useCallback((status: GitHubConnectionStatus) => {
    setError(null);
    setWizardState((prev) => ({
      ...prev,
      githubData: status,
      currentStep: 1,
    }));
  }, []);

  // Step 1: ZeroDB Setup Complete
  const handleZeroDBComplete = useCallback((data: { apiKey: string; project: ZeroDBProject }) => {
    setError(null);
    setWizardState((prev) => ({
      ...prev,
      zerodbData: data,
      currentStep: 2,
    }));
  }, []);

  // Step 2: PRD Upload Complete - Create Agent Swarm Project
  const handlePRDComplete = useCallback(async (prdContent: string) => {
    setError(null);
    setIsLoading(true);

    try {
      // Create the Agent Swarm project via orchestrate endpoint
      const project = await agentSwarmAIService.createProject({
        project_type: 'web_app',
        description: prdContent,
        features: [],
        technologies: ['React', 'FastAPI', 'ZeroDB'],
      });

      setWizardState((prev) => ({
        ...prev,
        prdContent,
        projectId: project.project_id,
        currentStep: 3,
      }));
    } catch (err) {
      console.error('Failed to create project:', err);
      setError('Failed to create Agent Swarm project. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Step 3: Data Model Complete
  const handleDataModelComplete = useCallback((dataModel: DataModel) => {
    setError(null);
    setWizardState((prev) => ({
      ...prev,
      dataModel,
      currentStep: 4,
    }));
  }, []);

  // Step 4: Backlog Complete
  const handleBacklogComplete = useCallback((backlog: Backlog) => {
    setError(null);
    setWizardState((prev) => ({
      ...prev,
      backlog,
      currentStep: 5,
    }));
  }, []);

  // Step 5: Sprint Plan Complete
  const handleSprintPlanComplete = useCallback((sprintPlan: SprintPlan) => {
    setError(null);
    setWizardState((prev) => ({
      ...prev,
      sprintPlan,
      currentStep: 6,
    }));
  }, []);

  // Step 6: Launch Complete
  const handleLaunchComplete = useCallback((result: { repoUrl: string; deploymentUrl?: string }) => {
    setError(null);
    setWizardState((prev) => ({
      ...prev,
      completionResult: result,
      currentStep: 7, // Final state
    }));
  }, []);

  // Reset wizard to start over
  const handleReset = useCallback(() => {
    setWizardState({
      currentStep: 0,
      githubData: null,
      zerodbData: null,
      prdContent: '',
      projectId: null,
      dataModel: null,
      backlog: null,
      sprintPlan: null,
      completionResult: null,
    });
    setError(null);
  }, []);

  // Get current step component
  const getCurrentStepComponent = () => {
    // Show completion screen
    if (wizardState.currentStep === 7 && wizardState.completionResult) {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-12"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
          >
            <Sparkles className="w-24 h-24 mx-auto mb-6 text-[#F4B400]" />
          </motion.div>
          <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-[#F4B400] to-[#FCAE39] bg-clip-text text-transparent">
            Your Application is Ready!
          </h2>
          <p className="text-gray-400 mb-8 text-lg">
            Agent Swarm has successfully built your application
          </p>

          <div className="flex flex-col gap-4 max-w-md mx-auto">
            <a
              href={wizardState.completionResult.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 p-4 bg-[#0D1117] border border-gray-700 rounded-lg hover:border-[#4B6FED] transition-colors"
            >
              <Github className="w-5 h-5" />
              <span>View GitHub Repository</span>
              <ExternalLink className="w-4 h-4 ml-auto" />
            </a>

            {wizardState.completionResult.deploymentUrl && (
              <a
                href={wizardState.completionResult.deploymentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 p-4 bg-[#0D1117] border border-gray-700 rounded-lg hover:border-[#34A853] transition-colors"
              >
                <Rocket className="w-5 h-5" />
                <span>View Live Deployment</span>
                <ExternalLink className="w-4 h-4 ml-auto" />
              </a>
            )}

            <Button
              onClick={handleReset}
              variant="outline"
              size="lg"
              className="mt-4 border-gray-700"
            >
              Create Another Project
            </Button>
          </div>
        </motion.div>
      );
    }

    switch (wizardState.currentStep) {
      case 0:
        return (
          <GitHubConnectionStep
            onComplete={handleGitHubComplete}
            initialStatus={wizardState.githubData || undefined}
          />
        );
      case 1:
        return <ZeroDBSetupStep onComplete={handleZeroDBComplete} />;
      case 2:
        return <PRDUploadStep onComplete={handlePRDComplete} />;
      case 3:
        if (!wizardState.projectId) {
          return (
            <div className="text-center py-12">
              <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
              <p className="text-red-400">Project ID not found. Please go back and try again.</p>
              <Button onClick={handleBack} className="mt-4">
                Go Back
              </Button>
            </div>
          );
        }
        return (
          <DataModelReviewStep
            projectId={wizardState.projectId}
            prdContent={wizardState.prdContent}
            onComplete={handleDataModelComplete}
            onBack={handleBack}
          />
        );
      case 4:
        if (!wizardState.projectId || !wizardState.dataModel) {
          return (
            <div className="text-center py-12">
              <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
              <p className="text-red-400">Missing data. Please go back and try again.</p>
              <Button onClick={handleBack} className="mt-4">
                Go Back
              </Button>
            </div>
          );
        }
        return (
          <BacklogReviewStep
            projectId={wizardState.projectId}
            prdContent={wizardState.prdContent}
            dataModel={wizardState.dataModel}
            onComplete={handleBacklogComplete}
            onBack={handleBack}
          />
        );
      case 5:
        if (!wizardState.projectId || !wizardState.backlog) {
          return (
            <div className="text-center py-12">
              <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
              <p className="text-red-400">Missing data. Please go back and try again.</p>
              <Button onClick={handleBack} className="mt-4">
                Go Back
              </Button>
            </div>
          );
        }
        return (
          <SprintPlanReviewStep
            projectId={wizardState.projectId}
            backlog={wizardState.backlog}
            onComplete={handleSprintPlanComplete}
            onBack={handleBack}
          />
        );
      case 6:
        if (!wizardState.projectId || !wizardState.sprintPlan) {
          return (
            <div className="text-center py-12">
              <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
              <p className="text-red-400">Missing data. Please go back and try again.</p>
              <Button onClick={handleBack} className="mt-4">
                Go Back
              </Button>
            </div>
          );
        }
        return (
          <LaunchMonitorStep
            projectId={wizardState.projectId}
            sprintPlan={wizardState.sprintPlan}
            onComplete={handleLaunchComplete}
            onBack={handleBack}
          />
        );
      default:
        return null;
    }
  };

  // Don't show step indicator on completion
  const showStepIndicator = wizardState.currentStep < 7;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-[#FCAE39] bg-clip-text text-transparent">
          Agent Swarm Setup Wizard
        </h1>
        <p className="text-gray-400 text-lg">
          Follow these simple steps to build your application with AI
        </p>
      </motion.div>

      {/* Progress Bar */}
      {showStepIndicator && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-400">
              Step {wizardState.currentStep + 1} of {WIZARD_STEPS.length}
            </span>
            <span className="text-sm font-medium text-gray-400">
              {Math.round(progressPercentage)}% Complete
            </span>
          </div>
          <Progress value={progressPercentage} className="h-3 bg-gray-800" />
        </motion.div>
      )}

      {/* Step Indicator */}
      {showStepIndicator && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between gap-2">
            {WIZARD_STEPS.map((step, index) => {
              const isCompleted = index < wizardState.currentStep;
              const isCurrent = index === wizardState.currentStep;
              const Icon = step.icon;

              return (
                <div key={step.id} className="flex-1">
                  <div className="flex flex-col items-center">
                    {/* Step Circle */}
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.3 + index * 0.05 }}
                      className={cn(
                        'w-14 h-14 rounded-full flex items-center justify-center mb-2 transition-all duration-300',
                        isCompleted && 'bg-gradient-to-r from-primary to-[#FCAE39] shadow-lg shadow-primary/30',
                        isCurrent && 'bg-[#161B22] border-2 border-primary shadow-lg shadow-primary/20',
                        !isCompleted && !isCurrent && 'bg-[#161B22] border-2 border-gray-800'
                      )}
                    >
                      {isCompleted ? (
                        <Check className="w-6 h-6 text-white" />
                      ) : (
                        <Icon className={cn('w-6 h-6', isCurrent ? step.color : 'text-gray-600')} />
                      )}
                    </motion.div>

                    {/* Step Title (hidden on mobile) */}
                    <span
                      className={cn(
                        'text-xs text-center hidden md:block transition-colors',
                        isCurrent ? 'text-white font-semibold' : 'text-gray-500'
                      )}
                    >
                      {step.title}
                    </span>
                  </div>

                  {/* Connector Line */}
                  {index < WIZARD_STEPS.length - 1 && (
                    <div className="relative h-1 mt-[-2.5rem] ml-7 mr-[-0.5rem] z-[-1]">
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gray-800 rounded-full" />
                      {index < wizardState.currentStep && (
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: '100%' }}
                          transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                          className="absolute top-0 left-0 h-1 bg-gradient-to-r from-primary to-[#FCAE39] rounded-full"
                        />
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Current Step Description */}
      {showStepIndicator && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8 text-center"
        >
          <h2 className="text-2xl font-bold mb-2">{WIZARD_STEPS[wizardState.currentStep].title}</h2>
          <p className="text-gray-400">{WIZARD_STEPS[wizardState.currentStep].description}</p>
        </motion.div>
      )}

      {/* Error Alert */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Alert variant="destructive" className="bg-red-500/10 border-red-500/30">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </motion.div>
      )}

      {/* Loading Overlay for Project Creation */}
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-6"
        >
          <Card className="bg-[#161B22] border-gray-800">
            <CardContent className="p-8 text-center">
              <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-primary" />
              <h3 className="text-xl font-semibold mb-2">Creating Agent Swarm Project...</h3>
              <p className="text-gray-400">This will only take a moment</p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Step Content Card */}
      {!isLoading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-[#161B22] border-gray-800">
            <CardContent className="p-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={wizardState.currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {getCurrentStepComponent()}
                </motion.div>
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Navigation for early steps (GitHub and ZeroDB) */}
      {wizardState.currentStep < 2 && !isLoading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 flex items-center justify-between"
        >
          <Button
            variant="outline"
            size="lg"
            onClick={handleBack}
            disabled={wizardState.currentStep === 0}
            className="border-gray-700"
          >
            <ChevronLeft className="w-5 h-5 mr-2" />
            Back
          </Button>
          <div />
        </motion.div>
      )}

      {/* Help Text */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-8 text-center text-sm text-gray-500"
      >
        Need help? Check out our{' '}
        <a href="/docs" className="text-primary hover:underline">
          documentation
        </a>{' '}
        or{' '}
        <a href="/support" className="text-primary hover:underline">
          contact support
        </a>
      </motion.div>
    </div>
  );
}
