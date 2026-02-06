import { Metadata } from 'next';
import ModelDetailClient from './ModelDetailClient';

export const metadata: Metadata = {
    title: 'Model Playground - AI Native Studio',
    description: 'Run inference and explore AI model capabilities',
};

export default async function ModelDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <ModelDetailClient modelId={id} />;
}
