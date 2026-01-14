'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, Circle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Feature {
  id: string;
  name: string;
  tddPhase: 'red' | 'green' | 'refactor' | 'completed';
  progress: number; // 0-100
}

interface TDDProgressDisplayProps {
  features: Feature[];
  currentFeatureId?: string;
}

const TDD_PHASES = {
  red: {
    emoji: '🔴',
    label: 'Red',
    description: 'Writing failing tests',
    color: 'text-red-400',
    bgColor: 'bg-red-900/20',
    borderColor: 'border-red-600',
    progressColor: 'bg-red-500',
  },
  green: {
    emoji: '🟢',
    label: 'Green',
    description: 'Making tests pass',
    color: 'text-green-400',
    bgColor: 'bg-green-900/20',
    borderColor: 'border-green-600',
    progressColor: 'bg-green-500',
  },
  refactor: {
    emoji: '🔵',
    label: 'Refactor',
    description: 'Improving code quality',
    color: 'text-blue-400',
    bgColor: 'bg-blue-900/20',
    borderColor: 'border-blue-600',
    progressColor: 'bg-blue-500',
  },
  completed: {
    emoji: '✅',
    label: 'Completed',
    description: 'Feature complete',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-900/20',
    borderColor: 'border-emerald-600',
    progressColor: 'bg-emerald-500',
  },
};

const FeatureCard = ({ feature, isCurrent }: { feature: Feature; isCurrent: boolean }) => {
  const phase = TDD_PHASES[feature.tddPhase];
  const isCompleted = feature.tddPhase === 'completed';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`
        relative rounded-lg border-2 p-4 transition-all duration-300
        ${isCurrent
          ? `${phase.borderColor} ${phase.bgColor} shadow-lg scale-[1.02]`
          : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
        }
      `}
    >
      {/* Current Feature Indicator */}
      {isCurrent && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-2 -right-2 bg-primary text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg"
        >
          ACTIVE
        </motion.div>
      )}

      {/* Feature Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className={`font-semibold text-sm mb-1 truncate ${isCurrent ? 'text-white' : 'text-gray-200'}`}>
            {feature.name}
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-lg leading-none">{phase.emoji}</span>
            <div>
              <div className={`text-xs font-medium ${phase.color}`}>
                {phase.label}
              </div>
              <div className="text-xs text-gray-400">
                {phase.description}
              </div>
            </div>
          </div>
        </div>

        {/* Status Icon */}
        <div className="flex-shrink-0">
          {isCompleted ? (
            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
          ) : isCurrent ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Circle className={`w-6 h-6 ${phase.color}`} />
            </motion.div>
          ) : (
            <Circle className="w-6 h-6 text-gray-600" />
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className={isCurrent ? 'text-gray-300 font-medium' : 'text-gray-500'}>
            Progress
          </span>
          <span className={`font-semibold ${isCurrent ? phase.color : 'text-gray-500'}`}>
            {feature.progress}%
          </span>
        </div>
        <div className="relative h-2 bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${feature.progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className={`h-full rounded-full ${phase.progressColor}`}
          >
            {isCurrent && feature.progress > 0 && feature.progress < 100 && (
              <motion.div
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              />
            )}
          </motion.div>
        </div>
      </div>

      {/* Phase Indicators (Mini Timeline) */}
      {!isCompleted && (
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-700">
          <div className="flex items-center gap-1">
            {(['red', 'green', 'refactor'] as const).map((phaseName, index) => {
              const phaseConfig = TDD_PHASES[phaseName];
              const isActivePhase = feature.tddPhase === phaseName;
              const isPastPhase = ['red', 'green', 'refactor'].indexOf(feature.tddPhase) > index;

              return (
                <div key={phaseName} className="flex items-center">
                  <div
                    className={`
                      w-6 h-6 rounded-full flex items-center justify-center text-xs
                      transition-all duration-300
                      ${isActivePhase
                        ? `${phaseConfig.bgColor} ${phaseConfig.color} ring-2 ${phaseConfig.borderColor} scale-110`
                        : isPastPhase
                        ? 'bg-gray-600 text-gray-300'
                        : 'bg-gray-800 text-gray-600'
                      }
                    `}
                  >
                    {isPastPhase ? '✓' : phaseConfig.emoji}
                  </div>
                  {index < 2 && (
                    <div
                      className={`
                        w-6 h-0.5 mx-0.5
                        ${isPastPhase ? 'bg-gray-600' : 'bg-gray-800'}
                      `}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default function TDDProgressDisplay({ features, currentFeatureId }: TDDProgressDisplayProps) {
  const completedFeatures = features.filter(f => f.tddPhase === 'completed');
  const inProgressFeatures = features.filter(f => f.tddPhase !== 'completed');
  const totalProgress = features.length > 0
    ? Math.round(features.reduce((sum, f) => sum + f.progress, 0) / features.length)
    : 0;

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 via-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-lg">🔄</span>
              </div>
              <div>
                <div className="text-lg font-bold">TDD Sprint Progress</div>
                <div className="text-xs text-gray-400 font-normal">
                  Red → Green → Refactor Cycle
                </div>
              </div>
            </div>
          </CardTitle>

          {/* Overall Stats */}
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-xs text-gray-400">Overall Progress</div>
              <div className="text-xl font-bold text-primary">{totalProgress}%</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-400">Completed</div>
              <div className="text-xl font-bold text-emerald-400">
                {completedFeatures.length}/{features.length}
              </div>
            </div>
          </div>
        </div>

        {/* Overall Progress Bar */}
        <div className="mt-4">
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${totalProgress}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-red-500 via-green-500 to-blue-500 rounded-full"
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Empty State */}
        {features.length === 0 && (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">No features in sprint backlog</p>
            <p className="text-gray-600 text-xs mt-1">Add features to start tracking TDD progress</p>
          </div>
        )}

        {/* In Progress Features */}
        {inProgressFeatures.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-gray-300">In Development</h3>
              <span className="text-xs text-gray-500">({inProgressFeatures.length})</span>
            </div>
            <div className="space-y-3">
              {inProgressFeatures.map((feature) => (
                <FeatureCard
                  key={feature.id}
                  feature={feature}
                  isCurrent={feature.id === currentFeatureId}
                />
              ))}
            </div>
          </div>
        )}

        {/* Completed Features */}
        {completedFeatures.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-gray-300">Completed</h3>
              <span className="text-xs text-gray-500">({completedFeatures.length})</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="space-y-2">
              {completedFeatures.map((feature) => (
                <FeatureCard
                  key={feature.id}
                  feature={feature}
                  isCurrent={false}
                />
              ))}
            </div>
          </div>
        )}

        {/* TDD Cycle Legend */}
        <div className="border-t border-gray-800 pt-4">
          <h4 className="text-xs font-semibold text-gray-400 mb-3">TDD Phases</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {(['red', 'green', 'refactor'] as const).map((phaseName) => {
              const phase = TDD_PHASES[phaseName];
              return (
                <div
                  key={phaseName}
                  className={`flex items-center gap-2 p-2 rounded border ${phase.borderColor} ${phase.bgColor}`}
                >
                  <span className="text-lg">{phase.emoji}</span>
                  <div>
                    <div className={`text-xs font-semibold ${phase.color}`}>
                      {phase.label}
                    </div>
                    <div className="text-xs text-gray-400">
                      {phase.description}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export type { Feature, TDDProgressDisplayProps };
