import { Metadata } from 'next';
import EvaluationClient from './EvaluationClient';

export const metadata: Metadata = {
  title: 'Model Evaluation',
  description: 'Evaluate trained QNN models with comprehensive performance metrics, confusion matrices, and ROC curves',
};

export default function EvaluationPage() {
  return <EvaluationClient />;
}
