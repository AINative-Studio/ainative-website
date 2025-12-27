import { motion } from 'framer-motion';
import { Check, Circle, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export interface WorkflowStep {
  id: number;
  name: string;
  shortName: string;
  description: string;
  status: 'completed' | 'current' | 'pending' | 'locked';
  prerequisite?: string;
}

interface WorkflowProgressProps {
  currentStep: number;
  onStepClick?: (stepId: number) => void;
  className?: string;
}

const workflowSteps: WorkflowStep[] = [
  {
    id: 1,
    name: 'Model Management',
    shortName: 'Models',
    description: 'Create and manage your quantum neural network models',
    status: 'pending',
  },
  {
    id: 2,
    name: 'Repository Management',
    shortName: 'Repos',
    description: 'Connect and configure your code repositories',
    status: 'pending',
  },
  {
    id: 3,
    name: 'Training Configuration',
    shortName: 'Config',
    description: 'Set up training parameters and hyperparameters',
    status: 'pending',
    prerequisite: 'Complete Repository Management first',
  },
  {
    id: 4,
    name: 'Model Training',
    shortName: 'Training',
    description: 'Train your models with quantum-enhanced algorithms',
    status: 'pending',
    prerequisite: 'Complete Training Configuration first',
  },
  {
    id: 5,
    name: 'Training History',
    shortName: 'History',
    description: 'View past training runs and their results',
    status: 'pending',
  },
  {
    id: 6,
    name: 'Evaluation Dashboard',
    shortName: 'Evaluation',
    description: 'Analyze model performance and metrics',
    status: 'pending',
    prerequisite: 'Complete Model Training first',
  },
  {
    id: 7,
    name: 'Benchmarking',
    shortName: 'Benchmark',
    description: 'Compare your models against industry standards',
    status: 'pending',
    prerequisite: 'Complete Model Training first',
  },
  {
    id: 8,
    name: 'Code Quality',
    shortName: 'Quality',
    description: 'Assess code quality and best practices',
    status: 'pending',
  },
  {
    id: 9,
    name: 'Quantum Monitoring',
    shortName: 'Monitoring',
    description: 'Real-time monitoring of quantum circuit performance',
    status: 'pending',
  },
  {
    id: 10,
    name: 'Documentation',
    shortName: 'Docs',
    description: 'Generate and manage model documentation',
    status: 'pending',
  },
];

export default function WorkflowProgress({
  currentStep,
  onStepClick,
  className,
}: WorkflowProgressProps) {
  // Calculate step statuses based on current step
  const steps = workflowSteps.map((step) => {
    if (step.id < currentStep) {
      return { ...step, status: 'completed' as const };
    } else if (step.id === currentStep) {
      return { ...step, status: 'current' as const };
    } else {
      // Check if step should be locked based on prerequisites
      const shouldLock = step.prerequisite && step.id > currentStep + 1;
      if (shouldLock) {
        return { ...step, status: 'locked' as const };
      }
      return { ...step, status: 'pending' as const };
    }
  });

  const handleStepClick = (step: WorkflowStep) => {
    // Only allow clicking completed steps or current step
    if (step.status === 'completed' || step.status === 'current') {
      onStepClick?.(step.id);
    }
  };

  const getStepIcon = (status: WorkflowStep['status']) => {
    switch (status) {
      case 'completed':
        return <Check className="h-4 w-4 text-white" />;
      case 'current':
        return <Circle className="h-4 w-4 text-white fill-white" />;
      case 'locked':
        return <Lock className="h-3 w-3 text-gray-400" />;
      case 'pending':
        return <Circle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStepStyles = (status: WorkflowStep['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500 border-green-500';
      case 'current':
        return 'bg-blue-500 border-blue-500 ring-4 ring-blue-500/20';
      case 'locked':
        return 'bg-gray-200 border-gray-300 dark:bg-gray-700 dark:border-gray-600';
      case 'pending':
        return 'bg-white border-gray-300 dark:bg-gray-800 dark:border-gray-600';
    }
  };

  const getConnectorStyles = (index: number) => {
    const step = steps[index];
    if (step.status === 'completed') {
      return 'bg-green-500';
    } else if (step.status === 'current' && index > 0) {
      return 'bg-gradient-to-r from-green-500 to-blue-500';
    }
    return 'bg-gray-300 dark:bg-gray-600';
  };

  return (
    <div className={cn('w-full', className)}>
      {/* Desktop View */}
      <div className="hidden lg:block">
        <div className="flex items-center justify-between px-4">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center flex-1">
              <TooltipProvider delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => handleStepClick(step)}
                      disabled={step.status === 'locked' || step.status === 'pending'}
                      className={cn(
                        'flex flex-col items-center gap-2 group relative',
                        (step.status === 'completed' || step.status === 'current') &&
                          'cursor-pointer',
                        step.status === 'locked' && 'cursor-not-allowed',
                        step.status === 'pending' && 'cursor-default'
                      )}
                    >
                      {/* Step Circle */}
                      <motion.div
                        initial={false}
                        animate={
                          step.status === 'current'
                            ? {
                                scale: [1, 1.1, 1],
                                transition: {
                                  duration: 2,
                                  repeat: Infinity,
                                  ease: 'easeInOut',
                                },
                              }
                            : { scale: 1 }
                        }
                        className={cn(
                          'w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-300',
                          getStepStyles(step.status),
                          step.status === 'completed' &&
                            'group-hover:scale-110 group-hover:shadow-lg',
                          step.status === 'current' && 'shadow-lg'
                        )}
                      >
                        {getStepIcon(step.status)}
                      </motion.div>

                      {/* Step Number */}
                      <div
                        className={cn(
                          'text-xs font-medium transition-colors',
                          step.status === 'current' &&
                            'text-blue-600 dark:text-blue-400 font-bold',
                          step.status === 'completed' &&
                            'text-green-600 dark:text-green-400',
                          (step.status === 'pending' || step.status === 'locked') &&
                            'text-gray-500 dark:text-gray-400'
                        )}
                      >
                        Step {step.id}
                      </div>

                      {/* Step Name */}
                      <div
                        className={cn(
                          'text-sm text-center max-w-[100px] transition-colors',
                          step.status === 'current' && 'font-semibold text-gray-900 dark:text-white',
                          step.status === 'completed' && 'text-gray-700 dark:text-gray-300',
                          (step.status === 'pending' || step.status === 'locked') &&
                            'text-gray-500 dark:text-gray-400'
                        )}
                      >
                        {step.shortName}
                      </div>

                      {/* Current Step Background Highlight */}
                      {step.status === 'current' && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="absolute inset-0 -inset-x-4 -inset-y-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg -z-10"
                        />
                      )}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-xs">
                    <div className="space-y-1">
                      <p className="font-semibold">{step.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {step.description}
                      </p>
                      {step.status === 'locked' && step.prerequisite && (
                        <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 flex items-center gap-1">
                          <Lock className="h-3 w-3" />
                          {step.prerequisite}
                        </p>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="flex-1 h-0.5 mx-2 relative">
                  <div className="absolute inset-0 bg-gray-300 dark:bg-gray-600" />
                  <motion.div
                    initial={{ width: '0%' }}
                    animate={{
                      width:
                        step.status === 'completed'
                          ? '100%'
                          : step.status === 'current'
                          ? '50%'
                          : '0%',
                    }}
                    transition={{ duration: 0.5, ease: 'easeInOut' }}
                    className={cn('absolute inset-y-0 left-0', getConnectorStyles(index))}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Tablet View - Scrollable Horizontal */}
      <div className="hidden md:block lg:hidden">
        <div className="overflow-x-auto pb-4 px-4 scrollbar-hide">
          <div className="flex items-center gap-4 min-w-max">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <TooltipProvider delayDuration={200}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => handleStepClick(step)}
                        disabled={step.status === 'locked' || step.status === 'pending'}
                        className={cn(
                          'flex flex-col items-center gap-2 group min-w-[80px]',
                          (step.status === 'completed' || step.status === 'current') &&
                            'cursor-pointer',
                          step.status === 'locked' && 'cursor-not-allowed'
                        )}
                      >
                        <motion.div
                          animate={
                            step.status === 'current'
                              ? {
                                  scale: [1, 1.1, 1],
                                  transition: { duration: 2, repeat: Infinity },
                                }
                              : {}
                          }
                          className={cn(
                            'w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all',
                            getStepStyles(step.status)
                          )}
                        >
                          {getStepIcon(step.status)}
                        </motion.div>
                        <div className="text-xs text-gray-500">{step.id}</div>
                        <div className="text-sm text-center">{step.shortName}</div>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="font-semibold">{step.name}</p>
                      <p className="text-sm">{step.description}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                {index < steps.length - 1 && (
                  <div className="w-8 h-0.5 mx-2 relative">
                    <div className="absolute inset-0 bg-gray-300" />
                    <motion.div
                      animate={{
                        width: step.status === 'completed' ? '100%' : '0%',
                      }}
                      className={cn('absolute inset-y-0 left-0', getConnectorStyles(index))}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile View - Vertical Stepper */}
      <div className="md:hidden">
        <div className="space-y-3 px-4">
          {steps.map((step, index) => (
            <TooltipProvider key={step.id} delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => handleStepClick(step)}
                    disabled={step.status === 'locked' || step.status === 'pending'}
                    className={cn(
                      'flex items-center gap-4 w-full p-3 rounded-lg transition-all',
                      step.status === 'current' &&
                        'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500',
                      step.status === 'completed' &&
                        'hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer',
                      (step.status === 'pending' || step.status === 'locked') &&
                        'opacity-60'
                    )}
                  >
                    {/* Step Circle */}
                    <motion.div
                      animate={
                        step.status === 'current'
                          ? {
                              scale: [1, 1.1, 1],
                              transition: { duration: 2, repeat: Infinity },
                            }
                          : {}
                      }
                      className={cn(
                        'w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0',
                        getStepStyles(step.status)
                      )}
                    >
                      {getStepIcon(step.status)}
                    </motion.div>

                    {/* Step Info */}
                    <div className="flex-1 text-left">
                      <div
                        className={cn(
                          'text-sm font-medium',
                          step.status === 'current' && 'text-blue-600 dark:text-blue-400',
                          step.status === 'completed' && 'text-gray-900 dark:text-white',
                          (step.status === 'pending' || step.status === 'locked') &&
                            'text-gray-500'
                        )}
                      >
                        {step.name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Step {step.id} of 10
                      </div>
                    </div>

                    {/* Status Badge */}
                    {step.status === 'locked' && (
                      <Lock className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <div className="space-y-1">
                    <p className="font-semibold">{step.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {step.description}
                    </p>
                    {step.status === 'locked' && step.prerequisite && (
                      <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
                        {step.prerequisite}
                      </p>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-6 px-4">
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
          <span>Overall Progress</span>
          <span className="font-medium">
            {Math.round(((currentStep - 1) / steps.length) * 100)}%
          </span>
        </div>
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{
              width: `${((currentStep - 1) / steps.length) * 100}%`,
            }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-green-500 to-blue-500"
          />
        </div>
      </div>
    </div>
  );
}
