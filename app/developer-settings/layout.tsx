import DashboardLayout from '@/components/layout/DashboardLayout';

export default function DeveloperSettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
