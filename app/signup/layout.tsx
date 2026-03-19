import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign Up | AI Native Studio',
  robots: { index: false, follow: false },
};

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
