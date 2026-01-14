'use client';

/**
 * Agent Swarm Workflow Demo Page
 *
 * Demonstrates the 9-step workflow with RLHF feedback collection at strategic points:
 * 1. Upload PRD
 * 2. Generate PRD (✅ Feedback)
 * 3. Create Data Model (✅ Feedback)
 * 4. Generate Backlog (✅ Feedback)
 * 5. Create Sprint Plan (✅ Feedback)
 * 6. Assign Agents
 * 7. Agent Collaboration (✅ Feedback on each agent)
 * 8. Integration & Testing
 * 9. Code Generation (✅ Feedback)
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  FileText,
  Database,
  Calendar,
  Users,
  GitBranch,
  TestTube,
  Code,
  CheckCircle,
  List,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import RLHFFeedback from '@/components/RLHFFeedback';
import AgentSwarmWorkflowProgress from './components/AgentSwarmWorkflowProgress';

interface WorkflowStep {
  id: number;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  hasFeedback: boolean;
  feedbackQuestion?: string;
  samplePrompt?: string;
  sampleResponse?: string;
}

const WORKFLOW_STEPS: WorkflowStep[] = [
  {
    id: 1,
    title: 'Upload PRD',
    icon: Upload,
    description: 'Upload your Product Requirements Document',
    hasFeedback: false,
  },
  {
    id: 2,
    title: 'Generate PRD Analysis',
    icon: FileText,
    description: 'AI analyzes and structures your requirements',
    hasFeedback: true,
    feedbackQuestion: 'Was the generated PRD analysis helpful?',
    samplePrompt: 'Analyze the uploaded PRD and extract key requirements, features, and technical specifications.',
    sampleResponse: '# PRD Analysis\n\n## Key Requirements\n- User authentication system\n- Real-time dashboard\n- Data visualization\n\n## Technical Stack\n- Frontend: React + TypeScript\n- Backend: FastAPI\n- Database: PostgreSQL\n\n## Features\n1. User Management\n2. Analytics Dashboard\n3. Reporting System',
  },
  {
    id: 3,
    title: 'Create Data Model',
    icon: Database,
    description: 'Generate database schema and data models',
    hasFeedback: true,
    feedbackQuestion: 'Is this data model appropriate?',
    samplePrompt: 'Create a comprehensive data model for the user authentication and analytics system.',
    sampleResponse: '```python\nclass User(Base):\n    id: int\n    email: str\n    username: str\n    created_at: datetime\n\nclass Analytics(Base):\n    id: int\n    user_id: int\n    event_type: str\n    timestamp: datetime\n```',
  },
  {
    id: 4,
    title: 'Generate Backlog',
    icon: List,
    description: 'Create prioritized backlog of tasks',
    hasFeedback: true,
    feedbackQuestion: 'Is the backlog complete and accurate?',
    samplePrompt: 'Generate a prioritized backlog of user stories and tasks based on the PRD.',
    sampleResponse: '## Sprint Backlog\n\n### High Priority\n- US-001: User Registration\n- US-002: User Login\n- US-003: Dashboard Layout\n\n### Medium Priority\n- US-004: Analytics Integration\n- US-005: Data Visualization\n\n### Low Priority\n- US-006: Email Notifications\n- US-007: Export Features',
  },
  {
    id: 5,
    title: 'Create Sprint Plan',
    icon: Calendar,
    description: 'Plan sprints and timelines',
    hasFeedback: true,
    feedbackQuestion: 'Is the timeline realistic?',
    samplePrompt: 'Create a sprint plan with realistic timelines for a 2-week sprint cycle.',
    sampleResponse: '## Sprint Plan\n\n### Sprint 1 (Weeks 1-2)\n- Setup infrastructure\n- User authentication\n- Basic dashboard\n\n### Sprint 2 (Weeks 3-4)\n- Analytics integration\n- Data visualization\n- Testing\n\nEstimated completion: 4 weeks',
  },
  {
    id: 6,
    title: 'Assign Agents',
    icon: Users,
    description: 'Assign specialized agents to tasks',
    hasFeedback: false,
  },
  {
    id: 7,
    title: 'Agent Collaboration',
    icon: GitBranch,
    description: 'Agents work together on implementation',
    hasFeedback: true,
    feedbackQuestion: 'Was this agent\'s contribution helpful?',
    samplePrompt: 'Frontend Agent: Implement the user authentication UI with React and TypeScript.',
    sampleResponse: 'Created authentication components:\n- LoginForm.tsx\n- RegisterForm.tsx\n- AuthProvider.tsx\n\nImplemented features:\n- Form validation with Zod\n- JWT token management\n- Protected routes',
  },
  {
    id: 8,
    title: 'Integration & Testing',
    icon: TestTube,
    description: 'Run automated tests and integration checks',
    hasFeedback: false,
  },
  {
    id: 9,
    title: 'Code Generation',
    icon: Code,
    description: 'Generate production-ready code',
    hasFeedback: true,
    feedbackQuestion: 'Is the generated code quality good?',
    samplePrompt: 'Generate complete, production-ready code for the authentication system.',
    sampleResponse: 'Generated complete codebase:\n\n- 47 files created\n- 100% test coverage\n- All linting rules passed\n- Security audit: No vulnerabilities\n- Ready for deployment',
  },
];

const SAMPLE_AGENTS = [
  { id: 'architect_1', name: 'System Architect', role: 'Architecture & Design' },
  { id: 'frontend_1', name: 'Frontend Engineer', role: 'UI/UX Implementation' },
  { id: 'backend_1', name: 'Backend Engineer', role: 'API Development' },
  { id: 'devops_1', name: 'DevOps Engineer', role: 'Infrastructure & CI/CD' },
  { id: 'qa_1', name: 'QA & Security', role: 'Testing & Security' },
  { id: 'docs_1', name: 'Documentation', role: 'Technical Documentation' },
];

export default function WorkflowDemoClient() {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [showAgentFeedback, setShowAgentFeedback] = useState(false);

  // Mock project ID (in real app, this would come from the actual project)
  const mockProjectId = 'demo-project-123';
  const mockWorkflowId = 'workflow-demo-456';

  const handleNextStep = () => {
    if (currentStep < WORKFLOW_STEPS.length) {
      setCompletedSteps([...completedSteps, currentStep]);
      setCurrentStep(currentStep + 1);

      // Show agent feedback when reaching step 7
      if (currentStep === 6) {
        setShowAgentFeedback(true);
      }
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setCompletedSteps(completedSteps.filter((step) => step !== currentStep - 1));
    }
  };

  const handleStepClick = (stepId: number) => {
    if (completedSteps.includes(stepId - 1) || stepId === 1) {
      setCurrentStep(stepId);
    }
  };

  const currentWorkflowStep = WORKFLOW_STEPS[currentStep - 1];
  const StepIcon = currentWorkflowStep.icon;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4 mr-2" />
            Interactive Demo with RLHF Feedback
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
            Agent Swarm Workflow
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Experience the 9-step Agent Swarm workflow with real-time feedback collection at strategic points
          </p>
        </motion.div>

        {/* Workflow Progress Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <AgentSwarmWorkflowProgress
            currentStep={currentStep}
            completedSteps={completedSteps}
            onStepClick={handleStepClick}
          />
        </motion.div>

        {/* Current Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="max-w-4xl mx-auto">
              <CardHeader>
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                    <StepIcon className="h-8 w-8" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">
                      Step {currentStep}: {currentWorkflowStep.title}
                    </CardTitle>
                    <CardDescription className="text-base mt-1">
                      {currentWorkflowStep.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Sample Content */}
                {currentWorkflowStep.samplePrompt && (
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Prompt:
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {currentWorkflowStep.samplePrompt}
                      </p>
                    </div>

                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <h3 className="text-sm font-semibold text-blue-700 dark:text-blue-300 mb-2">
                        AI Response:
                      </h3>
                      <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-mono">
                        {currentWorkflowStep.sampleResponse}
                      </pre>
                    </div>
                  </div>
                )}

                {/* RLHF Feedback Component */}
                {currentWorkflowStep.hasFeedback && currentWorkflowStep.samplePrompt && (
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <RLHFFeedback
                      stepNumber={currentStep}
                      stepName={currentWorkflowStep.title}
                      prompt={currentWorkflowStep.samplePrompt || ''}
                      response={currentWorkflowStep.sampleResponse || ''}
                      projectId={mockProjectId}
                      workflowId={mockWorkflowId}
                      onFeedbackSubmit={(feedback) => {
                        console.log('Feedback submitted:', feedback);
                      }}
                    />
                  </div>
                )}

                {/* Agent Feedback Section (Step 7) */}
                {currentStep === 7 && showAgentFeedback && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Agent Contributions
                    </h3>
                    {SAMPLE_AGENTS.map((agent) => (
                      <div
                        key={agent.id}
                        className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white">
                              {agent.name}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {agent.role}
                            </p>
                          </div>
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        </div>

                        <RLHFFeedback
                          stepNumber={7}
                          stepName={`Agent: ${agent.name}`}
                          prompt={`${agent.name}: Implement ${agent.role.toLowerCase()} features`}
                          response={`Completed ${agent.role.toLowerCase()} implementation with high quality and best practices.`}
                          projectId={mockProjectId}
                          workflowId={mockWorkflowId}
                          agentId={agent.id}
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between items-center pt-6 border-t border-gray-200 dark:border-gray-700">
                  <Button
                    variant="outline"
                    onClick={handlePreviousStep}
                    disabled={currentStep === 1}
                  >
                    Previous Step
                  </Button>

                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Step {currentStep} of {WORKFLOW_STEPS.length}
                  </div>

                  <Button
                    onClick={handleNextStep}
                    disabled={currentStep === WORKFLOW_STEPS.length}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    {currentStep === WORKFLOW_STEPS.length ? (
                      'Complete'
                    ) : (
                      <>
                        Next Step
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="max-w-4xl mx-auto mt-8"
        >
          <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200 dark:border-blue-800">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                  <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    About RLHF Feedback
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Your feedback helps improve AI agent performance through Reinforcement Learning
                    from Human Feedback (RLHF). Each thumbs up or down is collected and analyzed to
                    make agents smarter and more helpful over time.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
