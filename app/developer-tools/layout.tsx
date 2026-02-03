import DashboardLayout from '@/components/layout/DashboardLayout';

export default function DeveloperToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
