/**
 * AI Model Playground Page
 * Interactive testing environment for AI models with pre-loaded preview samples
 *
 * Features:
 * - Pre-populated form fields from preview_data
 * - Live video/image/audio player
 * - Parameter controls (duration, image upload, etc.)
 * - Request logs viewer
 * - Real-time generation with API integration
 *
 * Refs #238, #241, Phase 2 Playground Implementation
 */

import { Metadata } from 'next';
import PlaygroundClient from './PlaygroundClient';

export const metadata: Metadata = {
  title: 'AI Model Playground | AINative Studio',
  description: 'Test and experiment with AI models interactively',
};

export default async function PlaygroundPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PlaygroundClient modelId={id} />;
}
