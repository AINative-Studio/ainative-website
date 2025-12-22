import { Metadata } from 'next';
import CodeAnalysisClient from './CodeAnalysisClient';

export const metadata: Metadata = {
  title: 'Code Analysis - AI Native Studio',
  description: 'Analyze code for issues, get auto-fix suggestions, and improve code quality',
};

export default function CodeAnalysisPage() {
  return <CodeAnalysisClient />;
}
