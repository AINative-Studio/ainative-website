/**
 * Test fixtures for AI model training data
 */

export interface TrainingDataset {
  id: string;
  name: string;
  type: 'text' | 'image';
  samples: number;
}

export interface TrainingJob {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  totalEpochs: number;
}

export interface TrainingMetrics {
  loss: number;
  accuracy: number;
  epoch: number;
}

export const createTrainingDataset = (overrides?: Partial<TrainingDataset>): TrainingDataset => ({
  id: 'dataset-1',
  name: 'ImageNet',
  type: 'image',
  samples: 1000000,
  ...overrides,
});

export const createTrainingJob = (overrides?: Partial<TrainingJob>): TrainingJob => ({
  id: 'job-1',
  name: 'GPT-4 Fine-tuning',
  status: 'running',
  progress: 50,
  totalEpochs: 10,
  ...overrides,
});

export const createTrainingMetrics = (overrides?: Partial<TrainingMetrics>): TrainingMetrics => ({
  loss: 0.5,
  accuracy: 0.92,
  epoch: 5,
  ...overrides,
});

export const trainingDatasets = [
  createTrainingDataset({ id: 'dataset-1', name: 'ImageNet' }),
  createTrainingDataset({ id: 'dataset-2', name: 'Common Crawl', type: 'text' }),
];

export const trainingJobs = [
  createTrainingJob({ id: 'job-1', status: 'running' }),
  createTrainingJob({ id: 'job-2', status: 'completed', progress: 100 }),
];

export const trainingJobsByStatus = {
  pending: trainingJobs.filter(j => j.status === 'pending'),
  running: trainingJobs.filter(j => j.status === 'running'),
  completed: trainingJobs.filter(j => j.status === 'completed'),
  failed: trainingJobs.filter(j => j.status === 'failed'),
};
