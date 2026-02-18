import { Metadata } from 'next';
import OpenClawTeamClient from './OpenClawTeamClient';

export const metadata: Metadata = {
  title: 'Team - OpenClaw - AINative Studio',
  description: 'Manage who has access to this workspace',
};

export default function OpenClawTeamPage() {
  return <OpenClawTeamClient />;
}
