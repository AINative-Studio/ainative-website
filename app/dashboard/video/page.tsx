import { Metadata } from 'next';
import VideoProcessingClient from './VideoProcessingClient';

export const metadata: Metadata = {
  title: 'Video Processing - AI Native Studio',
  description: 'Upload, process, and manage video content with advanced transcoding and optimization',
};

export default function VideoProcessingPage() {
  return <VideoProcessingClient />;
}
